/**
 * PL: Zapytania TanStack Query podtoru 5b: lista ankiet, wyniki jednej ankiety i publikacja nowej. Dostawca zapytań stoi w korzeniu aplikacji (zapis w telefonie), więc lista i ostatnio otwarte wyniki są widoczne także bez internetu. Klucze zaczynają się od SURVEYS_ADMIN_KEY, żeby po publikacji jednym wywołaniem odświeżyć całą listę.
 * EN: The TanStack Query queries of subtrack 5b: the survey list, the results of one survey and publishing a new one. The query provider stands at the app root (saved on the phone), so the list and recently opened results are visible also without internet. The keys start with SURVEYS_ADMIN_KEY, so after publishing one call refreshes the whole list.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/surveyApi.ts::fetchPanelSurveys
 * @used_by src/features/surveys/admin/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/admin/ResultsScreen.tsx::ResultsScreen
 * @used_by src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 */

import { onlineManager, useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { createSurvey, fetchPanelSurveys, fetchResults } from './surveyApi';
import type { NewSurveyBody, PanelSurveyList, SurveyResults } from './types';

/** PL: Początek każdego klucza zapytania tego podtoru. EN: The start of every query key of this subtrack. */
export const SURVEYS_ADMIN_KEY = ['surveys', 'admin'] as const;

/**
 * PL: Pobiera listę ankiet. Bez ponawiania: błąd pokazujemy od razu, zamiast kilka sekund wczytywać.
 * EN: Fetches the survey list. Without retries: the error is shown at once, instead of loading for several seconds.
 *
 * @returns PL: wynik zapytania z listą. EN: the query result with the list.
 */
export function usePanelSurveys(): UseQueryResult<PanelSurveyList> {
  return useQuery({ queryKey: [...SURVEYS_ADMIN_KEY, 'list'], queryFn: fetchPanelSurveys, retry: false });
}

/**
 * PL: Pobiera wyniki jednej ankiety. Bez ponawiania, z tego samego powodu co lista.
 * EN: Fetches the results of one survey. Without retries, for the same reason as the list.
 *
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @returns PL: wynik zapytania z wynikami. EN: the query result with the results.
 */
export function useSurveyResults(surveyId: string): UseQueryResult<SurveyResults> {
  return useQuery({ queryKey: [...SURVEYS_ADMIN_KEY, 'results', surveyId], queryFn: () => fetchResults(surveyId), retry: false });
}

/**
 * PL: Publikuje ankietę. Po sukcesie odświeża listę ankiet.
 * EN: Publishes a survey. After success it refreshes the survey list.
 *
 * @returns PL: mutacja do wywołania z ekranu. EN: the mutation to call from the screen.
 */
export function usePublishSurvey(): UseMutationResult<{ id: string }, Error, NewSurveyBody> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSurvey,
    // PL: Nowa ankieta ma się pokazać na liście od razu.
    // EN: The new survey must show on the list at once.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SURVEYS_ADMIN_KEY }),
    // PL: Bez ponawiania: zapis robi się raz, a błąd widzi osoba z przyciskiem aktywnym.
    // EN: Without retries: the write happens once, and the person sees the error with the button still active.
    retry: false,
    // PL: Zapis zawsze próbuje od razu. Bez tego TanStack wstrzymałby go bez internetu i ekran wisiałby bez końca.
    // EN: The write always tries at once. Without this, TanStack would pause it offline and the screen would hang forever.
    networkMode: 'always',
  });
}

/**
 * PL: Mówi, czy telefon ma internet. Zapis ankiety bez internetu jest wyłączony (EKRANY.md, zasady wspólne ekranów 6.x).
 * EN: Tells whether the phone has internet. Saving a survey without internet is disabled (EKRANY.md, the shared rules of the 6.x screens).
 *
 * @returns PL: prawda, gdy jest internet. EN: true when there is internet.
 */
export function useIsOnline(): boolean {
  // PL: Ten sam menedżer sieci, którego używają zapytania, więc ekran i zapytania zgadzają się co do stanu sieci.
  // EN: The same network manager the queries use, so the screen and the queries agree about the network state.
  return useSyncExternalStore(
    (listener) => onlineManager.subscribe(listener),
    () => onlineManager.isOnline(),
  );
}
