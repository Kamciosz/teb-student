/**
 * PL: Zapytania do bazy podtoru 3a: lista opublikowanych wpisów i jeden opublikowany wpis. To jedyne miejsce, które czyta tabelę wpisów dla ucznia, więc warunki „tylko opublikowane” i „już widoczne” (chwila publikacji nie minęła) są tu, w SQL, a nie w ekranie. Wyszukiwanie też jest tutaj, w SQL. Podtor 3a niczego nie zapisuje.
 * EN: The database queries of subtrack 3a: the list of published entries and one published entry. This is the only place that reads the entries table for a student, so the "published only" and "already visible" (the scheduled moment has passed) conditions are here, in SQL, and not in the screen. The search is here too, in SQL. Subtrack 3a writes nothing.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/db/schema/news.ts::newsEntries
 * @used_by worker/news/feed/routes.ts::newsFeedApp
 * @used_by worker/news/feed/queries.test.ts::listPublishedEntries
 */

// PL: Funkcje składania warunków, sortowania i wyrażeń SQL w Drizzle.
// EN: The Drizzle functions for building conditions, sorting and SQL expressions.
import { and, desc, eq, isNotNull, isNull, lte, or, sql, type SQL } from 'drizzle-orm';
// PL: Typ bazy Drizzle dla D1.
// EN: The Drizzle database type for D1.
import type { DrizzleD1Database } from 'drizzle-orm/d1';
// PL: Tabela wpisów i typ jej wiersza.
// EN: The entries table and its row type.
import { newsEntries, user, type NewsEntryRow } from '../../db/schema';

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
 * PL: Polskie wielkie litery i ich małe odpowiedniki. SQLite zmienia wielkość liter tylko dla liter ASCII, więc te dziewięć zamieniamy przed lower().
 * EN: Polish capital letters and their lower-case forms. SQLite changes the case only for ASCII letters, so these nine are swapped before lower().
 */
const POLISH_CAPITALS: ReadonlyArray<readonly [string, string]> = [
  ['Ą', 'ą'],
  ['Ć', 'ć'],
  ['Ę', 'ę'],
  ['Ł', 'ł'],
  ['Ń', 'ń'],
  ['Ó', 'ó'],
  ['Ś', 'ś'],
  ['Ź', 'ź'],
  ['Ż', 'ż'],
];

/**
 * PL: Cały tekst treści jako jeden napis: sklejone węzły tekstowe dokumentu JSON (znaczniki jak pogrubienie czy link nie przerywają słowa). Dla wpisu bez tekstu wynik to NULL.
 * EN: The whole content text as one string: the text nodes of the JSON document joined together (marks such as bold or a link do not break a word). For an entry without text the result is NULL.
 */
const BODY_TEXT = sql`(SELECT group_concat(value, '') FROM json_tree(${newsEntries.body}) WHERE key = 'text' AND type = 'text')`;

/**
 * PL: Składa wielkość liter w tekście z SQL, tak żeby polskie litery też były małe.
 * EN: Folds the case of a text in SQL, so Polish letters become lower case too.
 *
 * @param text - PL: wyrażenie SQL z tekstem. EN: an SQL expression with text.
 * @returns PL: wyrażenie SQL z tekstem małymi literami. EN: an SQL expression with lower-case text.
 */
function foldCase(text: SQL): SQL {
  const replaced = POLISH_CAPITALS.reduce<SQL>((inner, [upper, lower]) => sql`replace(${inner}, ${upper}, ${lower})`, text);
  return sql`lower(${replaced})`;
}

/**
 * PL: Opublikowany wpis razem z imieniem autora. Imię to null, gdy wpis nie ma autora, konto zostało usunięte albo imię jest puste. E-mail autora tu nie trafia.
 * EN: A published entry together with the author's name. The name is null when the entry has no author, the account was deleted or the name is empty. The author's e-mail does not get here.
 */
export type PublishedEntry = { entry: NewsEntryRow; authorName: string | null };

/**
 * PL: Zamienia imię z konta na tekst do pokazania albo null, gdy imienia nie ma lub jest same spacje.
 * EN: Turns the name from the account into a text to show, or null when there is no name or it is only spaces.
 *
 * @param name - PL: imię z konta albo null z lewego złączenia. EN: the name from the account, or null from the left join.
 * @returns PL: imię bez spacji na brzegach albo null. EN: the name without spaces at the edges, or null.
 */
function toAuthorName(name: string | null): string | null {
  const trimmed = name?.trim() ?? '';
  return trimmed === '' ? null : trimmed;
}

/**
 * PL: Warunek widoczności dla ucznia w danej chwili: wpis jest opublikowany, ma chwilę publikacji i jego zaplanowana chwila (jeśli jest) już minęła.
 * EN: The visibility condition for a student at a given moment: the entry is published, has a publication moment, and its scheduled moment (if any) has passed.
 *
 * @param now - PL: obecna chwila. EN: the current moment.
 * @returns PL: warunek do where. EN: the condition for where.
 */
