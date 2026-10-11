/**
 * PL: Fabryka obiektu Better Auth dla kont z loginem i hasłem. Konto powstaje tylko za kodem zaproszenia: hak „before” na adresie rejestracji zużywa kod, zanim Better Auth założy konto. Obiekt ma ten sam sekret i tę samą bazę co logowanie kodem z maila (podtor 1a), więc sesja z ciasteczka działa w obu podtorach.
 * EN: The factory of the Better Auth object for login and password accounts. An account is created only with an invitation code: a "before" hook on the sign-up route uses the code before Better Auth creates the account. The object has the same secret and the same database as the e-mail code sign-in (subtrack 1a), so the cookie session works in both subtracks.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/inviteCodes.ts::consumeInviteCode
 * @uses worker/auth/invite/settings.ts::INVITE_BASE_PATH
 * @uses worker/db/schema/auth.ts::user
 * @used_by worker/auth/invite/runtimeAuth.ts::getInviteAuth
 * @used_by worker/auth/invite/testRuntime.ts::createTestInvite
 */

// PL: betterAuth tworzy obiekt logowania, a createAuthMiddleware i APIError służą do haka.
// EN: betterAuth creates the sign-in object, and createAuthMiddleware and APIError serve the hook.
import { betterAuth } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
// PL: Adapter Better Auth dla Drizzle i Drizzle dla D1.
// EN: The Better Auth adapter for Drizzle and Drizzle for D1.
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele modułu auth.
// EN: The auth module tables.
import * as schema from '../../db/schema/auth';
import { consumeInviteCode, normalizeInviteCode, restoreInviteCode } from './inviteCodes';
import { INVITE_BASE_PATH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './settings';

/**
 * PL: Adres, na którym Better Auth zakłada konto z hasłem. Telefon nie ma do niego dostępu: router podtoru go ukrywa i woła sam.
 * EN: The path where Better Auth creates a password account. The phone has no access to it: the subtrack router hides it and calls it itself.
 */
export const SIGN_UP_PATH = '/sign-up/email';

/**
 * PL: Dane potrzebne do zbudowania obiektu logowania.
 * EN: What is needed to build the sign-in object.
 */
export type CreateInviteAuthOptions = {
  /** PL: Baza D1 (env.DB), ta sama co w podtorze 1a. EN: The D1 database (env.DB), the same as in subtrack 1a. */
  db: D1Database;
  /** PL: Tajny klucz do podpisywania ciasteczek, ten sam co w podtorze 1a (BETTER_AUTH_SECRET). EN: The secret key for signing cookies, the same as in subtrack 1a (BETTER_AUTH_SECRET). */
  secret: string;
};

/**
 * PL: Sprawdza kod zaproszenia z ciała rejestracji i zużywa go. Gdy login jest zajęty, oddaje kod, żeby uczeń go nie stracił. Zły, zużyty albo przeterminowany kod daje błąd INVITE_INVALID.
 * EN: Checks the invitation code from the sign-up body and uses it. When the login is taken, it gives the code back so the student does not lose it. A wrong, used or expired code gives the INVITE_INVALID error.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param body - PL: ciało zapytania rejestracji (adres techniczny i kod). EN: the sign-up request body (the technical address and the code).
 * @returns PL: obietnica, która kończy się, gdy kod został zużyty. EN: a promise that settles when the code has been used.
 * @throws PL: APIError, gdy kod jest zły albo login zajęty. EN: an APIError when the code is wrong or the login is taken.
 */
async function useInviteCode(db: D1Database, body: { email?: unknown; inviteCode?: unknown }): Promise<void> {
  // PL: Kod musi mieć poprawny kształt, inaczej nie pytamy bazy.
  // EN: The code must have a valid shape, otherwise we do not ask the database.
  const code = typeof body.inviteCode === 'string' ? normalizeInviteCode(body.inviteCode) : null;
  if (code === null) throw new APIError('BAD_REQUEST', { code: 'INVITE_INVALID', message: 'Invalid invitation code' });

  // PL: Zużyj kod jednym zapytaniem. Kto przyjdzie drugi z tym samym kodem, dostanie błąd.
  // EN: Use the code with one query. Whoever comes second with the same code gets an error.
  const row = await consumeInviteCode(db, code);
  if (row === null) throw new APIError('BAD_REQUEST', { code: 'INVITE_INVALID', message: 'Invalid invitation code' });

  // PL: Zajęty login to nie wina kodu, więc kod wraca do bazy, a uczeń wybiera inny login.
  // EN: A taken login is not the code's fault, so the code goes back to the database and the student picks another login.
  const email = typeof body.email === 'string' ? body.email : '';
  const [existing] = await drizzle(db).select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email));
  if (existing) {
    await restoreInviteCode(db, code, row);
    throw new APIError('UNPROCESSABLE_ENTITY', { code: 'LOGIN_TAKEN', message: 'Login already taken' });
  }
}

/**
 * PL: Buduje obiekt Better Auth z logowaniem hasłem. Rejestracja wymaga kodu zaproszenia, a limit zapytań chroni przed zgadywaniem kodów i haseł.
 * EN: Builds the Better Auth object with password sign-in. Sign-up requires an invitation code, and the request limit protects against guessing codes and passwords.
 *
 * @param options - PL: baza i sekret. EN: the database and the secret.
 * @returns PL: obiekt Better Auth. EN: the Better Auth object.
 */
export function createInviteAuth(options: CreateInviteAuthOptions) {
  return betterAuth({
    // PL: Adres zgodny z wpisem w worker/mounts.ts.
    // EN: The address matching the entry in worker/mounts.ts.
    basePath: INVITE_BASE_PATH,
    // PL: Ta sama baza i ten sam sekret co w podtorze 1a: sesja zapisana tu jest ważna też tam.
    // EN: The same database and the same secret as in subtrack 1a: a session saved here is valid there too.
    database: drizzleAdapter(drizzle(options.db), { provider: 'sqlite', schema }),
    secret: options.secret,
    // PL: Limit zapytań włączony zawsze, jak w podtorze 1a. Better Auth domyślnie daje 3 próby rejestracji lub logowania na 10 sekund z jednego adresu IP. Liczniki są w pamięci jednej instancji Workera, więc to ochrona częściowa.
    // EN: The request limit is always on, as in subtrack 1a. Better Auth by default allows 3 sign-up or sign-in attempts per 10 seconds from one IP address. The counters live in the memory of one Worker instance, so this is partial protection.
    rateLimit: { enabled: true },
    advanced: { ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] } },
    // PL: Hasło: logowanie po zakładaniu konta włączone (uczeń od razu ma sesję), reguły długości z settings.ts.
    // EN: Password: sign-in right after creating the account is on (the student has a session at once), length rules from settings.ts.
    emailAndPassword: { enabled: true, autoSignIn: true, minPasswordLength: PASSWORD_MIN_LENGTH, maxPasswordLength: PASSWORD_MAX_LENGTH },
    // PL: Hak przed rejestracją: bez ważnego kodu zaproszenia konto nie powstanie, nawet gdyby ktoś trafił na adres Better Auth z pominięciem routera.
    // EN: The hook before sign-up: without a valid invitation code no account is created, even if someone reached the Better Auth address bypassing the router.
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (context.path !== SIGN_UP_PATH) return;
        await useInviteCode(options.db, (context.body ?? {}) as { email?: unknown; inviteCode?: unknown });
      }),
    },
  });
}

/**
 * PL: Typ obiektu logowania, którym posługują się router i testy.
 * EN: The type of the sign-in object used by the router and tests.
 */
export type AuthInvite = ReturnType<typeof createInviteAuth>;
