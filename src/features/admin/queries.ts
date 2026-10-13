/**
 * PL: Zapytania TanStack Query dla panelu: rola ucznia (trafia do wspólnej pamięci podręcznej, więc panel otwiera się też bez internetu), kody zaproszeń (lista i wydanie), role Samorządu i redakcji (lista, szukanie, karta i zapis), pobranie pliku z pilotażu, dziennik zmian (strony), wiersz wejścia do panelu dla profilu.
 * EN: The TanStack Query hooks for the panel: the student's role (it goes into the shared cache, so the panel opens without internet too), the invitation codes (the list and issuing), the Samorząd and editor roles (the list, search, card and saving), the pilot file download, the change diary (pages) and the panel entry row for the profile.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/api.ts::fetchPanelLevel
 * @uses src/features/admin/api.ts::issueInvite
 * @uses src/features/admin/api.ts::fetchInvites
 * @uses src/features/admin/api.ts::fetchRoleHolders
 * @uses src/features/admin/api.ts::searchRole
 * @uses src/features/admin/api.ts::fetchRoleCard
 * @uses src/features/admin/api.ts::saveRoles
 * @uses src/features/admin/api.ts::downloadPilot
 * @uses src/features/admin/api.ts::fetchDiary
 * @uses src/features/admin/panelView.ts::panelEntryFor
 * @used_by src/features/admin/PanelGate.tsx::usePanelLevel
 * @used_by src/features/admin/PanelHome.tsx::usePanelLevel
 * @used_by src/features/admin/InvitesScreen.tsx::useIssueInvite
 * @used_by src/features/admin/InvitesScreen.tsx::useInvites
 * @used_by src/features/admin/RoleScreen.tsx::useRoleHolders
 * @used_by src/features/admin/RoleScreen.tsx::useRoleSearch
 * @used_by src/features/admin/RoleCardScreen.tsx::useRoleCard
 * @used_by src/features/admin/RoleCardScreen.tsx::useSaveRoles
 * @used_by src/features/admin/PilotScreen.tsx::usePilotDownload
 * @used_by src/features/admin/DiaryScreen.tsx::useDiary
 * @used_by src/features/admin/index.ts::usePanelEntry
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { downloadPilot, fetchDiary, fetchInvites, fetchPanelLevel, fetchRoleCard, fetchRoleHolders, issueInvite, saveRoles, searchRole, type RoleChoice } from './api';
import { panelEntryFor, type PanelEntry } from './panelView';

/** PL: Klucz zapytania o rolę w pamięci podręcznej. EN: The role query key in the cache. */
const PANEL_LEVEL_KEY = ['admin', 'me'] as const;

/** PL: Klucz listy kodów zaproszeń w pamięci podręcznej. EN: The key of the invitation code list in the cache. */
const INVITES_KEY = ['admin', 'invites'] as const;

/** PL: Klucz listy osób z rolą w pamięci podręcznej. EN: The key of the role holders list in the cache. */
const ROLE_HOLDERS_KEY = ['admin', 'roles'] as const;

/** PL: Klucz dziennika zmian w pamięci podręcznej (wszystkie strony). EN: The key of the change diary in the cache (all pages). */
const DIARY_KEY = ['admin', 'diary'] as const;

/**
 * PL: Klucz karty jednej osoby z rolą w pamięci podręcznej. EN: The key of one role holder's card in the cache.
 *
 * @param studentId - PL: identyfikator ucznia. EN: the student's id.
 * @returns PL: klucz zapytania. EN: the query key.
 */
function roleCardKey(studentId: string) {
  return ['admin', 'roles', studentId] as const;
}

/**
 * PL: Zapisuje plik na urządzeniu: tymczasowy adres, kliknięcie w odnośnik i sprzątanie adresu po chwili.
 * EN: Saves the file to the device: a temporary address, a click on a link and cleaning up the address after a moment.
 *
 * @param blob - PL: zawartość pliku. EN: the file content.
 * @param filename - PL: nazwa pliku do zapisu. EN: the file name to save as.
 */
function saveFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // PL: Adres zwalniamy z opóźnieniem, żeby przeglądarka zdążyła zacząć pobieranie.
  // EN: We release the address with a delay, so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/**
 * PL: Czyta rolę ucznia w panelu. Bez internetu zwraca ostatnio zapisaną rolę.
 * EN: Reads the student's panel role. Without internet it returns the last saved role.
 *
 * @returns PL: wynik zapytania z rolą (albo null) w `data`. EN: the query result with the role (or null) in `data`.
 */
export function usePanelLevel() {
  return useQuery({ queryKey: PANEL_LEVEL_KEY, queryFn: fetchPanelLevel, staleTime: 30_000 });
}

/**
 * PL: Czyta kody zaproszeń, które nadal działają. Po wydaniu kodu lista odświeża się sama.
 * EN: Reads the invitation codes that still work. The list refreshes itself after a code is issued.
 *
 * @returns PL: wynik zapytania z listą kodów w `data`. EN: the query result with the list of codes in `data`.
 */
export function useInvites() {
  return useQuery({ queryKey: INVITES_KEY, queryFn: fetchInvites });
}

/**
 * PL: Wydanie kodu zaproszenia. Wymaga internetu, więc mutacja nie czeka w kolejce, tylko od razu próbuje i przy braku sieci kończy się błędem. Po udanym wydaniu unieważnia listę kodów, żeby nowy kod się w niej pojawił, i dziennik, który dostał nowy wpis.
 * EN: Issuing an invitation code. It needs internet, so the mutation does not wait in a queue but tries at once and ends with an error without a network. After a successful issue it invalidates the list of codes, so the new code appears in it, and the diary, which got a new entry.
 *
 * @returns PL: mutacja z `mutate`, `data`, `isPending` i `isError`. EN: a mutation with `mutate`, `data`, `isPending` and `isError`.
 */
