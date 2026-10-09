/**
 * PL: Obiekt logowania działający w Workerze: baza to D1 (przez Drizzle), sekret i nadawca kodu pochodzą ze środowiska Workera. Obiekt powstaje raz na instancję Workera. Bez bindingu bazy albo (poza dev) bez sekretu rzuca AuthNotConfiguredError, a router odpowiada 503.
 * EN: The sign-in object running in the Worker: the database is D1 (through Drizzle), the secret and the code sender come from the Worker environment. The object is created once per Worker instance. Without the database binding or (outside dev) without the secret it throws AuthNotConfiguredError, and the router answers 503.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/db/schema/auth.ts::user
 * @uses worker/auth/email/createAuth.ts::createAuth
 * @uses worker/auth/email/codeSender.ts::createCodeSender
 * @used_by worker/auth/email/routes.ts::authEmailApp
 * @used_by worker/auth/email/session.ts::requireStudent
 * @used_by worker/auth/email/deleteStudentData.ts::deleteAuthStudentData
 */

// PL: Środowisko Workera (bindingi i sekrety) dostępne z każdego miejsca kodu.
// EN: The Worker environment (bindings and secrets) available from anywhere in the code.
import { env } from 'cloudflare:workers';
// PL: Adapter Better Auth dla Drizzle i Drizzle dla D1.
// EN: The Better Auth adapter for Drizzle and Drizzle for D1.
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele modułu auth.
// EN: The auth module tables.
import * as schema from '../../db/schema/auth';
import { createAuth, type AuthEmail } from './createAuth';
import { createCodeSender, isDevRuntime } from './codeSender';

/**
 * PL: Obiekt logowania i informacja, czy serwer umie wysłać kod.
 * EN: The sign-in object and whether the server can send a code.
 */
export type RuntimeAuth = {
  /** PL: Obiekt Better Auth na D1. EN: The Better Auth object on D1. */
  auth: AuthEmail;
  /** PL: Prawda, gdy jest nadawca kodu. Dziś tylko w dev, bo maile czekają na konto Cloudflare. EN: True when there is a code sender. Today only in dev, because mail waits for the Cloudflare account. */
  canSendCodes: boolean;
};

/**
 * PL: Błąd: serwer nie ma ustawień potrzebnych do logowania (binding bazy albo sekret).
 * EN: Error: the server lacks the settings needed for sign-in (the database binding or the secret).
 */
export class AuthNotConfiguredError extends Error {}

/**
 * PL: Te pola środowiska czyta moduł logowania. Oba są opcjonalne, bo wrangler.jsonc i sekrety są ustawiane poza podtorem 1a.
 * EN: The environment fields the sign-in module reads. Both are optional, because wrangler.jsonc and the secrets are set outside subtrack 1a.
 */
type AuthEmailBindings = {
  /** PL: Baza D1 z tabelami z worker/db/schema/auth.ts. EN: The D1 database with the tables from worker/db/schema/auth.ts. */
  DB?: D1Database;
  /** PL: Tajny klucz do podpisywania ciasteczek (wrangler secret, lokalnie .dev.vars). EN: The secret key for signing cookies (wrangler secret, locally .dev.vars). */
  BETTER_AUTH_SECRET?: string;
};

/**
 * PL: Obiekt zbudowany dla jednego bindingu bazy, zapamiętany do następnych zapytań.
 * EN: The object built for one database binding, remembered for the next requests.
 */
let cached: { db: D1Database; runtime: RuntimeAuth } | null = null;

/**
 * PL: Sekret użyty w dev, gdy .dev.vars go nie ma: losowy, na czas życia procesu. Powstaje dopiero przy pierwszym użyciu, bo Worker nie pozwala losować w zakresie globalnym (przy starcie). Po restarcie serwera sesje z poprzedniego uruchomienia przestają działać, co w dev jest w porządku.
 * EN: The secret used in dev when .dev.vars lacks it: random, for the process lifetime. It is created only on first use, because a Worker does not allow random values in the global scope (at startup). After a server restart the sessions of the previous run stop working, which is fine in dev.
 */
