/**
 * PL: Hooki TanStack Query dla ekranu „Wpisy”: lista, publikacja, usunięcie i stan połączenia. Po publikacji i usunięciu odświeżamy listę (także po błędzie, bo wpis mógł zmienić się na serwerze). Przy każdym wejściu na ekran pobieramy listę od nowa, bo szkic mógł się zmienić w kreatorze.
 * EN: TanStack Query hooks for the "Wpisy" screen: the list, publishing, deleting and the connection state. After publishing and deleting we refresh the list (also after an error, because the entry may have changed on the server). Every entry to the screen fetches the list again, because a draft may have changed in the wizard.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/admin/api.ts::fetchPanelEntries
 * @uses src/features/news/admin/api.ts::publishEntry
 * @uses src/features/news/admin/api.ts::deleteEntry
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::usePanelEntries
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::usePublishEntry
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::useDeleteEntry
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::useIsOnline
 */

import { onlineManager, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { deleteEntry, fetchPanelEntries, publishEntry } from './api';

/** PL: Klucz listy w pamięci podręcznej. EN: The list key in the cache. */
const LIST_KEY = ['news', 'admin', 'list'] as const;

/**
 * PL: Ile razy ponawiamy nieudane pobranie. Odmowa serwera (403) nie mija po ponowieniu, a domyślne trzy próby trzymałyby Samorząd kilka sekund bez komunikatu.
 * EN: How many times a failed fetch is retried. A server refusal (403) does not go away on retry, and the default three attempts would keep the Student Council several seconds without a message.
 */
const RETRIES = 1;

/**
 * PL: Czyta listę wpisów. Bez internetu zostaje ostatnia zapisana lista.
 * EN: Reads the entry list. Without internet the last saved list stays.
 *
 * @returns PL: wynik zapytania (dane, stan ładowania, błąd). EN: the query result (data, loading state, error).
 */
export function usePanelEntries() {
  // PL: Lista jest świeża 30 sekund, ale przy każdym wejściu na ekran (np. po powrocie z kreatora) pobieramy ją od nowa, bo szkic mógł się zmienić na serwerze. Wzorzec: opcja `refetchOnMount` w dokumentacji TanStack Query.
  // EN: The list is fresh for 30 seconds, but on every entry to the screen (e.g. after returning from the wizard) we fetch it again, because a draft may have changed on the server. Pattern: the `refetchOnMount` option in the TanStack Query docs.
  // PL: Zapis w telefonie robi wspólny dostawca zapytań.
  // EN: Saving on the phone is done by the shared query provider.
  return useQuery({ queryKey: LIST_KEY, queryFn: fetchPanelEntries, staleTime: 30_000, refetchOnMount: 'always', retry: RETRIES });
}

/**
 * PL: Buduje mutację zmieniającą wpis, po której odświeżamy listę.
 * EN: Builds a mutation that changes an entry, after which we refresh the list.
 *
 * @param change - PL: funkcja zmieniająca wpis o podanym numerze. EN: the function that changes the entry with the given id.
 * @returns PL: mutacja z funkcją `mutate` i stanem zapisu. EN: a mutation with the `mutate` function and the saving state.
 */
function useListMutation(change: (id: string) => Promise<void>) {
  // PL: `networkMode: 'always'` pokazuje błąd zamiast czekać na sieć; przyciski i tak blokują się bez internetu.
  // EN: `networkMode: 'always'` shows an error instead of waiting for the network; the buttons are disabled offline anyway.
  const client = useQueryClient();
  return useMutation({ mutationFn: change, networkMode: 'always', onSettled: () => client.invalidateQueries({ queryKey: LIST_KEY }) });
}

/**
 * PL: Publikuje szkic o podanym numerze.
 * EN: Publishes the draft with the given id.
 *
 * @returns PL: mutacja, której `mutate` przyjmuje numer wpisu. EN: a mutation whose `mutate` takes the entry id.
 */
export function usePublishEntry() {
  return useListMutation(publishEntry);
}

/**
 * PL: Usuwa wpis o podanym numerze.
 * EN: Deletes the entry with the given id.
 *
 * @returns PL: mutacja, której `mutate` przyjmuje numer wpisu. EN: a mutation whose `mutate` takes the entry id.
 */
export function useDeleteEntry() {
  return useListMutation(deleteEntry);
}

/**
 * PL: Mówi, czy telefon ma internet. Zmienia się razem ze stanem sieci.
 * EN: Tells whether the phone has internet. It changes together with the network state.
 *
 * @returns PL: prawda, gdy jest połączenie. EN: true when there is a connection.
 */
export function useIsOnline(): boolean {
  // PL: Nasłuchuj stanu sieci z TanStack Query, tego samego co pasek „Brak internetu”.
  // EN: Listen to the network state from TanStack Query, the same one the "Brak internetu" bar uses.
  return useSyncExternalStore(
    (notify) => onlineManager.subscribe(notify),
    () => onlineManager.isOnline(),
  );
}
