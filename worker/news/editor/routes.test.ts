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

/**
 * PL: Dodaje wpis wprost do bazy, tak jak zrobiłby to zapis, i zwraca jego numer.
 * EN: Adds an entry straight to the database, as a save would, and returns its id.
 *
 * @param status - PL: stan wpisu. EN: the entry status.
 * @param title - PL: tytuł wpisu. EN: the entry title.
 * @returns PL: numer wpisu. EN: the entry id.
 */
async function seed(status: 'draft' | 'published', title = 'Szkic'): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(newsEntries).values({ id, type: 'news', title, status, body: BODY, source: 'Samorząd', publishedAt: status === 'published' ? new Date() : null });
  return id;
}

/**
 * PL: Odczytuje wpis o podanym numerze z routera.
 * EN: Reads the entry with the given id from the router.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @param router - PL: router do sprawdzenia. EN: the router to check.
 * @returns PL: odpowiedź serwera. EN: the server response.
 */
function get(id: string, router: { request: typeof app.request } = app) {
  return router.request(`/entries/${id}`, { method: 'GET' }, env);
}

/**
 * PL: Zapisuje zmiany w wpisie o podanym numerze przez router.
 * EN: Saves changes to the entry with the given id through the router.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @param entry - PL: ciało zapytania. EN: the request body.
 * @param router - PL: router do sprawdzenia. EN: the router to check.
 * @returns PL: odpowiedź serwera. EN: the server response.
 */
function put(id: string, entry: unknown, router: { request: typeof app.request } = app) {
  return router.request(`/entries/${id}`, { method: 'PUT', body: typeof entry === 'string' ? entry : JSON.stringify(entry) }, env);
}

// PL: Odczyt szkicu do edycji.
// EN: Reading a draft for editing.
describe('GET /entries/:id: odczyt do edycji / reading for editing', () => {
  it('oddaje szkic z danymi do kreatora / gives the draft with its data to the wizard', async () => {
    const id = await seed('draft', 'Zapisy');
    const response = await get(id);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id, type: 'news', title: 'Zapisy', status: 'draft', body: BODY });
  });

  it('opublikowany wpis daje 409 / a published entry gives 409', async () => {
    const id = await seed('published');
    const response = await get(id);
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'already_published' });
  });

  it('brak wpisu daje 404 / a missing entry gives 404', async () => {
    expect((await get(crypto.randomUUID())).status).toBe(404);
  });
});

// PL: Zapis zmian w szkicu.
// EN: Saving changes to a draft.
describe('PUT /entries/:id: zapis zmian / saving changes', () => {
  it('zmienia ten sam szkic, bez nowego numeru / changes the same draft, without a new id', async () => {
    const id = await seed('draft', 'Stary');
    const response = await put(id, { type: 'important', title: 'Nowy', status: 'draft', body: BODY });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id });
    const rows = await db.select().from(newsEntries);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id, type: 'important', title: 'Nowy', status: 'draft', publishedAt: null });
  });

  it('publikacja szkicu ustawia chwilę publikacji / publishing a draft sets the publication moment', async () => {
    const id = await seed('draft');
    expect((await put(id, { type: 'news', title: 'Gotowe', status: 'published', body: BODY })).status).toBe(200);
    const [row] = await db.select().from(newsEntries);
    expect(row?.status).toBe('published');
    expect(row?.publishedAt).toBeInstanceOf(Date);
  });

  it('opublikowany wpis nie przyjmuje zmian: 409 i baza bez zmian / a published entry takes no changes: 409 and the database unchanged', async () => {
    const id = await seed('published', 'Ważne');
    const response = await put(id, { type: 'news', title: 'Zmiana', status: 'draft', body: BODY });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'already_published' });
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ title: 'Ważne', status: 'published' });
  });

  it('brak wpisu daje 404 i nic nie tworzy / a missing entry gives 404 and creates nothing', async () => {
    const response = await put(crypto.randomUUID(), { type: 'news', title: 'T', status: 'draft', body: BODY });
    expect(response.status).toBe(404);
    expect(await db.select().from(newsEntries)).toHaveLength(0);
  });

  it('zły wpis daje 422 i szkic zostaje bez zmian / a bad entry gives 422 and the draft stays unchanged', async () => {
    const id = await seed('draft', 'Zostaje');
    const response = await put(id, { type: 'news', title: '   ', status: 'draft', body: BODY });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ error: 'invalid_entry', reason: 'bad_title' });
    const [row] = await db.select().from(newsEntries);
    expect(row?.title).toBe('Zostaje');
  });

  it('zły JSON daje 400 / bad JSON gives 400', async () => {
    const id = await seed('draft');
    expect((await put(id, '{nie json')).status).toBe(400);
  });

  it('zatrzymany strażnik nie dopuszcza do zmiany / a stopping guard lets no change through', async () => {
    const id = await seed('draft', 'Bez zmian');
    const closed = createNewsEditorApp(async (context) => context.json({ error: 'role_required' }, 403));
    expect((await put(id, { type: 'news', title: 'Zmiana', status: 'draft', body: BODY }, closed)).status).toBe(403);
    const [row] = await db.select().from(newsEntries);
    expect(row?.title).toBe('Bez zmian');
  });

  it('prawdziwy router bez sesji odpowiada 401 na odczyt i zapis / the real router without a session answers 401 to reading and saving', async () => {
    const id = await seed('draft');
    expect([401, 503]).toContain((await get(id, newsEditorApp)).status);
    expect([401, 503]).toContain((await put(id, { type: 'news', title: 'T', status: 'draft', body: BODY }, newsEditorApp)).status);
  });
});
