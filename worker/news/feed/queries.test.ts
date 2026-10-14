/**
 * PL: Test zapytań podtoru 3a na prawdziwym D1 z testów (env.DB, tabele ze schematu są już założone). Sprawdza, że lista zawiera tylko opublikowane wpisy z datą, od najnowszego i z limitem, że wpis zaplanowany na przyszłość jest niewidoczny, że przypięte są na górze i że szukanie traktuje % i _ jak zwykłe znaki. Test oblewa, gdy ktoś usunie któryś z tych warunków z zapytania.
 * EN: Test of the queries of subtrack 3a on the real D1 from the tests (env.DB, the schema tables are already created). Checks that the list holds only published entries with a date, newest first and with a limit, that an entry scheduled for the future is invisible, that pinned entries come first, and that the search treats % and _ as plain characters. The test fails when someone removes one of these conditions from the query.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/news/feed/queries.ts::listPublishedEntries
 * @uses worker/db/schema/news.ts::newsEntries
 * @used_by vitest.config.ts::include
 */

// PL: Baza D1 z testów.
// EN: The D1 database from the tests.
import { env } from 'cloudflare:workers';
// PL: Drizzle zamienia D1 w bazę, tak jak robi to serwer.
// EN: Drizzle turns D1 into a database, the way the server does.
import { drizzle } from 'drizzle-orm/d1';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Warunek równości dla zapytań.
// EN: The equality condition for queries.
import { eq } from 'drizzle-orm';
// PL: Tabela wpisów i typ wiersza do wstawienia.
// EN: The entries table and the type of a row to insert.
import { newsEntries, type NewNewsEntryRow, type NewsEntryRow } from '../../db/schema/news';
// PL: Tabela kont, z której bierzemy imię autora.
// EN: The accounts table, from which we take the author's name.
import { user } from '../../db/schema/auth';
// PL: Zapytania, które sprawdzamy, i limit listy.
// EN: The queries under test and the list limit.
import { LIST_LIMIT, findPublishedEntry, listPublishedEntries } from './queries';

// PL: Baza testowa.
// EN: The test database.
const db = drizzle(env.DB);

// PL: Stała „teraz” dla testów widoczności, żeby wynik nie zależał od zegara.
// EN: A fixed "now" for the visibility tests, so the result does not depend on the clock.
const NOW = new Date(Date.UTC(2026, 9, 12, 12));

// PL: Dwie godziny później niż NOW: zaplanowany wpis już wtedy jest widoczny.
// EN: Two hours after NOW: a scheduled entry is already visible then.
const LATER = new Date(NOW.getTime() + 2 * 3_600_000);

/**
 * PL: Składa wiersz testowy. Domyślnie jest opublikowany o podanej godzinie 2026-10-09.
 * EN: Builds a test row. By default it is published at the given hour of 2026-10-09.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @param overrides - PL: pola, które zmieniamy. EN: the fields to change.
 * @returns PL: wiersz do wstawienia. EN: a row to insert.
 */
function row(id: string, overrides: Partial<NewNewsEntryRow> = {}): NewNewsEntryRow {
  const body = { type: 'doc', content: [] };
  return { id, type: 'news', status: 'published', title: id, body, source: 'Samorząd', publishedAt: new Date(Date.UTC(2026, 9, 9, 10)), ...overrides };
}

/**
 * PL: Chwila publikacji n-tej minuty od początku 2026 roku, żeby kolejność była jasna.
 * EN: The publication moment of the n-th minute from the start of 2026, so the order is clear.
 *
 * @param index - PL: numer minuty. EN: the minute number.
 * @returns PL: data. EN: the date.
 */
function atMinute(index: number): Date {
  return new Date(Date.UTC(2026, 0, 1) + index * 60_000);
}

/**
 * PL: Numery wpisów z listy, w tej samej kolejności.
 * EN: The entry ids of the list, in the same order.
 *
 * @param rows - PL: wiersze z zapytania. EN: the rows from the query.
 * @returns PL: numery. EN: the ids.
 */
function ids(rows: NewsEntryRow[]): string[] {
  return rows.map((entry) => entry.id);
}

/**
 * PL: Wstawia wiersze partiami po 8. Wiersz ma 12 kolumn, a D1 przyjmuje do 100 parametrów w zapytaniu, więc 8 wierszy (96 parametrów) to najwięcej w jednej partii.
 * EN: Inserts rows in batches of 8. A row has 12 columns and D1 accepts up to 100 parameters per query, so 8 rows (96 parameters) is the most in one batch.
 *
 * @param rows - PL: wiersze do wstawienia. EN: the rows to insert.
 */
