/**
 * PL: Pomocnik testów podtoru 1b: konta z hasłem na prawdziwej bazie D1 testów (env.DB), z tym samym sekretem co logowanie kodem z maila (podtor 1a), żeby test mógł sprawdzić, że sesja z kodu zaproszenia działa też tam. Plik nie trafia do paczki, bo importują go tylko testy.
 * EN: The subtrack 1b test helper: password accounts on the real test D1 database (env.DB), with the same secret as the e-mail code sign-in (subtrack 1a), so a test can check that a session from an invitation code works there too. The file does not reach the bundle, because only tests import it.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/createInviteAuth.ts::createInviteAuth
 * @uses worker/auth/invite/routes.ts::createAuthInviteApp
 * @uses worker/auth/email/testRuntime.ts::createTestRuntime
 * @used_by worker/auth/invite/routes.test.ts::createTestInvite
 */

import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import type { Env } from '../../shared';
import { createTestRuntime as createEmailTestRuntime, uniqueIp } from '../email/testRuntime';
import { createInviteAuth, type AuthInvite } from './createInviteAuth';
import { createAuthInviteApp } from './routes';

/**
 * PL: Sekret testów, ten sam co w testRuntime podtoru 1a. Dzięki temu ciasteczko z jednego podtoru podpisuje się i sprawdza tak samo w drugim.
 * EN: The test secret, the same as in the testRuntime of subtrack 1a. Because of this a cookie from one subtrack is signed and checked the same way in the other.
 */
export const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/**
 * PL: Adres, z którego „przychodzi” zapytanie testu (nagłówek Origin). Better Auth przyjmuje tylko adres aplikacji: z BETTER_AUTH_URL z .dev.vars, a bez niego adres samego zapytania. Test bierze ten sam adres, więc działa z plikiem .dev.vars i bez niego (w CI go nie ma).
 * EN: The address the test request "comes from" (the Origin header). Better Auth accepts only the app address: from BETTER_AUTH_URL in .dev.vars, and without it the address of the request itself. The test takes the same address, so it works with and without the .dev.vars file (CI has none).
 */
export const TEST_ORIGIN = env.BETTER_AUTH_URL ?? 'http://localhost';

/**
 * PL: Wszystko, czego test potrzebuje do rozmowy z kontami z hasłem.
 * EN: Everything a test needs to talk to password accounts.
 */
export type TestInvite = {
  /** PL: Obiekt logowania hasłem na bazie testów. EN: The password sign-in object on the test database. */
  auth: AuthInvite;
  /** PL: Aplikacja z routerem pod /api/auth/invite, tak jak w Workerze. EN: The app with the router under /api/auth/invite, as in the Worker. */
  app: Hono<{ Bindings: Env }>;
  /** PL: Logowanie kodem z maila (podtor 1a) z tym samym sekretem i bazą. EN: The e-mail code sign-in (subtrack 1a) with the same secret and database. */
  emailAuth: ReturnType<typeof createEmailTestRuntime>['runtime']['auth'];
};

/**
 * PL: Tworzy świeże konta z hasłem na bazie D1 testów.
 * EN: Creates fresh password accounts on the test D1 database.
 *
 * @returns PL: logowanie hasłem, aplikacja i logowanie z podtoru 1a. EN: the password sign-in, the app and the sign-in of subtrack 1a.
 */
export function createTestInvite(): TestInvite {
  const auth = createInviteAuth({ db: env.DB, secret: TEST_SECRET });
  const app = new Hono<{ Bindings: Env }>();
  app.route('/api/auth/invite', createAuthInviteApp({ getAuth: () => auth }));
  return { auth, app, emailAuth: createEmailTestRuntime().runtime.auth };
}

/**
 * PL: Wysyła zapytanie do aplikacji testowej tak, jak robi to przeglądarka: z nagłówkiem Origin (bez niego Better Auth odrzuca zapytanie) i z adresem IP.
 * EN: Sends a request to the test app the way a browser does: with an Origin header (without it Better Auth rejects the request) and an IP address.
 *
 * @param app - PL: aplikacja testowa. EN: the test app.
 * @param path - PL: adres po /api/auth/invite, na przykład /sign-up. EN: the path after /api/auth/invite, for example /sign-up.
 * @param options - PL: ciało JSON i adres IP. EN: the JSON body and the IP address.
 * @returns PL: odpowiedź aplikacji. EN: the app response.
 */
export function call(app: TestInvite['app'], path: string, options: { body?: unknown; ip?: string } = {}): Promise<Response> {
  const init = {
    method: 'POST',
    headers: { origin: TEST_ORIGIN, 'cf-connecting-ip': options.ip ?? uniqueIp(), 'content-type': 'application/json' },
    body: JSON.stringify(options.body ?? {}),
  };
  return Promise.resolve(app.request(`http://localhost/api/auth/invite${path}`, init, env));
}
