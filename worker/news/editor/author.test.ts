/**
 * PL: Test strażnika zapisu wpisów (requireNewsAuthor) na produkcyjnym routerze 3b, z prawdziwym logowaniem i rolami w D1. Sprawdza: bez sesji 401, uczeń bez roli 403, a redakcja, Samorząd i administrator zapisują wpis. Oblewa, gdy strażnik przestanie wymagać roli albo zacznie wymagać roli wyższej niż redakcja.
 * EN: Test of the entry write guard (requireNewsAuthor) on the production 3b router, with a real sign-in and roles in D1. Checks: 401 without a session, 403 for a student without a role, and the editorial team, the Council and the administrator save an entry. It fails when the guard stops requiring a role or starts requiring a role higher than the editorial one.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/editor/routes.ts::newsEditorApp
 * @uses worker/auth/email/testRuntime.ts::signIn
 * @uses worker/news/editor/routes.ts::newsEditorApp
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera (baza D1) i Drizzle.
// EN: The Worker test environment (the D1 database) and Drizzle.
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
// PL: Logowanie ucznia w teście, jak w testach podtorów 1a, 4a i 4b. To plik pomocniczy testów, więc importujemy go wprost.
// EN: Signing a student in within a test, as in the tests of subtracks 1a, 4a and 4b. It is a test helper file, so we import it directly.
import { createTestRuntime, signIn, type TestRuntime } from '../../auth/email/testRuntime';
// PL: Tabela ról (test nadaje rolę wprost w bazie, bo drzwi modułu admin nie mają funkcji nadającej role) i tabela wpisów.
// EN: The roles table (the test grants the role directly in the database, because the admin module door has no function that grants roles) and the entries table.
import { panelRoles, type PanelRole } from '../../db/schema/admin';
import { newsEntries } from '../../db/schema/news';
import { newsEditorApp } from './routes';

/** PL: Sekret podpisu sesji z testRuntime.ts. EN: The session signing secret from testRuntime.ts. */
const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/** PL: Wpis do zapisu: krótka aktualność jako szkic. EN: The entry to save: a short news item as a draft. */
const ENTRY = { type: 'news', title: 'Zapisy do piątku', status: 'draft', body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Zapisy trwają.' }] }] } };

/** PL: Baza testowa. EN: The test database. */
const db = drizzle(env.DB);

/** PL: Środowisko logowania testu (wspólne dla kont w jednym teście). EN: The sign-in environment of the test (shared by the accounts in one test). */
let login: TestRuntime;
/** PL: Ciasteczko sesji ucznia zalogowanego w bieżącym teście. EN: The session cookie of the student signed in the current test. */
let cookie: string;
/** PL: Numer ucznia zalogowanego w bieżącym teście. EN: The id of the student signed in the current test. */
let studentId: string;

/**
 * PL: Loguje ucznia kodem i zwraca jego ciasteczko sesji oraz numer konta.
 * EN: Signs a student in with a code and returns their session cookie and account id.
 *
 * @param email - PL: adres szkolny (zmyślony w teście). EN: the school address (invented for the test).
 * @returns PL: ciasteczko i numer konta. EN: the cookie and the account id.
 */
async function signInAs(email: string): Promise<{ cookie: string; id: string }> {
  const sessionCookie = await signIn(login, email);
  const session = await login.runtime.auth.api.getSession({ headers: new Headers({ cookie: sessionCookie }) });
  return { cookie: sessionCookie, id: session?.user.id ?? '' };
}

/**
 * PL: Wysyła wpis do produkcyjnego routera, jako zalogowany albo bez sesji.
 * EN: Sends an entry to the production router, signed in or without a session.
 *
 * @param signedIn - PL: czy dołączyć ciasteczko sesji. EN: whether to attach the session cookie.
 * @param entry - PL: ciało zapytania. EN: the request body.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function save(signedIn: boolean, entry: unknown = ENTRY): Response | Promise<Response> {
  return newsEditorApp.request('/entries', { method: 'POST', body: JSON.stringify(entry), headers: signedIn ? { cookie } : {} }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
}

/**
 * PL: Zapisuje zmiany w wpisie przez produkcyjny router, jako zalogowany uczeń.
 * EN: Saves changes to an entry through the production router, as a signed-in student.
 *
 * @param sessionCookie - PL: ciasteczko sesji edytującego. EN: the session cookie of the editor.
 * @param id - PL: numer wpisu. EN: the entry id.
 * @param entry - PL: ciało zapytania. EN: the request body.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function edit(sessionCookie: string, id: string, entry: unknown): Response | Promise<Response> {
  return newsEditorApp.request(`/entries/${id}`, { method: 'PUT', body: JSON.stringify(entry), headers: { cookie: sessionCookie } }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
}

// PL: Przed każdym testem zaloguj ucznia, wyczyść role i wpisy.
// EN: Before every test sign a student in and clear the roles and the entries.
beforeEach(async () => {
  // PL: Zaloguj ucznia kodem i odczytaj jego numer.
  // EN: Sign the student in with a code and read their id.
  login = createTestRuntime();
  ({ cookie, id: studentId } = await signInAs('jan.test@teb.edu.pl'));

  // PL: Wyczyść role i wpisy z poprzedniego testu.
  // EN: Clear the roles and entries of the previous test.
  await db.delete(panelRoles);
  await db.delete(newsEntries);
});

describe('requireNewsAuthor', () => {
  // PL: Bez sesji nic się nie zapisuje.
  // EN: Without a session nothing is saved.
  it('bez sesji daje 401 / without a session gives 401', async () => {
    expect((await save(false)).status).toBe(401);
    expect(await db.select().from(newsEntries)).toHaveLength(0);
  });

  // PL: Uczeń bez roli dostaje 403 i nic się nie zapisuje.
  // EN: A student without a role gets 403 and nothing is saved.
  it('uczeń bez roli dostaje 403 / a student without a role gets 403', async () => {
    expect((await save(true)).status).toBe(403);
    expect(await db.select().from(newsEntries)).toHaveLength(0);
  });

  // PL: Redakcja (najniższa rola) i role wyższe zapisują wpis.
  // EN: The editorial team (the lowest role) and higher roles save an entry.
  it.each<PanelRole>(['editor', 'council', 'admin'])('rola %s zapisuje wpis / the role %s saves an entry', async (role) => {
    // PL: Nadaj rolę, zapisz wpis i odczytaj bazę.
    // EN: Grant the role, save an entry and read the database.
    await db.insert(panelRoles).values({ userId: studentId, role, grantedAt: Date.now() });
    const response = await save(true);

    // PL: Odpowiedź 201, jeden wpis w bazie, a jego autor to zalogowany uczeń z sesji.
    // EN: The answer is 201, there is one entry in the database, and its author is the student signed in the session.
    expect(response.status).toBe(201);
    const rows = await db.select().from(newsEntries);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.authorUserId).toBe(studentId);
  });
});

describe('autor wpisu / the entry author', () => {
  // PL: Autor pochodzi z sesji, a pola author z ciała są ignorowane, nawet gdy wskazują prawdziwe konto innego ucznia.
  // EN: The author comes from the session, and the author fields in the body are ignored, even when they point to a real account of another student.
  it('pola author z ciała są ignorowane / author fields in the body are ignored', async () => {
    const other = await signInAs('anna.test@teb.edu.pl');
    await db.insert(panelRoles).values({ userId: studentId, role: 'editor', grantedAt: Date.now() });
    const response = await save(true, { ...ENTRY, author: other.id, authorUserId: other.id, author_user_id: other.id });
    expect(response.status).toBe(201);
    const [row] = await db.select().from(newsEntries);
    expect(row?.authorUserId).toBe(studentId);
  });

  // PL: Inny redaktor zmienia szkic, ale autorem zostaje ten, kto zapisał wpis. Test sprawdza też, że zmiana naprawdę przeszła.
  // EN: Another editor changes the draft, but the author stays the one who saved the entry. The test also checks that the change really went through.
  it('edycja przez innego redaktora nie zmienia autora / an edit by another editor does not change the author', async () => {
    const editor = await signInAs('anna.test@teb.edu.pl');
    await db.insert(panelRoles).values([
      { userId: studentId, role: 'editor', grantedAt: Date.now() },
      { userId: editor.id, role: 'editor', grantedAt: Date.now() },
    ]);
    const created = await save(true);
    const { id } = (await created.json()) as { id: string };

    const response = await edit(editor.cookie, id, { ...ENTRY, title: 'Poprawka redakcji', author_user_id: editor.id });
    expect(response.status).toBe(200);
    const [row] = await db.select().from(newsEntries);
    expect(row).toMatchObject({ title: 'Poprawka redakcji', authorUserId: studentId });
  });
});

describe('requireNewsAuthor na trasach edycji / on the editing routes', () => {
  // PL: Odczyt i zapis szkicu wymagają tej samej roli co zapis nowego wpisu.
  // EN: Reading and saving a draft require the same role as saving a new entry.
  const routes: Array<[string, string]> = [
    ['GET', '/entries/00000000-0000-4000-8000-000000000001'],
    ['PUT', '/entries/00000000-0000-4000-8000-000000000001'],
  ];

  it.each(routes)('%s %s: bez sesji daje 401 / without a session gives 401', async (method, path) => {
    const response = await newsEditorApp.request(path, { method, body: method === 'GET' ? undefined : JSON.stringify(ENTRY) }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
    expect(response.status).toBe(401);
  });

  it.each(routes)('%s %s: uczeń bez roli daje 403 / a student without a role gives 403', async (method, path) => {
    const response = await newsEditorApp.request(path, { method, body: method === 'GET' ? undefined : JSON.stringify(ENTRY), headers: { cookie } }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
    expect(response.status).toBe(403);
  });
});