function visibleToStudent(now: Date) {
  return and(
    eq(newsEntries.status, 'published'),
    isNotNull(newsEntries.publishedAt),
    or(isNull(newsEntries.publishAt), lte(newsEntries.publishAt, now)),
  );
}

/**
 * PL: Warunek szukania: szukany tekst występuje w tytule albo w treści. Używamy instr(), a nie LIKE, bo D1 odrzuca wzorzec LIKE dłuższy niż około 50 bajtów („LIKE or GLOB pattern too complex”), a limit wyszukiwania to 100 znaków. instr() dopasowuje dosłownie, więc % i _ w szukanym tekście są zwykłymi znakami i nie trzeba ich escapować.
 * EN: The search condition: the searched text occurs in the title or in the content. We use instr(), not LIKE, because D1 rejects a LIKE pattern longer than about 50 bytes ("LIKE or GLOB pattern too complex"), and the search limit is 100 characters. instr() matches literally, so % and _ in the searched text are plain characters and need no escaping.
 *
 * @param term - PL: szukany tekst, już bez spacji na brzegach i niepusty. EN: the searched text, already trimmed and not empty.
 * @returns PL: warunek do where. EN: the condition for where.
 */
function matchesTerm(term: string): SQL {
  // PL: Szukany tekst ma tę samą wielkość liter co tekst z bazy: małe litery w JS, polskie wielkie litery w bazie składane przez foldCase.
  // EN: The searched text has the same case as the database text: lower case in JS, Polish capitals in the database folded by foldCase.
  const needle = term.normalize('NFC').toLowerCase();
  return sql`(instr(${foldCase(sql`${newsEntries.title}`)}, ${needle}) > 0 OR instr(${foldCase(BODY_TEXT)}, ${needle}) > 0)`;
}

/**
 * PL: Pobiera widoczne wpisy: najpierw przypięte (najnowsze przypięcie na górze), potem od najnowszej publikacji. Opcjonalnie tylko te pasujące do szukanego tekstu. Limit działa po filtrowaniu.
 * EN: Fetches the visible entries: pinned first (the latest pin on top), then by the newest publication. Optionally only those matching the searched text. The limit applies after filtering.
 *
 * @param db - PL: baza Drizzle zbudowana na D1. EN: the Drizzle database built on D1.
 * @param term - PL: szukany tekst; pusty znaczy bez szukania. EN: the searched text; empty means no search.
 * @param now - PL: chwila, od której liczymy widoczność (domyślnie teraz). EN: the moment from which visibility is counted (by default now).
 * @returns PL: do LIST_LIMIT wierszy bez szkiców i bez zaplanowanych na później. EN: up to LIST_LIMIT rows with no drafts and no entries scheduled for later.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function listPublishedEntries(db: DrizzleD1Database, term = '', now = new Date()): Promise<NewsEntryRow[]> {
  const search = term === '' ? undefined : matchesTerm(term);
  return db
    .select()
    .from(newsEntries)
    .where(and(visibleToStudent(now), search))
    .orderBy(desc(newsEntries.pinnedAt), desc(newsEntries.publishedAt))
    .limit(LIST_LIMIT);
}

/**
 * PL: Pobiera jeden widoczny wpis. Szkic, wpis zaplanowany na później i nieistniejący numer dają ten sam wynik: brak wiersza.
 * EN: Fetches one visible entry. A draft, an entry scheduled for later and a non-existent id give the same result: no row.
 *
 * @param db - PL: baza Drizzle zbudowana na D1. EN: the Drizzle database built on D1.
 * @param id - PL: numer wpisu z adresu. EN: the entry id from the address.
 * @param now - PL: chwila, od której liczymy widoczność (domyślnie teraz). EN: the moment from which visibility is counted (by default now).
 * @returns PL: wpis z imieniem autora albo `undefined`. EN: the entry with the author's name, or `undefined`.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function findPublishedEntry(db: DrizzleD1Database, id: string, now = new Date()): Promise<PublishedEntry | undefined> {
  // PL: Warunek widoczności plus numer. Numer idzie jako parametr zapytania, nie jako tekst SQL. Imię bierzemy z konta autora przez lewe złączenie: wpis bez autora (albo po usunięciu konta) zostaje, a imię jest puste. Z konta czytamy tylko imię.
  // EN: The visibility condition plus the id. The id goes as a query parameter, not as SQL text. The name comes from the author's account through a left join: an entry without an author (or after the account is deleted) stays, and the name is empty. Only the name is read from the account.
  const rows = await db
    .select({ entry: newsEntries, authorName: user.name })
    .from(newsEntries)
    .leftJoin(user, eq(user.id, newsEntries.authorUserId))
    .where(and(visibleToStudent(now), eq(newsEntries.id, id)))
    .limit(1);
  const row = rows[0];
  if (!row) return undefined;
  return { entry: row.entry, authorName: toAuthorName(row.authorName) };
}
