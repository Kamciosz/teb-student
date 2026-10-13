/**
 * PL: Rozmowa telefonu z serwerem ankiet w panelu: pobranie listy, pobranie wyników i utworzenie ankiety. Jedyne miejsce w telefonie, które woła /api/surveys/admin. Sesję niesie ciasteczko, które przeglądarka dołącza sama.
 * EN: The phone's talk with the survey panel server: fetching the list, fetching the results and creating a survey. The only place on the phone that calls /api/surveys/admin. The session travels in the cookie the browser attaches itself.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/types.ts::PanelSurveyList
 * @used_by src/features/surveys/admin/surveyQueries.ts::usePanelSurveys
 */

import type { NewSurveyBody, PanelSurveyList, SurveyResults } from './types';

// PL: Początek adresów serwera ankiet w panelu. Zgadza się z worker/mounts.ts.
// EN: The start of the survey panel server addresses. Matches worker/mounts.ts.
const API_BASE = '/api/surveys/admin';

/**
 * PL: Wysyła zapytanie i odczytuje JSON. Rzuca błąd, gdy odpowiedź nie jest udana.
 * EN: Sends a request and parses the JSON. Throws an error when the response is not successful.
 *
 * @param path - PL: adres po /api/surveys/admin. EN: the address after /api/surveys/admin.
 * @param init - PL: ustawienia zapytania (metoda, treść). EN: the request settings (method, body).
 * @returns PL: odczytany JSON. EN: the parsed JSON.
 */
async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  // PL: Brak internetu rzuca TypeError, a ekran pokaże błąd.
  // EN: No internet throws a TypeError, and the screen shows an error.
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error(`Serwer odpowiedział ${response.status} / The server answered ${response.status}`);
  return (await response.json()) as T;
}

/**
 * PL: Pobiera listę ankiet z liczbą odpowiedzi.
 * EN: Fetches the survey list with the response count.
 *
 * @returns PL: trwające i zakończone ankiety. EN: the running and ended surveys.
 */
export function fetchPanelSurveys(): Promise<PanelSurveyList> {
  return requestJson<PanelSurveyList>('/');
}

/**
 * PL: Pobiera wyniki ankiety. Poniżej progu odpowiedzi serwer nie wysyła rozkładu głosów.
 * EN: Fetches the survey results. Below the response threshold the server does not send the vote distribution.
 *
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @returns PL: wyniki. EN: the results.
 */
export function fetchResults(surveyId: string): Promise<SurveyResults> {
  return requestJson<SurveyResults>(`/${encodeURIComponent(surveyId)}/results`);
}

/**
 * PL: Tworzy ankietę. Zmienia dane na serwerze.
 * EN: Creates a survey. Changes data on the server.
 *
 * @param survey - PL: tytuł, pytania i czas trwania. EN: the title, the questions and the duration.
 * @returns PL: numer nowej ankiety. EN: the id of the new survey.
 */
export function createSurvey(survey: NewSurveyBody): Promise<{ id: string }> {
  return requestJson<{ id: string }>('/', { method: 'POST', body: JSON.stringify(survey) });
}
