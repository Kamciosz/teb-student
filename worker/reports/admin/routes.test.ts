/**
 * PL: Test routera podtoru 4b na prawdziwej bazie D1 z testowego Workera. Sprawdza dostęp (401 bez sesji, 403 bez roli albo z rolą redakcji, wpuszczenie Samorządu i administratora), listę, szczegół, zmianę etapu z historią, błędy (400, 404), to, że odpowiedź HTTP nie zawiera numeru autora, także dla zgłoszeń z autorem, oraz to, że zgłoszenie nieanonimowe wraca z imieniem i klasą autora, a anonimowe nie wraca z nimi wcale.
 * EN: Test of the 4b router on a real D1 database of the test Worker. Checks access (401 without a session, 403 without a role or with the editorial role, letting in the Council and the administrator), the list, the detail, the stage change with history, errors (400, 404), that the HTTP response never contains the author id, also for reports with an author, and that a signed report comes back with the author's name and class, while an anonymous one never comes back with them.
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
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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

/**
 * PL: Czyta dziennik zmian prosto z bazy testowej, od najstarszego wpisu: nazwa akcji, wykonawca i cel.
 * EN: Reads the change diary straight from the test database, from the oldest entry: the action name, the actor and the target.
 *
 * @returns PL: wiersze dziennika. EN: the diary rows.
 */
