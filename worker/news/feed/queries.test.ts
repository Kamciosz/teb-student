/**
 * PL: Test zapytań podtoru 3a na atrapie D1. Sprawdza tekst SQL i parametry: szkice są wycinane w zapytaniu, wynik jest sortowany od najnowszego z limitem, a numer wpisu idzie jako parametr. Test oblewa, gdy ktoś usunie warunek „published” z zapytania.
 * EN: Test of the queries of subtrack 3a on a D1 fake. Checks the SQL text and the parameters: drafts are cut out in the query, the result is sorted newest first with a limit, and the entry id goes as a parameter. The test fails when someone removes the "published" condition from the query.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/news/feed/queries.ts::listPublishedEntries
 * @uses worker/news/feed/fakeD1.ts::createFakeD1
 * @used_by vitest.config.ts::include
 */

// PL: Drizzle zamienia atrapę D1 w bazę, tak jak robi to serwer.
// EN: Drizzle turns the D1 fake into a database, the way the server does.
import { drizzle } from 'drizzle-orm/d1';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Atrapa D1.
// EN: The D1 fake.
import { createFakeD1 } from './fakeD1';
// PL: Zapytania, które sprawdzamy, i limit listy.
// EN: The queries under test and the list limit.
import { LIST_LIMIT, findPublishedEntry, listPublishedEntries } from './queries';

// PL: Grupa testów zapytania o listę.
// EN: A group of tests of the list query.
describe('listPublishedEntries', () => {
  // PL: Zapytanie o listę wybiera tylko opublikowane wpisy z datą, od najnowszego i z limitem.
  // EN: The list query selects only published entries with a date, newest first and with a limit.
  it('wycina szkice w SQL, sortuje od najnowszego i ma limit / cuts drafts in SQL, sorts newest first and has a limit', async () => {
    const fake = createFakeD1();

    await listPublishedEntries(drizzle(fake.binding));

    const [query] = fake.queries;
    expect(fake.queries).toHaveLength(1);
    expect(query?.sql).toContain('"news_entries"."status" = ?');
    expect(query?.sql).toContain('"news_entries"."published_at" is not null');
    expect(query?.sql).toContain('order by "news_entries"."published_at" desc');
    expect(query?.params).toEqual(['published', LIST_LIMIT]);
  });
});

// PL: Grupa testów zapytania o jeden wpis.
// EN: A group of tests of the single entry query.
describe('findPublishedEntry', () => {
  // PL: Zapytanie o jeden wpis ma ten sam warunek widoczności co lista.
  // EN: The single entry query has the same visibility condition as the list.
  it('wycina szkice także przy pojedynczym wpisie / cuts drafts for a single entry too', async () => {
    const fake = createFakeD1();

    const row = await findPublishedEntry(drizzle(fake.binding), 'seed-turniej');

    expect(row).toBeUndefined();
    expect(fake.queries[0]?.sql).toContain('"news_entries"."status" = ?');
    expect(fake.queries[0]?.params).toEqual(['published', 'seed-turniej', 1]);
  });

  // PL: Złośliwy numer z adresu trafia do parametru i nie wchodzi do tekstu SQL.
  // EN: A malicious id from the address goes into a parameter and does not enter the SQL text.
  it('numer wpisu jest parametrem, nie tekstem SQL / the entry id is a parameter, not SQL text', async () => {
    const fake = createFakeD1();
    const hostile = "x' OR '1'='1";

    await findPublishedEntry(drizzle(fake.binding), hostile);

    expect(fake.queries[0]?.sql).not.toContain('OR');
    expect(fake.queries[0]?.params).toContain(hostile);
  });
});
