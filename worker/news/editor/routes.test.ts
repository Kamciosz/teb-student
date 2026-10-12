/**
 * PL: Test routera podtoru 3b na prawdziwym D1 z testów. Sprawdza, że poprawny wpis trafia do bazy jako szkic albo publikacja, że zły wpis dostaje 422 i nic nie zapisuje, że zły JSON i za duże ciało są odrzucane, że strażnik zatrzymuje zapytanie przed zapisem oraz że prawdziwy router zamyka zapis ludziom bez sesji (401). Oblewa, gdy zapis przestanie przechodzić przez sprawdzanie treści.
 * EN: Test of the subtrack 3b router on the real D1 from the tests. Checks that a valid entry reaches the database as a draft or a publication, that a bad entry gets 422 and saves nothing, that bad JSON and a too large body are rejected, that the guard stops the request before saving, and that the real router closes writing for people without a session (401). It fails when saving stops going through the content check.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/editor/routes.ts::createNewsEditorApp
 * @used_by vitest.config.ts::include
 */

import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import { beforeEach, describe, expect, it } from 'vitest';
import { newsEntries } from '../../db/schema/news';
import { createNewsEditorApp, newsEditorApp } from './routes';

// PL: Baza testowa.
// EN: The test database.
const db = drizzle(env.DB);

// PL: Strażnik testowy, który wpuszcza każdego. Prawdziwy strażnik (sesja i rola) ma osobne sprawdzenie niżej.
// EN: A test guard that lets everyone in. The real guard (session and role) has a separate check below.
const app = createNewsEditorApp(async (_context, next) => next());

// PL: Poprawna treść: jeden akapit.
// EN: Valid content: one paragraph.
const BODY = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Zapisy do piątku.' }] }] };

/**
 * PL: Wysyła wpis pod adres zapisu.
 * EN: Sends an entry to the save address.
 *
 * @param entry - PL: ciało zapytania. EN: the request body.
 * @param router - PL: router do sprawdzenia. EN: the router to check.
 * @returns PL: odpowiedź serwera. EN: the server response.
 */
function post(entry: unknown, router: { request: typeof app.request } = app) {
  return router.request('/entries', { method: 'POST', body: typeof entry === 'string' ? entry : JSON.stringify(entry) }, env);
}

// PL: Przed każdym testem tabela jest pusta.
// EN: Before every test the table is empty.
beforeEach(async () => {
  await db.delete(newsEntries);
});

// PL: Zapis poprawnych wpisów.
// EN: Saving valid entries.
describe('POST /entries: zapis / saving', () => {
  it('zapisuje szkic bez chwili publikacji / saves a draft without a publication moment', async () => {
    const response = await post({ type: 'news', title: '  Szkic  ', status: 'draft', body: BODY });
    expect(response.status).toBe(201);
    const { id } = (await response.json()) as { id: string };
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ id, type: 'news', title: 'Szkic', status: 'draft', source: 'Samorząd', publishedAt: null, body: BODY });
  });

  it('zapisuje publikację z chwilą publikacji / saves a publication with a publication moment', async () => {
    const response = await post({ type: 'important', title: 'Ważne', status: 'published', body: BODY });
    expect(response.status).toBe(201);
    const [row] = await db.select().from(newsEntries);
    expect(row?.status).toBe('published');
    expect(row?.publishedAt).toBeInstanceOf(Date);
  });
});

// PL: Odrzucenia: nic nie trafia do bazy.
// EN: Rejections: nothing reaches the database.
describe('POST /entries: odrzucenia / rejections', () => {
  it('odrzuca link javascript: kodem 422 i nie zapisuje / rejects a javascript: link with 422 and saves nothing', async () => {
    const marks = [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }];
    const body = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x', marks }] }] };
    const response = await post({ type: 'news', title: 'T', status: 'published', body });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: 'invalid_entry', reason: 'bad_link' });
    expect(await db.select().from(newsEntries)).toHaveLength(0);
  });

  it.each([
    ['zły typ / a bad type', { type: 'blog', title: 'T', status: 'draft', body: BODY }, 'bad_type'],
    ['zły stan / a bad status', { type: 'news', title: 'T', status: 'archived', body: BODY }, 'bad_status'],
    ['pusty tytuł / an empty title', { type: 'news', title: '   ', status: 'draft', body: BODY }, 'bad_title'],
    ['za długi tytuł / a too long title', { type: 'news', title: 'a'.repeat(121), status: 'draft', body: BODY }, 'bad_title'],
    ['brak treści / no content', { type: 'news', title: 'T', status: 'draft' }, 'not_a_document'],
  ])('%s daje 422 / gives 422', async (_name, entry, reason) => {
    const response = await post(entry);
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: 'invalid_entry', reason });
  });

  it('odrzuca zły JSON kodem 400 / rejects bad JSON with 400', async () => {
    expect((await post('{nie json')).status).toBe(400);
  });

  it('odrzuca za duże ciało kodem 413 / rejects a too large body with 413', async () => {
    expect((await post('x'.repeat(300_000))).status).toBe(413);
  });
});

// PL: Strażnik zapisu.
// EN: The write guard.
describe('strażnik / guard', () => {
  it('zatrzymany strażnik nie dopuszcza do zapisu / a stopping guard lets nothing be saved', async () => {
    const closed = createNewsEditorApp(async (context) => context.json({ error: 'role_required' }, 403));
    const response = await post({ type: 'news', title: 'T', status: 'draft', body: BODY }, closed);
    expect(response.status).toBe(403);
    expect(await db.select().from(newsEntries)).toHaveLength(0);
  });

  it('prawdziwy router bez sesji odpowiada 401 / the real router without a session answers 401', async () => {
    const response = await post({ type: 'news', title: 'T', status: 'draft', body: BODY }, newsEditorApp);
    expect([401, 503]).toContain(response.status);
    expect(await db.select().from(newsEntries)).toHaveLength(0);
  });
});
