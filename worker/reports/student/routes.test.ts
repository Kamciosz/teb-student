/**
 * PL: Test routera podtoru 4a na prawdziwej bazie D1 z testowego Workera. Sprawdza zapis zgłoszenia (z pierwszym etapem historii), błędy danych, odczyt tylko własnych zgłoszeń bez numeru autora.
 * EN: Test of the 4a router on a real D1 database of the test Worker. Checks saving a report (with the first history stage), data errors, reading only own reports without the author id.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/reports/student/routes.ts::reportsStudentApp
 * @uses worker/reports/student/testDatabase.ts::resetDatabase
 * @uses worker/db/seed/reports.ts::REPORTS_SEED
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Router, który sprawdzamy.
// EN: The router under test.
import { reportsStudentApp } from './routes';
// PL: Baza testowa.
// EN: The test database.
import { resetDatabase } from './testDatabase';

/** PL: Poprawna treść nowego zgłoszenia. EN: A valid body of a new report. */
const BODY = { category: 'safety', place: 'gym', placeDetail: 'Przy drabinkach', description: 'Luźna deska na podłodze', isAnonymous: false };

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;

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
  return reportsStudentApp.request('/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload }, { DB: db });
}

// PL: Przed każdym testem wracamy do czystych danych testowych.
// EN: Before every test we go back to clean test data.
beforeEach(async () => {
  db = await resetDatabase();
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

    // PL: Odpowiedź to 201 z numerem; wiersz ma etap received i tymczasowego autora.
    // EN: The answer is 201 with an id; the row has the received stage and the temporary author.
    expect(response.status).toBe(201);
    const row = await db.prepare('SELECT author_id, stage, is_anonymous, description FROM reports WHERE id = ?').bind(id).first();
    expect(row).toEqual({ author_id: 'tymczasowy-uczen', stage: 'received', is_anonymous: 0, description: BODY.description });
    const history = await db.prepare('SELECT stage FROM report_stage_changes WHERE report_id = ?').bind(id).all();
    expect(history.results).toEqual([{ stage: 'received' }]);
  });

  // PL: Numer autora z treści jest ignorowany.
  // EN: An author id from the body is ignored.
  it('ignoruje authorId z treści / ignores authorId from the body', async () => {
    // PL: Spróbuj podszyć się pod innego ucznia.
    // EN: Try to impersonate another student.
    const response = await post({ ...BODY, authorId: 'inny-uczen', stage: 'resolved' });
    const { id } = (await response.json()) as { id: string };

    // PL: Wiersz ma autora z serwera i etap received.
    // EN: The row has the server's author and the received stage.
    const row = await db.prepare('SELECT author_id, stage FROM reports WHERE id = ?').bind(id).first();
    expect(row).toEqual({ author_id: 'tymczasowy-uczen', stage: 'received' });
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
    const response = await reportsStudentApp.request('/', {}, { DB: db });
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

// PL: Grupa testów kolejności listy i braku bazy.
// EN: A group of tests for the list order and a missing database.
describe('GET / kolejność i brak bazy / order and no database', () => {
  // PL: Świeżo wysłane zgłoszenie jest na początku listy.
  // EN: A freshly sent report is at the top of the list.
  it('nowe zgłoszenie jest pierwsze / a new report is first', async () => {
    // PL: Wyślij zgłoszenie i odczytaj listę.
    // EN: Send a report and read the list.
    const { id } = (await (await post(BODY)).json()) as { id: string };
    const response = await reportsStudentApp.request('/', {}, { DB: db });
    const { reports } = (await response.json()) as { reports: { id: string; stage: string }[] };

    // PL: Nowe zgłoszenie jest pierwsze i ma etap received.
    // EN: The new report is first and has the received stage.
    expect(reports[0]).toMatchObject({ id, stage: 'received' });
  });

});
