/**
 * PL: Rozmowa telefonu z serwerem ankiet: pobranie listy, pobranie ankiety i wysłanie odpowiedzi. Jedyne miejsce w telefonie, które woła /api/surveys/vote.
 * EN: The phone's talk with the survey server: fetching the list, fetching a survey and sending the answers. The only place on the phone that calls /api/surveys/vote.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/temporaryStudentId.ts::getTemporaryStudentId
 * @used_by src/features/surveys/vote/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 */

// PL: Tymczasowy numer ucznia i nazwa nagłówka.
// EN: The temporary student id and the header name.
import { TEMPORARY_STUDENT_HEADER, getTemporaryStudentId } from './temporaryStudentId';
import type { AnswerMap, SurveyDetail, SurveyList } from './types';

// PL: Początek adresów serwera ankiet. Zgadza się z worker/mounts.ts.
// EN: The start of the survey server addresses. Matches worker/mounts.ts.
const API_BASE = '/api/surveys/vote';

/** PL: Wynik wysłania odpowiedzi. EN: The result of sending the answers. */
export type SendResult = 'ok' | 'already_voted' | 'ended';

/** PL: Błąd rozmowy z serwerem. Niesie kod odpowiedzi. EN: An error in the talk with the server. Carries the response status. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Serwer odpowiedział ${status} / The server answered ${status}`);
    this.status = status;
  }
}

/**
 * PL: Nagłówki każdego zapytania: numer ucznia i rodzaj treści.
 * EN: The headers of every request: the student id and the content type.
 *
 * @returns PL: nagłówki. EN: the headers.
 */
function requestHeaders(): Record<string, string> {
  // PL: Numer ucznia jest tymczasowy, zob. temporaryStudentId.ts.
  // EN: The student id is temporary, see temporaryStudentId.ts.
  return { [TEMPORARY_STUDENT_HEADER]: getTemporaryStudentId(), 'Content-Type': 'application/json' };
}

/**
 * PL: Pobiera JSON z adresu serwera. Rzuca ApiError, gdy odpowiedź nie jest udana.
 * EN: Fetches JSON from a server address. Throws ApiError when the response is not successful.
 *
 * @param path - PL: adres po /api/surveys/vote. EN: the address after /api/surveys/vote.
 * @returns PL: odczytany JSON. EN: the parsed JSON.
 */
async function getJson<T>(path: string): Promise<T> {
  // PL: Wyślij zapytanie. Brak internetu rzuca TypeError, a ekran pokaże błąd.
  // EN: Send the request. No internet throws a TypeError, and the screen shows an error.
  const response = await fetch(`${API_BASE}${path}`, { headers: requestHeaders() });
  if (!response.ok) throw new ApiError(response.status);
  return (await response.json()) as T;
}

/**
 * PL: Pobiera listę ankiet.
 * EN: Fetches the survey list.
 *
 * @returns PL: lista trwających i zakończonych ankiet. EN: the list of running and ended surveys.
 */
export function fetchSurveyList(): Promise<SurveyList> {
  return getJson<SurveyList>('/');
}

/**
 * PL: Pobiera jedną ankietę z pytaniami.
 * EN: Fetches one survey with its questions.
 *
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @returns PL: ankieta z pytaniami. EN: the survey with its questions.
 */
export function fetchSurvey(surveyId: string): Promise<SurveyDetail> {
  return getJson<SurveyDetail>(`/${encodeURIComponent(surveyId)}`);
}

/**
 * PL: Wysyła odpowiedzi ucznia. Zmienia dane na serwerze: zapisuje głos.
 * EN: Sends the student's answers. Changes data on the server: it records the vote.
 *
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @param answers - PL: wybrane odpowiedzi. EN: the chosen options.
 * @returns PL: 'ok', 'already_voted' (409) albo 'ended' (410). Inny błąd rzuca ApiError. EN: 'ok', 'already_voted' (409) or 'ended' (410). Any other error throws ApiError.
 */
export async function sendAnswers(surveyId: string, answers: AnswerMap): Promise<SendResult> {
  // PL: Zamień mapę na listę par pytanie–odpowiedź, jakiej oczekuje serwer.
  // EN: Turn the map into the list of question–option pairs the server expects.
  const body = { answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })) };
  const response = await fetch(`${API_BASE}/${encodeURIComponent(surveyId)}/answers`, {
    method: 'POST',
    headers: requestHeaders(),
    body: JSON.stringify(body),
  });

  // PL: Dwa błędy są oczekiwane i mają własny komunikat. Reszta to błąd.
  // EN: Two errors are expected and have their own message. The rest is an error.
  if (response.status === 409) return 'already_voted';
  if (response.status === 410) return 'ended';
  if (!response.ok) throw new ApiError(response.status);
  return 'ok';
}
