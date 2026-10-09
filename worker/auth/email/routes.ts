/**
 * PL: Router Hono podtoru 1a (logowanie kodem z maila). Przepuszcza do Better Auth tylko cztery adresy: wyślij kod, zaloguj kodem, pokaż sesję, wyloguj. Pilnuje domeny szkolnej, zanim kod w ogóle powstanie. Router jest podpięty pod /api/auth/email w worker/mounts.ts.
 * EN: The Hono router of subtrack 1a (sign-in with an e-mail code). It lets only four routes through to Better Auth: send a code, sign in with a code, show the session, sign out. It checks the school domain before a code is even created. The router is mounted under /api/auth/email in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/runtimeAuth.ts::getRuntimeAuth
 * @uses worker/auth/email/schoolEmail.ts::isSchoolEmail
 * @used_by worker/auth/email/index.ts::authEmailApp
 * @used_by worker/auth/email/routes.test.ts::createAuthEmailApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono, type Context } from 'hono';
// PL: Obiekt logowania i błąd braku ustawień.
// EN: The sign-in object and the missing-settings error.
import { AuthNotConfiguredError, getRuntimeAuth, type RuntimeAuth } from './runtimeAuth';
// PL: Sprawdzanie adresu szkolnego.
// EN: The school address check.
import { isSchoolEmail, normalizeSchoolEmail } from './schoolEmail';

/**
 * PL: Skąd router bierze obiekt logowania. W Workerze to getRuntimeAuth, w testach obiekt na pamięci.
 * EN: Where the router gets the sign-in object. In the Worker it is getRuntimeAuth, in tests an object on memory.
 */
export type AuthEmailAppOptions = {
  /** PL: Zwraca obiekt logowania albo rzuca AuthNotConfiguredError. EN: Returns the sign-in object or throws AuthNotConfiguredError. */
  getRuntime: () => RuntimeAuth;
};

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
 * PL: Przekazuje do Better Auth to samo zapytanie, ale z nowym ciałem JSON. Dzięki temu do Better Auth trafiają tylko pola, które sami ustaliliśmy.
 * EN: Passes the same request to Better Auth, but with a new JSON body. This way only the fields we decided on reach Better Auth.
 *
 * @param context - PL: zapytanie Hono. EN: the Hono context.
 * @param runtime - PL: obiekt logowania. EN: the sign-in object.
 * @param body - PL: nowe ciało zapytania. EN: the new request body.
 * @returns PL: odpowiedź Better Auth. EN: the Better Auth response.
 */
function forwardWithBody(context: Context, runtime: RuntimeAuth, body: Record<string, string>): Promise<Response> {
  // PL: Długość ciała się zmienia, więc stary nagłówek musi zniknąć.
  // EN: The body length changes, so the old header must go.
  const headers = new Headers(context.req.raw.headers);
  headers.delete('content-length');
  headers.set('content-type', 'application/json');
  const request = new Request(context.req.raw.url, { method: 'POST', headers, body: JSON.stringify(body) });
  return Promise.resolve(runtime.auth.handler(request));
}

/**
 * PL: Obsługuje prośbę o kod: sprawdza adres szkolny i nadawcę, potem prosi Better Auth o kod. Obcy adres odrzuca, zanim powstanie kod.
 * EN: Handles a request for a code: checks the school address and the sender, then asks Better Auth for a code. A foreign address is rejected before a code is created.
 *
 * @param context - PL: zapytanie Hono. EN: the Hono context.
 * @param getRuntime - PL: zwraca obiekt logowania. EN: returns the sign-in object.
 * @returns PL: odpowiedź dla telefonu. EN: the response for the phone.
 */
