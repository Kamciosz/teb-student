/**
 * PL: Router Hono podtoru 1a (logowanie kodem z maila). Przepuszcza do Better Auth tylko wybrane adresy: wyślij kod, zaloguj kodem, pokaż sesję, wyloguj, urządzenia (lista, wylogowanie jednego, wylogowanie innych) oraz klucze dostępu (rejestracja, logowanie, lista, usunięcie). Pilnuje domeny szkolnej, zanim kod w ogóle powstanie. Reszta adresów Better Auth dostaje 404. Router jest podpięty pod /api/auth/email w worker/mounts.ts.
 * EN: The Hono router of subtrack 1a (sign-in with an e-mail code). It lets only the chosen routes through to Better Auth: send a code, sign in with a code, show the session, sign out, the devices (list, sign out one, sign out the others) and the passkeys (register, sign in, list, delete). It checks the school domain before a code is even created. Every other Better Auth route gets 404. The router is mounted under /api/auth/email in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/runtimeAuth.ts::getRuntimeAuth
 * @uses worker/auth/email/schoolEmail.ts::isSchoolEmail
 * @uses worker/auth/email/devices.ts::listDevices
 * @uses worker/auth/email/devices.ts::revokeDevice
 * @uses worker/auth/email/devices.ts::revokeOtherDevices
 * @uses worker/auth/email/passkeys.ts::toPasskeyView
 * @used_by worker/auth/email/index.ts::authEmailApp
 * @used_by worker/auth/email/routes.test.ts::createAuthEmailApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono, type Context } from 'hono';
// PL: Dozwolony kod HTTP z treścią JSON (używany przy błędach urządzeń).
// EN: An HTTP status code allowed with a JSON body (used for device errors).
import type { ContentfulStatusCode } from 'hono/utils/http-status';
// PL: Typ środowiska Workera (baza DB i sekrety).
// EN: The Worker environment type (the DB database and secrets).
import type { Env } from '../../shared';
// PL: Obiekt logowania i błąd braku ustawień.
// EN: The sign-in object and the missing-settings error.
import { AuthNotConfiguredError, getRuntimeAuth, type RuntimeAuth } from './runtimeAuth';
// PL: Lista i wylogowanie urządzeń.
// EN: The device list and device sign-out.
import { listDevices, revokeDevice, revokeOtherDevices, type DeviceOutcome } from './devices';
// PL: Sprawdzanie adresu szkolnego.
// EN: The school address check.
import { isSchoolEmail, normalizeSchoolEmail } from './schoolEmail';
// PL: Klucze dostępu: zamiana wiersza na bezpieczny kształt.
// EN: Passkeys: turning a row into a safe shape.
import { toPasskeyView, type PasskeyRow } from './passkeys';

/**
 * PL: Skąd router bierze obiekt logowania. W Workerze to getRuntimeAuth, w testach obiekt z nadawcą, który zapisuje kody.
 * EN: Where the router gets the sign-in object. In the Worker it is getRuntimeAuth, in tests an object with a sender that records codes.
 */
export type AuthEmailAppOptions = {
  /** PL: Zwraca obiekt logowania dla środowiska Workera albo rzuca AuthNotConfiguredError. EN: Returns the sign-in object for the Worker environment or throws AuthNotConfiguredError. */
  getRuntime: (env: Env) => RuntimeAuth;
};

/**
 * PL: Zapytanie Hono routera logowania: ma bindingi Workera (context.env).
 * EN: A Hono context of the sign-in router: it has the Worker bindings (context.env).
 */
type AuthContext = Context<{ Bindings: Env }>;

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
 * PL: Czyta ciało JSON jako obiekt (np. odpowiedź przeglądarki przy kluczu dostępu). Zły JSON albo tablica daje null.
 * EN: Reads the JSON body as an object (for example the browser's answer for a passkey). Bad JSON or an array gives null.
 *
 * @param request - PL: zapytanie od telefonu. EN: the request from the phone.
 * @returns PL: obiekt albo null. EN: an object or null.
 */
async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  return body as Record<string, unknown>;
}

