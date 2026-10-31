/**
 * PL: Obiekt logowania hasłem działający w Workerze: baza D1, sekret i adres aplikacji pochodzą ze środowiska Workera. Obiekt powstaje raz na instancję Workera. Bez sekretu BETTER_AUTH_SECRET, a poza dev także bez BETTER_AUTH_URL, zgłasza błąd braku ustawień, a router odpowiada 503. Sekret jest obowiązkowy też w dev: sesja musi się zgadzać z podtorem 1a, a ten bez sekretu losuje własny, którego tu nie znamy.
 * EN: The password sign-in object running in the Worker: the D1 database, the secret and the app address come from the Worker environment. The object is created once per Worker instance. Without the BETTER_AUTH_SECRET secret, and outside dev also without BETTER_AUTH_URL, it reports missing settings, and the router answers 503. The secret is mandatory in dev too: the session must match subtrack 1a, which without a secret draws its own that we do not know here.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/createInviteAuth.ts::createInviteAuth
 * @uses worker/auth/email/codeSender.ts::isDevRuntime
 * @used_by worker/auth/invite/routes.ts::authInviteApp
 */

// PL: Typ środowiska Workera (baza DB i sekrety) ze wspólnej części serwera.
// EN: The Worker environment type (the DB database and secrets) from the shared part of the server.
import type { Env } from '../../shared';
// PL: Tryb dev, ten sam co w logowaniu kodem, żeby oba podtory oceniały go tak samo.
// EN: The dev mode, the same as in code sign-in, so both subtracks judge it the same way.
import { isDevRuntime } from '../email/codeSender';
import { createInviteAuth, type AuthInvite } from './createInviteAuth';

/**
 * PL: Błąd: serwer nie ma ustawień potrzebnych do logowania hasłem (sekretu albo adresu aplikacji).
 * EN: Error: the server lacks the settings needed for password sign-in (the secret or the app address).
 */
export class InviteNotConfiguredError extends Error {}

/**
 * PL: Wybiera adres aplikacji z BETTER_AUTH_URL. Poza dev jest obowiązkowy, bo bez niego Better Auth ufałby adresowi samego zapytania.
 * EN: Picks the app address from BETTER_AUTH_URL. Outside dev it is mandatory, because without it Better Auth would trust the address of the request itself.
 *
 * @param env - PL: środowisko Workera. EN: the Worker environment.
 * @param isDev - PL: prawda w dev. EN: true in dev.
 * @returns PL: adres aplikacji albo undefined w dev. EN: the app address, or undefined in dev.
 * @throws PL: InviteNotConfiguredError, gdy poza dev brak BETTER_AUTH_URL. EN: InviteNotConfiguredError when BETTER_AUTH_URL is missing outside dev.
 */
export function pickAppUrl(env: Env, isDev: boolean): string | undefined {
  if (env.BETTER_AUTH_URL) return env.BETTER_AUTH_URL;
  if (!isDev) throw new InviteNotConfiguredError('Brak BETTER_AUTH_URL / Missing the BETTER_AUTH_URL setting');
  return undefined;
}

/**
 * PL: Obiekt zbudowany dla jednej bazy, jednego sekretu i jednego adresu aplikacji, zapamiętany do następnych zapytań.
 * EN: The object built for one database, one secret and one app address, remembered for the next requests.
 */
let cached: { db: D1Database; secret: string; appUrl: string | undefined; auth: AuthInvite } | null = null;

/**
 * PL: Zwraca obiekt logowania hasłem. Pierwsze wywołanie buduje go, kolejne oddają ten sam.
 * EN: Returns the password sign-in object. The first call builds it, the next ones return the same.
 *
 * @param env - PL: środowisko Workera z zapytania (context.env). EN: the Worker environment from the request (context.env).
 * @returns PL: obiekt logowania. EN: the sign-in object.
 * @throws PL: InviteNotConfiguredError, gdy brak sekretu BETTER_AUTH_SECRET albo, poza dev, adresu BETTER_AUTH_URL. EN: InviteNotConfiguredError when the BETTER_AUTH_SECRET secret is missing, or, outside dev, the BETTER_AUTH_URL address is missing.
 */
export function getInviteAuth(env: Env): AuthInvite {
  // PL: Bez sekretu nie da się podpisać ciasteczka sesji tak jak robi to podtor 1a.
  // EN: Without the secret the session cookie cannot be signed the way subtrack 1a does it.
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret) throw new InviteNotConfiguredError('Brak sekretu BETTER_AUTH_SECRET / Missing the BETTER_AUTH_SECRET secret');

  // PL: Adres aplikacji: poza dev obowiązkowy.
  // EN: The app address: mandatory outside dev.
  const appUrl = pickAppUrl(env, isDevRuntime());

  // PL: Ta sama baza, sekret i adres, więc oddaj już zbudowany obiekt.
  // EN: The same database, secret and address, so return the object that is already built.
  if (cached && cached.db === env.DB && cached.secret === secret && cached.appUrl === appUrl) return cached.auth;

  // PL: Zbuduj obiekt i zapamiętaj go.
  // EN: Build the object and remember it.
  const auth = createInviteAuth({ db: env.DB, secret, appUrl });
  cached = { db: env.DB, secret, appUrl, auth };
  return auth;
}
