/**
 * PL: Test funkcji joinReport na prawdziwej bazie D1 z testowego Workera. Sprawdza jeden głos na ucznia, odmowę dla własnego i załatwionego zgłoszenia oraz nieistniejące numery.
 * EN: Test of the joinReport function on a real D1 database of the test Worker. Checks one vote per student, the refusal for an own or resolved report, and non-existing ids.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/reports/student/joinReport.ts::joinReport
 * @uses worker/reports/student/testDatabase.ts::resetDatabase
 * @uses worker/db/schema/reports.ts::reportJoins
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { joinReport } from './joinReport';
// PL: Baza testowa.
// EN: The test database.
import { resetDatabase } from './testDatabase';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;

// PL: Przed każdym testem wracamy do czystych danych testowych.
// EN: Before every test we go back to clean test data.
beforeEach(async () => {
  db = await resetDatabase();
});

// PL: Grupa testów dołączania.
// EN: A group of tests for joining.
describe('joinReport dołączanie / joining', () => {
  // PL: Uczeń dołącza do cudzego, otwartego zgłoszenia i dostaje aktualną liczbę.
  // EN: A student joins someone else's open report and gets the current count.
  it('dołącza i zwraca liczbę po zmianie / joins and returns the count after the change', async () => {
    // PL: Dołącza nowy uczeń do zgłoszenia, które ma już jedno dołączenie.
    // EN: A new student joins a report that already has one join.
    const result = await joinReport(db, 'nikt', 'seed-cudze');

    // PL: Liczba dołączeń rośnie z jednego do dwóch.
    // EN: The number of joins goes from one to two.
    expect(result).toEqual({ ok: true, joinCount: 2 });
  });

  // PL: Powtórne kliknięcie nie dubluje dołączenia (jeden głos na ucznia).
  // EN: A repeated click does not duplicate the join (one vote per student).
  it('powtórne dołączenie zostawia jeden wiersz / a repeated join keeps one row', async () => {
    // PL: Dołącz dwa razy tym samym uczniem.
    // EN: Join twice with the same student.
    await joinReport(db, 'nikt', 'seed-cudze');
    const second = await joinReport(db, 'nikt', 'seed-cudze');
    const rows = await db.prepare("SELECT COUNT(*) AS n FROM report_joins WHERE report_id = 'seed-cudze' AND user_id = 'nikt'").first<{ n: number }>();

    // PL: Liczba się nie zmienia, a w bazie jest jeden wiersz tego ucznia.
    // EN: The count does not change, and the database has one row of this student.
    expect(second).toEqual({ ok: true, joinCount: 2 });
    expect(rows?.n).toBe(1);
  });

  // PL: Uczeń, który już dołączył, może dołączyć ponownie po usunięciu wiersza (test odtwarza stan z bazy).
  // EN: A student who already joined can join again after the row is removed (the test recreates the state from the database).
  it('liczy od nowa po usunięciu dołączenia / counts again after the join is removed', async () => {
    // PL: Uczeń z seedu już dołączył do cudzego zgłoszenia; usuń jego wiersz i dołącz ponownie.
    // EN: The seed student already joined the other student's report; remove his row and join again.
    await db.prepare("DELETE FROM report_joins WHERE report_id = 'seed-cudze' AND user_id = 'seed-user-1'").run();
    const result = await joinReport(db, 'seed-user-1', 'seed-cudze');

    // PL: Zgłoszenie miało tylko to dołączenie, więc po ponownym dołączeniu liczba wraca do jednego.
    // EN: The report had only this join, so after joining again the count is back to one.
    expect(result).toEqual({ ok: true, joinCount: 1 });
  });
});

// PL: Grupa testów odmów.
// EN: A group of tests for refusals.
describe('joinReport odmowy / refusals', () => {
  // PL: Nie dołączamy do własnego zgłoszenia.
  // EN: We do not join your own report.
  it('odmawia dla własnego zgłoszenia / refuses an own report', async () => {
    // PL: Autor zgłoszenia „cudze” próbuje dołączyć do własnego.
    // EN: The author of the "foreign" report tries to join his own.
    const result = await joinReport(db, 'seed-user-2', 'seed-cudze');

    // PL: Odmowa z powodem „własne”.
    // EN: A refusal with the reason "own".
    expect(result).toEqual({ ok: false, reason: 'own_report' });
  });

  // PL: Załatwionego zgłoszenia nie da się już poprzeć, a nieistniejące to też brak.
  // EN: A resolved report can no longer be supported, and a non-existing one is missing too.
  it('odmawia dla załatwionego i nieistniejącego / refuses a resolved and a non-existing report', async () => {
    // PL: Zgłoszenie „okno” jest załatwione, a „nie-ma” nie istnieje.
    // EN: The "window" report is resolved, and "nie-ma" does not exist.
    const resolved = await joinReport(db, 'nikt', 'seed-okno');
    const missing = await joinReport(db, 'nikt', 'nie-ma');

    // PL: Oba przypadki dają ten sam powód „nie znaleziono”.
    // EN: Both cases give the same reason "not found".
    expect(resolved).toEqual({ ok: false, reason: 'not_found' });
    expect(missing).toEqual({ ok: false, reason: 'not_found' });
  });
});
