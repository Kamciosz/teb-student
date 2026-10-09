/**
 * PL: Obiekt logowania działający w Workerze: baza to D1 (przez Drizzle), sekret i nadawca kodu pochodzą ze środowiska Workera. Obiekt powstaje raz na instancję Workera. Poza dev, bez sekretu, rzuca AuthNotConfiguredError, a router odpowiada 503.
 * EN: The sign-in object running in the Worker: the database is D1 (through Drizzle), the secret and the code sender come from the Worker environment. The object is created once per Worker instance. Outside dev, without the secret, it throws AuthNotConfiguredError, and the router answers 503.
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

// PL: Typ środowiska Workera (baza DB i sekrety) ze wspólnej części serwera.
// EN: The Worker environment type (the DB database and secrets) from the shared part of the server.
import type { Env } from '../../shared';
// PL: Adapter Better Auth dla Drizzle i Drizzle dla D1.
// EN: The Better Auth adapter for Drizzle and Drizzle for D1.
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele modułu auth.
// EN: The auth module tables.
import * as schema from '../../db/schema/auth';
import { createAuth, type AuthEmail, type CreateAuthOptions } from './createAuth';
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
 * PL: Błąd: serwer nie ma ustawień potrzebnych do logowania (sekret albo nadawca kodu).
 * EN: Error: the server lacks the settings needed for sign-in (the secret or the code sender).
 */
export class AuthNotConfiguredError extends Error {}

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
 * @param env - PL: środowisko Workera. EN: the Worker environment.
 * @param isDev - PL: prawda w dev. EN: true in dev.
 * @returns PL: sekret. EN: the secret.
 * @throws PL: AuthNotConfiguredError, gdy poza dev brak sekretu. EN: AuthNotConfiguredError when the secret is missing outside dev.
 */
function pickSecret(env: Env, isDev: boolean): string {
  if (env.BETTER_AUTH_SECRET) return env.BETTER_AUTH_SECRET;
  if (!isDev) throw new AuthNotConfiguredError('Brak sekretu BETTER_AUTH_SECRET / Missing the BETTER_AUTH_SECRET secret');

  // PL: Sekret deweloperski powstaje dopiero przy pierwszym użyciu (Worker nie pozwala losować przy starcie).
  // EN: The dev secret is created only on first use (a Worker does not allow random values at startup).
  devSecret ??= `${crypto.randomUUID()}${crypto.randomUUID()}`;
  return devSecret;
}

/**
 * PL: Adapter bazy Better Auth na D1 (Drizzle, tabele z worker/db/schema/auth.ts). Używa go Worker i testy, więc testy sprawdzają te same zapytania co serwer.
 * EN: The Better Auth database adapter on D1 (Drizzle, the tables from worker/db/schema/auth.ts). The Worker and the tests use it, so the tests check the same queries as the server.
 *
 * @param db - PL: baza D1 (env.DB). EN: the D1 database (env.DB).
 * @returns PL: adapter dla createAuth. EN: the adapter for createAuth.
 */
export function createDatabaseAdapter(db: D1Database): CreateAuthOptions['database'] {
  return drizzleAdapter(drizzle(db), { provider: 'sqlite', schema });
}

/**
 * PL: Zwraca obiekt logowania na D1. Pierwsze wywołanie buduje go, kolejne oddają ten sam.
 * EN: Returns the sign-in object on D1. The first call builds it, the next ones return the same.
 *
 * @param env - PL: środowisko Workera z zapytania (context.env). EN: the Worker environment from the request (context.env).
 * @returns PL: obiekt logowania i informacja o wysyłce kodów. EN: the sign-in object and the code sending info.
 * @throws PL: AuthNotConfiguredError, gdy poza dev brak sekretu BETTER_AUTH_SECRET. EN: AuthNotConfiguredError when the BETTER_AUTH_SECRET secret is missing outside dev.
 */
export function getRuntimeAuth(env: Env): RuntimeAuth {
  // PL: Ta sama baza, więc oddaj już zbudowany obiekt.
  // EN: The same database, so return the object that is already built.
  if (cached && cached.db === env.DB) return cached.runtime;

  // PL: Sekret i tryb dev. Poza dev sekret jest obowiązkowy.
  // EN: The secret and the dev mode. Outside dev the secret is mandatory.
  const isDev = isDevRuntime();
  const secret = pickSecret(env, isDev);

  // PL: Nadawca kodu: w dev terminal, poza dev nic (null).
  // EN: The code sender: the terminal in dev, nothing (null) outside dev.
  const sender = createCodeSender({ isDev });

  // PL: Zbuduj obiekt na D1. Gdy nadawcy nie ma, router i tak odmówi wysyłki, zanim Better Auth go wywoła.
  // EN: Build the object on D1. When there is no sender, the router refuses to send before Better Auth calls it.
  const auth = createAuth({
    database: createDatabaseAdapter(env.DB),
    secret,
    sendCode:
      sender ??
      (async () => {
        throw new AuthNotConfiguredError('Brak nadawcy kodu / No code sender');
      }),
  });

  // PL: Zapamiętaj wynik dla następnych zapytań.
  // EN: Remember the result for the next requests.
  cached = { db: env.DB, runtime: { auth, canSendCodes: sender !== null } };
  return cached.runtime;
}
