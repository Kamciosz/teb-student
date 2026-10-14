/**
 * PL: Router Hono podtoru 4a (zgłoszenie ucznia). Cztery adresy pod /api/reports/student: POST zapisuje nowe zgłoszenie, GET oddaje zgłoszenia ucznia („Moje zgłoszenia”), GET /similar oddaje podobne otwarte zgłoszenia („Mnie też”), POST /:id/join dołącza ucznia do zgłoszenia. Router jest podpięty w worker/mounts.ts.
 * EN: The Hono router of subtrack 4a (student report). Four routes under /api/reports/student: POST saves a new report, GET returns the student's reports ("Moje zgłoszenia"), GET /similar returns similar open reports ("Mnie też"), POST /:id/join joins the student to a report. The router is mounted in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/reports/student/validation.ts::parseReportInput
 * @uses worker/reports/student/validation.ts::isOneOf
 * @uses worker/reports/student/reportsRepository.ts::createReport
 * @uses worker/reports/student/checkReportPhoto.ts::checkReportPhoto
 * @uses worker/reports/student/reportsRepository.ts::listReportsByAuthor
 * @uses worker/reports/student/similarReports.ts::listSimilarReports
 * @uses worker/reports/student/joinReport.ts::joinReport
 * @uses worker/db/schema/reports.ts::REPORT_CATEGORIES
 * @uses worker/db/schema/reports.ts::REPORT_PLACES
 * @uses worker/auth/index.ts::requireStudent
 * @used_by worker/reports/student/index.ts::reportsStudentApp
 * @used_by worker/reports/student/routes.test.ts::reportsStudentApp
 */

// PL: Hono to router serwera. bodyLimit odrzuca zbyt duże zapytania, zanim je odczytamy.
// EN: Hono is the server router. bodyLimit rejects oversized requests before we read them.
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
// PL: Sprawdzanie sesji ucznia, przez drzwi modułu auth (worker/auth/index.ts).
// EN: The student session check, through the door of the auth module (worker/auth/index.ts).
import { requireStudent, type StudentEnv } from '../../auth';
// PL: Zapis i odczyt zgłoszeń.
// EN: Saving and reading reports.
import { createReport, listReportsByAuthor } from './reportsRepository';
// PL: Sprawdzenie, czy zdjęcie w zgłoszeniu jest plikiem tego ucznia.
// EN: The check that the photo in the report is a file of this student.
import { checkReportPhoto } from './checkReportPhoto';
// PL: Sprawdzanie danych z telefonu.
// EN: Checking the data from the phone.
import { isOneOf, parseReportInput } from './validation';
// PL: Lista podobnych zgłoszeń i dołączenie „Mnie też”.
// EN: The list of similar reports and the "Me too" join.
import { listSimilarReports } from './similarReports';
import { joinReport } from './joinReport';
// PL: Dozwolone kody kategorii i miejsca do sprawdzenia zapytania.
// EN: The allowed category and place codes for checking the query.
import { REPORT_CATEGORIES, REPORT_PLACES } from '../../db/schema/reports';

/**
 * PL: Najwięcej bajtów, jakie przyjmuje zapytanie o nowe zgłoszenie. Opis ma najwyżej 500 znaków, więc 8 KB to duży zapas.
 * EN: The most bytes a new-report request may have. The description has at most 500 characters, so 8 KB is a large margin.
 */
const MAX_BODY_BYTES = 8 * 1024;

/**
 * PL: Router podtoru 4a. Wymaga zalogowanego ucznia (bez sesji odpowiada 401), numer ucznia bierze z sesji, a bazę D1 z `context.env.DB`.
 * EN: The router of subtrack 4a. It requires a signed-in student (without a session it answers 401), takes the student id from the session and the D1 database from `context.env.DB`.
 */
export const reportsStudentApp = new Hono<StudentEnv>().use(requireStudent);

