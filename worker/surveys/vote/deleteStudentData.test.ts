/**
 * PL: Test funkcji deleteSurveysStudentData. Sprawdza, że wywołanie kończy się bez błędu i niczego nie zwraca. Gdy podtor 5a doda kasowanie, rozbudowuje ten test o sprawdzenie, że dane ucznia znikają, a cudze zostają.
 * EN: Test of the deleteSurveysStudentData function. Checks that the call finishes without an error and returns nothing. When subtrack 5a adds the deletion, it extends this test to check that the student's data goes away and other people's data stays.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/surveys/vote/deleteStudentData.ts::deleteSurveysStudentData
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (binding DB, tabele ze schematu).
// EN: The Worker test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { deleteSurveysStudentData } from './deleteStudentData';

// PL: Grupa testów kasowania danych ucznia z modułu surveys.
// EN: A group of tests for deleting the student's data from the surveys module.
describe('deleteSurveysStudentData', () => {
  // PL: Jedyny przypadek na dziś: funkcja nic nie robi i się nie psuje.
  // EN: The only case for now: the function does nothing and does not break.
  it('kończy się bez błędu / finishes without an error', async () => {
    // PL: Wywołaj funkcję dla wymyślonego ucznia i bazy testowej, poczekaj na koniec.
    // EN: Call the function for an invented student and the test database, wait for it to finish.
    const result = await deleteSurveysStudentData({ userId: 'test-user', db: env.DB });

    // PL: Funkcja niczego nie zwraca.
    // EN: The function returns nothing.
    expect(result).toBeUndefined();
  });
});
