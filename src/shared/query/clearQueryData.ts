/**
 * PL: Czyszczenie danych zapisanych w telefonie: pamięć zapytań i kopia w localStorage. Wywołują ją wylogowanie, usunięcie konta i bramka 401 (signInGate), żeby następna osoba na tym telefonie nie zobaczyła cudzych danych. Na końcu przenosi ucznia na /auth/email.
 * EN: Clearing the data saved on the phone: the query cache and the copy in localStorage. Sign-out, account deletion and the 401 gate (signInGate) call it so the next person on this phone does not see someone else's data. At the end it takes the student to /auth/email.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/query/queryClient.ts::queryClient
 * @uses src/shared/query/persistence.ts::getBrowserStorage
 * @uses src/shared/auth/redirectToSignIn.ts::redirectToSignIn
 * @used_by src/shared/index.ts::clearQueryData
 * @used_by src/shared/auth/signInGate.ts::installSignInGate
 */

// PL: Typ klienta zapytań.
// EN: The query client type.
import type { QueryClient } from '@tanstack/react-query';
// PL: Jedyny klient i klucz zapisu.
// EN: The only client and the storage key.
import { QUERY_STORAGE_KEY, queryClient } from './queryClient';
// PL: Pamięć przeglądarki i jej typ.
// EN: The browser storage and its type.
import { getBrowserStorage, type QueryStorage } from './persistence';
// PL: Przeniesienie na ekran logowania.
// EN: The move to the sign-in screen.
import { redirectToSignIn } from '../auth/redirectToSignIn';

/**
 * PL: Czyści dane w pamięci i zapisane w localStorage. Błąd pamięci (na przykład zablokowany localStorage) nie przerywa wylogowania. Potem przenosi ucznia na /auth/email.
 * EN: Clears the data in memory and saved in localStorage. A storage error (for example blocked localStorage) does not interrupt the sign-out. Then it takes the student to /auth/email.
 *
 * @param client - PL: klient do wyczyszczenia (domyślnie jedyny klient aplikacji). EN: the client to clear (the app's only client by default).
 * @param storage - PL: pamięć do wyczyszczenia (domyślnie localStorage przeglądarki). EN: the storage to clear (the browser's localStorage by default).
 * @param redirect - PL: przeniesienie na logowanie (domyślnie redirectToSignIn). EN: the move to sign-in (redirectToSignIn by default).
 */
export function clearQueryData(client: QueryClient = queryClient, storage: QueryStorage | undefined = getBrowserStorage(), redirect: () => void = redirectToSignIn): void {
  // PL: Najpierw pamięć, bo to ona zapisałaby dane z powrotem do localStorage.
  // EN: Memory first, because it would write the data back to localStorage.
  client.clear();
  // PL: Potem kopia w localStorage. Gdy usunięcie rzuci błąd, wylogowanie ma iść dalej.
  // EN: Then the copy in localStorage. If the removal throws, the sign-out must go on.
  try {
    storage?.removeItem(QUERY_STORAGE_KEY);
  } catch {
    // PL: Nic więcej nie da się zrobić, a zapis i tak wygaśnie po czasie ważności.
    // EN: Nothing more can be done, and the saved data expires after its lifetime anyway.
  }
  // PL: Na końcu na ekran logowania: stary ekran nie zostaje w starym stanie (zgłoszenie #58).
  // EN: Finally to the sign-in screen: the old screen does not stay in its old state (issue #58).
  redirect();
}
