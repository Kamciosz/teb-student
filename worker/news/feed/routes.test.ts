/**
 * PL: Test routera podtoru 3a. Sprawdza kształt odpowiedzi listy i wpisu, że szkic i nieznany numer dają 404, że nie ma adresów zapisu (uczeń nie doda wpisu) oraz kody 503 i 500 przy braku albo błędzie bazy.
 * EN: Test of the router of subtrack 3a. Checks the shape of the list and entry responses, that a draft and an unknown id give 404, that there are no write routes (a student cannot add an entry), and codes 503 and 500 for a missing or failing database.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/news/feed/routes.ts::newsFeedApp
 * @uses worker/news/feed/fakeD1.ts::createFakeD1
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Atrapa D1.
// EN: The D1 fake.
import { createFakeD1 } from './fakeD1';
// PL: Router, który sprawdzamy.
// EN: The router under test.
import { newsFeedApp } from './routes';

// PL: Chwila publikacji wpisu testowego w milisekundach: 2026-10-09 10:00 UTC.
// EN: The publication moment of the test entry in milliseconds: 2026-10-09 10:00 UTC.
const PUBLISHED_AT_MS = Date.UTC(2026, 9, 9, 10, 0, 0);

// PL: Treść wpisu testowego: jeden akapit.
// EN: The test entry content: one paragraph.
const BODY = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Zapisy do piątku.' }] }] };

// PL: Wiersz wpisu w kolejności kolumn tabeli: id, type, status, title, body, source, published_at, link_url, link_label.
// EN: An entry row in the table column order: id, type, status, title, body, source, published_at, link_url, link_label.
const ROW = ['e1', 'event', 'published', 'Turniej', JSON.stringify(BODY), 'Samorząd', PUBLISHED_AT_MS, 'https://example.com/r', 'Regulamin'];

// PL: Grupa testów listy wpisów.
// EN: A group of entry list tests.
describe('GET /', () => {
  // PL: Lista ma wpisy bez treści, z opisem i datą ISO.
  // EN: The list has entries without the content, with a description and an ISO date.
  it('zwraca wpisy z opisem i bez treści / returns entries with a description and without the content', async () => {
    const response = await newsFeedApp.request('/', {}, { DB: createFakeD1([ROW]).binding });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      entries: [{ id: 'e1', type: 'event', source: 'Samorząd', publishedAt: '2026-10-09T10:00:00.000Z', title: 'Turniej', excerpt: 'Zapisy do piątku.' }],
    });
  });

  // PL: Brak wiązania D1 to jasny kod 503, a nie wyjątek.
  // EN: A missing D1 binding is a clear 503, not an exception.
  it('bez bazy odpowiada 503 / answers 503 without a database', async () => {
    const response = await newsFeedApp.request('/');

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'database_unavailable' });
  });

  // PL: Błąd bazy to 500 bez treści błędu, żeby nic nie wyciekło do telefonu.
  // EN: A database error is 500 without the error text, so nothing leaks to the phone.
  it('przy błędzie bazy odpowiada 500 bez szczegółów / answers 500 without details on a database error', async () => {
    const fake = createFakeD1([], new Error('tajny szczegół bazy'));
    const response = await newsFeedApp.request('/', {}, { DB: fake.binding });

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
    const response = await newsFeedApp.request('/e1', {}, { DB: createFakeD1([ROW]).binding });
    const { entry } = (await response.json()) as { entry: Record<string, unknown> };

    expect(response.status).toBe(200);
    expect(entry.body).toEqual(BODY);
    expect(entry.linkUrl).toBe('https://example.com/r');
    expect(entry.linkLabel).toBe('Regulamin');
  });

  // PL: Gdy zapytanie nie zwróci wiersza (szkic albo nieznany numer), odpowiedź to 404 bez zdradzania powodu.
  // EN: When the query returns no row (a draft or an unknown id), the answer is 404 without giving the reason.
  it('szkic i nieznany numer dają 404 / a draft and an unknown id give 404', async () => {
    const response = await newsFeedApp.request('/szkic', {}, { DB: createFakeD1([]).binding });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });
});

// PL: Grupa testów zapisu: uczeń nie może dodać ani zmienić wpisu.
// EN: A group of write tests: a student cannot add or change an entry.
describe('zapis', () => {
  // PL: Zapis nie ma adresu: POST, PUT, PATCH i DELETE kończą się 404 i nie dotykają bazy.
  // EN: Writing has no route: POST, PUT, PATCH and DELETE end with 404 and do not touch the database.
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('%s nie dodaje ani nie zmienia wpisu / does not add or change an entry', async (method) => {
    const fake = createFakeD1([ROW]);
    const response = await newsFeedApp.request('/e1', { method }, { DB: fake.binding });

    expect(response.status).toBe(404);
    expect(fake.queries).toHaveLength(0);
  });
});
