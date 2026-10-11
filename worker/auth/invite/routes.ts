/**
 * PL: Router Hono podtoru 1b (kody zaproszeń, login i hasło). Przepuszcza do Better Auth tylko dwa adresy: załóż konto kodem zaproszenia oraz zaloguj loginem i hasłem. Sesję pokazuje i kończy podtor 1a (get-session, sign-out), bo ciasteczko jest wspólne. Login zamienia na adres techniczny, a reguły loginu i hasła sprawdza, zanim kod zaproszenia zostanie zużyty. Router jest podpięty pod /api/auth/invite w worker/mounts.ts.
 * EN: The Hono router of subtrack 1b (invitation codes, login and password). It lets only two routes through to Better Auth: create an account with an invitation code and sign in with a login and a password. The session is shown and ended by subtrack 1a (get-session, sign-out), because the cookie is shared. It turns the login into a technical address and checks the login and password rules before the invitation code is used. The router is mounted under /api/auth/invite in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/runtimeAuth.ts::getInviteAuth
 * @uses worker/auth/invite/login.ts::normalizeLogin
 * @used_by worker/auth/invite/index.ts::authInviteApp
 * @used_by worker/auth/invite/testRuntime.ts::createAuthInviteApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono, type Context } from 'hono';
// PL: Typ środowiska Workera (baza DB i sekrety).
// EN: The Worker environment type (the DB database and secrets).
import type { Env } from '../../shared';
import type { AuthInvite } from './createInviteAuth';
import { SIGN_UP_PATH } from './createInviteAuth';
import { loginToEmail, normalizeLogin } from './login';
import { getInviteAuth, InviteNotConfiguredError } from './runtimeAuth';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './settings';

/**
 * PL: Skąd router bierze obiekt logowania. W Workerze to getInviteAuth, w testach obiekt na bazie testów.
 * EN: Where the router gets the sign-in object. In the Worker it is getInviteAuth, in tests an object on the test database.
 */
export type AuthInviteAppOptions = {
  /** PL: Zwraca obiekt logowania dla środowiska Workera albo rzuca InviteNotConfiguredError. EN: Returns the sign-in object for the Worker environment or throws InviteNotConfiguredError. */
  getAuth: (env: Env) => AuthInvite;
};

/**
 * PL: Zapytanie Hono routera: ma bindingi Workera (context.env).
 * EN: A Hono context of the router: it has the Worker bindings (context.env).
 */
type InviteContext = Context<{ Bindings: Env }>;

/** PL: Adres logowania hasłem w Better Auth (za INVITE_BASE_PATH). EN: The password sign-in path in Better Auth (after INVITE_BASE_PATH). */
const SIGN_IN_PATH = '/sign-in/email';

/**
 * PL: Czyta z zapytania pola tekstowe z ciała JSON. Zły JSON albo brak pola daje null.
 * EN: Reads text fields from the JSON body of a request. Bad JSON or a missing field gives null.
 *
 * @param request - PL: zapytanie od telefonu. EN: the request from the phone.
 * @param fields - PL: nazwy wymaganych pól. EN: the names of the required fields.
 * @returns PL: pola jako teksty albo null. EN: the fields as strings or null.
 */
async function readTextFields(request: Request, fields: readonly string[]): Promise<Record<string, string> | null> {
  // PL: Zły JSON to błąd telefonu, nie serwera.
  // EN: Bad JSON is the phone's error, not the server's.
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== 'object' || body === null) return null;

  // PL: Każde wymagane pole musi być tekstem.
  // EN: Every required field must be a string.
  const result: Record<string, string> = {};
  for (const field of fields) {
    const value = (body as Record<string, unknown>)[field];
    if (typeof value !== 'string') return null;
    result[field] = value;
  }
  return result;
}

/**
 * PL: Przekazuje zapytanie do Better Auth na wskazany adres i z nowym ciałem JSON. Do Better Auth trafiają tylko pola, które sami ustaliliśmy.
 * EN: Passes the request to Better Auth at the given path and with a new JSON body. Only the fields we decided on reach Better Auth.
 *
 * @param context - PL: zapytanie Hono. EN: the Hono context.
 * @param auth - PL: obiekt logowania. EN: the sign-in object.
 * @param target - PL: adres Better Auth (za INVITE_BASE_PATH) i ciało. EN: the Better Auth path (after INVITE_BASE_PATH) and the body.
 * @returns PL: odpowiedź Better Auth. EN: the Better Auth response.
 */
function forwardTo(context: InviteContext, auth: AuthInvite, target: { path: string; body: Record<string, string> }): Promise<Response> {
  // PL: Zmień adres na adres Better Auth i zachowaj resztę adresu (serwer, port).
  // EN: Change the URL to the Better Auth path and keep the rest of the URL (server, port).
  const url = new URL(context.req.raw.url);
  url.pathname = url.pathname.replace(/\/[^/]+$/, target.path);

  // PL: Długość ciała się zmienia, więc stary nagłówek musi zniknąć.
  // EN: The body length changes, so the old header must go.
  const headers = new Headers(context.req.raw.headers);
  headers.delete('content-length');
  headers.set('content-type', 'application/json');
  const request = new Request(url, { method: 'POST', headers, body: JSON.stringify(target.body) });
  return Promise.resolve(auth.handler(request));
}

