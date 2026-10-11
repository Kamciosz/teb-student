/**
 * PL: Test usuwania konta na podstawionej liście funkcji kasujących. Sprawdza kolejność (konto na końcu) i to, że błąd modułu zatrzymuje usuwanie, zanim konto zniknie.
 * EN: Test of the account deletion on a stubbed list of deleting functions. Checks the order (the account last) and that a module error stops the deletion before the account is gone.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses worker/profile/deleteAccount.ts::deleteAccount
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1.
// EN: The Worker test environment with the D1 database.
import { env } from 'cloudflare:workers';
// PL: Funkcja, którą sprawdzamy, i typ wpisu listy.
// EN: The function under test and the list entry type.
import { deleteAccount } from './deleteAccount';
import type { StudentDataDeleter } from '../shared/accountDeletion';

/**
 * PL: Buduje listę z wpisami, które zapisują swoją nazwę do `calls`; wpis z nazwą z `failing` rzuca błąd.
 * EN: Builds a list whose entries record their name into `calls`; the entry named in `failing` throws an error.
 *
 * @param calls - PL: tablica na nazwy wywołanych modułów. EN: the array for the names of the called modules.
 * @param failing - PL: moduł, który ma rzucić błąd. EN: the module that must throw an error.
 * @returns PL: lista z auth na pierwszym miejscu, tak jak w prawdziwej liście. EN: a list with auth first, as in the real list.
 */
function buildDeleters(calls: string[], failing?: string): StudentDataDeleter[] {
  return ['auth', 'reports', 'profile'].map((module) => ({
    module,
    deleteStudentData: async () => {
      calls.push(module);
      if (module === failing) throw new Error('błąd bazy / database error');
    },
  }));
}

// PL: Grupa testów usuwania konta.
// EN: A group of tests for the account deletion.
describe('deleteAccount', () => {
  // PL: Auth jest pierwszy na liście, ale musi zostać wywołany jako ostatni.
  // EN: Auth is first on the list, but it must be called last.
  it('kasuje konto na końcu / deletes the account last', async () => {
    const calls: string[] = [];
    await deleteAccount({ userId: 'u1', db: env.DB }, buildDeleters(calls));
    expect(calls).toEqual(['reports', 'profile', 'auth']);
  });

  // PL: Błąd modułu z danymi przerywa usuwanie: konto (auth) nie jest ruszone, więc uczeń może spróbować jeszcze raz.
  // EN: An error of a data module stops the deletion: the account (auth) is untouched, so the student can try again.
  it('błąd modułu zatrzymuje usuwanie przed kontem / a module error stops before the account', async () => {
    const calls: string[] = [];
    await expect(deleteAccount({ userId: 'u1', db: env.DB }, buildDeleters(calls, 'reports'))).rejects.toThrow('błąd bazy');
    expect(calls).toEqual(['reports']);
  });
});