/**
 * PL: Zamienia wynik urządzeń na odpowiedź dla telefonu: sukces z treścią albo kod HTTP i kod błędu.
 * EN: Turns a device result into a response for the phone: success with a body, or an HTTP status and an error code.
 *
 * @param context - PL: zapytanie Hono. EN: the Hono context.
 * @param outcome - PL: wynik z devices.ts. EN: the result from devices.ts.
 * @param toBody - PL: treść przy sukcesie. EN: the body on success.
 * @returns PL: odpowiedź dla telefonu. EN: the response for the phone.
 */
function deviceResponse<T>(context: AuthContext, outcome: DeviceOutcome<T>, toBody: (value: T) => unknown): Response {
  if (!outcome.ok) return context.json({ error: outcome.error }, outcome.status as ContentfulStatusCode);
  return context.json(toBody(outcome.value));
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
function forwardWithBody(context: AuthContext, runtime: RuntimeAuth, body: Record<string, unknown>): Promise<Response> {
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
 * @param getRuntime - PL: zwraca obiekt logowania dla środowiska. EN: returns the sign-in object for the environment.
 * @returns PL: odpowiedź dla telefonu. EN: the response for the phone.
 */
async function handleSendCode(context: AuthContext, getRuntime: (env: Env) => RuntimeAuth): Promise<Response> {
  const fields = await readTextFields(context.req.raw, ['email']);
  if (!fields) return context.json({ error: 'invalid_request' }, 400);
  const email = normalizeSchoolEmail(fields.email);
  if (!isSchoolEmail(email)) return context.json({ error: 'email_not_allowed' }, 400);

  // PL: Bez nadawcy kodu (poza dev, dopóki maile czekają na Cloudflare) mówimy to wprost. Better Auth połyka błędy nadawcy, więc bez tego uczeń zobaczyłby „kod wysłany”, choć żaden nie wyszedł.
  // EN: Without a code sender (outside dev, while mail waits for Cloudflare) we say so plainly. Better Auth swallows sender errors, so without this the student would see "code sent" although none went out.
  const runtime = getRuntime(context.env);
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
 * @param getRuntime - PL: zwraca obiekt logowania dla środowiska. EN: returns the sign-in object for the environment.
 * @returns PL: odpowiedź dla telefonu. EN: the response for the phone.
 */
async function handleSignIn(context: AuthContext, getRuntime: (env: Env) => RuntimeAuth): Promise<Response> {
  const fields = await readTextFields(context.req.raw, ['email', 'otp']);
  if (!fields) return context.json({ error: 'invalid_request' }, 400);
  const email = normalizeSchoolEmail(fields.email);
  if (!isSchoolEmail(email)) return context.json({ error: 'email_not_allowed' }, 400);

  // PL: Przekazujemy tylko adres i kod. Pola dodatkowe (imię, zdjęcie) odpadają.
  // EN: We pass only the address and the code. Extra fields (name, image) are dropped.
  return forwardWithBody(context, getRuntime(context.env), { email, otp: fields.otp });
}

/**
 * PL: Buduje router logowania. Osobna funkcja, żeby test mógł podać własnego nadawcę kodu.
 * EN: Builds the sign-in router. A separate function so a test can pass its own code sender.
 *
 * @param options - PL: skąd brać obiekt logowania. EN: where to get the sign-in object.
 * @returns PL: router Hono. EN: the Hono router.
 */
export function createAuthEmailApp(options: AuthEmailAppOptions): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>();

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
  app.get('/get-session', (context) => Promise.resolve(options.getRuntime(context.env).auth.handler(context.req.raw)));
  app.post('/sign-out', (context) => Promise.resolve(options.getRuntime(context.env).auth.handler(context.req.raw)));

  // PL: Urządzenia: lista, wylogowanie jednego (po id z listy), wylogowanie wszystkich innych. Logika sesji siedzi w devices.ts i u Better Auth.
  // EN: Devices: the list, signing out one (by the id from the list), signing out all others. The session logic lives in devices.ts and in Better Auth.
  app.get('/devices', async (context) => {
    const outcome = await listDevices(options.getRuntime(context.env), context.req.raw);
    return deviceResponse(context, outcome, (devices) => ({ devices }));
  });
  app.post('/devices/revoke', async (context) => {
    const fields = await readTextFields(context.req.raw, ['id']);
    if (!fields) return context.json({ error: 'invalid_request' }, 400);
    const outcome = await revokeDevice(options.getRuntime(context.env), context.req.raw, fields.id);
    return deviceResponse(context, outcome, () => ({ ok: true }));
  });
  app.post('/devices/revoke-others', async (context) => {
    const outcome = await revokeOtherDevices(options.getRuntime(context.env), context.req.raw);
    return deviceResponse(context, outcome, () => ({ ok: true }));
  });

  // PL: Klucze dostępu (Face ID, Touch ID, Windows Hello). Rejestracja wymaga zalogowania, bo Better Auth sprawdza sesję. Logowanie kluczem jest publiczne i tworzy zwykłą sesję. Zmiany nazwy klucza nie wystawiamy (poza zakresem).
  // EN: Passkeys (Face ID, Touch ID, Windows Hello). Registration needs a signed-in session, because Better Auth checks it. Passkey sign-in is public and creates an ordinary session. We do not expose renaming a key (out of scope).
  app.get('/passkey/generate-register-options', (context) => Promise.resolve(options.getRuntime(context.env).auth.handler(context.req.raw)));
  app.post('/passkey/verify-registration', async (context) => {
    const body = await readJsonObject(context.req.raw);
    if (!body || typeof body.response !== 'object' || body.response === null) return context.json({ error: 'invalid_request' }, 400);
    // PL: Przekazujemy tylko odpowiedź przeglądarki i nazwę. Pole createSession odpada, bo sesja już istnieje.
    // EN: We pass only the browser answer and the name. The createSession field is dropped, because the session already exists.
    const name = typeof body.name === 'string' ? body.name : undefined;
    return forwardWithBody(context, options.getRuntime(context.env), { response: body.response, name });
  });
  app.get('/passkey/generate-authenticate-options', (context) => Promise.resolve(options.getRuntime(context.env).auth.handler(context.req.raw)));
  app.post('/passkey/verify-authentication', async (context) => {
    const body = await readJsonObject(context.req.raw);
    if (!body || typeof body.response !== 'object' || body.response === null) return context.json({ error: 'invalid_request' }, 400);
    // PL: Przekazujemy tylko odpowiedź przeglądarki. Better Auth sam zakłada sesję i ustawia ciasteczko.
    // EN: We pass only the browser answer. Better Auth creates the session and sets the cookie itself.
    return forwardWithBody(context, options.getRuntime(context.env), { response: body.response });
  });
  app.get('/passkey/list-user-passkeys', async (context) => {
    const runtime = options.getRuntime(context.env);
    const response = await Promise.resolve(runtime.auth.handler(context.req.raw));
    if (!response.ok) return response;
    // PL: Better Auth zwraca pełne wiersze z kluczem publicznym. Do telefonu idzie tylko bezpieczny kształt.
    // EN: Better Auth returns full rows with the public key. Only the safe shape goes to the phone.
    const rows = (await response.json()) as PasskeyRow[];
    return context.json(rows.map(toPasskeyView));
  });
  app.post('/passkey/delete-passkey', async (context) => {
    const fields = await readTextFields(context.req.raw, ['id']);
    if (!fields) return context.json({ error: 'invalid_request' }, 400);
    return forwardWithBody(context, options.getRuntime(context.env), { id: fields.id });
  });
  return app;
}

/**
 * PL: Router podtoru 1a w Workerze: logowanie na D1 (context.env.DB), kod drukowany w terminalu tylko w dev.
 * EN: The subtrack 1a router in the Worker: sign-in on D1, the code printed in the terminal in dev only.
 */
export const authEmailApp = createAuthEmailApp({ getRuntime: getRuntimeAuth });
