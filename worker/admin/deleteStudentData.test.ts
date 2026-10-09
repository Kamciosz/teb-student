/**
 * PL: Test funkcji deleteAdminStudentData. Sprawdza, że wywołanie kończy się bez błędu i niczego nie zwraca. Gdy podtor 8 doda kasowanie, rozbudowuje ten test o sprawdzenie, że dane ucznia znikają, a cudze zostają.
 * EN: Test of the deleteAdminStudentData function. Checks that the call finishes without an error and returns nothing. When subtrack 8 adds the deletion, it extends this test to check that the student's data goes away and other people's data stays.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/admin/deleteStudentData.ts::deleteAdminStudentData
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { deleteAdminStudentData } from './deleteStudentData';

// PL: Grupa testów kasowania danych ucznia z modułu admin.
// EN: A group of tests for deleting the student's data from the admin module.
describe('deleteAdminStudentData', () => {
  // PL: Jedyny przypadek na dziś: funkcja nic nie robi i się nie psuje.
  // EN: The only case for now: the function does nothing and does not break.
  it('kończy się bez błędu / finishes without an error', async () => {
    // PL: Wywołaj funkcję dla wymyślonego ucznia i poczekaj na koniec.
    // EN: Call the function for an invented student and wait for it to finish.
    const result = await deleteAdminStudentData({ userId: 'test-user' });

    // PL: Funkcja niczego nie zwraca.
    // EN: The function returns nothing.
    expect(result).toBeUndefined();
  });
});
