/**
 * PL: Liczy wszystkie zgłoszenia, także anonimowe, do ekranu „Dane z pilotażu” panelu Samorządu (podtor 8). Zwraca tylko liczbę, bez numerów zgłoszeń i autorów.
 * EN: Counts all reports, anonymous ones too, for the "Pilot data" screen of the Student Council panel (subtrack 8). Returns only the number, without report ids and authors.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/reports.ts::reports
 * @used_by worker/reports/student/index.ts::countReports
 * @used_by worker/reports/student/countReports.test.ts::countReports
 */

// PL: Funkcja count z Drizzle liczy wiersze.
// EN: Drizzle's count function counts rows.
import { count } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela zgłoszeń.
// EN: The reports table.
import { reports } from '../../db/schema/reports';

/**
 * PL: Liczba wszystkich zgłoszeń w bazie. Nie czyta kolumn autora ani anonimowości, tylko liczy wiersze.
 * EN: The number of all reports in the database. It does not read the author or anonymity columns, it only counts rows.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @returns PL: liczba zgłoszeń, zero, gdy ich nie ma. EN: the number of reports, zero when there are none.
 * @throws PL: błąd bazy, gdy odczyt się nie uda. EN: a database error when the read fails.
 */
export async function countReports(db: D1Database): Promise<number> {
  // PL: Jedno zapytanie SELECT count(*) z tabeli zgłoszeń.
  // EN: One SELECT count(*) query on the reports table.
  const [row] = await drizzle(db).select({ total: count() }).from(reports);

  // PL: Zapytanie zawsze zwraca jeden wiersz, ale na wszelki wypadek brak wiersza daje zero.
  // EN: The query always returns one row, but just in case a missing row gives zero.
  return row?.total ?? 0;
}
