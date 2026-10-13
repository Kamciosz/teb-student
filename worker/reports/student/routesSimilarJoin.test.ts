/**
 * PL: Test tras „Mnie też” routera podtoru 4a na prawdziwej bazie D1 z testowego Workera. Sprawdza 401 bez sesji, błędy zapytania (400), odpowiedź listy bez numerów osób i kody odmowy dołączenia (404, 409) oraz dołączenie (200).
 * EN: Test of the "Me too" routes of the 4a router on a real D1 database of the test Worker. Checks 401 without a session, query errors (400), the list answer without people's ids, the join refusal codes (404, 409) and the join (200).
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/reports/student/routes.ts::reportsStudentApp
 * @uses worker/reports/student/testDatabase.ts::resetDatabase
 * @uses worker/auth/email/testRuntime.ts::signIn
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera (baza D1 i ustawienia).
// EN: The Worker test environment (the D1 database and the settings).
import { env } from 'cloudflare:workers';
// PL: Logowanie ucznia w teście, tak jak w routes.test.ts.
// EN: Signing a student in within a test, as in routes.test.ts.
import { createTestRuntime, signIn } from '../../auth/email/testRuntime';
// PL: Router, który sprawdzamy.
// EN: The router under test.
import { reportsStudentApp } from './routes';
// PL: Baza testowa.
// EN: The test database.
import { resetDatabase } from './testDatabase';

/** PL: Sekret podpisu sesji z testRuntime.ts. EN: The session signing secret from testRuntime.ts. */
const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;

/** PL: Ciasteczko sesji ucznia zalogowanego w bieżącym teście. EN: The session cookie of the student signed in the current test. */
let cookie: string;

