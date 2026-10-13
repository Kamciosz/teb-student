/**
 * PL: Test eksportu zgłoszeń jednego ucznia (listReportsByAuthor) wywoływanego przez drzwi modułu worker/reports/index.ts. Sprawdza, że wynik ma tylko zgłoszenia tego ucznia, od najnowszego, z dokładnie wybranymi polami (bez numeru autora), a uczeń bez zgłoszeń dostaje pustą listę. Działa na prawdziwej bazie D1 testów.
 * EN: Test of the export of one student's reports (listReportsByAuthor) called through the module door worker/reports/index.ts. Checks that the result holds only this student's reports, newest first, with exactly the chosen fields (no author id), and that a student without reports gets an empty list. It runs on the real test D1 database.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/reports/index.ts::listReportsByAuthor
 * @uses worker/reports/student/testDatabase.ts::resetDatabase
 * @uses worker/db/seed/reports.ts::REPORTS_SEED
 * @uses worker/db/seed/reports.ts::OTHER_STUDENT_ID
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy, importowana z drzwi modułu reports.
// EN: The function under test, imported from the door of the reports module.
import { listReportsByAuthor } from './index';
// PL: Dane testowe i numery uczniów z seedu.
// EN: The test data and the student ids from the seed.
import { OTHER_STUDENT_ID, REPORTS_SEED, SEED_STUDENT_ID } from '../db/seed/reports';
// PL: Czyszczenie bazy przed każdym testem.
// EN: Cleaning the database before every test.
import { resetDatabase } from './student/testDatabase';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;

// PL: Przed każdym testem wracamy do czystych danych testowych.
// EN: Before every test we go back to clean test data.
beforeEach(async () => {
  db = await resetDatabase();
});

// PL: Grupa testów eksportu zgłoszeń ucznia.
// EN: A group of tests of the export of a student's reports.
describe('listReportsByAuthor', () => {
  // PL: Wynik ma tylko zgłoszenia ucznia, bez cudzego, od najnowszego.
  // EN: The result has only the student's reports, without the other one, newest first.
  it('zwraca tylko zgłoszenia ucznia, od najnowszego / returns only the student\'s reports, newest first', async () => {
    const items = await listReportsByAuthor(db, SEED_STUDENT_ID);

    expect(items.map((item) => item.id)).toEqual(['seed-projektor', 'seed-okno']);
    expect(items.map((item) => item.id)).not.toContain('seed-cudze');
  });

  // PL: Każde zgłoszenie ma dokładnie pola dla telefonu ucznia, bez numeru autora i z datami w milisekundach.
  // EN: Each report has exactly the fields for the student's phone, without the author id, and with dates in milliseconds.
  it('zwraca dokładnie pola dla ucznia, bez numeru autora / returns exactly the student fields, without the author id', async () => {
    const [first] = await listReportsByAuthor(db, SEED_STUDENT_ID);
    const seed = REPORTS_SEED.find((row) => row.id === 'seed-projektor');

    expect(Object.keys(first ?? {}).sort()).toEqual(
      ['category', 'createdAt', 'description', 'id', 'place', 'placeDetail', 'stage', 'updatedAt'],
    );
    expect(first).toEqual({
      id: 'seed-projektor',
      category: seed?.category,
      place: seed?.place,
      placeDetail: 'Sala 204',
      description: 'Nie działa projektor w sali 204',
      stage: 'in_progress',
      createdAt: Date.UTC(2026, 9, 6, 8, 0),
      updatedAt: Date.UTC(2026, 9, 7, 8, 0),
    });
  });

  // PL: Uczeń bez zgłoszeń dostaje pustą listę, a nie zgłoszenia innych.
  // EN: A student without reports gets an empty list, not other people's reports.
  it('zwraca pustą listę dla ucznia bez zgłoszeń / returns an empty list for a student without reports', async () => {
    expect(await listReportsByAuthor(db, 'uczen-bez-zgloszen')).toEqual([]);
    expect(await listReportsByAuthor(db, OTHER_STUDENT_ID)).toEqual([
      expect.objectContaining({ id: 'seed-cudze' }),
    ]);
  });
});
