/**
 * PL: Test funkcji listSimilarReports na prawdziwej bazie D1 z testowego Workera. Sprawdza filtr kategorii i miejsca, pomijanie własnych i załatwionych, zgłoszenia bez autora, sortowanie, limit i brak numerów autorów w odpowiedzi.
 * EN: Test of the listSimilarReports function on a real D1 database of the test Worker. Checks the category and place filter, skipping own and resolved reports, reports without an author, sorting, the limit and that no author ids appear in the answer.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/reports/student/similarReports.ts::listSimilarReports
 * @uses worker/reports/student/testDatabase.ts::resetDatabase
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/schema/reports.ts::reportJoins
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Drizzle dla bazy D1, żeby dopisać dane w teście.
// EN: Drizzle for the D1 database, to add data within a test.
import { drizzle } from 'drizzle-orm/d1';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { listSimilarReports } from './similarReports';
// PL: Tabele do dopisania danych i numer ucznia z seedu.
// EN: The tables to add data to and the seed student id.
import { reportJoins, reports } from '../../db/schema/reports';
import { SEED_STUDENT_ID } from '../../db/seed/reports';
import { resetDatabase } from './testDatabase';

/** PL: Baza użyta w bieżącym teście. EN: The database used in the current test. */
let db: D1Database;

// PL: Przed każdym testem wracamy do czystych danych testowych.
// EN: Before every test we go back to clean test data.
beforeEach(async () => {
  db = await resetDatabase();
});

// PL: Grupa testów filtrowania listy.
// EN: A group of tests for filtering the list.
describe('listSimilarReports filtr / filter', () => {
  // PL: Uczeń nie widzi własnych zgłoszeń, a załatwione zgłoszenie znika z listy.
  // EN: The student does not see their own reports, and a resolved report disappears from the list.
  it('pomija własne i załatwione / skips own and resolved', async () => {
    // PL: Uczeń z seedu pyta o sprzęt w sali: jedyne pasujące zgłoszenia są jego własne albo załatwione.
    // EN: The seed student asks about equipment in a classroom: the only matching reports are own or resolved.
    const result = await listSimilarReports(db, SEED_STUDENT_ID, { category: 'room_equipment', place: 'classroom' });

    // PL: Lista jest pusta.
    // EN: The list is empty.
    expect(result).toEqual([]);
  });

  // PL: Inny uczeń widzi otwarte zgłoszenie z tej samej kategorii i miejsca, z liczbą dołączeń i flagą „dołączyłem”.
  // EN: Another student sees the open report of the same category and place, with the join count and the "joined" flag.
  it('pokazuje cudze otwarte z liczbą i flagą / shows others open reports with the count and the flag', async () => {
    // PL: Uczeń drugi pyta o sprzęt w sali: widzi zgłoszenie „projektor”, do którego już dołączył.
    // EN: The second student asks about equipment in a classroom: sees the "projector" report that he already joined.
    const result = await listSimilarReports(db, 'seed-user-2', { category: 'room_equipment', place: 'classroom' });

    // PL: Jedno zgłoszenie, jeden głos, flaga prawda.
    // EN: One report, one vote, the flag is true.
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'seed-projektor', joinCount: 1, joinedByMe: true, stage: 'in_progress' });
  });

  // PL: Zgłoszenie z innej kategorii albo miejsca się nie pojawia.
  // EN: A report of another category or place does not appear.
  it('filtruje po kategorii i miejscu / filters by category and place', async () => {
    // PL: Pytamy o bezpieczeństwo na korytarzu, a nie o sprzęt w sali.
    // EN: We ask about safety in the corridor, not about equipment in a classroom.
    const result = await listSimilarReports(db, 'nikt', { category: 'safety', place: 'corridor' });

    // PL: Zostaje tylko zgłoszenie cudze z korytarza, bez dołączenia tego ucznia.
    // EN: Only the other student's corridor report stays, without a join by this student.
    expect(result).toMatchObject([{ id: 'seed-cudze', joinCount: 1, joinedByMe: false }]);
  });

  // PL: Zgłoszenie bez autora (po usunięciu konta) zostaje na liście.
  // EN: A report without an author (after an account deletion) stays on the list.
  it('zostawia zgłoszenia bez autora / keeps reports without an author', async () => {
    // PL: Zeruj autora cudzego zgłoszenia, jak po usunięciu konta autora.
    // EN: Clear the author of the other student's report, as after the author's account is deleted.
    await db.prepare("UPDATE reports SET author_id = NULL WHERE id = 'seed-cudze'").run();
    const result = await listSimilarReports(db, 'nikt', { category: 'safety', place: 'corridor' });

    // PL: Zgłoszenie dalej jest na liście.
    // EN: The report is still on the list.
    expect(result.map((item) => item.id)).toEqual(['seed-cudze']);
  });
});

