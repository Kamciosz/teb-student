/**
 * PL: Klient zapytań i zapis wpisów w telefonie dla podtoru 3a. Dzięki zapisowi w localStorage ostatnio pobrane wpisy widać bez internetu. Wspólnego dostawcy jeszcze nie ma (zgłoszenie #44), więc podtor ma własnego. Gdy wspólny powstanie, ten plik znika.
 * EN: The query client and the on-phone storage of entries for subtrack 3a. Thanks to the localStorage copy, the entries fetched last are visible without internet. There is no shared provider yet (issue #44), so the subtrack has its own. When the shared one exists, this file goes away.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/news/feed/NewsFeedScreen.tsx::newsQueryClient
 */

// PL: Klient zapytań TanStack Query.
// EN: The TanStack Query client.
import { QueryClient } from '@tanstack/react-query';
// PL: Zapis pamięci zapytań w localStorage.
// EN: Saving the query cache in localStorage.
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// PL: Jak długo zapisane wpisy są ważne bez internetu: 7 dni.
// EN: How long the saved entries stay valid without internet: 7 days.
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * PL: Klient zapytań podtoru: dane są świeże przez minutę, a w pamięci leżą tak długo, jak ważny jest zapis.
 * EN: The subtrack query client: data is fresh for a minute, and stays in memory as long as the saved copy is valid.
 */
export const newsQueryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, gcTime: MAX_AGE, retry: 1 } },
});

/**
 * PL: Zapis w localStorage. Gdy przeglądarka nie daje dostępu do localStorage (tryb prywatny), aplikacja działa bez zapisu.
 * EN: The localStorage copy. When the browser gives no access to localStorage (private mode), the app works without a copy.
 */
export const newsPersister = createSyncStoragePersister({
  storage: typeof window === 'undefined' ? undefined : window.localStorage,
  key: 'teb-news-feed',
});

/**
 * PL: Ustawienia zapisu: jak długo trzymać kopię.
 * EN: Persistence options: how long to keep the copy.
 */
export const NEWS_PERSIST_MAX_AGE = MAX_AGE;
