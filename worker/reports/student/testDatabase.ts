/**
 * PL: Pomocnik testów serwera 4a: czyści tabele zgłoszeń w bazie testowej D1 i wpisuje dane testowe z REPORTS_SEED i REPORT_STAGE_CHANGES_SEED. Same tabele zakłada wspólna konfiguracja testów (worker/shared/testSetup.ts) ze schematu.
 * EN: A helper for the 4a server tests: empties the report tables in the D1 test database and inserts the test data from REPORTS_SEED and REPORT_STAGE_CHANGES_SEED. The tables themselves are created by the shared test setup (worker/shared/testSetup.ts) from the schema.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/seed/reports.ts::REPORTS_SEED
 * @used_by worker/reports/student/routes.test.ts::resetDatabase
 * @used_by worker/reports/student/deleteStudentData.test.ts::resetDatabase
 */

// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Środowisko testowe Workera z bazą.
// EN: The Worker test environment with the database.
import { env } from 'cloudflare:workers';
// PL: Tabele i zestawy danych testowych.
// EN: The tables and the test data sets.
import { reports, reportStageChanges } from '../../db/schema/reports';
import { REPORTS_SEED, REPORT_STAGE_CHANGES_SEED, SEED_STUDENT_ID } from '../../db/seed/reports';

/**
 * PL: Przygotowuje czystą bazę: czyści tabele zgłoszeń i wpisuje dane testowe.
 * EN: Prepares a clean database: empties the report tables and inserts the test data.
 *
 * @param studentId - PL: numer ucznia, któremu przypisujemy zgłoszenia „własne” z danych testowych (domyślnie uczeń z seedu). EN: the id of the student to assign the "own" test reports to (the seed student by default).
 * @returns PL: baza D1 gotowa do testu. EN: the D1 database ready for a test.
 */
export async function resetDatabase(studentId: string = SEED_STUDENT_ID): Promise<D1Database> {
  // PL: Wyczyść dane z poprzedniego testu. Historia ma klucz obcy, więc ginie razem ze zgłoszeniami.
  // EN: Clear the data of the previous test. The history has a foreign key, so it goes away with the reports.
  const db = drizzle(env.DB);
  await db.delete(reportStageChanges);
  await db.delete(reports);

  // PL: Wpisz dane: najpierw zgłoszenia, potem historia. Zgłoszenia ucznia z seedu przejmuje podany uczeń (zalogowany w teście); cudze zostają.
  // EN: Insert the data: the reports first, then the history. The seed student's reports go to the given student (signed in the test); foreign ones stay.
  const rows = REPORTS_SEED.map((row) => (row.authorId === SEED_STUDENT_ID ? { ...row, authorId: studentId } : row));
  await db.insert(reports).values(rows);
  await db.insert(reportStageChanges).values(REPORT_STAGE_CHANGES_SEED);
  return env.DB;
}
