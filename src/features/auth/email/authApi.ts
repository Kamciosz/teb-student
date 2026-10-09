/**
 * PL: Rozmowa telefonu z serwerem logowania: prośba o kod, wpisanie kodu i wylogowanie. Sesję trzyma zapytanie z useAuthSession, a wylogowanie czyści dane zapisane w telefonie. Każda funkcja oddaje gotowy wynik z komunikatem po polsku i nigdy nie rzuca błędu sieci.
 * EN: The phone's conversation with the sign-in server: requesting a code, entering a code and signing out. The session is held by the query in useAuthSession, and sign-out clears the data saved on the phone. Every function returns a ready result with a message in Polish and never throws a network error.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/routes.ts::authEmailApp
 * @uses src/shared/index.ts::clearQueryData
 * @used_by src/features/auth/email/useAuthSession.ts::authClient
 * @used_by src/features/auth/email/EmailStep.tsx::requestCode
 * @used_by src/features/auth/email/CodeStep.tsx::verifyCode
 * @used_by src/features/auth/email/index.ts::signOutStudent
 */

// PL: Klient Better Auth (bez Reacta: sesją zajmuje się useQuery) i jego wtyczka kodu z maila.
// EN: The Better Auth client (without React: useQuery handles the session) and its e-mail code plugin.
import { createAuthClient } from 'better-auth/client';
import { emailOTPClient } from 'better-auth/client/plugins';
// PL: Czyszczenie danych zapisanych w telefonie, ze wspólnej części aplikacji.
// EN: Clearing the data saved on the phone, from the shared part of the app.
import { clearQueryData } from '../../../shared';
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
 * PL: Wylogowuje ucznia: serwer kasuje sesję z bazy i ciasteczko, a potem telefon czyści swoje dane (clearQueryData), żeby następna osoba na tym telefonie nie zobaczyła cudzych danych ani sesji. Przy błędzie sesja zostaje, więc dane też.
 * EN: Signs the student out: the server deletes the session from the database and the cookie, and then the phone clears its data (clearQueryData), so the next person on this phone sees neither someone else's data nor the session. On an error the session stays, so the data stays too.
 *
 * @returns PL: obietnica, która kończy się po wylogowaniu albo po błędzie sieci. EN: a promise that settles after sign-out or a network error.
 */
export async function signOutStudent(): Promise<AuthResult> {
  try {
    const { error } = await authClient.signOut();
    if (error) return { ok: false, message: MESSAGES.unknown };

    // PL: Sesja jest skasowana, więc wyczyść dane zapisane w telefonie.
    // EN: The session is deleted, so clear the data saved on the phone.
    clearQueryData();
    return { ok: true };
  } catch {
    // PL: Bez sieci nie da się skasować sesji na serwerze, więc mówimy to wprost.
    // EN: Without a network the session cannot be deleted on the server, so we say so plainly.
    return { ok: false, message: MESSAGES.offline };
  }
}
