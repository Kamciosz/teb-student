/**
 * PL: Test funkcji deleteSurveysStudentData. Bez wiązania bazy DB (zgłoszenie #41) funkcja rzuca błąd, żeby usuwanie konta się zatrzymało, a nie udawało sukces. Samo zapytanie kasujące, z warunkiem WHERE po numerze ucznia, sprawdza queries.test.ts.
 *     Gdy zgłoszenie #41 da testom bazę, ten test dostaje przypadek: ślad ucznia znika, a cudzy zostaje.
 * EN: Test of the deleteSurveysStudentData function. Without the DB binding (issue #41) the function throws, so the account deletion stops instead of pretending to succeed. The deleting query itself, with a WHERE condition on the student id, is checked by queries.test.ts.
 *     When issue #41 gives the tests a database, this test gets a case: the student's trace goes away and other people's stays.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/surveys/vote/deleteStudentData.ts::deleteSurveysStudentData
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { deleteSurveysStudentData } from './deleteStudentData';

// PL: Grupa testów kasowania danych ucznia z modułu surveys.
// EN: A group of tests for deleting the student's data from the surveys module.
describe('deleteSurveysStudentData', () => {
  // PL: Bez bazy nie da się skasować śladu, więc funkcja musi to zgłosić.
  // EN: Without a database the trace cannot be deleted, so the function must report it.
  it('rzuca błąd, gdy Worker nie ma bazy / throws when the Worker has no database', async () => {
    // PL: Wywołaj funkcję dla wymyślonego ucznia i oczekuj odrzucenia.
    // EN: Call the function for an invented student and expect a rejection.
    await expect(deleteSurveysStudentData({ userId: 'test-user' })).rejects.toThrow('DB');
  });
});