let devSecret: string | undefined;

/**
 * PL: Wybiera sekret do podpisywania ciasteczek. Poza dev jest obowiązkowy, bo domyślny sekret pozwoliłby podrobić sesję.
 * EN: Picks the secret for signing cookies. Outside dev it is mandatory, because a default secret would allow forging a session.
 *
 * @param bindings - PL: pola środowiska Workera. EN: the Worker environment fields.
 * @param isDev - PL: prawda w dev. EN: true in dev.
 * @returns PL: sekret. EN: the secret.
 * @throws PL: AuthNotConfiguredError, gdy poza dev brak sekretu. EN: AuthNotConfiguredError when the secret is missing outside dev.
 */
function pickSecret(bindings: AuthEmailBindings, isDev: boolean): string {
  if (bindings.BETTER_AUTH_SECRET) return bindings.BETTER_AUTH_SECRET;
  if (!isDev) throw new AuthNotConfiguredError('Brak sekretu BETTER_AUTH_SECRET / Missing the BETTER_AUTH_SECRET secret');

  // PL: Sekret deweloperski powstaje dopiero przy pierwszym użyciu (Worker nie pozwala losować przy starcie).
  // EN: The dev secret is created only on first use (a Worker does not allow random values at startup).
  devSecret ??= `${crypto.randomUUID()}${crypto.randomUUID()}`;
  return devSecret;
}

/**
 * PL: Zwraca obiekt logowania na D1. Pierwsze wywołanie buduje go, kolejne oddają ten sam.
 * EN: Returns the sign-in object on D1. The first call builds it, the next ones return the same.
 *
 * @returns PL: obiekt logowania i informacja o wysyłce kodów. EN: the sign-in object and the code sending info.
 * @throws PL: AuthNotConfiguredError, gdy brak bindingu DB albo (poza dev) sekretu BETTER_AUTH_SECRET. EN: AuthNotConfiguredError when the DB binding is missing or (outside dev) the BETTER_AUTH_SECRET secret.
 */
export function getRuntimeAuth(): RuntimeAuth {
  // PL: Weź pola środowiska, które nas obchodzą.
  // EN: Take the environment fields we care about.
  const bindings = env as unknown as AuthEmailBindings;

  // PL: Bez bazy nie ma sesji w D1, więc nie ma czego uruchamiać.
  // EN: Without the database there are no sessions in D1, so there is nothing to run.
  if (!bindings.DB) throw new AuthNotConfiguredError('Brak bindingu DB (D1) / Missing the DB (D1) binding');

  // PL: Ten sam binding, więc oddaj już zbudowany obiekt.
  // EN: The same binding, so return the object that is already built.
  if (cached && cached.db === bindings.DB) return cached.runtime;

  // PL: Sekret i tryb dev. Poza dev sekret jest obowiązkowy.
  // EN: The secret and the dev mode. Outside dev the secret is mandatory.
  const isDev = isDevRuntime();
  const secret = pickSecret(bindings, isDev);

  // PL: Nadawca kodu: w dev terminal, poza dev nic (null).
  // EN: The code sender: the terminal in dev, nothing (null) outside dev.
  const sender = createCodeSender({ isDev });

  // PL: Zbuduj obiekt na D1. Gdy nadawcy nie ma, router i tak odmówi wysyłki, zanim Better Auth go wywoła.
  // EN: Build the object on D1. When there is no sender, the router refuses to send before Better Auth calls it.
  const auth = createAuth({
    database: drizzleAdapter(drizzle(bindings.DB), { provider: 'sqlite', schema }),
    secret,
    sendCode:
      sender ??
      (async () => {
        throw new AuthNotConfiguredError('Brak nadawcy kodu / No code sender');
      }),
  });

  // PL: Zapamiętaj wynik dla następnych zapytań.
  // EN: Remember the result for the next requests.
  cached = { db: bindings.DB, runtime: { auth, canSendCodes: sender !== null } };
  return cached.runtime;
}
