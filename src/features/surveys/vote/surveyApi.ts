/**
 * PL: Rozmowa telefonu z serwerem ankiet: pobranie listy, pobranie ankiety i wysłanie odpowiedzi. Jedyne miejsce w telefonie, które woła /api/surveys/vote.
 * EN: The phone's talk with the survey server: fetching the list, fetching a survey and sending the answers. The only place on the phone that calls /api/surveys/vote.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by src/features/surveys/vote/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 */

import { cleanShortText } from './shortText';
import type { AnswerMap, SurveyDetail, SurveyList, TextMap } from './types';

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
 * PL: Nagłówki każdego zapytania: rodzaj treści. Sesję ucznia niesie ciasteczko, które przeglądarka dołącza sama.
 * EN: The headers of every request: the content type. The student session travels in the cookie the browser attaches itself.
 *
 * @returns PL: nagłówki. EN: the headers.
 */
function requestHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json' };
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
 * @param texts - PL: krótkie odpowiedzi (tekst przycinamy tu, przed wysłaniem). EN: the short answers (the text is trimmed here, before sending).
 * @returns PL: 'ok', 'already_voted' (409) albo 'ended' (410). Inny błąd rzuca ApiError. EN: 'ok', 'already_voted' (409) or 'ended' (410). Any other error throws ApiError.
 */
export async function sendAnswers(surveyId: string, answers: AnswerMap, texts: TextMap): Promise<SendResult> {
  // PL: Zamień mapy na listę pytań, jakiej oczekuje serwer. Wybory idą z listą numerów odpowiedzi, a krótka odpowiedź z tekstem i pustą listą wyborów.
  // EN: Turn the maps into the list of questions the server expects. Choices go with a list of option ids, and a short answer with its text and an empty list of choices.
  const choices = Object.entries(answers).map(([questionId, optionIds]) => ({ questionId, optionIds }));
  // PL: Pusty tekst (wyczyszczony po wpisaniu) nie idzie na serwer, bo serwer odrzuca pusty tekst.
  // EN: An empty text (cleared after typing) is not sent, because the server rejects empty text.
  const shortAnswers = Object.entries(texts)
    .map(([questionId, text]) => ({ questionId, optionIds: [], text: cleanShortText(text) }))
    .filter((answer) => answer.text !== '');
  const body = { answers: [...choices, ...shortAnswers] };
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
