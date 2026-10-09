/**
 * PL: Haki danych podtoru 3a: lista wpisów i jeden wpis jako zapytania TanStack Query.
 * EN: The data hooks of subtrack 3a: the entry list and one entry as TanStack Query queries.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/api.ts::fetchEntries
 * @used_by src/features/news/feed/FeedListScreen.tsx::useEntries
 * @used_by src/features/news/feed/EntryScreen.tsx::useEntry
 */

// PL: Zapytanie z pamięcią podręczną.
// EN: A query with a cache.
import { useQuery } from '@tanstack/react-query';
// PL: Funkcje pobierania.
// EN: The fetching functions.
import { fetchEntries, fetchEntry } from './api';

/**
 * PL: Zapytanie o listę wpisów.
 * EN: The entry list query.
 *
 * @returns PL: stan zapytania z listą. EN: the query state with the list.
 */
export function useEntries() {
  return useQuery({ queryKey: ['news', 'feed', 'list'], queryFn: fetchEntries });
}

/**
 * PL: Zapytanie o jeden wpis.
 * EN: The single entry query.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @returns PL: stan zapytania z wpisem. EN: the query state with the entry.
 */
export function useEntry(id: string) {
  return useQuery({ queryKey: ['news', 'feed', 'entry', id], queryFn: () => fetchEntry(id) });
}