async function diaryRows(): Promise<unknown[]> {
  // PL: Wybierz wszystkie wpisy po numerze.
  // EN: Select all entries by id.
  const { results } = await db.prepare('SELECT action, actor_id, target_id FROM diary_entries ORDER BY id').all();
  return results;
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

    // PL: Historia od najnowszego etapu, a wiersz ma etap, chwilę i odpowiedź dla autora. Lista kluczy jest dokładna, więc `changedBy` (numer osoby z Samorządu) nie może się tu pojawić.
    // EN: The history from the newest stage, and a row has the stage, the moment and the answer for the author. The key list is exact, so `changedBy` (the Council member's id) cannot appear here.
    expect(response.status).toBe(200);
    expect(body.report.id).toBe('seed-okno');
    expect(body.history.map((row) => row.stage)).toEqual(['resolved', 'in_progress', 'received']);
    expect(Object.keys(body.history[0] ?? {}).sort()).toEqual(['changedAt', 'note', 'stage']);
  });

  // PL: Wiersz historii z odpowiedzią dla autora niesie jej tekst, a wiersz bez odpowiedzi ma `note` równe null.
  // EN: A history row with an answer for the author carries its text, and a row without an answer has `note` equal to null.
  it('GET /:id niesie odpowiedź dla autora w wierszu historii / GET /:id carries the answer for the author in the history row', async () => {
    // PL: Odczytaj zgłoszenie z historią, w której jedna zmiana ma odpowiedź, a dwie nie mają.
    // EN: Read the report whose history has one change with an answer and two without.
    const body = (await (await send('/seed-okno')).json()) as { history: { stage: string; note: string | null }[] };

    // PL: Najnowsza zmiana (załatwione) ma odpowiedź z seedu, a zgłoszenie wpłynęło bez odpowiedzi.
    // EN: The newest change (resolved) has the seed answer, and the report's arrival (received) has none.
    expect(body.history.find((row) => row.stage === 'resolved')?.note).toBe('Okno wymienione, domyka się bez problemu.');
    expect(body.history.find((row) => row.stage === 'received')?.note).toBeNull();
  });

  // PL: Zdjęcie z modułu mediów wraca jako `photoId` w liście i w szczególe, także przy zgłoszeniu z autorem, a bez zdjęcia jest `null`.
  // EN: The photo from the media module comes back as `photoId` in the list and in the detail, also for a report with an author, and without a photo it is `null`.
  it('GET / i GET /:id niosą photoId, bez numeru autora / GET / and GET /:id carry photoId, without the author id', async () => {
    // PL: Dołącz zdjęcie do zgłoszenia z autorem i do anonimowego; trzecie zostaje bez zdjęcia.
    // EN: Attach a photo to the report with an author and to the anonymous one; the third stays without a photo.
    await db.prepare('UPDATE reports SET photo_id = ? WHERE id = ?').bind('photo-cudze', 'seed-cudze').run();
    await db.prepare('UPDATE reports SET photo_id = ? WHERE id = ?').bind('photo-projektor', 'seed-projektor').run();
    const listText = await (await send('/')).text();
    const { reports } = JSON.parse(listText) as { reports: { id: string; photoId: string | null }[] };
    expect(reports.map((report) => [report.id, report.photoId])).toEqual([['seed-cudze', 'photo-cudze'], ['seed-projektor', 'photo-projektor'], ['seed-okno', null]]);

    // PL: Szczegół zgłoszenia z autorem niesie zdjęcie, a w odpowiedzi nie ma numeru autora.
    // EN: The detail of the report with an author carries the photo, and the response has no author id.
    const detailText = await (await send('/seed-cudze')).text();
    expect((JSON.parse(detailText) as { report: { photoId: string | null } }).report.photoId).toBe('photo-cudze');
    expect(listText + detailText).not.toContain(OTHER_STUDENT_ID);

    // PL: Anonimowe zgłoszenie też pokazuje zdjęcie, ale nie ma autora.
    // EN: An anonymous report shows the photo too, but has no author.
    const anonymous = (await (await send('/seed-projektor')).json()) as { report: { photoId: string | null }; student: unknown };
    expect(anonymous.report.photoId).toBe('photo-projektor');
    expect(anonymous.student).toBeNull();
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

// PL: Zgłoszenie nieanonimowe wraca z imieniem i klasą autora z profilu, a anonimowe nie dostaje żadnych danych autora, nawet gdy profil istnieje.
// EN: A signed report comes back with the author's name and class from the profile, and an anonymous one gets no author data at all, even when a profile exists.
describe('imię i klasa autora / the author name and class', () => {
  // PL: Profile testowe sprzątamy po każdym teście, żeby nie zostawały w bazie.
  // EN: We clean the test profiles after every test, so they do not stay in the database.
  afterEach(async () => {
    await db.prepare('DELETE FROM profiles WHERE user_id IN (?, ?)').bind(studentId, OTHER_STUDENT_ID).run();
  });

  /**
   * PL: Zapisuje profil ucznia wprost w bazie testowej.
   * EN: Saves a student's profile directly in the test database.
   *
   * @param userId - PL: numer ucznia. EN: the student id.
   * @param name - PL: imię. EN: the name.
   * @param className - PL: klasa. EN: the class.
   */
  async function saveProfile(userId: string, name: string, className: string): Promise<void> {
    // PL: Wiersz profilu z tymi samymi kolumnami co w schemacie.
    // EN: A profile row with the same columns as in the schema.
    await db
      .prepare('INSERT OR REPLACE INTO profiles (user_id, name, class_name, school, palette, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(userId, name, className, 'L', 'CE', Date.now())
      .run();
  }

  // PL: Zgłoszenie podpisane przez innego ucznia wraca z jego imieniem i klasą, bez numeru ucznia.
  // EN: A report signed by another student comes back with their name and class, without the student id.
  it('zgłoszenie nieanonimowe ma imię i klasę autora / a signed report has the author name and class', async () => {
    // PL: Zapisz profil autora i odczytaj zgłoszenie podpisane przez niego.
    // EN: Save the author's profile and read the report they signed.
    await saveProfile(OTHER_STUDENT_ID, 'Anna Nowak', '3B');
    const response = await send('/seed-cudze');
    const text = await response.text();

    // PL: Odpowiedź ma imię i klasę, a numer autora nie pojawia się w tekście.
    // EN: The response has the name and class, and the author id does not appear in the text.
    expect(response.status).toBe(200);
    expect((JSON.parse(text) as { student: unknown }).student).toEqual({ name: 'Anna Nowak', className: '3B' });
    expect(text).not.toContain(OTHER_STUDENT_ID);
  });

  // PL: Podpisane zgłoszenie bez profilu autora ma `student` równe null, a napis z panelu zostaje.
  // EN: A signed report without the author's profile has `student` equal to null, and the label in the panel stays.
  it('zgłoszenie nieanonimowe bez profilu ma student null / a signed report without a profile has student null', async () => {
    // PL: Nie zapisujemy profilu autora i odczytujemy zgłoszenie podpisane przez niego.
    // EN: We do not save the author's profile and read the report they signed.
    const response = await send('/seed-cudze');

    // PL: Odpowiedź jest udana, a `student` to null.
    // EN: The answer is successful, and `student` is null.
    expect(response.status).toBe(200);
    expect(((await response.json()) as { student: unknown }).student).toBeNull();
  });

  // PL: Anonimowe zgłoszenie nie dostaje danych autora, nawet gdy profil autora (tu ucznia z sesji) istnieje.
  // EN: An anonymous report gets no author data, even when the author's profile (here the signed-in student's) exists.
  it('zgłoszenie anonimowe nie dostaje danych autora, nawet z profilem / an anonymous report gets no author data, even with a profile', async () => {
    // PL: Zapisz profil ucznia z sesji, który jest autorem anonimowego zgłoszenia, i odczytaj je.
    // EN: Save the profile of the signed-in student, who is the author of the anonymous report, and read it.
    await saveProfile(studentId, 'Jan Testowy', '2A');
    const response = await send('/seed-projektor');
    const text = await response.text();

    // PL: `student` to null, a w tekście nie ma ani imienia, ani numeru ucznia.
    // EN: `student` is null, and the text has neither the name nor the student id.
    expect(response.status).toBe(200);
    expect((JSON.parse(text) as { student: unknown }).student).toBeNull();
    expect(text).not.toContain('Jan Testowy');
    expect(text).not.toContain(studentId);
  });

  // PL: Odpowiedź dla autora przy anonimowym zgłoszeniu wraca, ale razem z nią nie wraca ani numer ucznia, ani numer osoby z Samorządu, która zmieniła etap.
  // EN: The answer for the author on an anonymous report comes back, but neither the student id nor the id of the Council member who changed the stage comes back with it.
  it('odpowiedź w historii anonimowego zgłoszenia nie ujawnia autora / the answer in an anonymous report history reveals no author', async () => {
    // PL: Zapisz profil ucznia z sesji (autora anonimowego zgłoszenia) i odczytaj zgłoszenie z odpowiedzią w historii.
    // EN: Save the profile of the signed-in student (the author of the anonymous report) and read the report with the answer in its history.
    await saveProfile(studentId, 'Jan Testowy', '2A');
    const response = await send('/seed-projektor');
    const text = await response.text();

    // PL: Tekst odpowiedzi jest w odpowiedzi HTTP, a imienia, numeru ucznia i numeru osoby z Samorządu (`changedBy` z seedu) nie ma.
    // EN: The answer text is in the HTTP response, and the name, the student id and the Council member's id (`changedBy` from the seed) are not.
    expect(response.status).toBe(200);
    expect(text).toContain('Sprawdzimy projektor na przerwie obiadowej.');
    expect(text).not.toContain('Jan Testowy');
    expect(text).not.toContain(studentId);
    expect(text).not.toContain('samorzad-testowy');
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
    // PL: Dokładnie jeden wpis w dzienniku: zmiana etapu, wykonawca z sesji i id zgłoszenia, bez treści.
    // EN: Exactly one diary entry: the stage change, the actor from the session and the report id, without the content.
    expect(await diaryRows()).toEqual([{ action: 'report_stage_changed', actor_id: studentId, target_id: 'seed-projektor' }]);
  });

  // PL: Odpowiedź wysłana razem ze zmianą etapu trafia do wiersza historii i wraca w tej samej odpowiedzi.
  // EN: An answer sent together with the stage change goes into the history row and comes back in the same response.
  it('zapisuje odpowiedź dla autora przy zmianie etapu / saves the answer for the author with the stage change', async () => {
    // PL: Zmień etap z odpowiedzią i sprawdź historię w odpowiedzi i w bazie.
    // EN: Change the stage with an answer and check the history in the response and in the database.
    const response = await patchStage('seed-projektor', { stage: 'resolved', note: 'Projektor naprawiony.' });
    const body = (await response.json()) as { history: { stage: string; note: string | null }[] };
    const saved = await db.prepare("SELECT note FROM report_stage_changes WHERE report_id = ? AND stage = 'resolved'").bind('seed-projektor').first();

    // PL: Odpowiedź i zapis mają ten sam tekst, a najnowszy wiersz historii go niesie.
    // EN: The response and the saved row have the same text, and the newest history row carries it.
    expect(response.status).toBe(200);
    expect(saved).toEqual({ note: 'Projektor naprawiony.' });
    expect(body.history[0]?.note).toBe('Projektor naprawiony.');
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
    // PL: Brak zmiany to brak wpisu w dzienniku.
    // EN: No change means no diary entry.
    expect(await diaryRows()).toEqual([]);
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
    expect(await diaryRows()).toEqual([]);
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
    expect(await diaryRows()).toEqual([]);
  });

  // PL: Zbyt duża treść to 413.
  // EN: An oversized body is 413.
  it('zbyt duża treść daje 413 / an oversized body gives 413', async () => {
    // PL: Treść większa niż 4 KB jest odrzucona, zanim ją odczytamy.
    // EN: A body larger than 4 KB is rejected before we read it.
    const response = await patchStage('seed-projektor', { stage: 'resolved', padding: 'x'.repeat(5000) });
    expect(response.status).toBe(413);
    expect(await diaryRows()).toEqual([]);
  });

  // PL: Odpowiedź dla autora zapisuje się w wierszu historii nowego etapu, bez dodatkowego wiersza. Przycięte spacje nie trafiają do bazy.
  // EN: The answer for the author is saved in the history row of the new stage, with no extra row. Trimmed spaces do not reach the database.
  it('zapisuje odpowiedź w wierszu historii / saves the answer in the history row', async () => {
    // PL: Zmień etap i dołącz odpowiedź ze spacjami na początku i na końcu.
    // EN: Change the stage and attach an answer with spaces at the start and the end.
    const response = await patchStage('seed-projektor', { stage: 'resolved', note: '  Projektor naprawiony, dziękujemy.  ' });
    const rows = await db.prepare('SELECT stage, note FROM report_stage_changes WHERE report_id = ? ORDER BY changed_at').bind('seed-projektor').all<{ stage: string; note: string | null }>();

    // PL: Odpowiedź przeszła, a w historii jest jeden nowy wiersz z przyciętą odpowiedzią.
    // EN: The answer went through, and the history has one new row with the trimmed answer.
    expect(response.status).toBe(200);
    expect(rows.results.length).toBe(3);
    expect(rows.results.at(-1)).toEqual({ stage: 'resolved', note: 'Projektor naprawiony, dziękujemy.' });
  });

  // PL: Odpowiedź z 500 znakami, w tym polskimi literami (po dwa bajty), mieści się w limicie i przechodzi.
  // EN: An answer of 500 characters, including Polish letters (two bytes each), fits the limit and goes through.
  it('500 znaków przechodzi / 500 characters pass', async () => {
    // PL: Wyślij odpowiedź dokładnie na granicy limitu.
    // EN: Send an answer exactly at the limit.
    const response = await patchStage('seed-projektor', { stage: 'resolved', note: 'ą'.repeat(500) });
    const row = await db.prepare("SELECT length(note) AS n FROM report_stage_changes WHERE report_id = ? AND stage = 'resolved'").bind('seed-projektor').first<{ n: number }>();

    // PL: Odpowiedź przeszła, a baza liczy 500 znaków.
    // EN: The answer went through, and the database counts 500 characters.
    expect(response.status).toBe(200);
    expect(row?.n).toBe(500);
  });

  // PL: Odpowiedź dłuższa niż 500 znaków albo nie-tekst to 400, a etap i historia zostają bez zmian.
  // EN: An answer longer than 500 characters, or one that is not text, is 400, and the stage and the history stay unchanged.
  it('za długa odpowiedź daje 400 i nic nie zmienia / a too long answer gives 400 and changes nothing', async () => {
    // PL: Wyślij 501 znaków i liczbę zamiast tekstu.
    // EN: Send 501 characters and a number instead of text.
    const tooLong = await patchStage('seed-projektor', { stage: 'resolved', note: 'ą'.repeat(501) });
    const notText = await patchStage('seed-projektor', { stage: 'resolved', note: 12 });
    const row = await db.prepare('SELECT stage FROM reports WHERE id = ?').bind('seed-projektor').first();
    const count = await db.prepare('SELECT COUNT(*) AS n FROM report_stage_changes WHERE report_id = ?').bind('seed-projektor').first<{ n: number }>();

    // PL: Oba zapytania to 400, etap w zgłoszeniu to dalej „w trakcie”, a historia ma dwa wiersze.
    // EN: Both requests are 400, the report stage is still "in progress", and the history has two rows.
    expect([tooLong.status, notText.status]).toEqual([400, 400]);
    expect(row).toEqual({ stage: 'in_progress' });
    expect(count?.n).toBe(2);
    expect(await diaryRows()).toEqual([]);
  });

  // PL: Pusta odpowiedź (same spacje) to brak odpowiedzi: zmiana etapu idzie, a `note` w bazie jest pusty.
  // EN: An empty answer (only spaces) means no answer: the stage change goes through, and `note` in the database is empty.
  it('pusta odpowiedź zapisuje brak odpowiedzi / an empty answer saves no answer', async () => {
    // PL: Wyślij etap z odpowiedzią złożoną z samych spacji.
    // EN: Send a stage with an answer made of spaces only.
    const response = await patchStage('seed-projektor', { stage: 'resolved', note: '   ' });
    const row = await db.prepare("SELECT note FROM report_stage_changes WHERE report_id = ? AND stage = 'resolved'").bind('seed-projektor').first<{ note: string | null }>();

    // PL: Zmiana przeszła, a odpowiedź w wierszu historii to `null`.
    // EN: The change went through, and the answer in the history row is `null`.
    expect(response.status).toBe(200);
    expect(row).toEqual({ note: null });
  });
});
