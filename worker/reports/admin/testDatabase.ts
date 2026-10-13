/**
 * PL: Pomocnik testów serwera 4b: czyści tabele zgłoszeń i ról w bazie testowej D1, wpisuje dane testowe z REPORTS_SEED i REPORT_STAGE_CHANGES_SEED (plik podtoru 4a, tylko import) i nadaje wskazaną rolę zalogowanemu uczniowi. Tabele zakłada wspólna konfiguracja testów (worker/shared/testSetup.ts).
 * EN: A helper for the 4b server tests: empties the report and role tables in the D1 test database, inserts the test data from REPORTS_SEED and REPORT_STAGE_CHANGES_SEED (a 4a file, import only) and grants the given role to the signed-in student. The tables are created by the shared test setup (worker/shared/testSetup.ts).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/db/seed/reports.ts::REPORTS_SEED
 * @uses worker/db/schema/admin.ts::panelRoles
 * @used_by worker/reports/admin/routes.test.ts::resetDatabase
 */

// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Środowisko testowe Workera z bazą.
// EN: The Worker test environment with the database.
import { env } from 'cloudflare:workers';
// PL: Tabela ról w panelu i typ roli. Test nadaje rolę wprost w bazie, bo drzwi modułu admin nie mają funkcji nadającej role.
// EN: The panel roles table and the role type. The test grants the role directly in the database, because the admin module door has no function that grants roles.
import { panelRoles, type PanelRole } from '../../db/schema/admin';
// PL: Tabele i zestawy danych testowych.
// EN: The tables and the test data sets.
import { reports, reportStageChanges } from '../../db/schema/reports';
import { REPORTS_SEED, REPORT_STAGE_CHANGES_SEED, SEED_STUDENT_ID } from '../../db/seed/reports';

/**
 * PL: Przygotowuje czystą bazę: czyści tabele i wpisuje dane testowe. Zgłoszenia ucznia z seedu (dwa anonimowe) dostają numer zalogowanego ucznia, żeby test mógł szukać tego numeru w odpowiedzi.
 * EN: Prepares a clean database: empties the tables and inserts the test data. The seed student's reports (two anonymous ones) get the signed-in student's id, so a test can look for that id in the response.
 *
 * @param authorId - PL: numer ucznia, któremu przypisujemy zgłoszenia z seedu i rolę. EN: the id of the student to assign the seed reports and the role to.
 * @param role - PL: rola w panelu dla tego ucznia albo null (uczeń bez roli). EN: the panel role for this student or null (a student without a role).
 * @returns PL: baza D1 gotowa do testu. EN: the D1 database ready for a test.
 */
export async function resetDatabase(authorId: string, role: PanelRole | null): Promise<D1Database> {
  // PL: Wyczyść dane z poprzedniego testu. Historia ma klucz obcy, więc ginie razem ze zgłoszeniami.
  // EN: Clear the data of the previous test. The history has a foreign key, so it goes away with the reports.
  const db = drizzle(env.DB);
  await db.delete(reportStageChanges);
  await db.delete(reports);
  await db.delete(panelRoles);

  // PL: Wpisz zgłoszenia, potem historię.
  // EN: Insert the reports, then the history.
  await db.insert(reports).values(REPORTS_SEED.map((row) => (row.authorId === SEED_STUDENT_ID ? { ...row, authorId } : row)));
  await db.insert(reportStageChanges).values(REPORT_STAGE_CHANGES_SEED);

  // PL: Nadaj uczniowi rolę, o ile ma ją mieć. Bez roli tabela zostaje pusta.
  // EN: Grant the student the role, if they are to have one. Without a role the table stays empty.
  if (role !== null) await db.insert(panelRoles).values({ userId: authorId, role, grantedAt: Date.now() });
  return env.DB;
}
