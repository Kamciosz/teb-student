/**
 * PL: Hook sesji ucznia w telefonie dla innych podtorów: mówi, czy uczeń jest zalogowany, i kim jest. Sesja pochodzi z ciasteczka, więc po zamknięciu i otwarciu aplikacji uczeń nadal jest zalogowany. Hook używa useQuery ze wspólnego dostawcy zapytań (src/shared), więc ostatnia znana sesja jest zapisana w telefonie, także bez internetu.
 * EN: The student session hook on the phone for other subtracks: tells whether the student is signed in, and who they are. The session comes from the cookie, so after closing and reopening the app the student is still signed in. The hook uses useQuery from the shared query provider (src/shared), so the last known session is saved on the phone, also without internet.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/authApi.ts::authClient
 * @uses src/shared/index.ts::AppQueryProvider
 * @used_by src/features/auth/email/AuthEmailScreen.tsx::useAuthSession
 * @used_by src/features/auth/email/CodeStep.tsx::useSessionRefresh
 * @used_by src/features/auth/email/index.ts::useAuthSession
 */

// PL: useQuery korzysta z dostawcy zapytań z App.tsx, więc hook nie tworzy własnego.
// EN: useQuery uses the query provider from App.tsx, so the hook creates none of its own.
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from './authApi';

/**
 * PL: Klucz zapytania o sesję. Po zalogowaniu useSessionRefresh unieważnia to zapytanie, żeby sesja odświeżyła się od razu.
 * EN: The session query key. After sign-in useSessionRefresh invalidates this query so the session refreshes right away.
 */
const SESSION_QUERY_KEY = ['auth', 'session'] as const;

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
 * PL: Pyta serwer o sesję. Brak sesji to null (to też poprawna odpowiedź), a błąd serwera lub sieci rzuca wyjątek, żeby zapytanie miało stan błędu.
 * EN: Asks the server for the session. No session is null (also a valid answer), and a server or network error throws, so the query gets the error state.
 *
 * @returns PL: uczeń z sesji albo null. EN: the student from the session or null.
 * @throws PL: błąd, gdy serwer nie odpowiedział poprawnie. EN: an error when the server did not answer correctly.
 */
async function fetchSession(): Promise<StudentSession | null> {
  const { data, error } = await authClient.getSession();
  if (error) throw new Error(`Sesja: błąd ${error.status} / Session: error ${error.status}`);
  return data ? { id: data.user.id, email: data.user.email } : null;
}

/**
 * PL: Podaje stan sesji ucznia i odświeża ekran, gdy się zmieni (zalogowanie, wylogowanie).
 * EN: Gives the student session state and re-renders the screen when it changes (sign-in, sign-out).
 *
 * @returns PL: stan sesji. EN: the session state.
 */
export function useAuthSession(): AuthSessionState {
  const query = useQuery({ queryKey: SESSION_QUERY_KEY, queryFn: fetchSession });

  // PL: Znana sesja wygrywa, także gdy odświeżenie nie wyszło (brak sieci): uczeń zostaje zalogowany.
  // EN: A known session wins, also when the refresh failed (no network): the student stays signed in.
  if (query.data) return { status: 'signed-in', student: query.data };
  if (query.isPending) return { status: 'loading' };
  if (query.isError) return { status: 'error' };
  return { status: 'signed-out' };
}

/**
 * PL: Daje funkcję, która pobiera sesję od nowa. Ekran kodu woła ją po dobrym kodzie, żeby ekran nadrzędny przeniósł ucznia na pulpit.
 * EN: Gives a function that fetches the session again. The code screen calls it after a correct code, so the parent screen takes the student to the dashboard.
 *
 * @returns PL: funkcja, której obietnica kończy się po odświeżeniu. EN: a function whose promise settles after the refresh.
 */
export function useSessionRefresh(): () => Promise<void> {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
}
