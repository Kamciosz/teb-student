/**
 * PL: Router Hono podtoru 4b (zgłoszenia w panelu). Trzy adresy pod /api/reports/admin: GET / oddaje listę zgłoszeń, GET /:id oddaje zgłoszenie z historią etapów (z odpowiedziami dla autora, jeśli były) i, przy zgłoszeniu nieanonimowym, imię i klasę autora, PATCH /:id zmienia etap. Żaden adres nie oddaje numeru autora. Router jest podpięty w worker/mounts.ts.
 * EN: The Hono router of subtrack 4b (reports in the panel). Three routes under /api/reports/admin: GET / returns the report list, GET /:id returns a report with its stage history and, for a signed report, the author's name and class, PATCH /:id changes the stage. No route returns the author id. The router is mounted in worker/mounts.ts.
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
// PL: Etapy zgłoszenia i najwyższy limit odpowiedzi ze schematu.
// EN: The report stages and the answer length limit from the schema.
import { MAX_STAGE_NOTE_LENGTH, REPORT_STAGES, type ReportStage } from '../../db/schema/reports';
// PL: Odczyt zgłoszeń i zmiana etapu.
// EN: Reading reports and changing the stage.
import { changeReportStage, getReport, listReports } from './reportsAdminRepository';

/**
 * PL: Najwięcej bajtów, jakie przyjmuje zapytanie o zmianę etapu. Odpowiedź ma do 500 znaków, a polskie litery to po dwa bajty w UTF-8, więc 500 znaków to około 1000 bajtów. Dlatego limit to 4 KB, a nie 1 KB.
 * EN: The most bytes a stage-change request may have. The answer has up to 500 characters, and Polish letters take two bytes in UTF-8, so 500 characters are about 1000 bytes. That is why the limit is 4 KB, not 1 KB.
 */
const MAX_BODY_BYTES = 4096;

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
 * PL: Sprawdza odpowiedź dla autora z treści zapytania. Brak pola albo `null` to brak odpowiedzi. Tekst jest przycięty z obu stron, a pusty po przycięciu to też brak odpowiedzi. Za długa odpowiedź albo wartość, która nie jest tekstem, to `'invalid'`.
 * EN: Checks the answer for the author from the request body. A missing field or `null` means no answer. The text is trimmed on both ends, and an empty text after trimming is also no answer. A too long answer, or a value that is not text, is `'invalid'`.
 *
 * @param value - PL: wartość pola `note` z treści zapytania. EN: the value of the `note` field from the request body.
 * @returns PL: przycięta odpowiedź, `null` albo `'invalid'`. EN: the trimmed answer, `null`, or `'invalid'`.
 */
function parseNote(value: unknown): string | null | 'invalid' {
  // PL: Brak pola i `null` znaczą to samo: nie ma odpowiedzi.
  // EN: A missing field and `null` mean the same: there is no answer.
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return 'invalid';

  // PL: Długość liczymy w znakach (punktach kodowych), tak jak baza w `length(note)`, a nie w jednostkach UTF-16.
  // EN: The length is counted in characters (code points), as the database does in `length(note)`, not in UTF-16 units.
  const trimmed = value.trim();
  if (trimmed === '') return null;
  return Array.from(trimmed).length > MAX_STAGE_NOTE_LENGTH ? 'invalid' : trimmed;
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

// PL: PATCH /:id zmienia etap i zapisuje odpowiedź dla autora (opcjonalną). Zwraca zgłoszenie z historią, 400 przy złym etapie albo złej odpowiedzi, 404 albo 413.
// EN: PATCH /:id changes the stage and saves the answer for the author (optional). Returns the report with its history, 400 for a bad stage or a bad answer, 404, or 413.
reportsAdminApp.patch('/:id', bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (context) => context.json({ error: 'payload_too_large' }, 413) }), async (context) => {
  // PL: Odczytaj JSON i sprawdź etap i odpowiedź. Zepsuty JSON to błąd telefonu (400).
  // EN: Read the JSON and check the stage and the answer. Broken JSON is the phone's error (400).
  const body = (await context.req.json().catch(() => undefined)) as { stage?: unknown; note?: unknown } | undefined;
  if (!isReportStage(body?.stage)) return context.json({ error: 'invalid_stage' }, 400);
  const note = parseNote(body?.note);
  if (note === 'invalid') return context.json({ error: 'invalid_note' }, 400);

  // PL: Zmień etap jako osoba z sesji, a nie ta z treści zapytania.
  // EN: Change the stage as the person from the session, not the one from the request body.
  const id = context.req.param('id');
  // PL: Zmiana etapu i wpis w dzienniku (tylko przy realnej zmianie) idą w jednym batchu w repozytorium.
  // EN: The stage change and the diary entry (only for a real change) go in one batch in the repository.
  const result = await changeReportStage(context.env.DB, { id, stage: body.stage, note, memberId: context.get('student').id });
  if (result === 'not_found') return context.json({ error: 'not_found' }, 404);

  // PL: Oddaj aktualny stan zgłoszenia, żeby telefon pokazał historię bez drugiego zapytania.
  // EN: Return the current state of the report, so the phone shows the history without a second request.
  return context.json(await getReport(context.env.DB, id));
});
