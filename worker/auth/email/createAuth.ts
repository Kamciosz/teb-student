/**
 * PL: Fabryka obiektu Better Auth dla logowania kodem z maila. Baza i nadawca kodu przychodzą z zewnątrz, więc te same ustawienia (kod 6 cyfr, 10 minut, 3 próby) działają na D1 w Workerze i na pamięci w testach.
 * EN: The factory of the Better Auth object for e-mail code sign-in. The database and the code sender come from outside, so the same settings (6 digits, 10 minutes, 3 attempts) work on D1 in the Worker and on memory in tests.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/settings.ts::AUTH_BASE_PATH
 * @uses worker/auth/email/codeSender.ts::CodeSender
 * @used_by worker/auth/email/runtimeAuth.ts::getRuntimeAuth
 * @used_by worker/auth/email/routes.test.ts::createTestAuth
 */

// PL: betterAuth tworzy obiekt logowania, a emailOTP dodaje logowanie kodem z maila.
// EN: betterAuth creates the sign-in object and emailOTP adds sign-in with an e-mail code.
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
// PL: Typ nadawcy kodu i ustawienia kodu.
// EN: The code sender type and the code settings.
import type { CodeSender } from './codeSender';
import { AUTH_BASE_PATH, CODE_LENGTH, CODE_LIFETIME_SECONDS, CODE_MAX_ATTEMPTS } from './settings';

/**
 * PL: Dane potrzebne do zbudowania obiektu logowania.
 * EN: What is needed to build the sign-in object.
 */
export type CreateAuthOptions = {
  /** PL: Adapter bazy Better Auth: Drizzle na D1 w Workerze, pamięć w testach. EN: The Better Auth database adapter: Drizzle on D1 in the Worker, memory in tests. */
  database: BetterAuthOptions['database'];
  /** PL: Tajny klucz do podpisywania ciasteczek sesji, co najmniej 32 znaki. EN: The secret key for signing session cookies, at least 32 characters. */
  secret: string;
  /** PL: Nadawca kodu. Better Auth wywoła go po utworzeniu kodu w bazie. EN: The code sender. Better Auth calls it after creating the code in the database. */
  sendCode: CodeSender;
};

/**
 * PL: Buduje obiekt Better Auth z logowaniem kodem. Konto powstaje przy pierwszym poprawnym kodzie. Hasła i inne sposoby logowania są wyłączone: dodaje je podtor 1b we własnym adresie.
 * EN: Builds the Better Auth object with code sign-in. An account is created at the first correct code. Passwords and other sign-in methods are off: subtrack 1b adds them at its own address.
 *
 * @param options - PL: baza, sekret i nadawca kodu. EN: the database, the secret and the code sender.
 * @returns PL: obiekt Better Auth. EN: the Better Auth object.
 */
export function createAuth(options: CreateAuthOptions) {
  // PL: Złóż obiekt logowania z ustawień planu.
  // EN: Assemble the sign-in object from the plan's settings.
  return betterAuth({
    // PL: Adres zgodny z wpisem w worker/mounts.ts.
    // EN: The address matching the entry in worker/mounts.ts.
    basePath: AUTH_BASE_PATH,
    // PL: Baza i sekret z zewnątrz.
    // EN: The database and the secret from outside.
    database: options.database,
    secret: options.secret,
    // PL: Limit zapytań włączony zawsze (Better Auth domyślnie włącza go tylko w produkcji, ale w Workerze nie widzi tego trybu). Wtyczka kodu daje 3 wysyłki na minutę z jednego adresu IP. Liczniki są w pamięci jednej instancji Workera, więc to ochrona częściowa (pytanie w pull requeście).
    // EN: The request limit is always on (Better Auth enables it by default only in production, but in a Worker it cannot see that mode). The code plugin allows 3 sends per minute from one IP address. The counters live in the memory of one Worker instance, so this is partial protection (a question in the pull request).
    rateLimit: { enabled: true },
    // PL: Adres IP telefonu podaje Cloudflare w nagłówku cf-connecting-ip. Nagłówka x-forwarded-for nie bierzemy, bo klient może go podrobić.
    // EN: Cloudflare gives the phone's IP address in the cf-connecting-ip header. We do not use x-forwarded-for, because the client can forge it.
    advanced: { ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] } },
    // PL: Wtyczka kodu z maila: 6 cyfr, 10 minut, 3 próby. Konto zakłada się samo przy pierwszym logowaniu (disableSignUp zostaje wyłączone), dzięki czemu wysyłka kodu nie zdradza, czy adres ma konto.
    // EN: The e-mail code plugin: 6 digits, 10 minutes, 3 attempts. The account is created by itself at the first sign-in (disableSignUp stays off), so sending a code does not reveal whether an address has an account.
    plugins: [
      emailOTP({
        otpLength: CODE_LENGTH,
        expiresIn: CODE_LIFETIME_SECONDS,
        allowedAttempts: CODE_MAX_ATTEMPTS,
        sendVerificationOTP: async ({ email, otp }) => options.sendCode({ email, code: otp }),
      }),
    ],
  });
}

/**
 * PL: Typ obiektu logowania, którym posługują się routery i testy.
 * EN: The type of the sign-in object used by the routers and tests.
 */
export type AuthEmail = ReturnType<typeof createAuth>;
