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

// PL: Zapytanie z pamięcią podręczną i trzymanie poprzednich danych.
// EN: A query with a cache and keeping the previous data.
import { keepPreviousData, useQuery } from '@tanstack/react-query';
// PL: Funkcje pobierania.
// EN: The fetching functions.
import { fetchEntries, fetchEntry } from './api';

// PL: Jedno ponowienie przy błędzie, żeby uczeń nie czekał kilku sekund na komunikat.
// EN: One retry on an error, so the student does not wait several seconds for the message.
const RETRIES = 1;

/**
 * PL: Zapytanie o listę wpisów. Każdy szukany tekst ma własną pamięć, a przy zmianie tekstu zostaje poprzednia lista, zamiast pustego ekranu.
 * EN: The entry list query. Each searched text has its own cache, and when the text changes the previous list stays instead of an empty screen.
 *
 * @param term - PL: szukany tekst; pusty znaczy cała lista. EN: the searched text; empty means the whole list.
 * @returns PL: stan zapytania z listą. EN: the query state with the list.
 */
export function useEntries(term: string) {
  return useQuery({
    queryKey: ['news', 'feed', 'list', term],
    queryFn: () => fetchEntries(term),
    retry: RETRIES,
    placeholderData: keepPreviousData,
  });
}

/**
 * PL: Zapytanie o jeden wpis.
 * EN: The single entry query.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @returns PL: stan zapytania z wpisem. EN: the query state with the entry.
 */
export function useEntry(id: string) {
  return useQuery({ queryKey: ['news', 'feed', 'entry', id], queryFn: () => fetchEntry(id), retry: RETRIES });
}
