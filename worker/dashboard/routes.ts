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
 * @returns PL: odpowiedź JSON modułu albo null, gdy moduł odmówił (na przykład 401 bez sesji) lub odpowiedział błędem. EN: the module's JSON answer, or null when it refused (for example 401 without a session) or answered with an error.
 */
async function readList(router: InnerRouter, env: Env, cookie: string | undefined): Promise<unknown> {
  try {
    // PL: Zapytanie o listę, z ciasteczkiem tylko gdy jest.
    // EN: Ask for the list, with the cookie only when there is one.
    const response = await router.request('/', { headers: cookie === undefined ? {} : { cookie } }, env);
    return response.ok ? await response.json() : null;
  } catch {
    // PL: Odpowiedź bez JSON to taki sam brak danych jak błąd: kafel pokaże pusty stan.
    // EN: An answer without JSON is the same lack of data as an error: the tile shows the empty state.
    return null;
  }
}

/**
 * PL: Router pulpitu. Nie wymaga sesji: aktualności są publiczne, a zgłoszenia i ankiety bez sesji dają pusty kafel (moduły odpowiadają 401).
 * EN: The dashboard router. It does not require a session: the news is public, and reports and surveys without a session give an empty tile (the modules answer 401).
 */
export const dashboardApp = new Hono<{ Bindings: Env }>();

// PL: GET / oddaje dane wszystkich kafelków naraz, żeby telefon robił jedno zapytanie i zapisywał jedną odpowiedź na czas braku internetu.
// EN: GET / returns the data of all tiles at once, so the phone makes one request and saves one answer for the time without internet.
dashboardApp.get('/', async (context) => {
  // PL: Zapytaj trzy moduły naraz.
  // EN: Ask the three modules at once.
  const cookie = context.req.header('cookie');
  const [news, surveys, reports] = await Promise.all([
    readList(newsFeedApp, context.env, cookie),
    readList(surveysVoteApp, context.env, cookie),
    readList(reportsStudentApp, context.env, cookie),
  ]);

  // PL: Złóż odpowiedź z danych kafelków.
  // EN: Build the answer from the tile data.
  const data: DashboardData = { ...summarizeNews(news), survey: summarizeSurveys(surveys), report: summarizeReports(reports) };
  return context.json(data);
});
