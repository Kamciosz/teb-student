/**
 * PL: Test liczby osób, które dołączyły do zgłoszenia („Mnie też”), w odpowiedziach routera podtoru 4b na prawdziwej bazie D1. Sprawdza liczby 0, 1, 2 i 5 w liście, w szczególe i po zmianie etapu oraz to, że odpowiedź nie zdradza, kto dołączył.
 * EN: Test of the number of people who joined a report ("Me too") in the 4b router responses on a real D1 database. Checks the numbers 0, 1, 2 and 5 in the list, in the detail and after a stage change, and that the response does not reveal who joined.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/reports/admin/routes.ts::reportsAdminApp
 * @uses worker/reports/admin/testDatabase.ts::resetDatabase
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/auth/email/testRuntime.ts::signIn
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera (baza D1 i ustawienia) oraz Drizzle do dopisania zgłoszenia.
// EN: The Worker test environment (the D1 database and the settings) and Drizzle for adding a report.
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
// PL: Logowanie ucznia w teście, tak jak w routes.test.ts.
// EN: Signing a student in within a test, as in routes.test.ts.
import { createTestRuntime, signIn } from '../../auth/email/testRuntime';
// PL: Tabela zgłoszeń i dane testowe z seedu (plik podtoru 4a, tylko import).
// EN: The reports table and the seed test data (a 4a file, import only).
import { reports } from '../../db/schema/reports';
import { OTHER_STUDENT_ID, REPORTS_SEED } from '../../db/seed/reports';
import { reportsAdminApp } from './routes';
import { resetDatabase } from './testDatabase';

/** PL: Sekret podpisu sesji z testRuntime.ts. EN: The session signing secret from testRuntime.ts. */
const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/** PL: Zgłoszenie dodane w teście, z pięcioma dołączeniami. EN: The report added in the test, with five joins. */
const FIVE_JOINS_ID = 'test-piec';

/** PL: Zapytanie dopisujące dołączenie do zgłoszenia. EN: The query that adds a join to a report. */
const INSERT_JOIN = 'INSERT INTO report_joins (report_id, user_id, created_at) VALUES (?, ?, ?)';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;
/** PL: Ciasteczko sesji ucznia zalogowanego w teście. EN: The session cookie of the student signed in for the test. */
let cookie: string;
/** PL: Numer ucznia zalogowanego w teście. EN: The id of the student signed in for the test. */
let studentId: string;

/**
 * PL: Wysyła zapytanie do produkcyjnego routera, jako zalogowany uczeń z rolą Samorządu.
 * EN: Sends a request to the production router, as the signed-in student with the Council role.
 *
 * @param path - PL: adres względem routera. EN: the path relative to the router.
 * @param init - PL: metoda, nagłówki i treść. EN: the method, headers and body.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
async function send(path: string, init: RequestInit = {}): Promise<Response> {
  // PL: Dołącz ciasteczko sesji i wyślij do routera z bazą testową.
  // EN: Attach the session cookie and send to the router with the test database.
  const headers = { ...(init.headers as Record<string, string> | undefined), cookie };
  return reportsAdminApp.request(path, { ...init, headers }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
}

/**
 * PL: Dopisuje podaną liczbę dołączeń do zgłoszenia, każdemu innemu, nieistniejącemu w bazie numerowi.
 * EN: Adds the given number of joins to a report, each from a different id that does not exist in the database.
 *
 * @param reportId - PL: numer zgłoszenia. EN: the report id.
 * @param count - PL: ile dołączeń dopisać. EN: how many joins to add.
 */
async function addJoins(reportId: string, count: number): Promise<void> {
  // PL: Jedna paczka zapytań: każde dołączenie ma inny numer ucznia.
  // EN: One batch of queries: each join has a different student id.
  const statements = Array.from({ length: count }, (_, index) =>
    db.prepare(INSERT_JOIN).bind(reportId, `test-dolaczyl-${reportId}-${index}`, Date.now()),
  );
  await db.batch(statements);
}

