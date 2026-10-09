/**
 * PL: Test zapytań podtoru 3a na prawdziwym D1 z testów (env.DB, tabele ze schematu są już założone). Sprawdza, że lista zawiera tylko opublikowane wpisy z datą, od najnowszego i z limitem, a pojedynczy wpis jest widoczny tylko wtedy, gdy jest opublikowany. Test oblewa, gdy ktoś usunie warunek „published” z zapytania.
 * EN: Test of the queries of subtrack 3a on the real D1 from the tests (env.DB, the schema tables are already created). Checks that the list holds only published entries with a date, newest first and with a limit, and that a single entry is visible only when it is published. The test fails when someone removes the "published" condition from the query.
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
// PL: Tabela wpisów i typ wiersza do wstawienia.
// EN: The entries table and the type of a row to insert.
import { newsEntries, type NewNewsEntryRow } from '../../db/schema/news';
// PL: Zapytania, które sprawdzamy, i limit listy.
// EN: The queries under test and the list limit.
import { LIST_LIMIT, findPublishedEntry, listPublishedEntries } from './queries';

// PL: Baza testowa.
// EN: The test database.
const db = drizzle(env.DB);

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
    const many = Array.from({ length: LIST_LIMIT + 5 }, (_, index) => row(`wpis-${index}`, { publishedAt: new Date(Date.UTC(2026, 0, 1) + index * 60_000) }));
    // PL: D1 przyjmuje do 100 parametrów w zapytaniu, więc wstawiamy po 10 wierszy (9 kolumn każdy).
    // EN: D1 accepts up to 100 parameters per query, so we insert 10 rows at a time (9 columns each).
    for (let start = 0; start < many.length; start += 10) await db.insert(newsEntries).values(many.slice(start, start + 10));

    const rows = await listPublishedEntries(db);

    expect(rows).toHaveLength(LIST_LIMIT);
    expect(rows[0]?.publishedAt).toBeInstanceOf(Date);
  });
});

// PL: Grupa testów zapytania o jeden wpis.
// EN: A group of tests of the single entry query.
describe('findPublishedEntry', () => {
  // PL: Opublikowany wpis jest znaleziony, szkic nie.
  // EN: A published entry is found, a draft is not.
  it('znajduje opublikowany, nie znajduje szkicu / finds a published entry, does not find a draft', async () => {
    await db.insert(newsEntries).values([row('opublikowany'), row('szkic', { status: 'draft', publishedAt: null })]);

    expect((await findPublishedEntry(db, 'opublikowany'))?.id).toBe('opublikowany');
    expect(await findPublishedEntry(db, 'szkic')).toBeUndefined();
    expect(await findPublishedEntry(db, 'nie-ma')).toBeUndefined();
  });

  // PL: Złośliwy numer z adresu jest parametrem: nic nie znajduje i nie psuje tabeli.
  // EN: A malicious id from the address is a parameter: it finds nothing and does not damage the table.
  it('numer wpisu jest parametrem, nie tekstem SQL / the entry id is a parameter, not SQL text', async () => {
    await db.insert(newsEntries).values(row('opublikowany'));

    expect(await findPublishedEntry(db, "x' OR '1'='1")).toBeUndefined();
    expect(await findPublishedEntry(db, "x'; DROP TABLE news_entries; --")).toBeUndefined();
    expect((await findPublishedEntry(db, 'opublikowany'))?.id).toBe('opublikowany');
  });
});
