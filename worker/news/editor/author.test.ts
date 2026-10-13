/**
 * PL: Test strażnika zapisu wpisów (requireNewsAuthor) na produkcyjnym routerze 3b, z prawdziwym logowaniem i rolami w D1. Sprawdza: bez sesji 401, uczeń bez roli 403, a redakcja, Samorząd i administrator zapisują wpis. Oblewa, gdy strażnik przestanie wymagać roli albo zacznie wymagać roli wyższej niż redakcja.
 * EN: Test of the entry write guard (requireNewsAuthor) on the production 3b router, with a real sign-in and roles in D1. Checks: 401 without a session, 403 for a student without a role, and the editorial team, the Council and the administrator save an entry. It fails when the guard stops requiring a role or starts requiring a role higher than the editorial one.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/editor/routes.ts::newsEditorApp
 * @uses worker/auth/email/testRuntime.ts::signIn
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
import { createTestRuntime, signIn } from '../../auth/email/testRuntime';
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

/** PL: Ciasteczko sesji ucznia zalogowanego w bieżącym teście. EN: The session cookie of the student signed in the current test. */
let cookie: string;
/** PL: Numer ucznia zalogowanego w bieżącym teście. EN: The id of the student signed in the current test. */
let studentId: string;

/**
 * PL: Wysyła wpis do produkcyjnego routera, jako zalogowany albo bez sesji.
 * EN: Sends an entry to the production router, signed in or without a session.
 *
 * @param signedIn - PL: czy dołączyć ciasteczko sesji. EN: whether to attach the session cookie.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function save(signedIn: boolean): Response | Promise<Response> {
  return newsEditorApp.request('/entries', { method: 'POST', body: JSON.stringify(ENTRY), headers: signedIn ? { cookie } : {} }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
}

// PL: Przed każdym testem zaloguj ucznia, wyczyść role i wpisy.
// EN: Before every test sign a student in and clear the roles and the entries.
beforeEach(async () => {
  // PL: Zaloguj ucznia kodem i odczytaj jego numer.
  // EN: Sign the student in with a code and read their id.
  const login = createTestRuntime();
  cookie = await signIn(login, 'jan.test@teb.edu.pl');
  const session = await login.runtime.auth.api.getSession({ headers: new Headers({ cookie }) });
  studentId = session?.user.id ?? '';

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
  it.each<PanelRole>(['editor', 'council', 'admin'])('rola %s zapisuje wpis / the %s role saves an entry', async (role) => {
    // PL: Nadaj rolę, zapisz wpis i odczytaj bazę.
    // EN: Grant the role, save an entry and read the database.
    await db.insert(panelRoles).values({ userId: studentId, role, grantedAt: Date.now() });
    const response = await save(true);

    // PL: Odpowiedź 201 i jeden wpis w bazie.
    // EN: The answer is 201 and there is one entry in the database.
    expect(response.status).toBe(201);
    expect(await db.select().from(newsEntries)).toHaveLength(1);
  });
});
