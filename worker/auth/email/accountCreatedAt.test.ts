/**
 * PL: Test daty założenia konta ucznia (getAccountCreatedAt) wywoływanej przez drzwi modułu worker/auth/index.ts. Sprawdza, że data wraca jako milisekundy zgodne z zapisem konta, a nieznany numer daje null. Działa na prawdziwej bazie D1 testów.
 * EN: Test of the student account creation date (getAccountCreatedAt) called through the module door worker/auth/index.ts. Checks that the date comes back as milliseconds matching the saved account, and that an unknown id gives null. It runs on the real test D1 database.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/auth/index.ts::getAccountCreatedAt
 * @uses worker/db/schema/auth.ts::user
 * @used_by vitest.config.ts::include
 */

// PL: Baza testowa D1 i funkcje testowe Vitest.
// EN: The D1 test database and Vitest test functions.
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
// PL: Drizzle do wpisania konta testowego.
// EN: Drizzle for inserting the test account.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela kont.
// EN: The accounts table.
import { user } from '../../db/schema/auth';
// PL: Funkcja, którą sprawdzamy, importowana z drzwi modułu auth.
// EN: The function under test, imported from the door of the auth module.
import { getAccountCreatedAt } from '../index';

// PL: Grupa testów daty założenia konta.
// EN: A group of tests of the account creation date.
describe('getAccountCreatedAt', () => {
  // PL: Data zapisana przy koncie wraca jako ta sama liczba milisekund.
  // EN: The date saved with the account comes back as the same number of milliseconds.
  it('zwraca chwilę założenia konta w milisekundach / returns the moment the account was created in milliseconds', async () => {
    const createdAt = new Date(Date.UTC(2026, 8, 1, 9, 30));
    await drizzle(env.DB).insert(user).values({
      id: 'created-ola',
      name: 'Ola',
      email: 'ola.created@teb.edu.pl',
      emailVerified: true,
      createdAt,
    });

    expect(await getAccountCreatedAt(env.DB, 'created-ola')).toBe(Date.UTC(2026, 8, 1, 9, 30));
  });

  // PL: Nieznany numer konta daje null, a nie datę zastępczą.
  // EN: An unknown account id gives null, not a placeholder date.
  it('zwraca null dla nieznanego konta / returns null for an unknown account', async () => {
    expect(await getAccountCreatedAt(env.DB, 'created-brak')).toBeNull();
  });
});
