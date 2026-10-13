/**
 * PL: Urządzenia ucznia: lista aktywnych sesji, wylogowanie jednego urządzenia i wylogowanie wszystkich innych. Sesje liczy i kasuje Better Auth (list-sessions, revoke-session, revoke-other-sessions), a my tylko przekładamy wynik na bezpieczny kształt: bez tokenu i bez adresu IP. Wywołania idą przez auth.handler, więc działa ochrona Origin Better Auth.
 * EN: The student's devices: the list of active sessions, signing out one device and signing out all other devices. Better Auth counts and deletes the sessions (list-sessions, revoke-session, revoke-other-sessions), and we only turn the result into a safe shape: no token and no IP address. The calls go through auth.handler, so the Better Auth Origin protection applies.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/auth/email/runtimeAuth.ts::RuntimeAuth
 * @uses worker/auth/email/settings.ts::AUTH_BASE_PATH
 * @used_by worker/auth/email/routes.ts::createAuthEmailApp
 * @used_by worker/auth/email/devices.test.ts::describeUserAgent
 */

// PL: Typ obiektu logowania, na którym działają trasy urządzeń.
// EN: The type of the sign-in object the device routes run on.
import type { RuntimeAuth } from './runtimeAuth';
// PL: Adres bazowy Better Auth, żeby zapytania trafiały w jego trasy.
// EN: The Better Auth base address, so requests hit its routes.
import { AUTH_BASE_PATH } from './settings';

/**
 * PL: Jedno urządzenie tak, jak widzi je uczeń. Bez tokenu i adresu IP.
 * EN: One device as the student sees it. No token and no IP address.
 */
export type Device = {
  /** PL: Id sesji w bazie, do wylogowania tego urządzenia. EN: The session id in the database, for signing this device out. */
  id: string;
  /** PL: Przeglądarka w prostej formie, na przykład Chrome. EN: The browser in a simple form, for example Chrome. */
  browser: string;
  /** PL: System w prostej formie, na przykład Android. EN: The system in a simple form, for example Android. */
  system: string;
  /** PL: Ostatnia aktywność (przybliżona, bo Better Auth odświeża sesję co ok. 24 h). EN: The last activity (approximate, because Better Auth refreshes the session about every 24 h). */
  lastActiveAt: string;
  /** PL: Prawda dla urządzenia, z którego idzie zapytanie. EN: True for the device the request comes from. */
  current: boolean;
};

/**
 * PL: Wynik trasy urządzeń: sukces z danymi albo kod HTTP i nasz kod błędu.
 * EN: The result of a device route: success with data, or an HTTP status and our error code.
 */
export type DeviceOutcome<T> = { ok: true; value: T } | { ok: false; status: number; error: string };

/** PL: Kształt sesji zwracany przez Better Auth z list-sessions (tylko pola, których używamy). EN: The session shape Better Auth returns from list-sessions (only the fields we use). */
type AuthSessionRow = { id: string; token: string; updatedAt: string | number | Date; userAgent?: string | null };

/**
 * PL: Nazwy przeglądarki i systemu z user-agenta, bez żadnej zewnętrznej biblioteki. Kolejność ma znaczenie: Edge przed Chrome, Chrome przed Safari, Android przed Linux, iPhone i iPad przed macOS.
 * EN: The browser and system names from the user-agent, with no external library. The order matters: Edge before Chrome, Chrome before Safari, Android before Linux, iPhone and iPad before macOS.
 *
 * @param userAgent - PL: nagłówek user-agent sesji albo null. EN: the session's user-agent header, or null.
 * @returns PL: nazwy po polsku, a dla nieznanego tekstu ogólne napisy. EN: the names, with general labels for unknown text.
 */
export function describeUserAgent(userAgent: string | null | undefined): { browser: string; system: string } {
  const ua = userAgent ?? '';
  return { browser: browserName(ua), system: systemName(ua) };
}

