/**
 * PL: Test routera podtoru 3a na prawdziwym D1 z testów. Sprawdza kształt odpowiedzi listy i wpisu, że szkic i nieznany numer dają 404, że nie ma adresów zapisu (uczeń nie doda wpisu) oraz kod 500 przy błędzie bazy.
 * EN: Test of the router of subtrack 3a on the real D1 from the tests. Checks the shape of the list and entry responses, that a draft and an unknown id give 404, that there are no write routes (a student cannot add an entry), and code 500 for a database error.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/news/feed/routes.ts::newsFeedApp
 * @uses worker/db/schema/news.ts::newsEntries
 * @used_by vitest.config.ts::include
 */

// PL: Baza D1 z testów.
// EN: The D1 database from the tests.
import { env } from 'cloudflare:workers';
// PL: Drizzle zamienia D1 w bazę.
// EN: Drizzle turns D1 into a database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Tabela wpisów.
// EN: The entries table.
import { newsEntries } from '../../db/schema/news';
// PL: Router, który sprawdzamy.
// EN: The router under test.
import { newsFeedApp } from './routes';

// PL: Baza testowa.
// EN: The test database.
const db = drizzle(env.DB);

// PL: Treść wpisu testowego: jeden akapit.
// EN: The test entry content: one paragraph.
const BODY = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Zapisy do piątku.' }] }] };

// PL: Chwila publikacji wpisu testowego: 2026-10-09 10:00 UTC.
// EN: The publication moment of the test entry: 2026-10-09 10:00 UTC.
const PUBLISHED_AT = new Date(Date.UTC(2026, 9, 9, 10, 0, 0));

// PL: Przed każdym testem są dwa wpisy: opublikowany i szkic.
// EN: Before every test there are two entries: a published one and a draft.
beforeEach(async () => {
  await db.delete(newsEntries);
  await db.insert(newsEntries).values([
    { id: 'e1', type: 'event', status: 'published', title: 'Turniej', body: BODY, source: 'Samorząd', publishedAt: PUBLISHED_AT, linkUrl: 'https://example.com/r', linkLabel: 'Regulamin' },
    { id: 'szkic', type: 'news', status: 'draft', title: 'Szkic', body: BODY, source: 'Samorząd', publishedAt: null },
  ]);
});

// PL: Grupa testów listy wpisów.
// EN: A group of entry list tests.
describe('GET /', () => {
  // PL: Lista ma wpis opublikowany bez treści, z opisem i datą ISO, a szkicu nie ma.
  // EN: The list has the published entry without the content, with a description and an ISO date, and no draft.
  it('zwraca opublikowane wpisy z opisem i bez treści / returns published entries with a description and without the content', async () => {
    const response = await newsFeedApp.request('/', {}, env);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      entries: [{ id: 'e1', type: 'event', source: 'Samorząd', publishedAt: '2026-10-09T10:00:00.000Z', title: 'Turniej', excerpt: 'Zapisy do piątku.' }],
    });
  });

  // PL: Błąd bazy to 500 bez treści błędu, żeby nic nie wyciekło do telefonu.
  // EN: A database error is 500 without the error text, so nothing leaks to the phone.
  it('przy błędzie bazy odpowiada 500 bez szczegółów / answers 500 without details on a database error', async () => {
    const failing = { DB: { prepare: () => { throw new Error('tajny szczegół bazy'); } } };

    const response = await newsFeedApp.request('/', {}, failing);

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('tajny');
  });
});

// PL: Grupa testów pojedynczego wpisu.
// EN: A group of single entry tests.
describe('GET /:id', () => {
  // PL: Wpis ma treść JSON i link.
  // EN: The entry has the JSON content and the link.
  it('zwraca wpis z treścią i linkiem / returns the entry with the content and the link', async () => {
    const response = await newsFeedApp.request('/e1', {}, env);
    const { entry } = (await response.json()) as { entry: Record<string, unknown> };

    expect(response.status).toBe(200);
    expect(entry.body).toEqual(BODY);
    expect(entry.linkUrl).toBe('https://example.com/r');
    expect(entry.linkLabel).toBe('Regulamin');
  });

  // PL: Szkic i nieznany numer dają ten sam wynik: 404 bez zdradzania powodu.
  // EN: A draft and an unknown id give the same result: 404 without giving the reason.
  it.each(['szkic', 'nie-ma-takiego'])('%s daje 404 / gives 404', async (id) => {
    const response = await newsFeedApp.request(`/${id}`, {}, env);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });
});

// PL: Grupa testów zapisu: uczeń nie może dodać ani zmienić wpisu.
// EN: A group of write tests: a student cannot add or change an entry.
describe('zapis', () => {
  // PL: Zapis nie ma adresu: POST, PUT, PATCH i DELETE kończą się 404, a tabela zostaje taka sama.
  // EN: Writing has no route: POST, PUT, PATCH and DELETE end with 404, and the table stays the same.
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('%s nie dodaje ani nie zmienia wpisu / does not add or change an entry', async (method) => {
    const response = await newsFeedApp.request('/e1', { method }, env);

    expect(response.status).toBe(404);
    expect((await db.select().from(newsEntries)).map((entry) => entry.id).sort()).toEqual(['e1', 'szkic']);
  });
});
