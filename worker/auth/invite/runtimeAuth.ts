/**
 * PL: Obiekt logowania hasłem działający w Workerze: baza D1 i sekret pochodzą ze środowiska Workera. Obiekt powstaje raz na instancję Workera. Bez sekretu BETTER_AUTH_SECRET zgłasza błąd braku ustawień, a router odpowiada 503. Sekret jest obowiązkowy też w dev: sesja musi się zgadzać z podtorem 1a, a ten bez sekretu losuje własny, którego tu nie znamy.
 * EN: The password sign-in object running in the Worker: the D1 database and the secret come from the Worker environment. The object is created once per Worker instance. Without the BETTER_AUTH_SECRET secret it reports missing settings, and the router answers 503. The secret is mandatory in dev too: the session must match subtrack 1a, which without a secret draws its own that we do not know here.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/createInviteAuth.ts::createInviteAuth
 * @used_by worker/auth/invite/routes.ts::authInviteApp
 */

// PL: Typ środowiska Workera (baza DB i sekrety) ze wspólnej części serwera.
// EN: The Worker environment type (the DB database and secrets) from the shared part of the server.
import type { Env } from '../../shared';
import { createInviteAuth, type AuthInvite } from './createInviteAuth';

/**
 * PL: Błąd: serwer nie ma ustawień potrzebnych do logowania hasłem (sekretu).
 * EN: Error: the server lacks the settings needed for password sign-in (the secret).
 */
export class InviteNotConfiguredError extends Error {}

/**
 * PL: Obiekt zbudowany dla jednej bazy i jednego sekretu, zapamiętany do następnych zapytań.
 * EN: The object built for one database and one secret, remembered for the next requests.
 */
let cached: { db: D1Database; secret: string; auth: AuthInvite } | null = null;

/**
 * PL: Zwraca obiekt logowania hasłem. Pierwsze wywołanie buduje go, kolejne oddają ten sam.
 * EN: Returns the password sign-in object. The first call builds it, the next ones return the same.
 *
 * @param env - PL: środowisko Workera z zapytania (context.env). EN: the Worker environment from the request (context.env).
 * @returns PL: obiekt logowania. EN: the sign-in object.
 * @throws PL: InviteNotConfiguredError, gdy brak sekretu BETTER_AUTH_SECRET. EN: InviteNotConfiguredError when the BETTER_AUTH_SECRET secret is missing.
 */
export function getInviteAuth(env: Env): AuthInvite {
  // PL: Bez sekretu nie da się podpisać ciasteczka sesji tak jak robi to podtor 1a.
  // EN: Without the secret the session cookie cannot be signed the way subtrack 1a does it.
  const secret = env.BETTER_AUTH_SECRET;
  if (!secret) throw new InviteNotConfiguredError('Brak sekretu BETTER_AUTH_SECRET / Missing the BETTER_AUTH_SECRET secret');

  // PL: Ta sama baza i sekret, więc oddaj już zbudowany obiekt.
  // EN: The same database and secret, so return the object that is already built.
  if (cached && cached.db === env.DB && cached.secret === secret) return cached.auth;

  // PL: Zbuduj obiekt i zapamiętaj go.
  // EN: Build the object and remember it.
  const auth = createInviteAuth({ db: env.DB, secret });
  cached = { db: env.DB, secret, auth };
  return auth;
}
