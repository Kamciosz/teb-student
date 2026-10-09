/**
 * PL: Dane testowe modułu auth: wymyśleni uczniowie do lokalnej bazy. Konta w produkcji powstają same przy pierwszym logowaniu kodem, więc te wiersze służą tylko do prób na własnym komputerze. Adresy są zmyślone.
 * EN: The test data of the auth module: invented students for the local database. In production accounts are created by themselves at the first code sign-in, so these rows are only for trying things on your own computer. The addresses are made up.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/db/schema/auth.ts::user
 * @used_by worker/db/seed/index.ts::*
 */

import type { user } from '../schema/auth';

/**
 * PL: Wymyśleni uczniowie: numer, imię i adres szkolny. Zmyślone dane, żadnej prawdziwej osoby.
 * EN: Invented students: an id, a name and a school address. Made-up data, no real person.
 */
export const authSeedUsers: ReadonlyArray<typeof user.$inferInsert> = [
  { id: 'seed-user-1', name: 'Ola Testowa', email: 'ola.testowa@teb.edu.pl', emailVerified: true },
  { id: 'seed-user-2', name: 'Kuba Probny', email: 'kuba.probny@teb.edu.pl', emailVerified: true },
  { id: 'seed-user-3', name: 'Ewa Przykladowa', email: 'ewa.przykladowa@teb.edu.pl', emailVerified: true },
];
