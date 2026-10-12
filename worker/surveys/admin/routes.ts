/**
 * PL: Router Hono podtoru 5b (ankiety w panelu: tworzenie i wyniki), podpięty pod /api/surveys/admin w worker/mounts.ts. Trzy adresy: lista ankiet z liczbą odpowiedzi, utworzenie ankiety i wyniki ankiety.
 *     Kody odpowiedzi: 401 brak sesji, 403 brak roli, 404 nie ma ankiety, 400 zła ankieta. Próg 5 odpowiedzi egzekwuje serwer (results.ts): poniżej progu wyniki nie mają rozkładu głosów.
 * EN: The Hono router of subtrack 5b (surveys in the panel: creating and results), mounted under /api/surveys/admin in worker/mounts.ts. Three routes: the survey list with the response count, creating a survey and the survey results.
 *     Response codes: 401 no session, 403 no role, 404 no such survey, 400 bad survey. The 5-response threshold is enforced by the server (results.ts): below the threshold the results have no vote distribution.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/surveys/admin/queries.ts::listPanelSurveys
 * @uses worker/surveys/admin/panelRole.ts::requirePanelRole
 * @used_by worker/surveys/admin/index.ts::surveysAdminApp
 * @used_by worker/surveys/admin/routes.test.ts::createSurveysAdminApp
 */

import { Hono, type MiddlewareHandler } from 'hono';
// PL: Klient bazy D1 dla Drizzle.
// EN: The D1 client for Drizzle.
import { drizzle } from 'drizzle-orm/d1';
import type { StudentEnv } from '../../auth';
import { lastDayOf, warsawToday } from './dates';
import { requirePanelRole } from './panelRole';
import { findResults, insertSurvey, listPanelSurveys } from './queries';
import { parseNewSurvey } from './validation';

/**
 * PL: Buduje router panelu ankiet z podanym sprawdzaniem roli. Strażnik jest parametrem, żeby test podstawił zaślepkę, a po scaleniu podtoru 8 zmieniła się jedna linia.
 * EN: Builds the survey panel router with the given role check. The guard is a parameter, so a test can substitute a stub, and after subtrack 8 merges one line changes.
 *
 * @param guard - PL: middleware sprawdzający sesję i rolę, wołany przed każdym adresem. EN: the middleware that checks the session and the role, called before every route.
 * @returns PL: router Hono. EN: the Hono router.
 */
export function createSurveysAdminApp(guard: MiddlewareHandler<StudentEnv>) {
  const app = new Hono<StudentEnv>().use(guard);

  // PL: GET / – lista ankiet: trwające i zakończone, z liczbą odpowiedzi.
  // EN: GET / – the survey list: running and ended, with the response count.
  app.get('/', async (context) => context.json(await listPanelSurveys(drizzle(context.env.DB), warsawToday(new Date()))));

  // PL: POST / – utworzenie ankiety. Ostatni dzień liczy serwer od dnia publikacji, telefon podaje tylko liczbę dni.
  // EN: POST / – creating a survey. The server counts the last day from the publication day, the phone gives only the number of days.
  app.post('/', async (context) => {
    const survey = parseNewSurvey(await context.req.json().catch(() => null));
    if (survey === null) return context.json({ error: 'invalid_survey' }, 400);
    const endsOn = lastDayOf(warsawToday(new Date()), survey.durationDays);
    return context.json({ id: await insertSurvey(drizzle(context.env.DB), survey, endsOn) }, 201);
  });

  // PL: GET /:surveyId/results – wyniki ankiety, od 5 odpowiedzi z rozkładem głosów.
  // EN: GET /:surveyId/results – the survey results, with the vote distribution from 5 responses.
  app.get('/:surveyId/results', async (context) => {
    const results = await findResults(drizzle(context.env.DB), context.req.param('surveyId'));
    return results === null ? context.json({ error: 'not_found' }, 404) : context.json(results);
  });

  return app;
}

/**
 * PL: Router podtoru 5b. Sprawdzanie roli jest tu w jednej linii: po scaleniu podtoru 8 podmień `requirePanelRole` na jego middleware.
 * EN: The router of subtrack 5b. The role check is in one line here: after subtrack 8 merges, replace `requirePanelRole` with its middleware.
 */
export const surveysAdminApp = createSurveysAdminApp(requirePanelRole);
