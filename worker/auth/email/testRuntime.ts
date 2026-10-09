/**
 * PL: Pomocnik testów podtoru 1a: logowanie na bazie w pamięci, z nadawcą, który zapisuje kody zamiast je drukować. Dzięki temu testy sprawdzają ten sam kod co Worker, bez D1 i bez terminala. Plik nie trafia do paczki, bo importują go tylko testy.
 * EN: The subtrack 1a test helper: sign-in on an in-memory database, with a sender that records codes instead of printing them. This way tests exercise the same code as the Worker, without D1 and without a terminal. The file does not reach the bundle, because only tests import it.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/createAuth.ts::createAuth
 * @uses worker/auth/email/routes.ts::createAuthEmailApp
 * @used_by worker/auth/email/routes.test.ts::createTestRuntime
 * @used_by worker/auth/email/session.test.ts::createTestRuntime
 * @used_by worker/auth/email/deleteStudentData.test.ts::createTestRuntime
 */

// PL: Baza w pamięci z Better Auth i klasa routera.
// EN: The in-memory database from Better Auth and the router class.
import { memoryAdapter } from 'better-auth/adapters/memory';
import { Hono } from 'hono';
import type { CodeMessage } from './codeSender';
import { createAuth } from './createAuth';
import { createAuthEmailApp } from './routes';
import type { RuntimeAuth } from './runtimeAuth';

/**
 * PL: Wszystko, czego test potrzebuje do rozmowy z logowaniem.
 * EN: Everything a test needs to talk to sign-in.
 */
export type TestRuntime = {
  /** PL: Obiekt logowania na pamięci. EN: The sign-in object on memory. */
  runtime: RuntimeAuth;
  /** PL: Kody „wysłane” do tej pory, od najstarszego. EN: The codes "sent" so far, oldest first. */
  sent: CodeMessage[];
  /** PL: Aplikacja z routerem pod /api/auth/email, tak jak w Workerze. EN: The app with the router under /api/auth/email, as in the Worker. */
  app: Hono;
};

/**
 * PL: Tworzy świeże logowanie na pamięci.
 * EN: Creates a fresh sign-in on memory.
 *
 * @param canSendCodes - PL: prawda, gdy nadawca kodu ma istnieć (domyślnie tak). EN: true when the code sender should exist (the default).
 * @returns PL: logowanie, lista wysłanych kodów i aplikacja. EN: the sign-in, the list of sent codes and the app.
 */
export function createTestRuntime(canSendCodes = true): TestRuntime {
  const sent: CodeMessage[] = [];

  // PL: Wszystkie tabele podajemy z góry, bo adapter pamięci rzuca błąd przy brakującej.
  // EN: We pass every table up front, because the memory adapter errors on a missing one.
  const database = memoryAdapter({ user: [], session: [], account: [], verification: [] });
  const auth = createAuth({
    database,
    secret: 'test-secret-test-secret-test-secret-00',
    sendCode: async (message) => {
      sent.push(message);
    },
  });
  const runtime: RuntimeAuth = { auth, canSendCodes };

  // PL: Router podpięty pod ten sam adres co w worker/mounts.ts.
  // EN: The router mounted at the same address as in worker/mounts.ts.
  const app = new Hono();
  app.route('/api/auth/email', createAuthEmailApp({ getRuntime: () => runtime }));
  return { runtime, sent, app };
}

/** PL: Licznik adresów IP, żeby limit zapytań jednego testu nie wpływał na inny. EN: The IP address counter, so one test's request limit does not affect another. */
let nextIp = 1;

/**
 * PL: Zwraca nowy, unikalny adres IP dla testu.
 * EN: Returns a new unique IP address for a test.
 *
 * @returns PL: adres IP w formie tekstu. EN: an IP address as a string.
 */
export function uniqueIp(): string {
  nextIp += 1;
  return `10.0.${Math.floor(nextIp / 250)}.${nextIp % 250}`;
}

/**
 * PL: Wysyła zapytanie do aplikacji testowej tak, jak robi to przeglądarka: z nagłówkiem Origin (bez niego Better Auth odrzuca zapytanie) i z adresem IP.
 * EN: Sends a request to the test app the way a browser does: with an Origin header (without it Better Auth rejects the request) and an IP address.
 *
 * @param app - PL: aplikacja testowa. EN: the test app.
 * @param path - PL: adres po /api/auth/email, na przykład /get-session. EN: the path after /api/auth/email, for example /get-session.
 * @param options - PL: metoda, ciało JSON, ciasteczko i IP. EN: the method, the JSON body, the cookie and the IP.
 * @returns PL: odpowiedź aplikacji. EN: the app response.
 */
export function call(
  app: Hono,
  path: string,
  options: { method?: string; body?: unknown; cookie?: string; ip?: string } = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    origin: 'http://localhost',
    'cf-connecting-ip': options.ip ?? uniqueIp(),
  };
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  if (options.cookie) headers.cookie = options.cookie;
  return Promise.resolve(
    app.request(`http://localhost/api/auth/email${path}`, {
      method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    }),
  );
}

/**
 * PL: Wyciąga z odpowiedzi ciasteczko sesji w formie gotowej do nagłówka Cookie.
 * EN: Extracts the session cookie from a response in a form ready for the Cookie header.
 *
 * @param response - PL: odpowiedź po udanym logowaniu. EN: the response after a successful sign-in.
 * @returns PL: „nazwa=wartość” albo pusty tekst. EN: "name=value" or an empty string.
 */
export function sessionCookie(response: Response): string {
  return (response.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
}

/**
 * PL: Loguje ucznia kodem i zwraca ciasteczko sesji. Skrót dla testów, które potrzebują zalogowanego ucznia.
 * EN: Signs a student in with a code and returns the session cookie. A shortcut for tests that need a signed-in student.
 *
 * @param test - PL: logowanie testowe. EN: the test sign-in.
 * @param email - PL: adres ucznia. EN: the student's address.
 * @returns PL: ciasteczko sesji. EN: the session cookie.
 */
export async function signIn(test: TestRuntime, email: string): Promise<string> {
  const ip = uniqueIp();
  await call(test.app, '/email-otp/send-verification-otp', { body: { email }, ip });
  const code = test.sent[test.sent.length - 1]?.code ?? '';
  const response = await call(test.app, '/sign-in/email-otp', { body: { email, otp: code }, ip });
  return sessionCookie(response);
}
