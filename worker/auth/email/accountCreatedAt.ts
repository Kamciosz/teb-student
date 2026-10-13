/**
 * PL: Data założenia konta ucznia dla eksportu danych RODO („Pobierz moje dane”). Zwraca tylko chwilę utworzenia konta, bez adresu, imienia i sesji, bo eksport ma te dane już z konta.
 * EN: The date the student's account was created, for the GDPR data export ("Download my data"). It returns only the moment the account was created, without the address, the name and the sessions, because the export already has those from the account.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/auth.ts::user
 * @used_by worker/auth/email/index.ts::getAccountCreatedAt
 * @used_by worker/auth/email/accountCreatedAt.test.ts::getAccountCreatedAt
 */

// PL: Drizzle: warunek równości na numerze konta.
// EN: Drizzle: the equality condition on the account id.
import { eq } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela kont.
// EN: The accounts table.
import { user } from '../../db/schema/auth';

/**
 * PL: Chwila założenia konta jako milisekundy od 1970, tak jak daty w zgłoszeniach. Brak konta daje null.
 * EN: The moment the account was created as milliseconds since 1970, like the dates in the reports. A missing account gives null.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param userId - PL: numer konta. EN: the account id.
 * @returns PL: chwila założenia konta w milisekundach albo null, gdy konta nie ma. EN: the moment the account was created in milliseconds, or null when there is no account.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function getAccountCreatedAt(db: D1Database, userId: string): Promise<number | null> {
  // PL: Czytamy tylko kolumnę daty dla jednego konta.
  // EN: We read only the date column for one account.
  const [row] = await drizzle(db).select({ createdAt: user.createdAt }).from(user).where(eq(user.id, userId));

  // PL: Kolumna jest typu timestamp_ms, więc Drizzle zwraca Date; oddajemy liczbę milisekund.
  // EN: The column is of the timestamp_ms type, so Drizzle returns a Date; we give back the number of milliseconds.
  return row ? row.createdAt.getTime() : null;
}