async function insertAll(rows: NewNewsEntryRow[]): Promise<void> {
  for (let start = 0; start < rows.length; start += 8) await db.insert(newsEntries).values(rows.slice(start, start + 8));
}

// PL: Przed każdym testem tabela jest pusta.
// EN: Before every test the table is empty.
beforeEach(async () => {
  await db.delete(newsEntries);
});

// PL: Grupa testów zapytania o listę.
// EN: A group of tests of the list query.
describe('listPublishedEntries', () => {
  // PL: Szkic i wpis opublikowany bez daty nie trafiają na listę.
  // EN: A draft and a published entry without a date do not reach the list.
  it('pomija szkice i wpisy bez daty / skips drafts and entries without a date', async () => {
    await db.insert(newsEntries).values([
      row('opublikowany'),
      row('szkic', { status: 'draft', publishedAt: null }),
      row('szkic-z-data', { status: 'draft' }),
      row('bez-daty', { publishedAt: null }),
    ]);

    const rows = await listPublishedEntries(db);

    expect(rows.map((entry) => entry.id)).toEqual(['opublikowany']);
  });

  // PL: Wpis do korekty ma datę publikacji w przeszłości i pustą chwilę zaplanowania, więc widoczność wynika tylko ze statusu. Ukrywa go filtr statusu, nie data: lista i wpis po numerze go pomijają.
  // EN: An entry in review has a publication date in the past and an empty scheduled moment, so its visibility comes only from the status. The status filter hides it, not the date: the list and the entry by id both skip it.
  it('pomija wpis do korekty, nawet z datą publikacji / skips an entry in review, even with a publication date', async () => {
    await db.insert(newsEntries).values([row('opublikowany'), row('do-korekty', { status: 'in_review', title: 'Zapisy do korekty' })]);

    expect(ids(await listPublishedEntries(db, '', NOW))).toEqual(['opublikowany']);
    expect(ids(await listPublishedEntries(db, 'zapisy', NOW))).toEqual([]);
    expect(await findPublishedEntry(db, 'do-korekty', NOW)).toBeUndefined();
  });

  // PL: Najnowszy wpis jest pierwszy.
  // EN: The newest entry comes first.
  it('sortuje od najnowszego / sorts newest first', async () => {
    await db.insert(newsEntries).values([
      row('stary', { publishedAt: new Date(Date.UTC(2026, 9, 1)) }),
      row('nowy', { publishedAt: new Date(Date.UTC(2026, 9, 8)) }),
      row('sredni', { publishedAt: new Date(Date.UTC(2026, 9, 5)) }),
    ]);

    const rows = await listPublishedEntries(db);

    expect(rows.map((entry) => entry.id)).toEqual(['nowy', 'sredni', 'stary']);
  });

  // PL: Lista ma limit, a odczytany wiersz ma datę jako obiekt Date.
  // EN: The list has a limit, and a read row has the date as a Date object.
  it('ucina listę do limitu / cuts the list to the limit', async () => {
    await insertAll(Array.from({ length: LIST_LIMIT + 5 }, (_, index) => row(`wpis-${index}`, { publishedAt: atMinute(index) })));

    const rows = await listPublishedEntries(db);

    expect(rows).toHaveLength(LIST_LIMIT);
    expect(rows[0]?.publishedAt).toBeInstanceOf(Date);
  });

  // PL: Szukanie po tytule i treści, bez względu na wielkość liter, także dla polskich liter.
  // EN: Searching in the title and the content, regardless of case, also for Polish letters.
  it('szuka w tytule i treści bez wielkości liter / searches the title and the content ignoring case', async () => {
    await db.insert(newsEntries).values([
      row('tytul', { title: 'Turniej ŻAK' }),
      row('tresc', { title: 'Biblioteka', body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Zapisy do Łodzi' }] }] } }),
      row('obcy', { title: 'Sport' }),
    ]);

    expect(ids(await listPublishedEntries(db, 'żak'))).toEqual(['tytul']);
    expect(ids(await listPublishedEntries(db, 'ŁODZI'))).toEqual(['tresc']);
    expect(ids(await listPublishedEntries(db, 'nic-takiego'))).toEqual([]);
  });

  // PL: Szkic z pasującym tytułem nie wraca w wynikach szukania.
  // EN: A draft with a matching title does not come back in the search results.
  it('nie szuka w szkicach / does not search drafts', async () => {
    await db.insert(newsEntries).values([row('opublikowany', { title: 'Żak' }), row('szkic', { title: 'Żak', status: 'draft', publishedAt: null })]);

    expect(ids(await listPublishedEntries(db, 'żak'))).toEqual(['opublikowany']);
  });

  // PL: Szukanie sięga do całej listy, a nie tylko do pierwszej strony: najstarszy pasujący wpis też się znajdzie.
  // EN: The search reaches the whole list, not just the first page: the oldest matching entry is found too.
  it('szuka w całej liście, nie tylko na pierwszej stronie / searches the whole list, not just the first page', async () => {
    await insertAll(Array.from({ length: LIST_LIMIT + 10 }, (_, index) => row(`wpis-${index}`, { title: index < 3 ? `Zapisy ${index}` : `Inne ${index}`, publishedAt: atMinute(index) })));

    expect(ids(await listPublishedEntries(db, 'zapisy'))).toEqual(['wpis-2', 'wpis-1', 'wpis-0']);
  });

  // PL: Limit działa po filtrowaniu: pasujących wpisów jest więcej niż strona, a odpowiedź ma ich najwyżej LIST_LIMIT.
  // EN: The limit applies after filtering: there are more matching entries than a page, and the answer has at most LIST_LIMIT of them.
  it('ucina wyniki szukania do limitu / cuts the search results to the limit', async () => {
    await insertAll(Array.from({ length: LIST_LIMIT + 5 }, (_, index) => row(`zapis-${index}`, { title: `Zapisy ${index}`, publishedAt: atMinute(index) })));

    expect(await listPublishedEntries(db, 'zapisy')).toHaveLength(LIST_LIMIT);
  });
  // PL: Wpis zaplanowany na przyszłość nie jest widoczny na liście ani w szukaniu, a po swojej chwili już jest. Wpis bez zaplanowanej chwili (od razu) i z chwilą, która minęła, też jest widoczny.
  // EN: An entry scheduled for the future is not visible in the list or in the search, and after its moment it is. An entry without a scheduled moment (right away) and one whose moment has passed are visible too.
  it('ukrywa wpis zaplanowany na przyszłość / hides an entry scheduled for the future', async () => {
    await db.insert(newsEntries).values([
      row('od-razu', { publishedAt: atMinute(3) }),
      row('minelo', { publishedAt: atMinute(2), publishAt: new Date(NOW.getTime() - 60_000) }),
      row('zaplanowany', { publishedAt: atMinute(1), publishAt: new Date(NOW.getTime() + 3_600_000), title: 'Zapisy przyszłe' }),
    ]);

    expect(ids(await listPublishedEntries(db, '', NOW))).toEqual(['od-razu', 'minelo']);
    expect(ids(await listPublishedEntries(db, 'zapisy', NOW))).toEqual([]);
    expect(ids(await listPublishedEntries(db, 'zapisy', LATER))).toEqual(['zaplanowany']);
  });

  // PL: Przypięte wpisy są na górze, najnowsze przypięcie pierwsze. Wpis bez przypięcia, najnowszy według daty, ląduje pod nimi: samo sortowanie po dacie by tego nie przeszło.
  // EN: Pinned entries come first, the latest pin on top. An unpinned entry, newest by date, lands below them: sorting by date alone would not pass this.
  it('przypięte są na górze, najnowsze przypięcie pierwsze / pinned entries come first, the latest pin on top', async () => {
    await db.insert(newsEntries).values([
      row('najnowszy-bez-przypiecia', { publishedAt: atMinute(5) }),
      row('przypiety-stary', { publishedAt: atMinute(1), pinnedAt: atMinute(100) }),
      row('przypiety-nowy', { publishedAt: atMinute(2), pinnedAt: atMinute(200) }),
      row('zwykly', { publishedAt: atMinute(3) }),
    ]);

    expect(ids(await listPublishedEntries(db, '', NOW))).toEqual(['przypiety-nowy', 'przypiety-stary', 'najnowszy-bez-przypiecia', 'zwykly']);
  });

  // PL: Znaki % i _ w szukanym tekście są zwykłymi znakami (szukanie działa przez instr, a nie LIKE). Ukośnik też. Gdyby % działał jak wzorzec, znalazłby każdy tytuł.
  // EN: The % and _ characters in the searched text are plain characters (the search works through instr, not LIKE). So is the backslash. If % acted as a pattern, it would find every title.
  it('szuka znaków % i _ dosłownie / searches the % and _ characters literally', async () => {
    await db.insert(newsEntries).values([
      row('procent', { title: 'Rabat 50%', publishedAt: atMinute(1) }),
      row('zlotowki', { title: 'Rabat 50 zł', publishedAt: atMinute(2) }),
      row('podkreslenie', { title: 'Kod a_b', publishedAt: atMinute(3) }),
      row('litera', { title: 'Kod axb', publishedAt: atMinute(4) }),
      row('ukosnik', { title: 'Ścieżka a\\b', publishedAt: atMinute(5) }),
    ]);

    expect(ids(await listPublishedEntries(db, '50%', NOW))).toEqual(['procent']);
    expect(ids(await listPublishedEntries(db, '%', NOW))).toEqual(['procent']);
    expect(ids(await listPublishedEntries(db, 'a_b', NOW))).toEqual(['podkreslenie']);
    expect(ids(await listPublishedEntries(db, '_', NOW))).toEqual(['podkreslenie']);
    expect(ids(await listPublishedEntries(db, 'a\\b', NOW))).toEqual(['ukosnik']);
    expect(ids(await listPublishedEntries(db, '\\', NOW))).toEqual(['ukosnik']);
  });
});

// PL: Grupa testów zapytania o jeden wpis.
// EN: A group of tests of the single entry query.
describe('findPublishedEntry', () => {
  // PL: Opublikowany wpis jest znaleziony, szkic nie.
  // EN: A published entry is found, a draft is not.
  it('znajduje opublikowany, nie znajduje szkicu / finds a published entry, does not find a draft', async () => {
    await db.insert(newsEntries).values([row('opublikowany'), row('szkic', { status: 'draft', publishedAt: null })]);

    expect((await findPublishedEntry(db, 'opublikowany'))?.entry.id).toBe('opublikowany');
    expect(await findPublishedEntry(db, 'szkic')).toBeUndefined();
    expect(await findPublishedEntry(db, 'nie-ma')).toBeUndefined();
  });

  // PL: Wpis zaplanowany na przyszłość nie otwiera się po numerze, dopóki jego chwila nie minie.
  // EN: An entry scheduled for the future does not open by its id until its moment passes.
  it('wpis zaplanowany na przyszłość nie jest widoczny po numerze / a scheduled entry is not visible by its id', async () => {
    await db.insert(newsEntries).values(row('zaplanowany', { publishAt: new Date(NOW.getTime() + 3_600_000) }));

    expect(await findPublishedEntry(db, 'zaplanowany', NOW)).toBeUndefined();
    expect((await findPublishedEntry(db, 'zaplanowany', LATER))?.entry.id).toBe('zaplanowany');
  });

  // PL: Złośliwy numer z adresu jest parametrem: nic nie znajduje i nie psuje tabeli.
  // EN: A malicious id from the address is a parameter: it finds nothing and does not damage the table.
  it('numer wpisu jest parametrem, nie tekstem SQL / the entry id is a parameter, not SQL text', async () => {
    await db.insert(newsEntries).values(row('opublikowany'));

    expect(await findPublishedEntry(db, "x' OR '1'='1")).toBeUndefined();
    expect(await findPublishedEntry(db, "x'; DROP TABLE news_entries; --")).toBeUndefined();
    expect((await findPublishedEntry(db, 'opublikowany'))?.entry.id).toBe('opublikowany');
  });

  // PL: Imię autora idzie z konta. Bez autora, z samymi spacjami w imieniu albo po usunięciu konta dostajemy null. E-mail konta nigdy nie trafia do wyniku.
  // EN: The author's name comes from the account. Without an author, with only spaces in the name, or after the account is deleted we get null. The account's e-mail never gets into the result.
  it('podaje imię autora z konta, a bez autora null / gives the author\'s name from the account, and null without an author', async () => {
    await db.insert(user).values([
      { id: 'autor-ada', name: '  Ada Wymyślona ', email: 'ada.wymyslona@example.com', emailVerified: true },
      { id: 'autor-pusty', name: '   ', email: 'pusty.autor@example.com', emailVerified: true },
    ]).onConflictDoNothing();
    await db.insert(newsEntries).values([
      row('z-autorem', { authorUserId: 'autor-ada' }),
      row('pusty-autor', { authorUserId: 'autor-pusty' }),
      row('bez-autora'),
    ]);

    const withAuthor = await findPublishedEntry(db, 'z-autorem');
    expect(withAuthor?.authorName).toBe('Ada Wymyślona');
    expect(JSON.stringify(withAuthor)).not.toContain('example.com');
    expect((await findPublishedEntry(db, 'pusty-autor'))?.authorName).toBeNull();
    expect((await findPublishedEntry(db, 'bez-autora'))?.authorName).toBeNull();

    await db.delete(user).where(eq(user.id, 'autor-ada'));
    expect((await findPublishedEntry(db, 'z-autorem'))?.authorName).toBeNull();
  });
});
