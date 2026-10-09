/**
 * PL: Test zapytań ankiet, które da się sprawdzić bez bazy: kasowanie śladu ucznia musi mieć warunek WHERE po numerze ucznia (docs/STANDARD_KODU.md, część 7), a zapytania o odpowiedzi nie mogą wybierać licznika głosów.
 * EN: Test of the survey queries that can be checked without a database: deleting a student's trace must have a WHERE condition on the student id (docs/STANDARD_KODU.md, part 7), and the option queries must not select the vote counter.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/queries.ts::buildParticipationDelete
 * @used_by vitest.config.ts::include
 */

// PL: Drizzle bez prawdziwej bazy: zapytanie można zbudować i obejrzeć jako SQL, nie uruchamiając go.
// EN: Drizzle without a real database: a query can be built and inspected as SQL without running it.
import { drizzle } from 'drizzle-orm/d1';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Baza i funkcje, które sprawdzamy.
// EN: The database and the functions under test.
import type { VoteDatabase } from './database';
import { buildParticipationDelete, loadQuestions } from './queries';

// PL: Baza do oglądania SQL. Obiekt D1 jest pusty, bo zapytań nie uruchamiamy.
// EN: A database for inspecting SQL. The D1 object is empty, because we do not run the queries.
const db = drizzle({} as D1Database) as unknown as VoteDatabase;

// PL: Grupa testów kasowania.
// EN: A group of tests for the deletion.
describe('buildParticipationDelete', () => {
  it('kasuje tylko wiersze danego ucznia / deletes only the given student rows', () => {
    const query = buildParticipationDelete(db, 'student-123').toSQL();

    expect(query.sql).toBe('delete from "survey_participation" where "survey_participation"."user_id" = ?');
    expect(query.params).toEqual(['student-123']);
  });
});

// PL: Grupa testów odczytu pytań.
// EN: A group of tests for reading the questions.
describe('loadQuestions', () => {
  it('nie wybiera licznika głosów / does not select the vote counter', async () => {
    // PL: Zapisz każde zapytanie, które funkcja próbuje wysłać, i zwróć pusty wynik.
    // EN: Record every query the function tries to send, and return an empty result.
    const sent: string[] = [];
    const recorder = {
      prepare: (sql: string) => {
        sent.push(sql);
        const statement = { bind: () => statement, raw: async () => [], all: async () => ({ results: [] }) };
        return statement;
      },
    };
    const recordingDb = drizzle(recorder as unknown as D1Database) as unknown as VoteDatabase;

    await loadQuestions(recordingDb, 'any');

    // PL: Pytania są puste, więc leci tylko pierwsze zapytanie, a żadne nie wspomina o licznika.
    // EN: The questions are empty, so only the first query goes out, and none mentions the counter.
    expect(sent.length).toBeGreaterThan(0);
    expect(sent.some((sql) => sql.includes('votes'))).toBe(false);
  });
});
