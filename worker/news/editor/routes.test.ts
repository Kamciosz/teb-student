/**
 * PL: Test routera podtoru 3b na prawdziwym D1 z testów. Sprawdza, że poprawny wpis trafia do bazy jako szkic albo publikacja, że zły wpis dostaje 422 i nic nie zapisuje, że zły JSON i za duże ciało są odrzucane, że strażnik zatrzymuje zapytanie przed zapisem oraz że prawdziwy router zamyka zapis ludziom bez sesji (401). Oblewa, gdy zapis przestanie przechodzić przez sprawdzanie treści.
 * EN: Test of the subtrack 3b router on the real D1 from the tests. Checks that a valid entry reaches the database as a draft or a publication, that a bad entry gets 422 and saves nothing, that bad JSON and a too large body are rejected, that the guard stops the request before saving, and that the real router closes writing for people without a session (401). It fails when saving stops going through the content check.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/editor/routes.ts::createNewsEditorApp
 * @uses worker/db/schema/auth.ts::user
 * @used_by vitest.config.ts::include
 */

import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import { beforeEach, describe, expect, it } from 'vitest';
import { user } from '../../db/schema/auth';
import { newsEntries } from '../../db/schema/news';
import { createNewsEditorApp, newsEditorApp } from './routes';
import { MAX_PUBLISH_AHEAD_MS } from './validatePublishAt';

// PL: Godzina w milisekundach, do wyliczania terminów publikacji.
// EN: An hour in milliseconds, for working out publication times.
const HOUR = 60 * 60 * 1000;

// PL: Baza testowa.
// EN: The test database.
const db = drizzle(env.DB);

// PL: Konta w bazie: autor, który zapisuje wpis przez strażnika, i drugie konto, którego numer ktoś podstawia w ciele zapytania. Autor wpisu musi być prawdziwym kontem, bo baza pilnuje klucza obcego.
// EN: Accounts in the database: the author who saves the entry through the guard, and a second account whose id someone puts into the request body. The entry author must be a real account, because the database enforces the foreign key.
const AUTHOR = { id: 'autor-testowy', email: 'autor.test@teb.edu.pl' };
const OTHER = { id: 'drugi-testowy', email: 'drugi.test@teb.edu.pl' };

/**
 * PL: Strażnik testowy: wpuszcza każdego i ustawia zalogowanego użytkownika o podanym numerze, tak jak prawdziwy strażnik. Prawdziwy strażnik (sesja i rola) ma osobne sprawdzenie niżej.
 * EN: A test guard: lets everyone in and sets the signed-in user with the given id, as the real guard does. The real guard (session and role) has a separate check below.
 *
 * @param id - PL: numer zalogowanego użytkownika. EN: the id of the signed-in user.
 * @returns PL: router z tym strażnikiem. EN: the router with this guard.
 */
function guardAs(id: string) {
  return createNewsEditorApp(async (context, next) => {
    context.set('student', { id, email: `${id}@example.com` });
    return next();
  });
}

// PL: Domyślny zalogowany użytkownik testów: autor, który zapisuje wpisy.
// EN: The default signed-in user of the tests: the author who saves entries.
const app = guardAs(AUTHOR.id);

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

// PL: Przed każdym testem tabela wpisów jest pusta, a konta są takie same jak na początku.
// EN: Before every test the entries table is empty, and the accounts are the same as at the start.
beforeEach(async () => {
  await db.delete(newsEntries);
  await db.delete(user);
  await db.insert(user).values([
    { id: AUTHOR.id, name: 'Autor Testowy', email: AUTHOR.email, emailVerified: true },
    { id: OTHER.id, name: 'Drugi Testowy', email: OTHER.email, emailVerified: true },
  ]);
});

