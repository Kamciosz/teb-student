/**
 * PL: Schemat bazy modułu bell (tabele Drizzle): dni, w które Samorząd włączył plan skrócony (lekcje skrócone). Schemat modułu należy do podtoru 6 (docs/PODZIAL_PRACY.md, część 2).
 * EN: The database schema of the bell module (Drizzle tables): the days on which the Student Council turned on the shortened plan (shortened lessons). The module schema belongs to subtrack 6 (docs/PODZIAL_PRACY.md, part 2).
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses worker/db/schema/auth.ts::user
 * @used_by worker/db/schema/index.ts::*
 * @used_by worker/bell/routes.ts::shortenedDays
 */

// PL: Funkcje Drizzle do opisu tabel SQLite (D1 to SQLite).
// EN: Drizzle functions that describe SQLite tables (D1 is SQLite).
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
// PL: Tabela kont, do której wskazuje kolumna „kto włączył”.
// EN: The account table the "who turned it on" column points to.
import { user } from './auth';

/**
 * PL: Dni skrócone. Jeden wiersz na dzień, więc ten sam dzień nie dubluje się, a wyłączenie to skasowanie wiersza.
 * EN: Shortened days. One row per day, so the same day is not duplicated, and turning it off means deleting the row.
 */
export const shortenedDays = sqliteTable('bell_shortened_days', {
  /** PL: Dzień skrócony, data RRRR-MM-DD (czas polski). Klucz główny, więc jeden dzień jest tylko raz. EN: The shortened day, a YYYY-MM-DD date (Polish time). The primary key, so one day appears only once. */
  date: text('date').primaryKey(),
  /** PL: Członek Samorządu, który włączył dzień. Po usunięciu konta kolumna zostaje pusta (null), a dzień nadal jest skrócony. EN: The Student Council member who turned the day on. When the account is deleted the column becomes empty (null), and the day stays shortened. */
  setBy: text('set_by').references(() => user.id, { onDelete: 'set null' }),
  /** PL: Chwila włączenia dnia, w milisekundach. EN: The moment the day was turned on, in milliseconds. */
  setAt: integer('set_at', { mode: 'timestamp_ms' }).notNull(),
});
