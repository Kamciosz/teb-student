/**
 * PL: Hooki TanStack Query dla ekranów 4a: lista „Moje zgłoszenia” i wysłanie zgłoszenia. Po wysłaniu lista pobiera się od nowa.
 * EN: TanStack Query hooks for the 4a screens: the "Moje zgłoszenia" list and sending a report. After sending, the list is fetched again.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/api.ts::fetchMyReports
 * @uses src/features/reports/student/api.ts::sendReport
 * @used_by src/features/reports/student/MyReports.tsx::useMyReports
 * @used_by src/features/reports/student/ReportForm.tsx::useSendReport
 */

// PL: useQuery czyta dane, useMutation je zmienia, useQueryClient daje dostęp do pamięci podręcznej.
// EN: useQuery reads data, useMutation changes it, useQueryClient gives access to the cache.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// PL: Rozmowa z serwerem.
// EN: The talk with the server.
import { fetchMyReports, sendReport } from './api';

/** PL: Klucz listy w pamięci podręcznej. EN: The list key in the cache. */
const MY_REPORTS_KEY = ['reports', 'student', 'mine'] as const;

/**
 * PL: Czyta „Moje zgłoszenia”. Bez internetu zostaje ostatnia zapisana lista.
 * EN: Reads "Moje zgłoszenia". Without internet the last saved list stays.
 *
 * @returns PL: wynik zapytania (dane, stan ładowania, błąd). EN: the query result (data, loading state, error).
 */
export function useMyReports() {
  // PL: Lista jest świeża 30 sekund, żeby wejście na ekran nie pobierało jej za każdym razem.
  // EN: The list is fresh for 30 seconds, so opening the screen does not fetch it every time.
  return useQuery({ queryKey: MY_REPORTS_KEY, queryFn: fetchMyReports, staleTime: 30_000 });
}

/**
 * PL: Wysyła zgłoszenie i po sukcesie odświeża listę.
 * EN: Sends a report and refreshes the list after success.
 *
 * @returns PL: mutacja z funkcją `mutate` i stanem wysyłania. EN: a mutation with the `mutate` function and the sending state.
 */
export function useSendReport() {
  // PL: Dostęp do pamięci podręcznej, żeby unieważnić listę.
  // EN: Access to the cache, to invalidate the list.
  const client = useQueryClient();
  // PL: networkMode „always” wysyła od razu i bez internetu kończy się błędem, zamiast czekać w tle; formularz pokaże błąd.
  // EN: networkMode "always" sends right away and fails without internet instead of waiting in the background; the form shows the error.
  return useMutation({
    mutationFn: sendReport,
    networkMode: 'always',
    onSuccess: () => client.invalidateQueries({ queryKey: MY_REPORTS_KEY }),
  });
}
