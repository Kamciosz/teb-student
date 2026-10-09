/**
 * PL: Rozmowa telefonu z serwerem logowania: prośba o kod, wpisanie kodu i wylogowanie. Klient Better Auth trzyma też sesję i odświeża ją po zalogowaniu, więc hook useAuthSession sam widzi zmianę. Każda funkcja oddaje gotowy wynik z komunikatem po polsku i nigdy nie rzuca błędu sieci.
 * EN: The phone's conversation with the sign-in server: requesting a code, entering a code and signing out. The Better Auth client also holds the session and refreshes it after sign-in, so the useAuthSession hook sees the change by itself. Every function returns a ready result with a message in Polish and never throws a network error.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/routes.ts::authEmailApp
 * @used_by src/features/auth/email/useAuthSession.ts::authClient
 * @used_by src/features/auth/email/EmailStep.tsx::requestCode
 * @used_by src/features/auth/email/CodeStep.tsx::verifyCode
 * @used_by src/features/auth/email/index.ts::signOutStudent
 */

// PL: Klient Better Auth dla Reacta i jego wtyczka kodu z maila.
// EN: The Better Auth client for React and its e-mail code plugin.
import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';
import { describeSendError, describeVerifyError, MESSAGES, type ClientError } from './authMessages';

/**
 * PL: Wynik rozmowy z serwerem: udało się albo błąd z komunikatem dla ucznia.
 * EN: The result of a server conversation: it worked, or an error with a message for the student.
 */
export type AuthResult = { ok: true } | { ok: false; message: string };

/**
 * PL: Klient logowania. Adres serwera to adres aplikacji, a ścieżka jest ta sama co w worker/mounts.ts.
 * EN: The sign-in client. The server address is the app address, and the path is the same as in worker/mounts.ts.
 */
export const authClient = createAuthClient({
  basePath: '/api/auth/email',
  plugins: [emailOTPClient()],
});

/**
 * PL: Prosi serwer o kod logowania na podany adres. Serwer jeszcze raz sprawdza domenę szkolną.
 * EN: Asks the server for a sign-in code for the given address. The server checks the school domain again.
 *
 * @param email - PL: adres szkolny małymi literami. EN: the school address in lowercase.
 * @returns PL: wynik z komunikatem po polsku przy błędzie. EN: the result with a message in Polish on error.
 */
export async function requestCode(email: string): Promise<AuthResult> {
  try {
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
    return error ? { ok: false, message: describeSendError(error as ClientError) } : { ok: true };
  } catch {
    // PL: Wyjątek z fetch to brak sieci.
    // EN: An exception from fetch means no network.
    return { ok: false, message: MESSAGES.offline };
  }
}

/**
 * PL: Loguje kodem z maila. Po sukcesie serwer ustawia ciasteczko sesji, a klient odświeża sesję.
 * EN: Signs in with the code from the e-mail. After success the server sets the session cookie and the client refreshes the session.
 *
 * @param email - PL: adres szkolny małymi literami. EN: the school address in lowercase.
 * @param code - PL: sześć cyfr z maila. EN: the six digits from the e-mail.
 * @returns PL: wynik z komunikatem po polsku przy błędzie. EN: the result with a message in Polish on error.
 */
export async function verifyCode(email: string, code: string): Promise<AuthResult> {
  try {
    const { error } = await authClient.signIn.emailOtp({ email, otp: code });
    return error ? { ok: false, message: describeVerifyError(error as ClientError) } : { ok: true };
  } catch {
    // PL: Wyjątek z fetch to brak sieci.
    // EN: An exception from fetch means no network.
    return { ok: false, message: MESSAGES.offline };
  }
}

/**
 * PL: Wylogowuje ucznia: serwer kasuje sesję z bazy i ciasteczko, a klient odświeża sesję. Dane zapisane w telefonie (pamięć podręczna ekranów) czyści wywołujący, bo to nie należy do logowania.
 * EN: Signs the student out: the server deletes the session from the database and the cookie, and the client refreshes the session. Data stored on the phone (the screen cache) is cleared by the caller, because that is not part of sign-in.
 *
 * @returns PL: obietnica, która kończy się po wylogowaniu albo po błędzie sieci. EN: a promise that settles after sign-out or a network error.
 */
export async function signOutStudent(): Promise<AuthResult> {
  try {
    const { error } = await authClient.signOut();
    return error ? { ok: false, message: MESSAGES.unknown } : { ok: true };
  } catch {
    // PL: Bez sieci nie da się skasować sesji na serwerze, więc mówimy to wprost.
    // EN: Without a network the session cannot be deleted on the server, so we say so plainly.
    return { ok: false, message: MESSAGES.offline };
  }
}
