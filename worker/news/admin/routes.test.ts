/**
 * PL: Test routera podtoru 3c na prawdziwej bazie D1 z testowego Workera. Sprawdza listę ze szkicami, publikację szkicu (bez przesuwania wpisu już opublikowanego), usuwanie, błędy (404, 409, 500) oraz dostęp: 401 bez sesji i 403 dla ucznia bez roli na każdym adresie, bez zmian w bazie. Szkice i usunięte wpisy sprawdza na odpowiedziach HTTP routera ucznia (podtor 3a, przez jego drzwi), nie na ekranie. Rolę zastępuje zaślepka, bo role robi podtor 8.
 * EN: Test of the subtrack 3c router on a real D1 database of the test Worker. Checks the list with drafts, publishing a draft (without moving an already published entry), deleting, errors (404, 409, 500) and access: 401 without a session and 403 for a student without a role on every route, with no database change. Drafts and deleted entries are checked on the HTTP responses of the student router (subtrack 3a, through its door), not on the screen. A stub replaces the role, because subtrack 8 builds roles.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/admin/routes.ts::createNewsAdminApp
 * @uses worker/news/admin/routes.ts::newsAdminApp
 * @uses worker/news/feed/index.ts::newsFeedApp
 * @uses worker/auth/email/testRuntime.ts::signIn
 * @used_by vitest.config.ts::include
 */

// PL: Środowisko testowe Workera (baza D1 i ustawienia).
// EN: The Worker test environment (the D1 database and the settings).
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Logowanie ucznia w teście. To plik pomocniczy testów, więc importujemy go wprost, jak w testach podtorów 4a i 4b.
// EN: Signing a student in within a test. It is a test helper file, so we import it directly, as in the tests of subtracks 4a and 4b.
import { createTestRuntime, signIn } from '../../auth/email/testRuntime';
import { newsEntries } from '../../db/schema/news';
// PL: Router ucznia z drzwi podtoru 3a.
// EN: The student router from the door of subtrack 3a.
import { newsFeedApp } from '../feed';
import { createNewsAdminApp, newsAdminApp } from './routes';

/** PL: Sekret podpisu sesji z testRuntime.ts. EN: The session signing secret from testRuntime.ts. */
const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/** PL: Zaślepka roli: wpuszcza każdego. Prawdziwy strażnik przyjdzie z rolami podtoru 8. EN: The role stub: lets everyone in. The real guard comes with the roles of subtrack 8. */
const app = createNewsAdminApp((_context, next) => next());

/** PL: Baza testowa. EN: The test database. */
const db = drizzle(env.DB);

/** PL: Treść wpisu testowego: jeden akapit. EN: The test entry content: one paragraph. */
const BODY = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Zapisy do piątku.' }] }] };

/** PL: Chwila publikacji wpisu testowego: 2026-10-09 10:00 UTC. EN: The publication moment of the test entry: 2026-10-09 10:00 UTC. */
const PUBLISHED_AT = new Date(Date.UTC(2026, 9, 9, 10, 0, 0));

/**
 * PL: Wysyła zapytanie do routera z zaślepką roli.
 * EN: Sends a request to the router with the role stub.
 *
 * @param path - PL: adres względem routera. EN: the path relative to the router.
 * @param method - PL: metoda HTTP. EN: the HTTP method.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
async function send(path: string, method = 'GET'): Promise<Response> {
  return app.request(path, { method }, env);
}

/**
 * PL: Czyta opublikowane wpisy tak, jak widzi je uczeń: przez router podtoru 3a.
 * EN: Reads the published entries as a student sees them: through the subtrack 3a router.
 *
 * @returns PL: numery wpisów z listy ucznia. EN: the entry ids from the student list.
 */
async function studentList(): Promise<string[]> {
  // PL: Zapytanie do listy ucznia i wyciągnięcie numerów.
  // EN: A request to the student list and picking out the ids.
  const { entries } = (await (await newsFeedApp.request('/', {}, env)).json()) as { entries: { id: string }[] };
  return entries.map((entry) => entry.id);
}

/**
 * PL: Czyta stan wpisów prosto z bazy: numer i stan, od numeru.
 * EN: Reads the entry state straight from the database: the id and the status, ordered by id.
 *
 * @returns PL: pary numer i stan. EN: id and status pairs.
 */
