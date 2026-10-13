/**
 * PL: Test routera podtoru 4b na prawdziwej bazie D1 z testowego Workera. Sprawdza dostęp (401 bez sesji, 403 bez roli albo z rolą redakcji, wpuszczenie Samorządu i administratora), listę, szczegół, zmianę etapu z historią, błędy (400, 404) i to, że odpowiedź HTTP nie zawiera numeru autora, także dla zgłoszeń z autorem.
 * EN: Test of the 4b router on a real D1 database of the test Worker. Checks access (401 without a session, 403 without a role or with the editorial role, letting in the Council and the administrator), the list, the detail, the stage change with history, errors (400, 404) and that the HTTP response never contains the author id, also for reports with an author.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/reports/admin/routes.ts::reportsAdminApp
 * @uses worker/reports/admin/testDatabase.ts::resetDatabase
 * @uses worker/auth/email/testRuntime.ts::signIn
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera (baza D1 i ustawienia).
// EN: The Worker test environment (the D1 database and the settings).
import { env } from 'cloudflare:workers';
// PL: Logowanie ucznia w teście, tak jak w testach podtorów 1a i 4a. To plik pomocniczy testów, więc importujemy go wprost.
// EN: Signing a student in within a test, as in the tests of subtracks 1a and 4a. It is a test helper file, so we import it directly.
import { createTestRuntime, signIn } from '../../auth/email/testRuntime';
// PL: Dane testowe: numer ucznia, którego zgłoszeń nie wolno ujawnić, i drugi autor.
// EN: The test data: the id of the student whose reports must not be revealed, and the other author.
import { OTHER_STUDENT_ID } from '../../db/seed/reports';
// PL: Produkcyjny router, razem z prawdziwym sprawdzaniem roli.
// EN: The production router, together with the real role check.
import { reportsAdminApp } from './routes';
import type { PanelRole } from '../../db/schema/admin';
import { resetDatabase } from './testDatabase';

/** PL: Sekret podpisu sesji z testRuntime.ts. EN: The session signing secret from testRuntime.ts. */
const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;
/** PL: Ciasteczko sesji ucznia zalogowanego w bieżącym teście. EN: The session cookie of the student signed in the current test. */
let cookie: string;
/** PL: Numer ucznia zalogowanego w bieżącym teście (autor dwóch anonimowych zgłoszeń). EN: The id of the student signed in the current test (the author of two anonymous reports). */
let studentId: string;

