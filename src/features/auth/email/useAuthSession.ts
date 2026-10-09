/**
 * PL: Hook sesji ucznia w telefonie dla innych podtorów: mówi, czy uczeń jest zalogowany, i kim jest. Sesja pochodzi z ciasteczka, więc po zamknięciu i otwarciu aplikacji uczeń nadal jest zalogowany.
 * EN: The student session hook on the phone for other subtracks: tells whether the student is signed in, and who they are. The session comes from the cookie, so after closing and reopening the app the student is still signed in.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/authApi.ts::authClient
 * @used_by src/features/auth/email/AuthEmailScreen.tsx::useAuthSession
 * @used_by src/features/auth/email/index.ts::useAuthSession
 */

import { authClient } from './authApi';

/**
 * PL: Zalogowany uczeń: numer i adres szkolny.
 * EN: A signed-in student: the id and the school address.
 */
export type StudentSession = {
  /** PL: Numer ucznia (konta). EN: The student (account) id. */
  id: string;
  /** PL: Adres szkolny małymi literami. EN: The school address in lowercase. */
  email: string;
};

/**
 * PL: Stan sesji. loading: serwer jeszcze nie odpowiedział. signed-out: nie ma sesji. signed-in: jest uczeń. error: nie udało się zapytać serwera (na przykład brak sieci), więc nie wiadomo.
 * EN: The session state. loading: the server has not answered yet. signed-out: there is no session. signed-in: there is a student. error: the server could not be asked (for example no network), so it is not known.
 */
export type AuthSessionState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; student: StudentSession }
  | { status: 'error' };

/**
 * PL: Podaje stan sesji ucznia i odświeża ekran, gdy się zmieni (zalogowanie, wylogowanie).
 * EN: Gives the student session state and re-renders the screen when it changes (sign-in, sign-out).
 *
 * @returns PL: stan sesji. EN: the session state.
 */
export function useAuthSession(): AuthSessionState {
  const { data, isPending, error } = authClient.useSession();

  // PL: Kolejność ma znaczenie: sesja z odpowiedzi wygrywa z błędem odświeżenia.
  // EN: The order matters: a session from an answer wins over a refresh error.
  if (data) return { status: 'signed-in', student: { id: data.user.id, email: data.user.email } };
  if (isPending) return { status: 'loading' };
  if (error) return { status: 'error' };
  return { status: 'signed-out' };
}