async function rows(): Promise<[string, string][]> {
  // PL: Wybierz wszystkie wiersze i posortuj po numerze.
  // EN: Select all rows and sort them by id.
  return (await db.select().from(newsEntries)).map((row): [string, string] => [row.id, row.status]).sort();
}

// PL: Przed każdym testem są trzy wpisy: opublikowany, szkic i drugi szkic.
// EN: Before every test there are three entries: a published one, a draft and another draft.
beforeEach(async () => {
  await db.delete(newsEntries);
  await db.insert(newsEntries).values([
    { id: 'opublikowany', type: 'event', status: 'published', title: 'Turniej', body: BODY, source: 'Samorząd', publishedAt: PUBLISHED_AT },
    { id: 'szkic', type: 'news', status: 'draft', title: 'Szkic', body: BODY, source: 'Samorząd', publishedAt: null },
    { id: 'szkic-2', type: 'sport', status: 'draft', title: 'Drugi szkic', body: BODY, source: 'Samorząd', publishedAt: null },
  ]);
});

// PL: Lista panelu: szkice pierwsze, bez treści.
// EN: The panel list: drafts first, without the content.
describe('GET /', () => {
  // PL: Panel widzi szkice, a uczeń na swojej liście ich nie ma. To sprawdzenie na odpowiedziach HTTP obu routerów.
  // EN: The panel sees drafts, and the student does not have them on their list. A check on the HTTP responses of both routers.
  it('pokazuje szkice w panelu, a uczniowi nie / shows drafts in the panel and not to a student', async () => {
    const response = await send('/');
    const { entries } = (await response.json()) as { entries: Record<string, unknown>[] };

    expect(response.status).toBe(200);
    expect(entries.map((entry) => [entry.id, entry.status]).sort()).toEqual([['opublikowany', 'published'], ['szkic', 'draft'], ['szkic-2', 'draft']]);
    expect(entries.at(-1)).toEqual({ id: 'opublikowany', type: 'event', status: 'published', title: 'Turniej', source: 'Samorząd', publishedAt: '2026-10-09T10:00:00.000Z' });
    expect(entries.every((entry) => !('body' in entry))).toBe(true);
    expect(await studentList()).toEqual(['opublikowany']);
    expect((await newsFeedApp.request('/szkic', {}, env)).status).toBe(404);
  });
});

// PL: Wpis w korekcie widać na liście panelu, a publikacja go nie rusza.
// EN: An entry in review is visible on the panel list, and publishing does not touch it.
describe('wpis w korekcie / entry in review', () => {
  // PL: Wpis „in_review” wstawiony w teście. Lista panelu go zwraca, a publikacja daje 409 in_review i nie zmienia jego stanu.
  // EN: An "in_review" entry inserted in the test. The panel list returns it, and publishing gives 409 in_review and does not change its state.
  it('lista pokazuje wpis w korekcie, a publikacja daje 409 in_review i go nie zmienia / the list shows an entry in review, and publishing gives 409 in_review and does not change it', async () => {
    await db.insert(newsEntries).values({ id: 'w-korekcie', type: 'news', status: 'in_review', title: 'W korekcie', body: BODY, source: 'Samorząd', publishedAt: null });

    const { entries } = (await (await send('/')).json()) as { entries: { id: string; status: string }[] };
    expect(entries.find((entry) => entry.id === 'w-korekcie')?.status).toBe('in_review');

    const response = await send('/w-korekcie/publish', 'POST');
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'in_review' });
    expect((await rows()).find(([id]) => id === 'w-korekcie')).toEqual(['w-korekcie', 'in_review']);
  });
});