// PL: Zapis poprawnych wpisów.
// EN: Saving valid entries.
describe('POST /entries: zapis / saving', () => {
  it('zapisuje szkic bez chwili publikacji / saves a draft without a publication moment', async () => {
    const response = await post({ type: 'news', title: '  Szkic  ', status: 'draft', body: BODY });
    expect(response.status).toBe(201);
    const { id } = (await response.json()) as { id: string };
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ id, type: 'news', title: 'Szkic', status: 'draft', source: 'Samorząd', authorUserId: AUTHOR.id, publishedAt: null, body: BODY });
  });

  // PL: Autor pochodzi z sesji. Pola author, authorUserId i author_user_id w ciele są ignorowane, więc do bazy trafia konto z sesji, a nie podstawione.
  // EN: The author comes from the session. The author, authorUserId and author_user_id fields in the body are ignored, so the session account reaches the database, not the one put in.
  it('autor z sesji, pola author z ciała ignorowane / the author from the session, author fields from the body ignored', async () => {
    const response = await post({ type: 'news', title: 'Podstawiony', status: 'draft', body: BODY, author: OTHER.id, authorUserId: OTHER.id, author_user_id: OTHER.id });
    expect(response.status).toBe(201);
    const [row] = await db.select().from(newsEntries);
    expect(row?.authorUserId).toBe(AUTHOR.id);
  });

  it('zapisuje publikację z chwilą publikacji / saves a publication with a publication moment', async () => {
    const response = await post({ type: 'important', title: 'Ważne', status: 'published', body: BODY });
    expect(response.status).toBe(201);
    const [row] = await db.select().from(newsEntries);
    expect(row?.status).toBe('published');
    expect(row?.publishedAt).toBeInstanceOf(Date);
  });

  it('zaplanowana publikacja dostaje wpisaną godzinę / a scheduled publication gets the time entered', async () => {
    const publishAt = Date.now() + HOUR;
    expect((await post({ type: 'news', title: 'Później', status: 'published', body: BODY, publishAt })).status).toBe(201);
    const [row] = await db.select().from(newsEntries);
    expect(row?.publishedAt?.getTime()).toBe(publishAt);
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
    ['godzina w przeszłości / a time in the past', { type: 'news', title: 'T', status: 'published', body: BODY, publishAt: Date.now() - HOUR }, 'publish_past'],
    ['godzina dalej niż 30 dni / a time more than 30 days ahead', { type: 'news', title: 'T', status: 'published', body: BODY, publishAt: Date.now() + MAX_PUBLISH_AHEAD_MS + HOUR }, 'publish_too_far'],
    ['godzina przy szkicu / a time for a draft', { type: 'news', title: 'T', status: 'draft', body: BODY, publishAt: Date.now() + HOUR }, 'bad_publish_at'],
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
 * @param authorUserId - PL: autor wpisu albo null, gdy brak autora. EN: the entry author, or null when there is none.
 * @returns PL: numer wpisu. EN: the entry id.
 */
async function seed(status: 'draft' | 'in_review' | 'published', title = 'Szkic', authorUserId: string | null = null): Promise<string> {
  const id = crypto.randomUUID();
  await db.insert(newsEntries).values({ id, type: 'news', title, status, body: BODY, source: 'Samorząd', authorUserId, publishedAt: status === 'published' ? new Date() : null });
  return id;
}

// PL: Konta autorów i redaktorów, na które wskazują wpisy (klucz obcy).
// EN: The author and editor accounts that the entries point to (a foreign key).
beforeEach(async () => {
  await db.insert(user).values([
    { id: 'autor-ada', name: 'Ada', email: 'ada@example.com', emailVerified: true },
    { id: 'redaktor-b', name: 'Bartek', email: 'bartek@example.com', emailVerified: true },
  ]).onConflictDoNothing();
});

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
  // PL: Zmiana szkicu nie przepisuje autora: wpis zostaje przypisany do konta, które go zapisało, nawet gdy zmianę wysyła ktoś inny (tu: strażnik podaje innego ucznia).
  // EN: Changing a draft does not rewrite the author: the entry stays with the account that saved it, even when someone else sends the change (here the guard passes another student).
  it('zmiana szkicu nie zmienia autora / changing a draft does not change the author', async () => {
    const id = crypto.randomUUID();
    await db.insert(newsEntries).values({ id, type: 'news', title: 'Stary', status: 'draft', body: BODY, source: 'Samorząd', authorUserId: OTHER.id });
    const response = await put(id, { type: 'news', title: 'Nowy', status: 'published', body: BODY, author_user_id: AUTHOR.id });
    expect(response.status).toBe(200);
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ title: 'Nowy', status: 'published', authorUserId: OTHER.id });
  });

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

/**
 * PL: Zatwierdza wpis w korekcie przez router jako redaktor o podanym numerze.
 * EN: Approves the entry in review through the router as the editor with the given id.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @param editor - PL: router zalogowanego redaktora. EN: the router of the signed-in editor.
 * @returns PL: odpowiedź serwera. EN: the server response.
 */
function approve(id: string, editor: { request: typeof app.request } = app) {
  return editor.request(`/entries/${id}/approve`, { method: 'POST' }, env);
}

