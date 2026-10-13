/**
 * PL: Router Hono podtoru 4b (zgłoszenia w panelu). Trzy adresy pod /api/reports/admin: GET / oddaje listę zgłoszeń, GET /:id oddaje zgłoszenie z historią etapów, PATCH /:id zmienia etap. Żaden adres nie oddaje numeru autora. Router jest podpięty w worker/mounts.ts.
 * EN: The Hono router of subtrack 4b (reports in the panel). Three routes under /api/reports/admin: GET / returns the report list, GET /:id returns a report with its stage history, PATCH /:id changes the stage. No route returns the author id. The router is mounted in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/reports/admin/reportsAdminRepository.ts::listReports
 * @uses worker/reports/admin/reportsAdminRepository.ts::getReport
 * @uses worker/reports/admin/reportsAdminRepository.ts::changeReportStage
 * @uses worker/admin/index.ts::requirePanelRole
 * @used_by worker/reports/admin/index.ts::reportsAdminApp
 * @used_by worker/reports/admin/routes.test.ts::reportsAdminApp
 */

// PL: Hono to router serwera. bodyLimit odrzuca zbyt duże zapytania, zanim je odczytamy.
// EN: Hono is the server router. bodyLimit rejects oversized requests before we read them.
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
// PL: Sprawdzanie roli w panelu (401 bez sesji, 403 bez roli), przez drzwi modułu admin (worker/admin/index.ts).
// EN: The panel role check (401 without a session, 403 without a role), through the door of the admin module (worker/admin/index.ts).
import { requirePanelRole, type PanelEnv } from '../../admin';
// PL: Etapy zgłoszenia ze schematu.
// EN: The report stages from the schema.
import { REPORT_STAGES, type ReportStage } from '../../db/schema/reports';
// PL: Odczyt zgłoszeń i zmiana etapu.
// EN: Reading reports and changing the stage.
import { changeReportStage, getReport, listReports } from './reportsAdminRepository';

/**
 * PL: Najwięcej bajtów, jakie przyjmuje zapytanie o zmianę etapu. Treść to jedno krótkie pole, więc 1 KB to duży zapas.
 * EN: The most bytes a stage-change request may have. The body is one short field, so 1 KB is a large margin.
 */
const MAX_BODY_BYTES = 1024;

/**
 * PL: Sprawdza, czy wartość jest etapem zgłoszenia.
 * EN: Checks whether a value is a report stage.
 *
 * @param value - PL: wartość z treści zapytania. EN: the value from the request body.
 * @returns PL: prawda, gdy to znany etap. EN: true when it is a known stage.
 */
function isReportStage(value: unknown): value is ReportStage {
  // PL: Porównaj ze stałą listą etapów ze schematu.
  // EN: Compare with the constant list of stages from the schema.
  return REPORT_STAGES.some((stage) => stage === value);
}

/**
 * PL: Router podtoru 4b. Jedna linia `use(...)` stawia przed wszystkimi adresami sprawdzanie roli: bez sesji 401, bez roli Samorządu (albo administratora) 403. Bazę D1 router bierze z `context.env.DB`, a numer osoby z Samorządu z sesji.
 * EN: The 4b router. A single `use(...)` line puts the role check in front of all routes: 401 without a session, 403 without the Council (or administrator) role. The router takes the D1 database from `context.env.DB` and the Council member's id from the session.
 */
export const reportsAdminApp = new Hono<PanelEnv>().use(requirePanelRole('council'));

// PL: GET / oddaje wszystkie zgłoszenia od najnowszego. Filtr po etapie robi telefon.
// EN: GET / returns all reports, newest first. The phone does the stage filter.
reportsAdminApp.get('/', async (context) => {
  // PL: Odczytaj wszystkie zgłoszenia; zapytanie nie wybiera autora.
  // EN: Read all reports; the query does not select the author.
  return context.json({ reports: await listReports(context.env.DB) });
});

// PL: GET /:id oddaje zgłoszenie z historią albo 404.
// EN: GET /:id returns the report with its history, or 404.
reportsAdminApp.get('/:id', async (context) => {
  // PL: Odczytaj zgłoszenie z historią; brak zgłoszenia to 404.
  // EN: Read the report with its history; a missing report is 404.
  const found = await getReport(context.env.DB, context.req.param('id'));
  return found ? context.json(found) : context.json({ error: 'not_found' }, 404);
});

// PL: PATCH /:id zmienia etap. Zwraca zgłoszenie z historią, 400 przy złym etapie albo 404.
// EN: PATCH /:id changes the stage. Returns the report with its history, 400 for a bad stage, or 404.
reportsAdminApp.patch('/:id', bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (context) => context.json({ error: 'payload_too_large' }, 413) }), async (context) => {
  // PL: Odczytaj JSON i sprawdź etap. Zepsuty JSON to błąd telefonu (400).
  // EN: Read the JSON and check the stage. Broken JSON is the phone's error (400).
  const body = (await context.req.json().catch(() => undefined)) as { stage?: unknown } | undefined;
  if (!isReportStage(body?.stage)) return context.json({ error: 'invalid_stage' }, 400);

  // PL: Zmień etap jako osoba z sesji, a nie ta z treści zapytania.
  // EN: Change the stage as the person from the session, not the one from the request body.
  const id = context.req.param('id');
  const result = await changeReportStage(context.env.DB, { id, stage: body.stage, memberId: context.get('student').id });
  if (result === 'not_found') return context.json({ error: 'not_found' }, 404);

  // PL: Oddaj aktualny stan zgłoszenia, żeby telefon pokazał historię bez drugiego zapytania.
  // EN: Return the current state of the report, so the phone shows the history without a second request.
  return context.json(await getReport(context.env.DB, id));
});