/**
 * PL: Sprawdza hasło: długość w znakach według settings.ts.
 * EN: Checks the password: the length in characters according to settings.ts.
 *
 * @param password - PL: hasło z pola. EN: the password from the field.
 * @returns PL: prawda, gdy hasło ma dozwoloną długość. EN: true when the password has an allowed length.
 */
function isPasswordLengthValid(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
}

/**
 * PL: Obsługuje zakładanie konta: sprawdza login i hasło, zanim kod zaproszenia zostanie zużyty, potem prosi Better Auth o konto. Kod sprawdza i zużywa hak w createInviteAuth.
 * EN: Handles creating an account: checks the login and the password before the invitation code is used, then asks Better Auth for the account. The code is checked and used by the hook in createInviteAuth.
 *
 * @param context - PL: zapytanie Hono. EN: the Hono context.
 * @param getAuth - PL: zwraca obiekt logowania dla środowiska. EN: returns the sign-in object for the environment.
 * @returns PL: odpowiedź dla telefonu. EN: the response for the phone.
 */
async function handleSignUp(context: InviteContext, getAuth: AuthInviteAppOptions['getAuth']): Promise<Response> {
  const fields = await readTextFields(context.req.raw, ['code', 'login', 'password']);
  if (!fields) return context.json({ error: 'invalid_request' }, 400);

  // PL: Zły login albo za krótkie hasło odrzucamy tu, żeby nie zużyć kodu na próbę, która i tak by się nie udała.
  // EN: A bad login or a too short password is rejected here, so the code is not used on an attempt that would fail anyway.
  const login = normalizeLogin(fields.login ?? '');
  if (login === null) return context.json({ error: 'invalid_login' }, 400);
  if (!isPasswordLengthValid(fields.password ?? '')) return context.json({ error: 'invalid_password' }, 400);

  // PL: Imię na koncie to login. Uczeń zmieni je w profilu (podtor 7).
  // EN: The name on the account is the login. The student changes it in the profile (subtrack 7).
  const body = { email: loginToEmail(login), name: login, password: fields.password ?? '', inviteCode: fields.code ?? '' };
  return forwardTo(context, getAuth(context.env), { path: SIGN_UP_PATH, body });
}

/**
 * PL: Obsługuje logowanie loginem i hasłem. Login spoza reguł dostaje taką samą odpowiedź jak złe hasło, żeby nic nie zdradzać.
 * EN: Handles sign-in with a login and a password. A login that breaks the rules gets the same answer as a wrong password, so nothing is revealed.
 *
 * @param context - PL: zapytanie Hono. EN: the Hono context.
 * @param getAuth - PL: zwraca obiekt logowania dla środowiska. EN: returns the sign-in object for the environment.
 * @returns PL: odpowiedź dla telefonu. EN: the response for the phone.
 */
async function handleSignIn(context: InviteContext, getAuth: AuthInviteAppOptions['getAuth']): Promise<Response> {
  const fields = await readTextFields(context.req.raw, ['login', 'password']);
  if (!fields) return context.json({ error: 'invalid_request' }, 400);

  // PL: Login spoza reguł nie może mieć konta, więc od razu odpowiadamy jak na złe dane.
  // EN: A login outside the rules cannot have an account, so we answer at once as for wrong credentials.
  const login = normalizeLogin(fields.login ?? '');
  if (login === null) return context.json({ error: 'invalid_credentials' }, 401);

  const body = { email: loginToEmail(login), password: fields.password ?? '' };
  return forwardTo(context, getAuth(context.env), { path: SIGN_IN_PATH, body });
}

/**
 * PL: Buduje router kodów zaproszeń i hasła. Osobna funkcja, żeby test mógł podać własny obiekt logowania.
 * EN: Builds the invitation codes and password router. A separate function so a test can pass its own sign-in object.
 *
 * @param options - PL: skąd brać obiekt logowania. EN: where to get the sign-in object.
 * @returns PL: router Hono. EN: the Hono router.
 */
export function createAuthInviteApp(options: AuthInviteAppOptions): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>();

  // PL: Brak ustawień serwera (sekret) to 503, a nie 500: to nie błąd w kodzie, tylko brak konfiguracji.
  // EN: Missing server settings (the secret) is 503, not 500: it is not a bug in the code, only missing configuration.
  app.onError((error, context) => {
    if (error instanceof InviteNotConfiguredError) return context.json({ error: 'not_configured' }, 503);
    throw error;
  });

  // PL: Załóż konto kodem zaproszenia i zaloguj loginem. Każdy inny adres (w tym surowe /sign-up/email Better Auth) dostaje 404.
  // EN: Create an account with an invitation code and sign in with a login. Every other route (including the raw Better Auth /sign-up/email) gets 404.
  app.post('/sign-up', (context) => handleSignUp(context, options.getAuth));
  app.post('/sign-in', (context) => handleSignIn(context, options.getAuth));
  return app;
}

/**
 * PL: Router podtoru 1b w Workerze: konta z hasłem na D1 (context.env.DB) z sekretem BETTER_AUTH_SECRET.
 * EN: The subtrack 1b router in the Worker: password accounts on D1 (context.env.DB) with the BETTER_AUTH_SECRET secret.
 */
export const authInviteApp = createAuthInviteApp({ getAuth: getInviteAuth });