async function handleSendCode(context: Context, getRuntime: () => RuntimeAuth): Promise<Response> {
  const fields = await readTextFields(context.req.raw, ['email']);
  if (!fields) return context.json({ error: 'invalid_request' }, 400);
  const email = normalizeSchoolEmail(fields.email);
  if (!isSchoolEmail(email)) return context.json({ error: 'email_not_allowed' }, 400);

  // PL: Bez nadawcy kodu (poza dev, dopóki maile czekają na Cloudflare) mówimy to wprost. Better Auth połyka błędy nadawcy, więc bez tego uczeń zobaczyłby „kod wysłany”, choć żaden nie wyszedł.
  // EN: Without a code sender (outside dev, while mail waits for Cloudflare) we say so plainly. Better Auth swallows sender errors, so without this the student would see "code sent" although none went out.
  const runtime = getRuntime();
  if (!runtime.canSendCodes) return context.json({ error: 'codes_unavailable' }, 503);

  // PL: Typ kodu ustawiamy sami, żeby telefon nie mógł poprosić o kod do resetu hasła ani weryfikacji.
  // EN: We set the code type ourselves, so the phone cannot ask for a password reset or verification code.
  return forwardWithBody(context, runtime, { email, type: 'sign-in' });
}

/**
 * PL: Obsługuje logowanie kodem. Domenę sprawdzamy też tu, żeby konto nigdy nie powstało dla obcego adresu.
 * EN: Handles code sign-in. We check the domain here too, so an account is never created for a foreign address.
 *
 * @param context - PL: zapytanie Hono. EN: the Hono context.
 * @param getRuntime - PL: zwraca obiekt logowania. EN: returns the sign-in object.
 * @returns PL: odpowiedź dla telefonu. EN: the response for the phone.
 */
async function handleSignIn(context: Context, getRuntime: () => RuntimeAuth): Promise<Response> {
  const fields = await readTextFields(context.req.raw, ['email', 'otp']);
  if (!fields) return context.json({ error: 'invalid_request' }, 400);
  const email = normalizeSchoolEmail(fields.email);
  if (!isSchoolEmail(email)) return context.json({ error: 'email_not_allowed' }, 400);

  // PL: Przekazujemy tylko adres i kod. Pola dodatkowe (imię, zdjęcie) odpadają.
  // EN: We pass only the address and the code. Extra fields (name, image) are dropped.
  return forwardWithBody(context, getRuntime(), { email, otp: fields.otp });
}

/**
 * PL: Buduje router logowania. Osobna funkcja, żeby test mógł podać obiekt na pamięci zamiast D1.
 * EN: Builds the sign-in router. A separate function so a test can pass an object on memory instead of D1.
 *
 * @param options - PL: skąd brać obiekt logowania. EN: where to get the sign-in object.
 * @returns PL: router Hono. EN: the Hono router.
 */
export function createAuthEmailApp(options: AuthEmailAppOptions): Hono {
  const app = new Hono();

  // PL: Brak ustawień serwera (baza, sekret) to 503, a nie 500: to nie błąd w kodzie, tylko brak konfiguracji.
  // EN: Missing server settings (database, secret) is 503, not 500: it is not a bug in the code, only missing configuration.
  app.onError((error, context) => {
    if (error instanceof AuthNotConfiguredError) return context.json({ error: 'not_configured' }, 503);
    throw error;
  });

  // PL: Wyślij kod, zaloguj kodem, pokaż sesję z ciasteczka (albo null), wyloguj (kasuje sesję w bazie i ciasteczko). Reszta adresów Better Auth dostaje 404.
  // EN: Send a code, sign in with a code, show the session from the cookie (or null), sign out (removes the session from the database and the cookie). Every other Better Auth route gets 404.
  app.post('/email-otp/send-verification-otp', (context) => handleSendCode(context, options.getRuntime));
  app.post('/sign-in/email-otp', (context) => handleSignIn(context, options.getRuntime));
  app.get('/get-session', (context) => Promise.resolve(options.getRuntime().auth.handler(context.req.raw)));
  app.post('/sign-out', (context) => Promise.resolve(options.getRuntime().auth.handler(context.req.raw)));
  return app;
}

/**
 * PL: Router podtoru 1a w Workerze: logowanie na D1, kod drukowany w terminalu tylko w dev.
 * EN: The subtrack 1a router in the Worker: sign-in on D1, the code printed in the terminal in dev only.
 */
export const authEmailApp = createAuthEmailApp({ getRuntime: getRuntimeAuth });