// PL: Przed każdym testem zaloguj ucznia z rolą Samorządu i przygotuj zgłoszenia z liczbami dołączeń.
// EN: Before every test sign in a student with the Council role and prepare the reports with their join counts.
beforeEach(async () => {
  // PL: Zaloguj ucznia, odczytaj jego numer i wróć do czystych danych z seedu.
  // EN: Sign the student in, read their id and go back to the clean seed data.
  const login = createTestRuntime();
  cookie = await signIn(login, 'jan.test@teb.edu.pl');
  const session = await login.runtime.auth.api.getSession({ headers: new Headers({ cookie }) });
  studentId = session?.user.id ?? '';
  db = await resetDatabase(studentId, 'council');

  // PL: Zgłoszenie „seed-okno” zostaje bez dołączeń (0), „seed-projektor” ma seedowe dołączenie od drugiego ucznia (1). Do „seed-cudze” dopisujemy jedno (2). Nowe zgłoszenie dostaje pięć (5).
  // EN: The "seed-okno" report stays without joins (0), "seed-projektor" has the seed join from the second student (1). We add one to "seed-cudze" (2). The new report gets five (5).
  await addJoins('seed-cudze', 1);
  await drizzle(db).insert(reports).values({ ...REPORTS_SEED[1], id: FIVE_JOINS_ID, authorId: studentId });
  await addJoins(FIVE_JOINS_ID, 5);
});

// PL: Lista podaje liczbę dla każdego zgłoszenia, bez numerów osób.
// EN: The list gives the number for every report, without the numbers of the people.
describe('liczba dołączeń w liście / join count in the list', () => {
  // PL: Każde zgłoszenie ma swoją liczbę: 0, 1, 2 i 5.
  // EN: Every report has its own number: 0, 1, 2 and 5.
  it('podaje 0, 1, 2 i 5 / gives 0, 1, 2 and 5', async () => {
    // PL: Pobierz listę i zamień ją na mapę numer zgłoszenia → liczba.
    // EN: Fetch the list and turn it into a map of report id → number.
    const response = await send('/');
    const { reports: list } = (await response.json()) as { reports: { id: string; joinCount: number }[] };
    const counts = Object.fromEntries(list.map((item) => [item.id, item.joinCount]));
    expect(counts).toEqual({ 'seed-okno': 0, 'seed-projektor': 1, 'seed-cudze': 2, [FIVE_JOINS_ID]: 5 });
  });
});

// PL: Szczegół i odpowiedź po zmianie etapu niosą tę samą liczbę.
// EN: The detail and the response after a stage change carry the same number.
describe('liczba dołączeń w szczególe i po zmianie etapu / join count in the detail and after a stage change', () => {
  // PL: Szczegół zgłoszenia z pięcioma dołączeniami pokazuje 5.
  // EN: The detail of the report with five joins shows 5.
  it('szczegół pokazuje liczbę / the detail shows the number', async () => {
    const body = (await (await send(`/${FIVE_JOINS_ID}`)).json()) as { report: { joinCount: number } };
    expect(body.report.joinCount).toBe(5);
  });

  // PL: Zmiana etapu zwraca zgłoszenie z tą samą liczbą.
  // EN: A stage change returns the report with the same number.
  it('po zmianie etapu liczba zostaje / the number stays after a stage change', async () => {
    const response = await send(`/${FIVE_JOINS_ID}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ stage: 'in_progress' }) });
    const body = (await response.json()) as { report: { joinCount: number } };
    expect(body.report.joinCount).toBe(5);
  });
});

// PL: Odpowiedzi nie zdradzają, kto dołączył: ani numerów uczniów z dołączeń, ani pola z ich numerem.
// EN: The responses do not reveal who joined: neither the student ids from the joins, nor a field with their id.
describe('prywatność dołączeń / privacy of joins', () => {
  // PL: Lista i szczegół nie zawierają numerów osób, które dołączyły, ani pól z numerem użytkownika.
  // EN: The list and the detail contain no ids of the people who joined, and no field with a user id.
  it('nie ujawnia, kto dołączył / does not reveal who joined', async () => {
    // PL: Odczytaj tekst obu odpowiedzi (lista i szczegół zgłoszenia z dołączeniami).
    // EN: Read the text of both responses (the list and the detail of the report with joins).
    const listText = await (await send('/')).text();
    const detailText = await (await send(`/${FIVE_JOINS_ID}`)).text();
    for (const text of [listText, detailText]) {
      expect(text).not.toContain(OTHER_STUDENT_ID);
      expect(text).not.toContain(studentId);
      expect(text).not.toContain('test-dolaczyl-');
      expect(text).not.toMatch(/"(userId|user_id)"/);
    }
  });
});
