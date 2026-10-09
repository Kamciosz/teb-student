/**
 * PL: Test routera podtoru 4a na prawdziwej bazie D1 z testowego Workera. Sprawdza zalogowanie (401 bez sesji), zapis zgłoszenia (z pierwszym etapem historii), błędy danych, odczyt tylko własnych zgłoszeń bez numeru autora.
 * EN: Test of the 4a router on a real D1 database of the test Worker. Checks the sign-in requirement (401 without a session), saving a report (with the first history stage), data errors, reading only own reports without the author id.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/reports/student/routes.ts::reportsStudentApp
 * @uses worker/reports/student/testDatabase.ts::resetDatabase
 * @uses worker/auth/email/testRuntime.ts::signIn
 * @uses worker/db/seed/reports.ts::REPORTS_SEED
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera (baza D1 i ustawienia).
// EN: The Worker test environment (the D1 database and the settings).
import { env } from 'cloudflare:workers';
// PL: Logowanie ucznia w teście, tak jak w testach podtoru 1a. To plik pomocniczy testów, więc importujemy go wprost (moduł auth nie wystawia go przez drzwi).
// EN: Signing a student in within a test, as in the tests of subtrack 1a. It is a test helper file, so we import it directly (the auth module does not expose it through its door).
import { createTestRuntime, signIn } from '../../auth/email/testRuntime';
// PL: Router, który sprawdzamy.
// EN: The router under test.
import { reportsStudentApp } from './routes';
// PL: Baza testowa.
// EN: The test database.
import { resetDatabase } from './testDatabase';

/** PL: Poprawna treść nowego zgłoszenia. EN: A valid body of a new report. */
const BODY = { category: 'safety', place: 'gym', placeDetail: 'Przy drabinkach', description: 'Luźna deska na podłodze', isAnonymous: false };

/** PL: Sekret podpisu sesji z testRuntime.ts: z nim prawdziwy requireStudent uzna ciasteczko z testu. EN: The session signing secret from testRuntime.ts: with it the real requireStudent accepts the cookie from the test. */
const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;

/** PL: Ciasteczko sesji ucznia zalogowanego w bieżącym teście. EN: The session cookie of the student signed in the current test. */
let cookie: string;

/** PL: Numer ucznia zalogowanego w bieżącym teście. EN: The id of the student signed in the current test. */
let studentId: string;

