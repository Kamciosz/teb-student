/**
 * PL: Dostawca zapytań dla całej aplikacji: jeden QueryClient z zapisem w localStorage. Stoi w korzeniu (App.tsx), więc każdy ekran podtoru może użyć useQuery bez własnego dostawcy.
 * EN: The query provider for the whole app: one QueryClient saved in localStorage. It stands at the root (App.tsx), so every subtrack screen can use useQuery without its own provider.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/query/queryClient.ts::queryClient
 * @uses src/shared/query/persistence.ts::createQueryPersister
 * @uses src/shared/auth/signInGate.ts::installSignInGate
 * @used_by src/App.tsx::App
 */

// PL: Typ dzieci komponentu.
// EN: The type of the component's children.
import { useLayoutEffect, type ReactNode } from 'react';
// PL: Dostawca, który odczytuje zapisane dane przy starcie i zapisuje je przy zmianach.
// EN: The provider that reads the saved data at start and saves it on changes.
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
// PL: Klient i ustawienia zapisu.
// EN: The client and the saving settings.
import { QUERY_CACHE_BUSTER, QUERY_MAX_AGE_MS, queryClient } from './queryClient';
// PL: Bramka 401: przenosi na /auth/email, gdy serwer odpowiada, że nie ma sesji.
// EN: The 401 gate: takes the student to /auth/email when the server says there is no session.
import { installSignInGate } from '../auth/signInGate';
// PL: Tworzenie zapisującego.
// EN: Creating the persister.
import { createQueryPersister } from './persistence';

// PL: Zapisujący jest jeden, tworzony przy wczytaniu pliku. Funkcja nie dotyka window w testach, bo App.tsx wczytuje się tylko w przeglądarce.
// EN: There is one persister, created when the file loads. The function does not touch window in tests, because App.tsx loads only in the browser.
const persister = createQueryPersister();

/**
 * PL: Otacza aplikację dostawcą zapytań z zapisem w telefonie.
 * EN: Wraps the app in the query provider that saves on the phone.
 *
 * @param props - PL: dzieci, czyli reszta aplikacji. EN: the children, that is the rest of the app.
 * @returns PL: drzewo elementów z dostawcą. EN: the element tree with the provider.
 */
export function AppQueryProvider({ children }: { children: ReactNode }) {
  // PL: Bramka 401 działa, dopóki aplikacja stoi. Efekt układu (useLayoutEffect) rusza przed efektami ekranów, więc ich pierwsze zapytania też przechodzą przez bramkę. Zwrócona funkcja przywraca fetch (ważne przy podwójnym uruchomieniu efektu w StrictMode).
  // EN: The 401 gate works while the app stands. The layout effect (useLayoutEffect) runs before the screens' effects, so their first requests also pass through the gate. The returned function restores fetch (important when the effect runs twice in StrictMode).
  useLayoutEffect(() => installSignInGate(), []);
  // PL: maxAge i buster odrzucają stary zapis przy starcie.
  // EN: maxAge and buster drop the old saved data at start.
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: QUERY_MAX_AGE_MS, buster: QUERY_CACHE_BUSTER }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