export function useIssueInvite() {
  // PL: Klient zapytań, żeby po wydaniu oznaczyć listę kodów i dziennik jako nieaktualne.
  // EN: The query client, to mark the list of codes and the diary as stale after issuing.
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueInvite,
    networkMode: 'always',
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: INVITES_KEY }), queryClient.invalidateQueries({ queryKey: DIARY_KEY })]),
  });
}

/**
 * PL: Czyta jedną stronę dziennika zmian (po 50 wpisów, od najnowszych). Każda strona ma swój klucz w pamięci podręcznej.
 * EN: Reads one page of the change diary (50 entries each, newest first). Each page has its own key in the cache.
 *
 * @param page - PL: numer strony, od 1. EN: the page number, from 1.
 * @returns PL: wynik zapytania ze stroną wpisów w `data`. EN: the query result with the page of entries in `data`.
 */
export function useDiary(page: number) {
  return useQuery({ queryKey: [...DIARY_KEY, page], queryFn: () => fetchDiary(page) });
}

/**
 * PL: Czyta listę osób z rolą Samorządu albo redakcji (6.3a). Po zapisaniu ról lista odświeża się sama.
 * EN: Reads the list of people with the Samorząd or editor role (6.3a). The list refreshes itself after the roles are saved.
 *
 * @returns PL: wynik zapytania z listą osób w `data`. EN: the query result with the list of people in `data`.
 */
export function useRoleHolders() {
  return useQuery({ queryKey: ROLE_HOLDERS_KEY, queryFn: fetchRoleHolders });
}

/**
 * PL: Szuka ucznia po szkolnym adresie (przycisk „Znajdź ucznia” w 6.3a). Wynik `null` znaczy, że nie ma konta z tym adresem.
 * EN: Searches for a student by the school address (the "Znajdź ucznia" button in 6.3a). The `null` result means there is no account with this address.
 *
 * @returns PL: mutacja z `mutate`, `data` (karta albo null), `isPending` i `isError`. EN: a mutation with `mutate`, `data` (the card or null), `isPending` and `isError`.
 */
export function useRoleSearch() {
  return useMutation({ mutationFn: searchRole, networkMode: 'always' });
}

/**
 * PL: Czyta kartę jednej osoby z rolą (6.3b).
 * EN: Reads the card of one person with a role (6.3b).
 *
 * @param studentId - PL: identyfikator ucznia. EN: the student's id.
 * @returns PL: wynik zapytania z kartą w `data`. EN: the query result with the card in `data`.
 */
export function useRoleCard(studentId: string) {
  return useQuery({ queryKey: roleCardKey(studentId), queryFn: () => fetchRoleCard(studentId) });
}

/**
 * PL: Zapisuje role ucznia (6.3b). Wymaga internetu, więc mutacja od razu próbuje. Po udanym zapisie karta dostaje nowe dane, a lista osób z rolą się odświeża.
 * EN: Saves the student's roles (6.3b). It needs internet, so the mutation tries at once. After a successful save the card gets the new data and the list of role holders refreshes.
 *
 * @param studentId - PL: identyfikator ucznia. EN: the student's id.
 * @returns PL: mutacja z `mutate(wybór)`, `isPending` i `isError`. EN: a mutation with `mutate(choice)`, `isPending` and `isError`.
 */
export function useSaveRoles(studentId: string) {
  // PL: Klient zapytań, żeby po zapisie podmienić kartę i odświeżyć listę.
  // EN: The query client, to replace the card and refresh the list after saving.
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (choice: RoleChoice) => saveRoles(studentId, choice),
    networkMode: 'always',
    onSuccess: async (card) => {
      queryClient.setQueryData(roleCardKey(studentId), card);
      await queryClient.invalidateQueries({ queryKey: ROLE_HOLDERS_KEY });
      await queryClient.invalidateQueries({ queryKey: DIARY_KEY });
    },
  });
}

/**
 * PL: Pobiera plik z pilotażem (6.1e) i zapisuje go na urządzeniu. Wymaga internetu. Po pobraniu odświeża dziennik, bo pobranie zapisuje wpis.
 * EN: Downloads the pilot file (6.1e) and saves it to the device. It needs internet. After the download it refreshes the diary, because the download records an entry.
 *
 * @returns PL: mutacja z `mutate`, `isPending` i `isError`. EN: a mutation with `mutate`, `isPending` and `isError`.
 */
export function usePilotDownload() {
  // PL: Klient zapytań, żeby po pobraniu oznaczyć dziennik jako nieaktualny.
  // EN: The query client, to mark the diary as stale after the download.
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: downloadPilot,
    networkMode: 'always',
    onSuccess: (blob) => {
      saveFile(blob, 'pilotaz.csv');
      return queryClient.invalidateQueries({ queryKey: DIARY_KEY });
    },
  });
}

/**
 * PL: Wiersz wejścia do panelu dla ekranu profilu (6.1a). Zwraca null, dopóki rola się wczytuje i gdy uczeń nie ma roli, więc profil nie pokazuje wtedy wiersza.
 * EN: The panel entry row for the profile screen (6.1a). It returns null while the role is loading and when the student has no role, so the profile shows no row then.
 *
 * @returns PL: nazwa wiersza i znacznik albo null. EN: the row name and the badge, or null.
 */
export function usePanelEntry(): PanelEntry | null {
  // PL: Rola z pamięci podręcznej albo z serwera; bez niej (undefined) nie ma wiersza.
  // EN: The role from the cache or the server; without it (undefined) there is no row.
  return panelEntryFor(usePanelLevel().data ?? null);
}
