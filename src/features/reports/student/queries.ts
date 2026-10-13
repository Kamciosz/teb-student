/**
 * PL: Hooki TanStack Query dla ekranów 4a: lista „Moje zgłoszenia”, wysłanie zgłoszenia, lista podobnych zgłoszeń i dołączenie „Mnie też”. Po wysłaniu lista pobiera się od nowa, po dołączeniu lista podobnych też.
 * EN: TanStack Query hooks for the 4a screens: the "Moje zgłoszenia" list, sending a report, the list of similar reports and joining "Me too". After sending, the list is fetched again; after joining, the similar list is too.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/api.ts::fetchMyReports
 * @uses src/features/reports/student/api.ts::sendReport
 * @uses src/features/reports/student/api.ts::fetchSimilarReports
 * @uses src/features/reports/student/api.ts::joinReport
 * @used_by src/features/reports/student/MyReports.tsx::useMyReports
 * @used_by src/features/reports/student/ReportForm.tsx::useSendReport
 * @used_by src/features/reports/student/SimilarReports.tsx::useSimilarReports
 * @used_by src/features/reports/student/SimilarReports.tsx::useJoinReport
 */

// PL: useQuery czyta dane, useMutation je zmienia, useQueryClient daje dostęp do pamięci podręcznej.
// EN: useQuery reads data, useMutation changes it, useQueryClient gives access to the cache.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// PL: Rozmowa z serwerem.
// EN: The talk with the server.
import { fetchMyReports, fetchSimilarReports, joinReport, sendReport } from './api';

/** PL: Klucz listy w pamięci podręcznej. EN: The list key in the cache. */
const MY_REPORTS_KEY = ['reports', 'student', 'mine'] as const;

/** PL: Początek klucza list podobnych zgłoszeń; unieważnienie po dołączeniu obejmuje wszystkie. EN: The start of the similar-list keys; invalidating after a join covers all of them. */
const SIMILAR_KEY = ['reports', 'student', 'similar'] as const;

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

/**
 * PL: Czyta otwarte zgłoszenia podobne do nowego. Bez ponowień i bez czekania na internet: błąd albo brak sieci ma od razu przepuścić ucznia dalej.
 * EN: Reads open reports similar to the new one. No retries and no waiting for the internet: an error or no network must let the student move on at once.
 *
 * @param category - PL: kod kategorii z formularza. EN: the category code from the form.
 * @param place - PL: kod miejsca z formularza. EN: the place code from the form.
 * @returns PL: wynik zapytania (lista, stan ładowania, błąd). EN: the query result (the list, loading state, error).
 */
export function useSimilarReports(category: string, place: string) {
  // PL: networkMode „always” wysyła od razu, więc bez sieci zapytanie kończy się błędem zamiast czekać. gcTime 0 nie zostawia listy w pamięci po wyjściu z kroku.
  // EN: networkMode "always" sends at once, so without a network the query fails instead of waiting. gcTime 0 keeps no list in memory after leaving the step.
  return useQuery({
    queryKey: [...SIMILAR_KEY, category, place],
    queryFn: () => fetchSimilarReports(category, place),
    retry: false,
    networkMode: 'always',
    gcTime: 0,
  });
}

/**
 * PL: Dołącza ucznia do zgłoszenia („Mnie też”) i po sukcesie odświeża listy podobnych zgłoszeń.
 * EN: Joins the student to a report ("Me too") and after success refreshes the similar-report lists.
 *
 * @returns PL: mutacja z funkcją `mutate` i stanem wysyłania. EN: a mutation with the `mutate` function and the sending state.
 */
export function useJoinReport() {
  // PL: Dostęp do pamięci podręcznej, żeby unieważnić listy podobnych zgłoszeń.
  // EN: Access to the cache, to invalidate the similar-report lists.
  const client = useQueryClient();
  return useMutation({
    mutationFn: joinReport,
    networkMode: 'always',
    onSuccess: () => client.invalidateQueries({ queryKey: SIMILAR_KEY }),
  });
}