/**
 * PL: Wysyła zapytanie do produkcyjnego routera, jako zalogowany (albo bez sesji, gdy `signedIn` to false).
 * EN: Sends a request to the production router, signed in (or without a session when `signedIn` is false).
 *
 * @param path - PL: adres względem routera. EN: the path relative to the router.
 * @param init - PL: metoda, nagłówki i treść. EN: the method, headers and body.
 * @param signedIn - PL: czy dołączyć ciasteczko sesji. EN: whether to attach the session cookie.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
async function send(path: string, init: RequestInit = {}, signedIn = true): Promise<Response> {
  // PL: Nagłówki z ciasteczkiem sesji albo bez niego, potem zapytanie do routera z bazą testową.
  // EN: The headers with the session cookie or without it, then the request to the router with the test database.
  const headers = { ...(init.headers as Record<string, string> | undefined), ...(signedIn ? { cookie } : {}) };
  return reportsAdminApp.request(path, { ...init, headers }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
}

/**
 * PL: Wysyła PATCH ze zmianą etapu.
 * EN: Sends a PATCH with a stage change.
 *
 * @param id - PL: numer zgłoszenia. EN: the report id.
 * @param body - PL: treść (tekst lub obiekt). EN: the body (a string or an object).
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function patchStage(id: string, body: unknown): Promise<Response> {
  // PL: Tekst wysyłamy jak jest (zepsuty JSON), resztę zamieniamy na JSON.
  // EN: A string is sent as is (broken JSON), anything else becomes JSON.
  return send(`/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}

// PL: Przed każdym testem zaloguj ucznia z rolą Samorządu i wróć do czystych danych.
// EN: Before every test sign in a student with the Council role and go back to clean data.
beforeEach(async () => {
  // PL: Zaloguj ucznia kodem, odczytaj jego numer, przypisz mu zgłoszenia z seedu i rolę Samorządu.
  // EN: Sign the student in with a code, read their id, assign the seed reports and the Council role to them.
  const login = createTestRuntime();
  cookie = await signIn(login, 'jan.test@teb.edu.pl');
  const session = await login.runtime.auth.api.getSession({ headers: new Headers({ cookie }) });
  studentId = session?.user.id ?? '';
  db = await resetDatabase(studentId, 'council');
});

// PL: Dostęp: bez sesji 401, bez roli albo z rolą redakcji 403 (bez zmian w bazie), Samorząd i administrator wchodzą.
// EN: Access: 401 without a session, 403 without a role or with the editorial role (no database change), the Council and the administrator get in.
describe('dostęp / access', () => {
  // PL: Bez sesji żaden adres nie odpowiada danymi, a PATCH niczego nie zmienia.
  // EN: Without a session no route answers with data, and PATCH changes nothing.
  it('bez sesji daje 401 / without a session gives 401', async () => {
    // PL: Wyślij listę i zmianę etapu bez ciasteczka, potem odczytaj etap z bazy.
    // EN: Send the list and a stage change without the cookie, then read the stage from the database.
    const list = await send('/', {}, false);
    const patch = await send('/seed-projektor', { method: 'PATCH', body: JSON.stringify({ stage: 'resolved' }) }, false);
    const row = await db.prepare('SELECT stage FROM reports WHERE id = ?').bind('seed-projektor').first();

    // PL: Oba zapytania dostają 401, a etap w bazie jest ten z seedu.
    // EN: Both requests get 401, and the stage in the database is the seed one.
    expect(list.status).toBe(401);
    expect(patch.status).toBe(401);
    expect(row).toEqual({ stage: 'in_progress' });
  });

  // PL: Uczeń bez roli i członek redakcji (rola niższa niż Samorząd) dostają 403 na wszystkich adresach.
  // EN: A student without a role and an editorial team member (a role lower than the Council) get 403 on all routes.
  it.each<[string, PanelRole | null]>([
    ['uczeń bez roli / a student without a role', null],
    ['redakcja / the editorial team', 'editor'],
  ])('%s dostaje 403 i nic nie zmienia', async (_name, role) => {
    // PL: Ustaw rolę ucznia i zapytaj o trzy adresy.
    // EN: Set the student's role and ask three routes.
    db = await resetDatabase(studentId, role);
    const list = await send('/');
    const detail = await send('/seed-projektor');
    const patch = await patchStage('seed-projektor', { stage: 'resolved' });
    const row = await db.prepare('SELECT stage FROM reports WHERE id = ?').bind('seed-projektor').first();

    // PL: Wszystkie trzy adresy odmawiają, odpowiedź nie ma danych, a etap się nie zmienił.
    // EN: All three routes refuse, the response has no data and the stage did not change.
    expect([list.status, detail.status, patch.status]).toEqual([403, 403, 403]);
    expect(await list.text()).not.toContain('Nie działa projektor');
    expect(row).toEqual({ stage: 'in_progress' });
  });

  // PL: Samorząd (rola z beforeEach) i administrator (rola wyższa) wchodzą i widzą listę.
  // EN: The Council (the role from beforeEach) and the administrator (a higher role) get in and see the list.
  it.each<PanelRole>(['council', 'admin'])('rola %s wchodzi / the %s role gets in', async (role) => {
    // PL: Ustaw rolę i odczytaj listę.
    // EN: Set the role and read the list.
    db = await resetDatabase(studentId, role);
    const response = await send('/');

    // PL: Odpowiedź jest udana i ma trzy zgłoszenia z seedu.
    // EN: The answer is successful and has the three seed reports.
    expect(response.status).toBe(200);
    expect(((await response.json()) as { reports: unknown[] }).reports).toHaveLength(3);
  });
});

// PL: Lista i szczegół oddają wszystkie zgłoszenia, także cudze, od najnowszego.
// EN: The list and the detail return all reports, also other people's, newest first.
describe('odczyt / reading', () => {
  // PL: Lista ma trzy zgłoszenia od najnowszego, z etapem i znacznikiem anonimowości.
  // EN: The list has three reports from the newest, with the stage and the anonymity flag.
  it('GET / oddaje wszystkie zgłoszenia od najnowszego / GET / returns all reports newest first', async () => {
    // PL: Odczytaj listę jako zalogowany członek Samorządu.
    // EN: Read the list as a signed-in Council member.
    const response = await send('/');
    const { reports } = (await response.json()) as { reports: { id: string; stage: string; isAnonymous: boolean }[] };

    // PL: Trzy zgłoszenia od najnowszego z etapami i znacznikiem anonimowości.
    // EN: Three reports from the newest with their stages and the anonymity flag.
    expect(response.status).toBe(200);
    expect(reports.map((report) => report.id)).toEqual(['seed-cudze', 'seed-projektor', 'seed-okno']);
    expect(reports.map((report) => [report.stage, report.isAnonymous])).toEqual([['received', false], ['in_progress', true], ['resolved', true]]);
  });

  // PL: Szczegół ma historię od najnowszego etapu, bez osoby, która go zmieniła.
  // EN: The detail has the history from the newest stage, without the person who changed it.
  it('GET /:id oddaje zgłoszenie z historią / GET /:id returns the report with its history', async () => {
    // PL: Odczytaj zgłoszenie z trzema etapami w historii.
    // EN: Read the report with three stages in its history.
    const response = await send('/seed-okno');
    const body = (await response.json()) as { report: { id: string }; history: Record<string, unknown>[] };

    // PL: Historia od najnowszego etapu, a wiersz ma tylko etap i chwilę.
    // EN: The history from the newest stage, and a row has only the stage and the moment.
    expect(response.status).toBe(200);
    expect(body.report.id).toBe('seed-okno');
    expect(body.history.map((row) => row.stage)).toEqual(['resolved', 'in_progress', 'received']);
    expect(Object.keys(body.history[0] ?? {}).sort()).toEqual(['changedAt', 'stage']);
  });

  // PL: Nieznane zgłoszenie to 404.
  // EN: An unknown report is 404.
  it('GET /:id nieznanego daje 404 / GET /:id of an unknown report gives 404', async () => {
    // PL: Zgłoszenie o nieznanym numerze daje 404.
    // EN: A report with an unknown id gives 404.
    expect((await send('/nie-ma')).status).toBe(404);
  });
});

// PL: Anonimowość sprawdzamy na samej odpowiedzi HTTP, nie na ekranie.
// EN: We check anonymity on the HTTP response itself, not on the screen.
describe('anonimowość w odpowiedzi HTTP / anonymity in the HTTP response', () => {
  /**
   * PL: Sprawdza surowy tekst odpowiedzi: bez numerów autorów i bez klucza authorId.
   * EN: Checks the raw response text: no author ids and no authorId key.
   *
   * @param response - PL: odpowiedź routera. EN: the router response.
   */
  async function expectNoAuthor(response: Response): Promise<void> {
    // PL: Weź surowy tekst odpowiedzi, nie JSON po rozbiorze, żeby żaden klucz nie umknął.
    // EN: Take the raw response text, not the parsed JSON, so no key can slip by.
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(studentId).not.toBe('');
    expect(text).not.toContain(studentId);
    expect(text).not.toContain(OTHER_STUDENT_ID);
    expect(text.toLowerCase()).not.toContain('author');
  }

  // PL: Lista nie ma autorów ani anonimowych, ani podpisanych zgłoszeń.
  // EN: The list has no authors, neither of anonymous nor of signed reports.
  it('lista nie zawiera autora / the list contains no author', async () => {
    // PL: Lista ma zgłoszenia anonimowe (autor to zalogowany uczeń) i jedno z autorem.
    // EN: The list has anonymous reports (the author is the signed-in student) and one with an author.
    await expectNoAuthor(await send('/'));
  });

  // PL: Szczegół zgłoszenia anonimowego i podpisanego też nie ma autora.
  // EN: The detail of an anonymous and of a signed report has no author either.
  it('szczegół nie zawiera autora / the detail contains no author', async () => {
    // PL: Najpierw zgłoszenie anonimowe, potem podpisane przez innego ucznia.
    // EN: First an anonymous report, then one signed by another student.
    await expectNoAuthor(await send('/seed-projektor'));
    await expectNoAuthor(await send('/seed-cudze'));
  });

  // PL: Odpowiedź na zmianę etapu też.
  // EN: The answer to a stage change too.
  it('odpowiedź na PATCH nie zawiera autora / the PATCH response contains no author', async () => {
    // PL: Zmień etap zgłoszenia anonimowego i sprawdź odpowiedź.
    // EN: Change the stage of an anonymous report and check the response.
    await expectNoAuthor(await patchStage('seed-projektor', { stage: 'resolved' }));
  });
});