// PL: Grupa testów kształtu odpowiedzi i anonimowości.
// EN: A group of tests for the shape of the answer and anonymity.
describe('listSimilarReports anonimowość / anonymity', () => {
  // PL: W odpowiedzi nie ma numeru autora ani numerów osób, które dołączyły.
  // EN: The answer has no author id and no ids of the people who joined.
  it('nie zwraca numerów autora ani dołączających / does not return author or joining ids', async () => {
    // PL: Pobierz zgłoszenie cudze, do którego dołączył uczeń z seedu.
    // EN: Get the other student's report that the seed student joined.
    const result = await listSimilarReports(db, 'nikt', { category: 'safety', place: 'corridor' });

    // PL: Klucze są tylko z listy dozwolonych pól, a tekst odpowiedzi nie zawiera numeru autora.
    // EN: The keys are only from the list of allowed fields, and the answer text has no author id.
    expect(Object.keys(result[0]).sort()).toEqual(['category', 'createdAt', 'description', 'id', 'joinCount', 'joinedByMe', 'place', 'placeDetail', 'stage']);
    expect(JSON.stringify(result)).not.toContain('seed-user');
  });
});

// PL: Grupa testów kolejności i limitu.
// EN: A group of tests for the order and the limit.
describe('listSimilarReports kolejność i limit / order and limit', () => {
  // PL: Najbardziej poparte zgłoszenia są pierwsze, a lista ma najwyżej pięć pozycji.
  // EN: The most supported reports come first, and the list has at most five items.
  it('sortuje po dołączeniach i ucina do pięciu / sorts by joins and cuts to five', async () => {
    // PL: Dopisz sześć nowych zgłoszeń tej samej kategorii i miejsca; jedno dostaje dwa dołączenia.
    // EN: Add six new reports of the same category and place; one of them gets two joins.
    const orm = drizzle(db);
    const rows = Array.from({ length: 6 }, (_, index) => ({
      id: `extra-${index}`,
      authorId: 'seed-user-2',
      isAnonymous: true,
      category: 'safety' as const,
      place: 'corridor' as const,
      placeDetail: null,
      description: `Dodatkowe zgłoszenie ${index}`,
      stage: 'received' as const,
      createdAt: Date.UTC(2026, 9, 1 + index),
      updatedAt: Date.UTC(2026, 9, 1 + index),
    }));
    await orm.insert(reports).values(rows);
    await orm.insert(reportJoins).values([
      { reportId: 'extra-5', userId: 'nikt-a', createdAt: 1 },
      { reportId: 'extra-5', userId: 'nikt-b', createdAt: 2 },
    ]);

    // PL: Pytamy jako inny uczeń, żeby własne nie wypadły z listy.
    // EN: We ask as another student, so no own report drops out of the list.
    const result = await listSimilarReports(db, 'nikt', { category: 'safety', place: 'corridor' });

    // PL: Pierwsze jest zgłoszenie z dwoma dołączeniami, a lista ma pięć pozycji.
    // EN: The first is the report with two joins, and the list has five items.
    expect(result).toHaveLength(5);
    expect(result[0]).toMatchObject({ id: 'extra-5', joinCount: 2 });
  });
});
