/**
 * PL: Router Hono podtoru 5b (ankiety w panelu: tworzenie i wyniki), podpięty pod /api/surveys/admin w worker/mounts.ts. Cztery adresy: lista ankiet z liczbą odpowiedzi, utworzenie ankiety, wyniki ankiety i wyniki jako plik CSV.
 *     Kody odpowiedzi: 401 brak sesji, 403 brak roli, 404 nie ma ankiety, 400 zła ankieta, 409 za mało odpowiedzi na plik CSV. Próg 5 odpowiedzi egzekwuje serwer (results.ts): poniżej progu wyniki nie mają rozkładu głosów.
 * EN: The Hono router of subtrack 5b (surveys in the panel: creating and results), mounted under /api/surveys/admin in worker/mounts.ts. Four routes: the survey list with the response count, creating a survey, the survey results and the results as a CSV file.
 *     Response codes: 401 no session, 403 no role, 404 no such survey, 400 bad survey, 409 too few responses for the CSV file. The 5-response threshold is enforced by the server (results.ts): below the threshold the results have no vote distribution.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/surveys/admin/queries.ts::listPanelSurveys
 * @uses worker/admin/index.ts::requirePanelRole
 * @uses worker/surveys/admin/csv.ts::toResultsCsv
 * @used_by worker/surveys/admin/index.ts::surveysAdminApp
 * @used_by worker/surveys/admin/routes.test.ts::surveysAdminApp
 */

import { Hono } from 'hono';
// PL: Klient bazy D1 dla Drizzle.
// EN: The D1 client for Drizzle.
import { drizzle } from 'drizzle-orm/d1';
// PL: Sprawdzanie roli w panelu z drzwi modułu admin (podtor 8).
// EN: The panel role check from the admin module door (subtrack 8).
import { requirePanelRole, type PanelEnv } from '../../admin';
import { lastDayOf, warsawToday } from './dates';
import { toResultsCsv } from './csv';
import { findResults, insertSurvey, listPanelSurveys } from './queries';
import { parseNewSurvey } from './validation';

/**
 * PL: Router podtoru 5b. Sprawdzanie roli jest w jednej linii (`use`): bez sesji 401, bez roli Samorządu 403.
 * EN: The router of subtrack 5b. The role check is in one line (`use`): no session gives 401, no Student Council role gives 403.
 */
export const surveysAdminApp = new Hono<PanelEnv>()
  .use(requirePanelRole('council'))

  // PL: GET / – lista ankiet: trwające i zakończone, z liczbą odpowiedzi.
  // EN: GET / – the survey list: running and ended, with the response count.
  .get('/', async (context) => context.json(await listPanelSurveys(drizzle(context.env.DB), warsawToday(new Date()))))

  // PL: POST / – utworzenie ankiety. Ostatni dzień liczy serwer od dnia publikacji, telefon podaje tylko liczbę dni.
  // EN: POST / – creating a survey. The server counts the last day from the publication day, the phone gives only the number of days.
  .post('/', async (context) => {
    const survey = parseNewSurvey(await context.req.json().catch(() => null));
    if (survey === null) return context.json({ error: 'invalid_survey' }, 400);
    const endsOn = lastDayOf(warsawToday(new Date()), survey.durationDays);
    return context.json({ id: await insertSurvey(drizzle(context.env.DB), survey, endsOn) }, 201);
  })

  // PL: GET /:surveyId/results – wyniki ankiety, od 5 odpowiedzi z rozkładem głosów.
  // EN: GET /:surveyId/results – the survey results, with the vote distribution from 5 responses.
  .get('/:surveyId/results', async (context) => {
    const results = await findResults(drizzle(context.env.DB), context.req.param('surveyId'));
    return results === null ? context.json({ error: 'not_found' }, 404) : context.json(results);
  })

  // PL: GET /:surveyId/results/csv – wyniki jako plik CSV. Plik powstaje tylko od progu odpowiedzi: poniżej progu nie ma rozkładu, więc nie ma czego zapisać (409).
  // EN: GET /:surveyId/results/csv – the results as a CSV file. The file is made only from the response threshold: below it there is no distribution, so there is nothing to write (409).
  .get('/:surveyId/results/csv', async (context) => {
    const results = await findResults(drizzle(context.env.DB), context.req.param('surveyId'));
    if (results === null) return context.json({ error: 'not_found' }, 404);
    if (results.questions === undefined) return context.json({ error: 'too_few_responses' }, 409);
    // PL: Nazwa pliku z numeru ankiety (UUID, same bezpieczne znaki), nie z tytułu, więc nagłówek nie wymaga kodowania polskich liter.
    // EN: The file name from the survey id (a UUID, only safe characters), not from the title, so the header needs no encoding of Polish letters.
    return context.body(toResultsCsv(results.questions), 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ankieta-${results.id}-wyniki.csv"`,
    });
  });