// PL: Publikacja szkicu.
// EN: Publishing a draft.
describe('POST /:id/publish', () => {
  // PL: Po publikacji wpis jest u ucznia, z chwilą publikacji.
  // EN: After publishing, the entry is on the student's list, with a publication moment.
  it('publikuje szkic i uczeń go widzi / publishes a draft and a student sees it', async () => {
    const response = await send('/szkic/publish', 'POST');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 'szkic' });
    expect(await studentList()).toContain('szkic');
    expect((await newsFeedApp.request('/szkic', {}, env)).status).toBe(200);
    expect((await db.select().from(newsEntries)).find((row) => row.id === 'szkic')?.publishedAt).toBeInstanceOf(Date);
  });

  // PL: Drugie dotknięcie nie przesuwa wpisu: 409 i ta sama chwila publikacji.
  // EN: A second tap does not move the entry: 409 and the same publication moment.
  it('wpis już opublikowany daje 409 i zachowuje chwilę publikacji / an already published entry gives 409 and keeps its publication moment', async () => {
    const response = await send('/opublikowany/publish', 'POST');

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'already_published' });
    expect((await db.select().from(newsEntries)).find((row) => row.id === 'opublikowany')?.publishedAt).toEqual(PUBLISHED_AT);
  });

  // PL: Nieznany numer to 404 i nic się nie zmienia.
  // EN: An unknown id is 404 and nothing changes.
  it('nieznany numer daje 404 / an unknown id gives 404', async () => {
    expect((await send('/nie-ma/publish', 'POST')).status).toBe(404);
    expect(await rows()).toEqual([['opublikowany', 'published'], ['szkic', 'draft'], ['szkic-2', 'draft']]);
  });
});

// PL: Usuwanie wpisu.
// EN: Deleting an entry.
describe('DELETE /:id', () => {
  // PL: Po usunięciu opublikowanego wpisu uczeń dostaje 404, a reszta zostaje.
  // EN: After deleting a published entry the student gets 404, and the rest stays.
  it('usuwa opublikowany wpis i znika on uczniowi / deletes a published entry and it disappears for a student', async () => {
    const response = await send('/opublikowany', 'DELETE');

    expect(response.status).toBe(200);
    expect((await newsFeedApp.request('/opublikowany', {}, env)).status).toBe(404);
    expect(await studentList()).toEqual([]);
    expect(await rows()).toEqual([['szkic', 'draft'], ['szkic-2', 'draft']]);
  });

  // PL: Usunięcie szkicu i nieznany numer.
  // EN: Deleting a draft and an unknown id.
  it('usuwa szkic, a nieznany numer daje 404 / deletes a draft and an unknown id gives 404', async () => {
    expect((await send('/szkic', 'DELETE')).status).toBe(200);
    expect((await send('/szkic', 'DELETE')).status).toBe(404);
    expect(await rows()).toEqual([['opublikowany', 'published'], ['szkic-2', 'draft']]);
  });
});

// PL: Błąd bazy to 500 bez szczegółów.
// EN: A database error is 500 without details.
describe('błąd bazy / database error', () => {
  it.each([['/', 'GET'], ['/szkic/publish', 'POST'], ['/szkic', 'DELETE']])('%s %s odpowiada 500 bez szczegółów / answers 500 without details', async (path, method) => {
    const failing = { DB: { prepare: () => { throw new Error('tajny szczegół bazy'); } } };

    const response = await app.request(path, { method }, failing);

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('tajny');
  });
});

// PL: Dostęp: bez sesji 401, uczeń bez roli 403, w obu przypadkach baza bez zmian.
// EN: Access: 401 without a session, 403 for a student without a role, and the database unchanged in both cases.
describe('dostęp / access', () => {
  /** PL: Trzy adresy routera: odczyt, publikacja i usunięcie. EN: The three router routes: reading, publishing and deleting. */
  const ROUTES: [string, string][] = [['/', 'GET'], ['/szkic/publish', 'POST'], ['/opublikowany', 'DELETE']];

  // PL: Bez ciasteczka każdy adres daje 401.
  // EN: Without a cookie every route gives 401.
  it.each(ROUTES)('%s %s bez sesji daje 401 / without a session gives 401', async (path, method) => {
    const response = await newsAdminApp.request(path, { method }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });

    expect(response.status).toBe(401);
    expect(await rows()).toEqual([['opublikowany', 'published'], ['szkic', 'draft'], ['szkic-2', 'draft']]);
  });

  // PL: Zalogowany uczeń bez roli nie dostaje ani listy szkiców, ani możliwości publikacji i usunięcia.
  // EN: A signed-in student without a role gets neither the list of drafts nor the ability to publish or delete.
  it.each(ROUTES)('%s %s dla ucznia bez roli daje 403 / for a student without a role gives 403', async (path, method) => {
    const cookie = await signIn(createTestRuntime(), 'jan.test@teb.edu.pl');

    const response = await newsAdminApp.request(path, { method, headers: { cookie } }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });

    expect(response.status).toBe(403);
    expect(await response.text()).not.toContain('Szkic');
    expect(await rows()).toEqual([['opublikowany', 'published'], ['szkic', 'draft'], ['szkic-2', 'draft']]);
  });
});
