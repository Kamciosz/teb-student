/**
 * PL: Zapytania do bazy podtoru 3a: lista opublikowanych wpisów i jeden opublikowany wpis. To jedyne miejsce, które czyta tabelę wpisów dla ucznia, więc warunek „tylko opublikowane” jest tu, w SQL, a nie w ekranie. Podtor 3a niczego nie zapisuje.
 * EN: The database queries of subtrack 3a: the list of published entries and one published entry. This is the only place that reads the entries table for a student, so the "published only" condition is here, in SQL, and not in the screen. Subtrack 3a writes nothing.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/db/schema/news.ts::newsEntries
 * @used_by worker/news/feed/routes.ts::newsFeedApp
 * @used_by worker/news/feed/queries.test.ts::listPublishedEntries
 */

// PL: Funkcje składania warunków i sortowania w Drizzle.
// EN: The Drizzle functions for building conditions and sorting.
import { and, desc, eq, isNotNull } from 'drizzle-orm';
// PL: Typ bazy Drizzle dla D1.
// EN: The Drizzle database type for D1.
import type { DrizzleD1Database } from 'drizzle-orm/d1';
// PL: Tabela wpisów i typ jej wiersza.
// EN: The entries table and its row type.
import { newsEntries, type NewsEntryRow } from '../../db/schema';
// PL: Tekst treści wpisu do wyszukiwania.
// EN: The entry content text for the search.
import { plainTextOf } from './excerpt';

/**
 * PL: Najwięcej wpisów na liście. Telefon filtruje tę listę u siebie, więc jedna odpowiedź musi starczyć na wszystkie typy.
 * EN: The most entries on the list. The phone filters this list itself, so one response must be enough for all types.
 */
export const LIST_LIMIT = 50;

/**
 * PL: Najdłuższy szukany tekst (po przycięciu spacji). Dłuższy dostaje 400, zanim dotknie bazy.
 * EN: The longest searched text (after trimming spaces). A longer one gets 400 before it touches the database.
 */
export const SEARCH_MAX_LENGTH = 100;

/**
 * PL: Warunek widoczności dla ucznia: wpis jest opublikowany i ma chwilę publikacji.
 * EN: The visibility condition for a student: the entry is published and has a publication moment.
 */
const isVisibleToStudent = and(eq(newsEntries.status, 'published'), isNotNull(newsEntries.publishedAt));

/**
 * PL: Sprowadza tekst do postaci do porównania: składanie znaków NFC i małe litery. Polskie litery (ą, ś, ż) też się zmieniają.
 * EN: Brings a text to the form for comparison: NFC character composition and lower case. Polish letters (ą, ś, ż) change too.
 *
 * @param text - PL: dowolny tekst. EN: any text.
 * @returns PL: tekst gotowy do porównania. EN: the text ready for comparison.
 */
function normalizeForSearch(text: string): string {
  return text.normalize('NFC').toLowerCase();
}

/**
 * PL: Czy wpis pasuje do szukanego tekstu w tytule albo w treści.
 * EN: Whether the entry matches the searched text in the title or in the content.
 *
 * @param row - PL: wiersz opublikowanego wpisu. EN: a row of a published entry.
 * @param term - PL: szukany tekst, już bez spacji na brzegach. EN: the searched text, already trimmed.
 * @returns PL: `true`, gdy tekst się znajduje. EN: `true` when the text is found.
 */
function matchesTerm(row: NewsEntryRow, term: string): boolean {
  const needle = normalizeForSearch(term);
  return normalizeForSearch(row.title).includes(needle) || normalizeForSearch(plainTextOf(row.body)).includes(needle);
}

/**
 * PL: Pobiera opublikowane wpisy od najnowszego, opcjonalnie tylko te pasujące do szukanego tekstu.
 * EN: Fetches the published entries, newest first, optionally only those matching the searched text.
 *
 * @param db - PL: baza Drizzle zbudowana na D1. EN: the Drizzle database built on D1.
 * @param term - PL: szukany tekst; pusty znaczy bez szukania. EN: the searched text; empty means no search.
 * @returns PL: do LIST_LIMIT wierszy bez szkiców. EN: up to LIST_LIMIT rows with no drafts.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function listPublishedEntries(db: DrizzleD1Database, term = ''): Promise<NewsEntryRow[]> {
  // PL: Bez szukania tylko widoczne wpisy, od najnowszego, z limitem w bazie.
  // EN: Without a search only visible entries, newest first, with the limit in the database.
  if (term === '') return db.select().from(newsEntries).where(isVisibleToStudent).orderBy(desc(newsEntries.publishedAt)).limit(LIST_LIMIT);

  // PL: Przy szukaniu limit idzie po filtrowaniu, więc bierzemy wszystkie widoczne wpisy i sprawdzamy je tutaj. Tekst treści jest w JSON, a SQL nie porówna polskich liter bez względu na wielkość.
  // EN: With a search the limit applies after filtering, so we take all visible entries and check them here. The content text is in JSON, and SQL cannot compare Polish letters regardless of case.
  const rows = await db.select().from(newsEntries).where(isVisibleToStudent).orderBy(desc(newsEntries.publishedAt));
  return rows.filter((row) => matchesTerm(row, term)).slice(0, LIST_LIMIT);
}

/**
 * PL: Pobiera jeden opublikowany wpis. Szkic i nieistniejący numer dają ten sam wynik: brak wiersza.
 * EN: Fetches one published entry. A draft and a non-existent id give the same result: no row.
 *
 * @param db - PL: baza Drizzle zbudowana na D1. EN: the Drizzle database built on D1.
 * @param id - PL: numer wpisu z adresu. EN: the entry id from the address.
 * @returns PL: wiersz albo `undefined`. EN: the row or `undefined`.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function findPublishedEntry(db: DrizzleD1Database, id: string): Promise<NewsEntryRow | undefined> {
  // PL: Warunek widoczności plus numer. Numer idzie jako parametr zapytania, nie jako tekst SQL.
  // EN: The visibility condition plus the id. The id goes as a query parameter, not as SQL text.
  const rows = await db.select().from(newsEntries).where(and(isVisibleToStudent, eq(newsEntries.id, id))).limit(1);
  return rows[0];
}