/**
 * PL: Wysyła zapytanie do routera jako zalogowany uczeń (albo bez sesji, gdy `signedIn` to false).
 * EN: Sends a request to the router as the signed-in student (or without a session when `signedIn` is false).
 *
 * @param init - PL: metoda, nagłówki i treść. EN: the method, headers and body.
 * @param signedIn - PL: czy dołączyć ciasteczko sesji (domyślnie tak). EN: whether to attach the session cookie (yes by default).
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function send(init: RequestInit = {}, signedIn = true): Response | Promise<Response> {
  // PL: Nagłówki z ciasteczkiem sesji albo bez niego.
  // EN: The headers with the session cookie or without it.
  const headers = { ...(init.headers as Record<string, string> | undefined), ...(signedIn ? { cookie } : {}) };
  return reportsStudentApp.request('/', { ...init, headers }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
}

/**
 * PL: Wysyła zapytanie POST z treścią JSON do routera.
 * EN: Sends a POST request with a JSON body to the router.
 *
 * @param body - PL: treść do wysłania (tekst lub obiekt). EN: the body to send (a string or an object).
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function post(body: unknown): Response | Promise<Response> {
  // PL: Tekst wysyłamy jak jest, resztę zamieniamy na JSON.
  // EN: A string is sent as is, anything else becomes JSON.
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  return send({ method: 'POST', headers: { 'content-type': 'application/json' }, body: payload });
}

// PL: Przed każdym testem wracamy do czystych danych testowych.
// EN: Before every test we go back to clean test data.
beforeEach(async () => {
  // PL: Zaloguj ucznia kodem i sprawdź, jaki ma numer; jego zgłoszenia z seedu dostają ten numer.
  // EN: Sign the student in with a code and read their id; the seed reports of the student get this id.
  const login = createTestRuntime();
  cookie = await signIn(login, 'jan.test@teb.edu.pl');
  const session = await login.runtime.auth.api.getSession({ headers: new Headers({ cookie }) });
  studentId = session?.user.id ?? '';
  db = await resetDatabase(studentId);
});

// PL: Grupa testów dostępu: bez sesji oba adresy odpowiadają 401 i niczego nie zapisują.
// EN: A group of access tests: without a session both routes answer 401 and save nothing.
describe('401 bez sesji / 401 without a session', () => {
  // PL: Zapis bez sesji jest odrzucony, a baza zostaje bez zmian.
  // EN: Saving without a session is rejected and the database stays unchanged.
  it('POST bez sesji daje 401 i nic nie zapisuje / POST without a session gives 401 and saves nothing', async () => {
    // PL: Wyślij poprawne zgłoszenie bez ciasteczka.
    // EN: Send a valid report without the cookie.
    const response = await send({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(BODY) }, false);
    const count = await db.prepare('SELECT COUNT(*) AS n FROM reports').first<{ n: number }>();

    // PL: Kod 401, a w bazie dalej trzy zgłoszenia z seedu.
    // EN: Code 401, and the database still has the three seed reports.
    expect(response.status).toBe(401);
    expect(count?.n).toBe(3);
  });

  // PL: Odczyt bez sesji jest odrzucony.
  // EN: Reading without a session is rejected.
  it('GET bez sesji daje 401 / GET without a session gives 401', async () => {
    // PL: Odczytaj listę bez ciasteczka i z zepsutym ciasteczkiem.
    // EN: Read the list without the cookie and with a forged cookie.
    const anonymous = await send({}, false);
    const forged = await send({ headers: { cookie: 'better-auth.session_token=zmyslone.zmyslone' } }, false);

    // PL: Oba zapytania dostają 401.
    // EN: Both requests get 401.
    expect(anonymous.status).toBe(401);
    expect(forged.status).toBe(401);
  });
});

// PL: Grupa testów zapisu zgłoszenia.
// EN: A group of tests for saving a report.
describe('POST / zapis / saving', () => {
  // PL: Poprawne zgłoszenie jest zapisane z etapem „przyjęte” i historią.
  // EN: A valid report is saved at the "received" stage with its history.
  it('zapisuje zgłoszenie i pierwszy etap / saves the report and the first stage', async () => {
    // PL: Wyślij poprawne zgłoszenie.
    // EN: Send a valid report.
    const response = await post(BODY);
    const { id } = (await response.json()) as { id: string };

    // PL: Odpowiedź to 201 z numerem; wiersz ma etap received i autora z sesji.
    // EN: The answer is 201 with an id; the row has the received stage and the author from the session.
    expect(response.status).toBe(201);
    const row = await db.prepare('SELECT author_id, stage, is_anonymous, description FROM reports WHERE id = ?').bind(id).first();
    expect(row).toEqual({ author_id: studentId, stage: 'received', is_anonymous: 0, description: BODY.description });
    const history = await db.prepare('SELECT stage FROM report_stage_changes WHERE report_id = ?').bind(id).all();
    expect(history.results).toEqual([{ stage: 'received' }]);
  });

  // PL: Numer autora z treści jest ignorowany.
  // EN: An author id from the body is ignored.
  it('ignoruje authorId z treści / ignores authorId from the body', async () => {
    // PL: Spróbuj podszyć się pod innego ucznia.
    // EN: Try to impersonate another student.
    const response = await post({ ...BODY, authorId: 'seed-user-2', stage: 'resolved' });
    const { id } = (await response.json()) as { id: string };

    // PL: Wiersz ma autora z serwera i etap received.
    // EN: The row has the server's author and the received stage.
    const row = await db.prepare('SELECT author_id, stage FROM reports WHERE id = ?').bind(id).first();
    expect(row).toEqual({ author_id: studentId, stage: 'received' });
  });

});

// PL: Grupa testów odrzucania zgłoszeń.
// EN: A group of tests for rejecting reports.
describe('POST / odrzucanie / rejecting', () => {
  // PL: Złe dane to 400 z listą pól, a w bazie nic nie przybywa.
  // EN: Bad data is 400 with a list of fields, and nothing is added to the database.
  it('odrzuca złe dane kodem 400 / rejects bad data with code 400', async () => {
    // PL: Wyślij zgłoszenie z nieznaną kategorią.
    // EN: Send a report with an unknown category.
    const response = await post({ ...BODY, category: 'xyz' });

    // PL: Odpowiedź wskazuje pole, a liczba wierszy się nie zmienia.
    // EN: The answer names the field, and the row count does not change.
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid_report', fields: ['category'] });
    const count = await db.prepare('SELECT COUNT(*) AS n FROM reports').first<{ n: number }>();
    expect(count?.n).toBe(3);
  });

  // PL: Zepsuty JSON to też 400.
  // EN: Broken JSON is 400 too.
  it('odrzuca zepsuty JSON kodem 400 / rejects broken JSON with code 400', async () => {
    // PL: Wyślij tekst, który nie jest JSON.
    // EN: Send text that is not JSON.
    const response = await post('{nie json');

    // PL: Kod 400.
    // EN: Code 400.
    expect(response.status).toBe(400);
  });

});

// PL: Grupa testów granic zapytania.
// EN: A group of tests for request limits.
describe('POST / granice / limits', () => {
  // PL: Za duże zapytanie to 413.
  // EN: An oversized request is 413.
  it('odrzuca za duże zapytanie kodem 413 / rejects an oversized request with code 413', async () => {
    // PL: Wyślij treść większą niż 8 KB.
    // EN: Send a body larger than 8 KB.
    const response = await post({ ...BODY, description: 'a'.repeat(9 * 1024) });

    // PL: Kod 413.
    // EN: Code 413.
    expect(response.status).toBe(413);
  });

});

// PL: Grupa testów odczytu zgłoszeń.
// EN: A group of tests for reading reports.
describe('GET /', () => {
  // PL: Uczeń widzi tylko własne zgłoszenia, od najnowszego, bez numeru autora.
  // EN: The student sees only their own reports, newest first, without the author id.
  it('oddaje tylko własne zgłoszenia, od najnowszego / returns only own reports, newest first', async () => {
    // PL: Odczytaj listę.
    // EN: Read the list.
    const response = await send();
    const { reports } = (await response.json()) as { reports: Record<string, unknown>[] };

    // PL: Są dwa własne zgłoszenia, bez cudzego.
    // EN: There are two own reports, without the foreign one.
    expect(response.status).toBe(200);
    expect(reports.map((item) => item.id)).toEqual(['seed-projektor', 'seed-okno']);
    // PL: Żaden wiersz nie ma numeru autora ani znacznika anonimowości.
    // EN: No row has the author id or the anonymity flag.
    for (const item of reports) {
      expect(item).not.toHaveProperty('authorId');
      expect(item).not.toHaveProperty('isAnonymous');
    }
  });

});

// PL: Grupa testów kolejności listy.
// EN: A group of tests for the list order.
describe('GET / kolejność / order', () => {
  // PL: Świeżo wysłane zgłoszenie jest na początku listy.
  // EN: A freshly sent report is at the top of the list.
  it('nowe zgłoszenie jest pierwsze / a new report is first', async () => {
    // PL: Wyślij zgłoszenie i odczytaj listę.
    // EN: Send a report and read the list.
    const { id } = (await (await post(BODY)).json()) as { id: string };
    const response = await send();
    const { reports } = (await response.json()) as { reports: { id: string; stage: string }[] };

    // PL: Nowe zgłoszenie jest pierwsze i ma etap received.
    // EN: The new report is first and has the received stage.
    expect(reports[0]).toMatchObject({ id, stage: 'received' });
  });

});
