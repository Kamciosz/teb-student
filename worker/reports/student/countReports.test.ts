/**
 * PL: Test funkcji countReports na prawdziwej bazie D1 testowego Workera. Sprawdza, że liczba obejmuje wszystkie zgłoszenia, także anonimowe, i rośnie o jeden po nowym zgłoszeniu.
 * EN: Test of the countReports function on a real D1 database of the test Worker. Checks that the number covers all reports, anonymous ones too, and grows by one after a new report.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/reports/index.ts::countReports
 * @uses worker/reports/student/reportsRepository.ts::createReport
 * @uses worker/reports/student/testDatabase.ts::resetDatabase
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy, importowana z drzwi modułu reports.
// EN: The function under test, imported from the door of the reports module.
import { countReports } from '../index';
// PL: Zapis nowego zgłoszenia i dane testowe.
// EN: Saving a new report and the test data.
import { createReport } from './reportsRepository';
import { REPORTS_SEED, SEED_STUDENT_ID } from '../../db/seed/reports';
import { resetDatabase } from './testDatabase';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;

// PL: Przed każdym testem wracamy do czystych danych testowych.
// EN: Before every test we go back to clean test data.
beforeEach(async () => {
  db = await resetDatabase();
});

// PL: Grupa testów liczby zgłoszeń.
// EN: A group of tests of the number of reports.
describe('liczba zgłoszeń / number of reports', () => {
  // PL: Liczba obejmuje wszystkie zgłoszenia z danych testowych, także anonimowe.
  // EN: The number covers all the test reports, anonymous ones too.
  it('liczy wszystkie zgłoszenia, także anonimowe / counts all reports, anonymous ones too', async () => {
    expect(await countReports(db)).toBe(REPORTS_SEED.length);
  });

  // PL: Nowe zgłoszenie anonimowe podbija liczbę dokładnie o jeden.
  // EN: A new anonymous report raises the number by exactly one.
  it('rośnie o jeden po nowym zgłoszeniu / grows by one after a new report', async () => {
    const before = await countReports(db);
    await createReport(db, SEED_STUDENT_ID, {
      category: 'room_equipment',
      place: 'classroom',
      placeDetail: null,
      description: 'Nie działa światło w sali',
      isAnonymous: true,
      photoId: null,
    });
    expect(await countReports(db)).toBe(before + 1);
  });
});