/**
 * PL: Nazwa przeglądarki z user-agenta.
 * EN: The browser name from the user-agent.
 *
 * @param ua - PL: user-agent. EN: the user-agent.
 * @returns PL: nazwa przeglądarki. EN: the browser name.
 */
function browserName(ua: string): string {
  if (/\bEdg[A-Za-z]*\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Firefox\/|FxiOS\//.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Nieznana przeglądarka';
}

/**
 * PL: Nazwa systemu z user-agenta.
 * EN: The system name from the user-agent.
 *
 * @param ua - PL: user-agent. EN: the user-agent.
 * @returns PL: nazwa systemu. EN: the system name.
 */
function systemName(ua: string): string {
  if (/Android/.test(ua)) return 'Android';
  if (/iPhone|iPod/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X|Macintosh/.test(ua)) return 'macOS';
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Nieznany system';
}

/**
 * PL: Buduje zapytanie do trasy Better Auth z nagłówkami oryginalnego zapytania (cookie i Origin), żeby Better Auth widział tę samą sesję i tego samego klienta.
 * EN: Builds a request to a Better Auth route with the headers of the original request (cookie and Origin), so Better Auth sees the same session and the same client.
 *
 * @param source - PL: zapytanie od telefonu. EN: the request from the phone.
 * @param path - PL: adres trasy po /api/auth/email, na przykład /list-sessions. EN: the route path after /api/auth/email, for example /list-sessions.
 * @param method - PL: metoda HTTP. EN: the HTTP method.
 * @param body - PL: ciało JSON dla POST. EN: the JSON body for POST.
 * @returns PL: zapytanie gotowe do auth.handler. EN: the request ready for auth.handler.
 */
function authRequest(source: Request, path: string, method: 'GET' | 'POST', body?: Record<string, string>): Request {
  const headers = new Headers(source.headers);
  headers.delete('content-length');
  if (method === 'GET') {
    headers.delete('content-type');
    return new Request(new URL(`${AUTH_BASE_PATH}${path}`, source.url), { method, headers });
  }
  headers.set('content-type', 'application/json');
  return new Request(new URL(`${AUTH_BASE_PATH}${path}`, source.url), {
    method,
    headers,
    body: JSON.stringify(body ?? {}),
  });
}

/**
 * PL: Zamienia nieudaną odpowiedź Better Auth na nasz kod błędu. Świeżość sesji (403 SESSION_NOT_FRESH) dostaje osobny kod, bo UI pokazuje wtedy „zaloguj się ponownie”.
 * EN: Turns a failed Better Auth answer into our error code. Session freshness (403 SESSION_NOT_FRESH) gets its own code, because the UI then shows "sign in again".
 *
 * @param response - PL: odpowiedź Better Auth. EN: the Better Auth response.
 * @returns PL: nieudany wynik z kodem HTTP i kodem błędu. EN: a failed result with the HTTP status and the error code.
 */
async function failFromAuth<T>(response: Response): Promise<DeviceOutcome<T>> {
  if (response.status === 401) return { ok: false, status: 401, error: 'unauthorized' };
  const body = (await response.json().catch(() => null)) as { code?: string } | null;
  if (body?.code === 'SESSION_NOT_FRESH') return { ok: false, status: 403, error: 'session_not_fresh' };
  if (response.status >= 500) return { ok: false, status: 503, error: 'unavailable' };
  return { ok: false, status: 403, error: 'forbidden' };
}

/**
 * PL: Pobiera sesje ucznia z Better Auth i zaznacza bieżącą. Ta sama funkcja służy do listy i do znalezienia tokenu przed wylogowaniem.
 * EN: Gets the student's sessions from Better Auth and marks the current one. The same function serves the list and finding a token before sign-out.
 *
 * @param runtime - PL: obiekt logowania. EN: the sign-in object.
 * @param source - PL: zapytanie od telefonu. EN: the request from the phone.
 * @returns PL: sesje albo nieudany wynik. EN: the sessions or a failed result.
 */
async function loadSessions(
  runtime: RuntimeAuth,
  source: Request,
): Promise<DeviceOutcome<{ rows: AuthSessionRow[]; currentId: string }>> {
  const current = await runtime.auth.api.getSession({ headers: source.headers });
  if (!current) return { ok: false, status: 401, error: 'unauthorized' };

  const response = await runtime.auth.handler(authRequest(source, '/list-sessions', 'GET'));
  if (!response.ok) return failFromAuth(response);
  const rows = (await response.json()) as AuthSessionRow[];
  return { ok: true, value: { rows, currentId: current.session.id } };
}

/**
 * PL: Zwraca listę aktywnych urządzeń ucznia.
 * EN: Returns the list of the student's active devices.
 *
 * @param runtime - PL: obiekt logowania. EN: the sign-in object.
 * @param source - PL: zapytanie od telefonu. EN: the request from the phone.
 * @returns PL: lista urządzeń albo nieudany wynik. EN: the device list or a failed result.
 */
export async function listDevices(runtime: RuntimeAuth, source: Request): Promise<DeviceOutcome<Device[]>> {
  const loaded = await loadSessions(runtime, source);
  if (!loaded.ok) return loaded;
  const { rows, currentId } = loaded.value;
  const devices = rows.map((row) => {
    const names = describeUserAgent(row.userAgent);
    return {
      id: row.id,
      browser: names.browser,
      system: names.system,
      lastActiveAt: new Date(row.updatedAt).toISOString(),
      current: row.id === currentId,
    };
  });
  return { ok: true, value: devices };
}

/**
 * PL: Wylogowuje jedno urządzenie po id z listy. Bieżącego urządzenia tą drogą nie wylogowujemy (zostałoby ciasteczko bez sesji), a nieznane id daje 404.
 * EN: Signs out one device by its id from the list. The current device is not signed out this way (a cookie without a session would stay), and an unknown id gives 404.
 *
 * @param runtime - PL: obiekt logowania. EN: the sign-in object.
 * @param source - PL: zapytanie od telefonu. EN: the request from the phone.
 * @param id - PL: id sesji z listy. EN: the session id from the list.
 * @returns PL: pusty sukces albo nieudany wynik. EN: an empty success or a failed result.
 */
export async function revokeDevice(runtime: RuntimeAuth, source: Request, id: string): Promise<DeviceOutcome<null>> {
  const loaded = await loadSessions(runtime, source);
  if (!loaded.ok) return loaded;
  const { rows, currentId } = loaded.value;
  if (id === currentId) return { ok: false, status: 400, error: 'current_session' };

  // PL: Token zostaje po stronie serwera: z listy wychodzi tylko id.
  // EN: The token stays on the server: only the id leaves in the list.
  const target = rows.find((row) => row.id === id);
  if (!target) return { ok: false, status: 404, error: 'not_found' };

  const response = await runtime.auth.handler(authRequest(source, '/revoke-session', 'POST', { token: target.token }));
  if (!response.ok) return failFromAuth(response);
  return { ok: true, value: null };
}

/**
 * PL: Wylogowuje wszystkie urządzenia ucznia poza bieżącym.
 * EN: Signs out all of the student's devices except the current one.
 *
 * @param runtime - PL: obiekt logowania. EN: the sign-in object.
 * @param source - PL: zapytanie od telefonu. EN: the request from the phone.
 * @returns PL: pusty sukces albo nieudany wynik. EN: an empty success or a failed result.
 */
export async function revokeOtherDevices(runtime: RuntimeAuth, source: Request): Promise<DeviceOutcome<null>> {
  const current = await runtime.auth.api.getSession({ headers: source.headers });
  if (!current) return { ok: false, status: 401, error: 'unauthorized' };

  const response = await runtime.auth.handler(authRequest(source, '/revoke-other-sessions', 'POST', {}));
  if (!response.ok) return failFromAuth(response);
  return { ok: true, value: null };
}
