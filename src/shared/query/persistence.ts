/**
 * PL: Zapis danych zapytań w localStorage telefonu. Tworzy zapisującego (persister) i wybiera pamięć tak, żeby nic się nie psuło tam, gdzie localStorage nie ma (testy w Workerze, tryb prywatny, zablokowane dane strony).
 * EN: Saving the query data in the phone's localStorage. Creates the persister and picks the storage so nothing breaks where localStorage is missing (Worker tests, private mode, blocked site data).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/query/queryClient.ts::QUERY_STORAGE_KEY
 * @used_by src/shared/query/AppQueryProvider.tsx::AppQueryProvider
 * @used_by src/shared/query/clearQueryData.ts::clearQueryData
 */

// PL: Zapisujący dane zapytań w pamięci typu localStorage.
// EN: The persister that saves query data in localStorage-like storage.
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
// PL: Klucz zapisu.
// EN: The storage key.
import { QUERY_STORAGE_KEY } from './queryClient';

/**
 * PL: Pamięć, której używa zapis: tyle, ile potrzeba z localStorage.
 * EN: The storage the persister uses: just what it needs from localStorage.
 */
export type QueryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * PL: Podaje localStorage przeglądarki albo undefined, gdy go nie ma lub dostęp rzuca błąd. Nie dotyka `window` przy wczytaniu pliku, tylko przy wywołaniu.
 * EN: Returns the browser's localStorage or undefined when it is missing or access throws. It does not touch `window` when the file loads, only when called.
 *
 * @returns PL: pamięć albo undefined. EN: the storage or undefined.
 */
export function getBrowserStorage(): QueryStorage | undefined {
  // PL: Samo odczytanie window.localStorage potrafi rzucić błąd (zablokowane dane strony), więc jest w try.
  // EN: Merely reading window.localStorage can throw (blocked site data), so it is in a try.
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * PL: Tworzy zapisującego dane zapytań. Bez pamięci zapisujący nic nie robi, a aplikacja działa dalej bez zapisu.
 * EN: Creates the query data persister. Without storage the persister does nothing and the app keeps working without saving.
 *
 * @param storage - PL: pamięć do zapisu (domyślnie localStorage przeglądarki). EN: the storage to save to (the browser's localStorage by default).
 * @param throttleTime - PL: najkrótszy odstęp między zapisami w ms (domyślnie 1000; testy dają 0). EN: the shortest gap between saves in ms (1000 by default; tests pass 0).
 * @returns PL: zapisujący dla PersistQueryClientProvider. EN: the persister for PersistQueryClientProvider.
 */
export function createQueryPersister(storage: QueryStorage | undefined = getBrowserStorage(), throttleTime = 1000) {
  // PL: Zapis do jednego klucza, domyślnie co sekundę najwyżej.
  // EN: Saving to one key, by default at most once a second.
  return createSyncStoragePersister({ storage, key: QUERY_STORAGE_KEY, throttleTime });
}
