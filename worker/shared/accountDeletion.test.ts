/**
 * PL: Test listy funkcji kasujących dane ucznia. Sprawdza, że lista ma wpis dla każdego modułu z danymi ucznia. Nie wywołuje funkcji: każdy moduł ma obok własny test swojej funkcji, a ten test nie może się zepsuć, gdy któryś moduł zacznie naprawdę kasować dane.
 * EN: Test of the list of functions that delete student data. Checks that the list has an entry for every module with student data. It does not call the functions: every module has its own test of its function next to it, and this test must not break when a module starts really deleting data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Lista, którą sprawdzamy.
// EN: The list under test.
import { STUDENT_DATA_DELETERS } from './accountDeletion';

/**
 * PL: Moduły z danymi ucznia. Lista jest wpisana ręcznie, a nie wyliczona z kodu, bo wtedy test nie wykryłby brakującego wpisu. Pulpit i licznik do dzwonka nie mają własnych danych ucznia. Nowy moduł z danymi ucznia dopisujemy tu i w accountDeletion.ts.
 * EN: The modules with student data. The list is written by hand and not computed from the code, because then the test would not notice a missing entry. The dashboard and the bell countdown hold no student data of their own. A new module with student data is added here and in accountDeletion.ts.
 */
const MODULES_WITH_STUDENT_DATA = ['auth', 'media', 'news', 'reports', 'surveys', 'profile', 'admin'];

// PL: Grupa testów listy funkcji kasujących.
// EN: A group of tests for the list of deleting functions.
describe('STUDENT_DATA_DELETERS', () => {
  // PL: Jeden przypadek na moduł: wpis istnieje i ma funkcję.
  // EN: One case per module: the entry exists and has a function.
  it.each(MODULES_WITH_STUDENT_DATA.map((module) => ({ module })))('moduł $module ma funkcję kasującą / module $module has a deleting function', ({ module }) => {
    // PL: Znajdź wpis po nazwie modułu.
    // EN: Find the entry by module name.
    const entry = STUDENT_DATA_DELETERS.find((item) => item.module === module);

    // PL: Wpis musi mieć funkcję.
    // EN: The entry must have a function.
    expect(typeof entry?.deleteStudentData).toBe('function');
  });

  // PL: Wpis spoza listy modułów z danymi ucznia to pomyłka albo zapomniany test.
  // EN: An entry outside the list of modules with student data is a mistake or a forgotten test.
  it('lista nie ma nadmiarowych modułów / the list has no extra modules', () => {
    // PL: Zbierz nazwy modułów z listy.
    // EN: Collect the module names from the list.
    const modules = STUDENT_DATA_DELETERS.map((item) => item.module);

    // PL: Nazwy muszą być dokładnie takie jak oczekiwane.
    // EN: The names must be exactly the expected ones.
    expect(modules).toEqual(MODULES_WITH_STUDENT_DATA);
  });
});