/**
 * PL: Wysyła zapytanie do routera pod podaną ścieżką jako zalogowany uczeń (albo bez sesji, gdy `signedIn` to false).
 * EN: Sends a request to the router at the given path as the signed-in student (or without a session when `signedIn` is false).
 *
 * @param path - PL: ścieżka z zapytaniem, na przykład „/similar?category=safety”. EN: the path with the query, for example "/similar?category=safety".
 * @param init - PL: metoda i nagłówki. EN: the method and headers.
 * @param signedIn - PL: czy dołączyć ciasteczko sesji (domyślnie tak). EN: whether to attach the session cookie (yes by default).
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function call(path: string, init: RequestInit = {}, signedIn = true): Response | Promise<Response> {
  // PL: Nagłówki z ciasteczkiem sesji albo bez niego.
  // EN: The headers with the session cookie or without it.
  const headers = { ...(init.headers as Record<string, string> | undefined), ...(signedIn ? { cookie } : {}) };
  return reportsStudentApp.request(path, { ...init, headers }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
}

// PL: Przed każdym testem logujemy ucznia i wracamy do czystych danych testowych.
// EN: Before every test we sign a student in and go back to clean test data.
beforeEach(async () => {
  // PL: Zaloguj ucznia kodem i sprawdź, jaki ma numer; jego dołączenia z seedu dostają ten numer.
  // EN: Sign the student in with a code and read their id; the seed joins of the student get this id.
  const login = createTestRuntime();
  cookie = await signIn(login, 'jan.test@teb.edu.pl');
  const session = await login.runtime.auth.api.getSession({ headers: new Headers({ cookie }) });
  db = await resetDatabase(session?.user.id ?? '');
});

// PL: Grupa testów dostępu: bez sesji obie nowe trasy odpowiadają 401.
// EN: A group of access tests: without a session both new routes answer 401.
describe('401 bez sesji / 401 without a session', () => {
  // PL: Lista podobnych zgłoszeń wymaga sesji.
  // EN: The list of similar reports requires a session.
  it('GET /similar bez sesji daje 401 / GET /similar without a session gives 401', async () => {
    // PL: Zapytaj bez ciasteczka.
    // EN: Ask without the cookie.
    const response = await call('/similar?category=safety&place=corridor', {}, false);

    // PL: Kod 401.
    // EN: Code 401.
    expect(response.status).toBe(401);
  });

  // PL: Dołączenie bez sesji jest odrzucone i nic nie zapisuje.
  // EN: Joining without a session is rejected and saves nothing.
  it('POST /:id/join bez sesji daje 401 i nic nie zapisuje / POST /:id/join without a session gives 401 and saves nothing', async () => {
    // PL: Spróbuj dołączyć bez ciasteczka.
    // EN: Try to join without the cookie.
    const response = await call('/seed-cudze/join', { method: 'POST' }, false);
    const row = await db.prepare("SELECT COUNT(*) AS n FROM report_joins WHERE report_id = 'seed-cudze'").first<{ n: number }>();

    // PL: Kod 401 i nadal jedno dołączenie z seedu.
    // EN: Code 401 and still the one join from the seed.
    expect(response.status).toBe(401);
    expect(row?.n).toBe(1);
  });
});

// PL: Grupa testów listy podobnych zgłoszeń.
// EN: A group of tests for the list of similar reports.
describe('GET /similar', () => {
  // PL: Zapytanie bez kodu kategorii albo miejsca to błąd 400.
  // EN: A query without a category or place code is error 400.
  it('odrzuca brakujący albo zły kod kodem 400 / rejects a missing or bad code with 400', async () => {
    // PL: Trzy złe zapytania: bez parametrów, z nieznaną kategorią, z nieznanym miejscem.
    // EN: Three bad queries: without parameters, with an unknown category, with an unknown place.
    const none = await call('/similar');
    const badCategory = await call('/similar?category=xyz&place=corridor');
    const badPlace = await call('/similar?category=safety&place=dach');

    // PL: Każde dostaje 400 z tym samym kodem błędu.
    // EN: Each gets 400 with the same error code.
    for (const response of [none, badCategory, badPlace]) {
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'invalid_query' });
    }
  });

  // PL: Odpowiedź ma otwarte zgłoszenia z liczbą dołączeń i flagą, bez numerów osób.
  // EN: The answer has the open reports with the join count and the flag, without people's ids.
  it('oddaje podobne zgłoszenia bez numerów osób / returns similar reports without people ids', async () => {
    // PL: Pytamy o korytarz i bezpieczeństwo, gdzie uczeń z sesji już dołączył do cudzego zgłoszenia.
    // EN: We ask about safety in the corridor, where the signed-in student already joined someone else's report.
    const response = await call('/similar?category=safety&place=corridor');
    const { reports } = (await response.json()) as { reports: Record<string, unknown>[] };

    // PL: Jedno zgłoszenie z jednym głosem i flagą prawda; brak pól z numerami.
    // EN: One report with one vote and the flag true; no fields with ids.
    expect(response.status).toBe(200);
    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({ id: 'seed-cudze', joinCount: 1, joinedByMe: true });
    expect(reports[0]).not.toHaveProperty('authorId');
    expect(JSON.stringify(reports)).not.toContain('seed-user');
  });
});

// PL: Grupa testów dołączania „Mnie też”.
// EN: A group of tests for the "Me too" join.
describe('POST /:id/join', () => {
  // PL: Własne zgłoszenie daje 409 z powodem.
  // EN: An own report gives 409 with the reason.
  it('własne zgłoszenie daje 409 / an own report gives 409', async () => {
    // PL: Uczeń z sesji próbuje dołączyć do własnego zgłoszenia z seedu.
    // EN: The signed-in student tries to join his own seed report.
    const response = await call('/seed-projektor/join', { method: 'POST' });

    // PL: Kod 409 i powód „własne”.
    // EN: Code 409 and the reason "own".
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'own_report' });
  });

  // PL: Załatwione albo nieistniejące zgłoszenie daje 404.
  // EN: A resolved or non-existing report gives 404.
  it('załatwione i nieistniejące daje 404 / a resolved and a non-existing report give 404', async () => {
    // PL: Dwa zapytania: zgłoszenie załatwione i zgłoszenie, którego nie ma.
    // EN: Two requests: a resolved report and a report that does not exist.
    const resolved = await call('/seed-okno/join', { method: 'POST' });
    const missing = await call('/nie-ma/join', { method: 'POST' });

    // PL: Oba dają 404 z powodem „nie znaleziono”.
    // EN: Both give 404 with the reason "not found".
    expect(resolved.status).toBe(404);
    expect(await resolved.json()).toEqual({ error: 'not_found' });
    expect(missing.status).toBe(404);
  });

  // PL: Dołączenie do cudzego, otwartego zgłoszenia daje 200 z liczbą i flagą; powtórne nie dubluje.
  // EN: Joining someone else's open report gives 200 with the count and the flag; a repeated join does not duplicate.
  it('dołączenie daje 200 i nie dubluje / a join gives 200 and does not duplicate', async () => {
    // PL: Dołącz dwa razy do zgłoszenia, do którego uczeń już dołączył w seedzie.
    // EN: Join twice to the report that the student already joined in the seed.
    const first = await call('/seed-cudze/join', { method: 'POST' });
    const second = await call('/seed-cudze/join', { method: 'POST' });
    const row = await db.prepare("SELECT COUNT(*) AS n FROM report_joins WHERE report_id = 'seed-cudze'").first<{ n: number }>();

    // PL: Oba zapytania dają 200 z tą samą liczbą, a w bazie wciąż jeden wiersz tego ucznia.
    // EN: Both requests give 200 with the same count, and the database still has one row of this student.
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ joinCount: 1, joinedByMe: true });
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ joinCount: 1, joinedByMe: true });
    expect(row?.n).toBe(1);
  });
});
