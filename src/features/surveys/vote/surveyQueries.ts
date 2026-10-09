/**
 * PL: Zapytania TanStack Query podtoru 5a: lista ankiet i szczegóły jednej ankiety. Dostawca zapytań stoi w korzeniu aplikacji (zapis w telefonie), więc lista i ostatnio otwarte ankiety są widoczne także bez internetu. Klucze zaczynają się od SURVEYS_VOTE_KEY, żeby po głosie jednym wywołaniem odświeżyć wszystko z tego podtoru.
 * EN: The TanStack Query queries of subtrack 5a: the survey list and the details of one survey. The query provider stands at the app root (saved on the phone), so the list and recently opened surveys are visible also without internet. The keys start with SURVEYS_VOTE_KEY, so after a vote one call refreshes everything from this subtrack.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/surveyApi.ts::fetchSurveyList
 * @uses src/features/surveys/vote/surveyApi.ts::fetchSurvey
 * @used_by src/features/surveys/vote/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 * @used_by src/features/surveys/vote/useVoteSubmit.ts::useVoteSubmit
 */

// PL: Zapytanie z TanStack Query i typ jego wyniku.
// EN: The TanStack Query query and the type of its result.
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchSurvey, fetchSurveyList } from './surveyApi';
import type { SurveyDetail, SurveyList } from './types';

/** PL: Początek każdego klucza zapytania tego podtoru. EN: The start of every query key of this subtrack. */
export const SURVEYS_VOTE_KEY = ['surveys', 'vote'] as const;

/**
 * PL: Pobiera listę ankiet. Bez ponawiania: błąd pokazujemy od razu z przyciskiem „Spróbuj ponownie”, zamiast kilka sekund wczytywać.
 * EN: Fetches the survey list. Without retries: the error is shown at once with a "Spróbuj ponownie" button, instead of loading for several seconds.
 *
 * @returns PL: wynik zapytania z listą. EN: the query result with the list.
 */
export function useSurveyList(): UseQueryResult<SurveyList> {
  return useQuery({ queryKey: [...SURVEYS_VOTE_KEY, 'list'], queryFn: fetchSurveyList, retry: false });
}

/**
 * PL: Pobiera szczegóły jednej ankiety. Bez ponawiania, z tego samego powodu co lista.
 * EN: Fetches the details of one survey. Without retries, for the same reason as the list.
 *
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @returns PL: wynik zapytania ze szczegółami. EN: the query result with the details.
 */
export function useSurvey(surveyId: string): UseQueryResult<SurveyDetail> {
  return useQuery({ queryKey: [...SURVEYS_VOTE_KEY, 'survey', surveyId], queryFn: () => fetchSurvey(surveyId), retry: false });
}