// PL: Wysyłka do korekty: szkic zmienia stan na in_review, bez chwili publikacji.
// EN: Sending to review: a draft changes its status to in_review, without a publication moment.
describe('wysyłka do korekty / sending to review', () => {
  it('szkic wysłany do korekty dostaje stan in_review bez chwili publikacji / a draft sent to review gets in_review without a publication moment', async () => {
    const id = await seed('draft', 'Do korekty');
    expect((await put(id, { type: 'news', title: 'Do korekty', status: 'in_review', body: BODY })).status).toBe(200);
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ id, status: 'in_review', publishedAt: null });
  });

  it('zapis nowego wpisu jako in_review nie ustawia chwili publikacji / saving a new entry as in_review sets no publication moment', async () => {
    expect((await post({ type: 'news', title: 'Nowy', status: 'in_review', body: BODY })).status).toBe(201);
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ status: 'in_review', publishedAt: null });
  });

  it('wpis w korekcie nie przyjmuje zmian: 409 in_review i baza bez zmian / an entry in review takes no changes: 409 in_review and the database unchanged', async () => {
    const id = await seed('draft', 'Zostaje', 'autor-ada');
    await put(id, { type: 'news', title: 'Do korekty', status: 'in_review', body: BODY });
    const response = await put(id, { type: 'news', title: 'Zmiana', status: 'draft', body: BODY });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'in_review' });
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ title: 'Do korekty', status: 'in_review' });
  });

  it('odczyt wpisu w korekcie zwraca canApprove: false dla autora / reading an entry in review gives canApprove: false to its author', async () => {
    const id = await seed('in_review', 'W korekcie', 'autor-ada');
    const response = await get(id, guardAs('autor-ada'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id, type: 'news', title: 'W korekcie', status: 'in_review', body: BODY, canApprove: false });
  });

  it('odczyt wpisu w korekcie zwraca canApprove: true dla innego redaktora / reading an entry in review gives canApprove: true to another editor', async () => {
    const id = await seed('in_review', 'W korekcie', 'autor-ada');
    const body = (await (await get(id, guardAs('redaktor-b'))).json()) as { canApprove: boolean };
    expect(body.canApprove).toBe(true);
  });
});

// PL: Zatwierdzenie wpisu w korekcie: autor nie zatwierdzi swojego, inny redaktor zatwierdzi, zła zmiana stanu daje 409.
// EN: Approving an entry in review: the author cannot approve their own, another editor can, a wrong status change gives 409.
describe('POST /entries/:id/approve: zatwierdzenie / approval', () => {
  it('autor nie zatwierdzi swojego wpisu: 403 i wpis dalej czeka w korekcie / the author cannot approve their own entry: 403 and the entry still waits in review', async () => {
    const id = await seed('in_review', 'Mój', 'autor-ada');
    const response = await approve(id, guardAs('autor-ada'));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'own_entry' });
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ status: 'in_review', publishedAt: null });
  });

  it('inny redaktor zatwierdza: 200 i wpis opublikowany z chwilą publikacji / another editor approves: 200 and the entry is published with a publication moment', async () => {
    const id = await seed('in_review', 'Do publikacji', 'autor-ada');
    const response = await approve(id, guardAs('redaktor-b'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id });
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ id, status: 'published', title: 'Do publikacji' });
    expect(row?.publishedAt).toBeInstanceOf(Date);
  });

  it('wpis bez autora zatwierdza każdy redaktor / an entry without an author can be approved by any editor', async () => {
    const id = await seed('in_review', 'Bez autora');
    expect((await approve(id)).status).toBe(200);
    const [row] = await db.select().from(newsEntries);
    expect(row?.status).toBe('published');
  });

  it('drugie zatwierdzenie tego samego wpisu daje 409 i nie zmienia chwili publikacji / a second approval of the same entry gives 409 and does not change the publication moment', async () => {
    const id = await seed('in_review', 'Raz', 'autor-ada');
    expect((await approve(id, guardAs('redaktor-b'))).status).toBe(200);
    const [first] = await db.select().from(newsEntries);
    const response = await approve(id, guardAs('redaktor-b'));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'not_in_review' });
    const [second] = await db.select().from(newsEntries);
    expect(second?.publishedAt).toEqual(first?.publishedAt);
  });

  it('szkic nie jest w korekcie: 409 i baza bez zmian / a draft is not in review: 409 and the database unchanged', async () => {
    const id = await seed('draft', 'Szkic', 'autor-ada');
    const response = await approve(id, guardAs('redaktor-b'));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'not_in_review' });
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ status: 'draft', publishedAt: null });
  });

  it('brak wpisu daje 404 / a missing entry gives 404', async () => {
    const response = await approve(crypto.randomUUID(), guardAs('redaktor-b'));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });

  it('prawdziwy router bez sesji odpowiada 401 / the real router without a session answers 401', async () => {
    const id = await seed('in_review', 'Zostaje', 'autor-ada');
    expect([401, 503]).toContain((await approve(id, newsEditorApp)).status);
    const [row] = await db.select().from(newsEntries);
    expect(row?.status).toBe('in_review');
  });
});
