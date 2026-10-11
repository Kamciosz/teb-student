/**
 * PL: Router pulpitu (podtor 9), podpięty pod /api/dashboard. Jedno zapytanie GET / zbiera dane kafelków: pyta routery aktualności, zgłoszeń i ankiet przez ich drzwi (index.ts), tak jak zrobiłby to telefon, i skraca odpowiedzi do tego, co pokazuje pulpit.
 * EN: The dashboard router (subtrack 9), mounted under /api/dashboard. One GET / request gathers the tile data: it asks the news, reports and surveys routers through their doors (index.ts), the way the phone would, and shortens the answers to what the dashboard shows.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses worker/news/index.ts::newsFeedApp
 * @uses worker/reports/index.ts::reportsStudentApp
 * @uses worker/surveys/index.ts::surveysVoteApp
 * @uses worker/dashboard/summary.ts::summarizeNews
 * @used_by worker/dashboard/index.ts::dashboardApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';
// PL: Typ środowiska Workera (baza i sekrety).
// EN: The Worker environment type (the database and secrets).
import type { Env } from '../shared';
// PL: Routery modułów, tylko przez ich drzwi.
// EN: The module routers, only through their doors.
import { newsFeedApp } from '../news';
import { reportsStudentApp } from '../reports';
import { surveysVoteApp } from '../surveys';
// PL: Skracanie odpowiedzi modułów do danych kafelków.
// EN: Shortening the module answers to the tile data.
import { summarizeNews, summarizeReports, summarizeSurveys } from './summary';
import type { DashboardData } from './types';

/**
 * PL: Router, który umie odpowiedzieć na zapytanie z podanym środowiskiem. Pasuje do każdego routera Hono.
 * EN: A router that can answer a request with the given environment. It fits every Hono router.
 */
type InnerRouter = { request: (input: string, init: RequestInit, env: Env) => Response | Promise<Response> };

/**
 * PL: Pyta router modułu o jego listę, z ciasteczkiem sesji ucznia, bo zgłoszenia i ankiety wymagają zalogowania.
 * EN: Asks a module router for its list, with the student's session cookie, because reports and surveys require sign-in.
 *
 * @param router - PL: router modułu. EN: the module router.
 * @param env - PL: środowisko Workera z bazą. EN: the Worker environment with the database.
 * @param cookie - PL: nagłówek `cookie` zapytania pulpitu albo undefined. EN: the `cookie` header of the dashboard request, or undefined.
 * @returns PL: odpowiedź JSON modułu albo null, gdy moduł odmówił z powodu braku sesji (401): to pusty kafel, a nie błąd. EN: the module's JSON answer, or null when the module refused because of no session (401): that is an empty tile, not an error.
 * @throws PL: Error, gdy moduł odpowiedział innym błędem albo odpowiedź nie jest JSON. EN: an Error when the module answered with another error or the answer is not JSON.
 */
async function readList(router: InnerRouter, env: Env, cookie: string | undefined): Promise<unknown> {
  // PL: Zapytanie o listę, z ciasteczkiem tylko gdy jest.
  // EN: Ask for the list, with the cookie only when there is one.
  const response = await router.request('/', { headers: cookie === undefined ? {} : { cookie } }, env);

  // PL: Brak sesji to pusty kafel. Każdy inny błąd modułu to błąd pulpitu, żeby telefon nie wziął go za „nic nie ma” i nie zastąpił nim zapisanych danych.
  // EN: No session is an empty tile. Every other module error is a dashboard error, so the phone does not take it for "nothing there" and does not replace the saved data with it.
  if (response.status === 401) return null;
  if (!response.ok) throw new Error(`Module answered ${response.status}`);
  return await response.json();
}

/**
 * PL: Router pulpitu. Nie wymaga sesji: aktualności są publiczne, a zgłoszenia i ankiety bez sesji dają pusty kafel (moduły odpowiadają 401). Błąd któregokolwiek modułu to odpowiedź 502 bez szczegółów.
 * EN: The dashboard router. It does not require a session: the news is public, and reports and surveys without a session give an empty tile (the modules answer 401). An error of any module is a 502 answer without details.
 */
export const dashboardApp = new Hono<{ Bindings: Env }>();

// PL: GET / oddaje dane wszystkich kafelków naraz, żeby telefon robił jedno zapytanie i zapisywał jedną odpowiedź na czas braku internetu.
// EN: GET / returns the data of all tiles at once, so the phone makes one request and saves one answer for the time without internet.
dashboardApp.get('/', async (context) => {
  // PL: Zapytaj trzy moduły naraz.
  // EN: Ask the three modules at once.
  const cookie = context.req.header('cookie');
  try {
    const [news, surveys, reports] = await Promise.all([
      readList(newsFeedApp, context.env, cookie),
      readList(surveysVoteApp, context.env, cookie),
      readList(reportsStudentApp, context.env, cookie),
    ]);

    // PL: Złóż odpowiedź z danych kafelków.
    // EN: Build the answer from the tile data.
    const data: DashboardData = { ...summarizeNews(news), survey: summarizeSurveys(surveys), report: summarizeReports(reports) };
    return context.json(data);
  } catch {
    // PL: Błąd modułu to 502 bez szczegółów. Telefon pokaże komunikat albo zapisane dane, a nie puste kafelki.
    // EN: A module error is 502 without details. The phone shows a message or the saved data, not empty tiles.
    return context.json({ error: 'upstream_error' }, 502);
  }
});
