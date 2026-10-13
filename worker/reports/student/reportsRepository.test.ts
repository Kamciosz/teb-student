/**
 * PL: Test odczytu zgłoszeń ucznia z historią etapów na prawdziwej bazie D1 z testowego Workera. Sprawdza kolejność historii, że odpowiedź Samorządu wraca uczniowi, że numer członka Samorządu nie wycieka, oraz że baza odrzuca odpowiedź dłuższą niż 500 znaków.
 * EN: Test of reading student reports with their stage history on a real D1 database of the test Worker. Checks the history order, that the Student Council answer reaches the student, that the Student Council member id does not leak, and that the database rejects an answer longer than 500 characters.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/reports/student/reportsRepository.ts::listReportsByAuthor
 * @uses worker/reports/student/testDatabase.ts::resetDatabase
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { listReportsByAuthor } from './reportsRepository';
// PL: Numer ucznia testowego i baza testowa.
// EN: The test student id and the test database.
import { SEED_STUDENT_ID } from '../../db/seed/reports';
import { resetDatabase } from './testDatabase';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;

// PL: Przed każdym testem wracamy do czystych danych testowych.
// EN: Before every test we go back to clean test data.
beforeEach(async () => {
  db = await resetDatabase();
});

// PL: Grupa testów odczytu zgłoszeń z historią.
// EN: A group of tests for reading reports with their history.
describe('listReportsByAuthor', () => {
  // PL: Historia idzie od najstarszego wpisu, a odpowiedź Samorządu trafia do ucznia.
  // EN: The history goes from the oldest entry, and the Student Council answer reaches the student.
  it('oddaje historię od najstarszego wpisu z odpowiedzią / returns the history from the oldest entry with the answer', async () => {
    // PL: Pobierz zgłoszenia ucznia testowego.
    // EN: Get the test student's reports.
    const reports = await listReportsByAuthor(db, SEED_STUDENT_ID);

    // PL: Zgłoszenie „okno” ma trzy etapy; ostatni ma odpowiedź z seedów.
    // EN: The "okno" report has three stages; the last one has the answer from the seeds.
    const okno = reports.find((report) => report.id === 'seed-okno');
    expect(okno?.history).toEqual([
      { stage: 'received', note: null, changedAt: Date.UTC(2026, 8, 29, 8, 0) },
      { stage: 'in_progress', note: null, changedAt: Date.UTC(2026, 8, 30, 8, 0) },
      { stage: 'resolved', note: 'Okno wymienione, domyka się bez problemu.', changedAt: Date.UTC(2026, 9, 2, 8, 0) },
    ]);
  });

  // PL: W historii nie ma numeru członka Samorządu ani autora, tylko etap, odpowiedź i chwila.
  // EN: The history has no Student Council member id and no author, only the stage, the answer and the time.
  it('nie oddaje numeru członka Samorządu w historii / does not return the Student Council member id in the history', async () => {
    // PL: Pobierz zgłoszenia ucznia testowego.
    // EN: Get the test student's reports.
    const reports = await listReportsByAuthor(db, SEED_STUDENT_ID);

    // PL: Każdy wpis historii ma dokładnie trzy pola, bez numeru członka.
    // EN: Every history entry has exactly three fields, without the member id.
    for (const report of reports) {
      for (const entry of report.history) {
        expect(Object.keys(entry).sort()).toEqual(['changedAt', 'note', 'stage']);
      }
    }
  });

  // PL: Uczeń bez zgłoszeń dostaje pustą listę bez błędu.
  // EN: A student without reports gets an empty list without an error.
  it('zwraca pustą listę dla ucznia bez zgłoszeń / returns an empty list for a student without reports', async () => {
    // PL: Pobierz zgłoszenia nieznanego ucznia.
    // EN: Get the reports of an unknown student.
    await expect(listReportsByAuthor(db, 'nikt')).resolves.toEqual([]);
  });

  // PL: Baza odrzuca odpowiedź dłuższą niż 500 znaków, a przyjmuje dokładnie 500.
  // EN: The database rejects an answer longer than 500 characters, and accepts exactly 500.
  it('odrzuca odpowiedź dłuższą niż 500 znaków, a przyjmuje 500 / rejects an answer over 500 characters and accepts 500', async () => {
    // PL: Wstawienie 501 znaków musi się nie udać.
    // EN: Inserting 501 characters must fail.
    await expect(
      db.prepare("INSERT INTO report_stage_changes (id, report_id, stage, note, changed_at) VALUES ('test-za-dluga', 'seed-okno', 'resolved', ?, 3)")
        .bind('a'.repeat(501))
        .run(),
    ).rejects.toThrow();

    // PL: Wstawienie 500 znaków musi się udać.
    // EN: Inserting 500 characters must succeed.
    await expect(
      db.prepare("INSERT INTO report_stage_changes (id, report_id, stage, note, changed_at) VALUES ('test-granica', 'seed-okno', 'resolved', ?, 3)")
        .bind('a'.repeat(500))
        .run(),
    ).resolves.toBeDefined();
  });
});