// PL: POST / zapisuje nowe zgłoszenie. Zwraca 201 z numerem albo 400 przy złych danych.
// EN: POST / saves a new report. Returns 201 with the id or 400 for bad data.
reportsStudentApp.post('/', bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (context) => context.json({ error: 'payload_too_large' }, 413) }), async (context) => {
  // PL: Odczytaj JSON. Zepsuty JSON to błąd telefonu (400), a nie serwera.
  // EN: Read the JSON. Broken JSON is the phone's error (400), not the server's.
  const body: unknown = await context.req.json().catch(() => undefined);

  // PL: Sprawdź dane. Telefon dostaje nazwy złych pól, żeby pokazać błąd przy właściwym polu.
  // EN: Validate the data. The phone gets the names of the bad fields, to show the error at the right field.
  const parsed = parseReportInput(body);
  if (!parsed.ok) return context.json({ error: 'invalid_report', fields: parsed.fields }, 400);

  // PL: Numer ucznia bierzemy z sesji, a nie z treści zapytania.
  // EN: The student id comes from the session, not from the request body.
  const studentId = context.get('student').id;

  // PL: Zdjęcie, jeśli jest, musi być plikiem tego ucznia. Sprawdzamy przed zapisem.
  // EN: The photo, if any, must be a file of this student. We check it before saving.
  const photoProblem = await checkReportPhoto(context.env.DB, studentId, parsed.value.photoId);
  if (photoProblem) return context.json({ error: photoProblem.error }, photoProblem.status);

  // PL: Zapisz zgłoszenie dla ucznia z sesji.
  // EN: Save the report for the student from the session.
  const id = await createReport(context.env.DB, studentId, parsed.value);
  return context.json({ id }, 201);
});

// PL: GET / oddaje zgłoszenia ucznia od najnowszego.
// EN: GET / returns the student's reports, newest first.
reportsStudentApp.get('/', async (context) => {
  // PL: Odczytaj tylko zgłoszenia tego ucznia.
  // EN: Read only this student's reports.
  const items = await listReportsByAuthor(context.env.DB, context.get('student').id);
  return context.json({ reports: items });
});

// PL: GET /similar oddaje otwarte zgłoszenia tej samej kategorii i miejsca. Brak albo zły kod to błąd zapytania (400).
// EN: GET /similar returns open reports of the same category and place. A missing or bad code is a bad query (400).
reportsStudentApp.get('/similar', async (context) => {
  // PL: Sprawdź kody z adresu, zanim zapytamy bazę.
  // EN: Check the codes from the address before querying the database.
  const category = context.req.query('category');
  const place = context.req.query('place');
  if (!isOneOf(category, REPORT_CATEGORIES) || !isOneOf(place, REPORT_PLACES)) return context.json({ error: 'invalid_query' }, 400);

  // PL: Szukaj dla ucznia z sesji; odpowiedź nie zawiera numerów autorów ani dołączających.
  // EN: Search for the student from the session; the answer has no author ids or joining students.
  const items = await listSimilarReports(context.env.DB, context.get('student').id, { category, place });
  return context.json({ reports: items });
});

// PL: POST /:id/join dołącza ucznia do cudzego, otwartego zgłoszenia. Zwraca 404, gdy zgłoszenia nie ma lub jest załatwione, 409 dla własnego.
// EN: POST /:id/join joins the student to someone else's open report. Returns 404 when the report does not exist or is resolved, 409 for an own report.
reportsStudentApp.post('/:id/join', async (context) => {
  // PL: Numer zgłoszenia bierzemy z adresu, numer ucznia z sesji.
  // EN: The report id comes from the address, the student id from the session.
  const result = await joinReport(context.env.DB, context.get('student').id, context.req.param('id'));
  if (!result.ok) return context.json({ error: result.reason }, result.reason === 'not_found' ? 404 : 409);
  return context.json({ joinCount: result.joinCount, joinedByMe: true });
});
