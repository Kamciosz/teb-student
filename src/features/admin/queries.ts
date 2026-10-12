/**
 * PL: Zapytania TanStack Query dla panelu: rola ucznia (trafia do wspólnej pamięci podręcznej, więc panel otwiera się też bez internetu), wydanie kodu zaproszenia i wiersz wejścia do panelu dla profilu.
 * EN: The TanStack Query hooks for the panel: the student's role (it goes into the shared cache, so the panel opens without internet too), issuing an invitation code and the panel entry row for the profile.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/api.ts::fetchPanelLevel
 * @uses src/features/admin/api.ts::issueInvite
 * @uses src/features/admin/panelView.ts::panelEntryFor
 * @used_by src/features/admin/AdminLayout.tsx::usePanelLevel
 * @used_by src/features/admin/PanelHome.tsx::usePanelLevel
 * @used_by src/features/admin/InvitesScreen.tsx::useIssueInvite
 * @used_by src/features/admin/index.ts::usePanelEntry
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchPanelLevel, issueInvite } from './api';
import { panelEntryFor, type PanelEntry } from './panelView';

/** PL: Klucz zapytania o rolę w pamięci podręcznej. EN: The role query key in the cache. */
const PANEL_LEVEL_KEY = ['admin', 'me'] as const;

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
 * PL: Wydanie kodu zaproszenia. Wymaga internetu, więc mutacja nie czeka w kolejce, tylko od razu próbuje i przy braku sieci kończy się błędem.
 * EN: Issuing an invitation code. It needs internet, so the mutation does not wait in a queue but tries at once and ends with an error without a network.
 *
 * @returns PL: mutacja z `mutate`, `data`, `isPending` i `isError`. EN: a mutation with `mutate`, `data`, `isPending` and `isError`.
 */
export function useIssueInvite() {
  return useMutation({ mutationFn: issueInvite, networkMode: 'always' });
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
