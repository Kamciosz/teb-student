/**
 * PL: Hooki TanStack Query dla ekranów 4b: lista zgłoszeń, jedno zgłoszenie z historią, zmiana etapu i stan połączenia. Po zmianie etapu zapisujemy odpowiedź serwera w pamięci i pobieramy listę od nowa.
 * EN: TanStack Query hooks for the 4b screens: the report list, one report with its history, the stage change and the connection state. After a stage change we store the server answer in the cache and fetch the list again.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/api.ts::fetchAdminReports
 * @uses src/features/reports/admin/api.ts::fetchAdminReport
 * @uses src/features/reports/admin/api.ts::changeReportStage
 * @used_by src/features/reports/admin/ReportsList.tsx::useAdminReports
 * @used_by src/features/reports/admin/ReportDetail.tsx::useAdminReport
 * @used_by src/features/reports/admin/ReportDetail.tsx::useChangeStage
 * @used_by src/features/reports/admin/ReportDetail.tsx::useIsOnline
 */

import { onlineManager, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { changeReportStage, fetchAdminReport, fetchAdminReports } from './api';

/** PL: Klucz listy w pamięci podręcznej. EN: The list key in the cache. */
const LIST_KEY = ['reports', 'admin', 'list'] as const;

/**
 * PL: Ile razy ponawiamy nieudane pobranie. Domyślne trzy próby z przerwami trzymałyby Samorząd kilka sekund bez komunikatu, a odmowa serwera (403) nie mija po ponowieniu.
 * EN: How many times a failed fetch is retried. The default three attempts with pauses would keep the Student Council several seconds without a message, and a server refusal (403) does not go away on retry.
 */
const RETRIES = 1;

/**
 * PL: Buduje klucz jednego zgłoszenia w pamięci podręcznej.
 * EN: Builds the cache key of one report.
 *
 * @param id - PL: numer zgłoszenia. EN: the report id.
 * @returns PL: klucz zapytania. EN: the query key.
 */
function detailKey(id: string) {
  return ['reports', 'admin', 'detail', id] as const;
}

/**
 * PL: Czyta listę zgłoszeń. Bez internetu zostaje ostatnia zapisana lista.
 * EN: Reads the report list. Without internet the last saved list stays.
 *
 * @returns PL: wynik zapytania (dane, stan ładowania, błąd). EN: the query result (data, loading state, error).
 */
export function useAdminReports() {
  // PL: Lista jest świeża 30 sekund; zapis w telefonie robi wspólny dostawca zapytań.
  // EN: The list is fresh for 30 seconds; saving on the phone is done by the shared query provider.
  return useQuery({ queryKey: LIST_KEY, queryFn: fetchAdminReports, staleTime: 30_000, retry: RETRIES });
}

/**
 * PL: Czyta jedno zgłoszenie z historią.
 * EN: Reads one report with its history.
 *
 * @param id - PL: numer zgłoszenia. EN: the report id.
 * @returns PL: wynik zapytania. EN: the query result.
 */
export function useAdminReport(id: string) {
  // PL: Każde zgłoszenie ma własny klucz w pamięci.
  // EN: Every report has its own cache key.
  return useQuery({ queryKey: detailKey(id), queryFn: () => fetchAdminReport(id), staleTime: 30_000, retry: RETRIES });
}

/**
 * PL: Zmienia etap zgłoszenia. Po sukcesie zapisuje nowy stan zgłoszenia i odświeża listę.
 * EN: Changes a report's stage. After success it stores the new report state and refreshes the list.
 *
 * @param id - PL: numer zgłoszenia. EN: the report id.
 * @returns PL: mutacja z funkcją `mutate` i stanem zapisu. EN: a mutation with the `mutate` function and the saving state.
 */
export function useChangeStage(id: string) {
  // PL: `networkMode: 'always'` pokazuje błąd zamiast czekać na sieć; przycisk i tak blokuje się bez internetu.
  // EN: `networkMode: 'always'` shows an error instead of waiting for the network; the button is disabled offline anyway.
  const client = useQueryClient();
  return useMutation({
    mutationFn: (stage: string) => changeReportStage({ id, stage }),
    networkMode: 'always',
    onSuccess: (detail) => {
      // PL: Odpowiedź serwera to aktualny szczegół, więc wstawiamy go do pamięci i odświeżamy listę.
      // EN: The server answer is the current detail, so we put it into the cache and refresh the list.
      client.setQueryData(detailKey(id), detail);
      return client.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
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
