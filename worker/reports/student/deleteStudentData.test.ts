/**
 * PL: Test funkcji deleteReportsStudentData na prawdziwej bazie D1 z testowego Workera. Sprawdza, że zgłoszenia ucznia zostają bez autora, a cudze nie są ruszone.
 * EN: Test of the deleteReportsStudentData function on a real D1 database of the test Worker. Checks that the student's reports stay without an author and other people's reports are untouched.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/reports/student/deleteStudentData.ts::deleteReportsStudentData
 * @uses worker/reports/student/testDatabase.ts::resetDatabase
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { deleteReportsStudentData } from './deleteStudentData';
// PL: Numer ucznia testowego i baza testowa.
// EN: The test student id and the test database.
import { TEMPORARY_STUDENT_ID } from './currentStudent';
import { resetDatabase } from './testDatabase';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;

// PL: Przed każdym testem wracamy do czystych danych testowych.
// EN: Before every test we go back to clean test data.
beforeEach(async () => {
  db = await resetDatabase();
});

// PL: Grupa testów kasowania danych ucznia z modułu reports.
// EN: A group of tests for deleting the student's data from the reports module.
describe('deleteReportsStudentData', () => {
  // PL: Zgłoszenia ucznia zostają, ale bez autora; cudze bez zmian.
  // EN: The student's reports stay, but without an author; other people's are unchanged.
  it('zeruje autora zgłoszeń ucznia i nie rusza cudzych / clears the author of the student reports and leaves others', async () => {
    // PL: Usuń dane ucznia testowego i zignoruj wynik, bo funkcja nic nie zwraca.
    // EN: Delete the test student's data and ignore the result, because the function returns nothing.
    const result = await deleteReportsStudentData({ userId: TEMPORARY_STUDENT_ID, db });

    // PL: Odczytaj autorów wszystkich zgłoszeń.
    // EN: Read the authors of all reports.
    const rows = await db.prepare('SELECT id, author_id FROM reports ORDER BY id').all();

    // PL: Zgłoszenia ucznia mają null, cudze dalej mają autora, a nic nie zniknęło.
    // EN: The student's reports have null, the foreign one still has its author, and nothing disappeared.
    expect(result).toBeUndefined();
    expect(rows.results).toEqual([
      { id: 'seed-cudze', author_id: 'inny-uczen' },
      { id: 'seed-okno', author_id: null },
      { id: 'seed-projektor', author_id: null },
    ]);
  });

  // PL: Uczeń bez zgłoszeń to nie błąd.
  // EN: A student without reports is not an error.
  it('nie psuje się dla ucznia bez zgłoszeń / does not fail for a student without reports', async () => {
    // PL: Usuń dane nieznanego ucznia.
    // EN: Delete the data of an unknown student.
    await expect(deleteReportsStudentData({ userId: 'nikt', db })).resolves.toBeUndefined();
  });
});