// PL: Zmiana etapu zapisuje etap, czas i wiersz historii z numerem osoby z sesji.
// EN: A stage change saves the stage, the time and a history row with the id of the person from the session.
describe('PATCH /:id zmiana etapu / stage change', () => {
  // PL: Zmiana etapu zmienia zgłoszenie i dopisuje historię.
  // EN: A stage change updates the report and appends the history.
  it('zmienia etap i dopisuje historię / changes the stage and appends the history', async () => {
    // PL: Zmień etap na „załatwione” i odczytaj bazę.
    // EN: Change the stage to "resolved" and read the database.
    const response = await patchStage('seed-projektor', { stage: 'resolved' });
    const body = (await response.json()) as { report: { stage: string }; history: { stage: string }[] };
    const row = await db.prepare('SELECT stage, updated_at FROM reports WHERE id = ?').bind('seed-projektor').first<{ stage: string; updated_at: number }>();
    const last = await db.prepare("SELECT changed_by FROM report_stage_changes WHERE report_id = ? AND stage = 'resolved'").bind('seed-projektor').first();

    // PL: Odpowiedź, wiersz i historia mają nowy etap, a zmienił go uczeń z sesji.
    // EN: The response, the row and the history have the new stage, and the student from the session changed it.
    expect(response.status).toBe(200);
    expect(body.report.stage).toBe('resolved');
    expect(body.history.map((item) => item.stage)).toEqual(['resolved', 'in_progress', 'received']);
    expect(row?.stage).toBe('resolved');
    expect(row?.updated_at).toBeGreaterThan(Date.UTC(2026, 9, 7, 8, 0));
    expect(last).toEqual({ changed_by: studentId });
  });

  // PL: Ten sam etap nie dopisuje historii.
  // EN: The same stage adds no history.
  it('ten sam etap nic nie dopisuje / the same stage adds nothing', async () => {
    // PL: Wyślij etap, który zgłoszenie już ma.
    // EN: Send the stage the report already has.
    const response = await patchStage('seed-projektor', { stage: 'in_progress' });
    const count = await db.prepare('SELECT COUNT(*) AS n FROM report_stage_changes WHERE report_id = ?').bind('seed-projektor').first<{ n: number }>();

    // PL: Odpowiedź jest udana, a historia dalej ma dwa wiersze.
    // EN: The answer is successful and the history still has two rows.
    expect(response.status).toBe(200);
    expect(count?.n).toBe(2);
  });

  // PL: Zły etap, brak etapu i zepsuty JSON to 400, a baza zostaje bez zmian.
  // EN: A bad stage, a missing stage and broken JSON are 400, and the database stays unchanged.
  it('zły etap daje 400 / a bad stage gives 400', async () => {
    // PL: Wyślij nieznany etap, pustą treść i zepsuty JSON.
    // EN: Send an unknown stage, an empty body and broken JSON.
    const bad = await patchStage('seed-projektor', { stage: 'zamkniete' });
    const missing = await patchStage('seed-projektor', {});
    const broken = await patchStage('seed-projektor', '{nie json');
    const row = await db.prepare('SELECT stage FROM reports WHERE id = ?').bind('seed-projektor').first();

    // PL: Wszystkie trzy to 400, a etap w bazie się nie zmienił.
    // EN: All three are 400, and the stage in the database did not change.
    expect([bad.status, missing.status, broken.status]).toEqual([400, 400, 400]);
    expect(row).toEqual({ stage: 'in_progress' });
  });

  // PL: Nieznane zgłoszenie to 404 i nic nie trafia do historii.
  // EN: An unknown report is 404 and nothing reaches the history.
  it('nieznane zgłoszenie daje 404 / an unknown report gives 404', async () => {
    // PL: Zmień etap zgłoszenia, którego nie ma.
    // EN: Change the stage of a report that does not exist.
    const response = await patchStage('nie-ma', { stage: 'resolved' });
    const count = await db.prepare('SELECT COUNT(*) AS n FROM report_stage_changes').first<{ n: number }>();

    // PL: 404, a w historii dalej sześć wierszy z seedu.
    // EN: 404, and the history still has the six seed rows.
    expect(response.status).toBe(404);
    expect(count?.n).toBe(6);
  });

  // PL: Zbyt duża treść to 413.
  // EN: An oversized body is 413.
  it('zbyt duża treść daje 413 / an oversized body gives 413', async () => {
    // PL: Treść większa niż 1 KB jest odrzucona, zanim ją odczytamy.
    // EN: A body larger than 1 KB is rejected before we read it.
    const response = await patchStage('seed-projektor', { stage: 'resolved', padding: 'x'.repeat(2048) });
    expect(response.status).toBe(413);
  });
});
