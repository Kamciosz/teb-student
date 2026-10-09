/**
 * PL: Test funkcji deleteSurveysStudentData na prawdziwej bazie D1: kasuje wpisy udziału tylko tego ucznia, cudze zostają, a liczniki głosów się nie zmieniają, bo wyniki są anonimowe. Samo zapytanie kasujące, z warunkiem WHERE po numerze ucznia, sprawdza też queries.test.ts.
 * EN: Test of the deleteSurveysStudentData function on a real D1 database: it deletes the participation rows of this student only, other people's rows stay, and the vote counters do not change, because the results are anonymous. The deleting query itself, with a WHERE condition on the student id, is also checked by queries.test.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/surveys/vote/deleteStudentData.ts::deleteSurveysStudentData
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (binding DB, tabele ze schematu).
// EN: The Worker test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
// PL: Klient bazy do przygotowania i sprawdzenia wierszy.
// EN: The database client for preparing and checking rows.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele ankiet.
// EN: The survey tables.
import { surveyOptions, surveyParticipation, surveyQuestions, surveys } from '../../db/schema/surveys';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { deleteSurveysStudentData } from './deleteStudentData';

// PL: Grupa testów kasowania danych ucznia z modułu surveys.
// EN: A group of tests for deleting the student's data from the surveys module.
describe('deleteSurveysStudentData', () => {
  // PL: Ślad ucznia znika, cudzy zostaje, a wyniki ankiety się nie zmieniają.
  // EN: The student's trace goes away, other people's stays, and the survey results do not change.
  it('kasuje udział tylko tego ucznia i nie rusza liczników / deletes this student participation only and leaves the counters', async () => {
    // PL: Przygotuj ankietę z jedną odpowiedzią o liczniku 2 i udziałem dwóch uczniów.
    // EN: Prepare a survey with one option with the counter 2 and the participation of two students.
    const db = drizzle(env.DB);
    await db.insert(surveys).values({ id: 'del', label: null, title: 'Kasowanie', endsOn: '2099-12-31' });
    await db.insert(surveyQuestions).values({ id: 'del-1', surveyId: 'del', position: 1, prompt: 'Pytanie?' });
    await db.insert(surveyOptions).values({ id: 'del-1-a', questionId: 'del-1', position: 1, label: 'A', votes: 2 });
    await db.insert(surveyParticipation).values([
      { surveyId: 'del', userId: 'student-del-0001' },
      { surveyId: 'del', userId: 'student-del-0002' },
    ]);

    // PL: Skasuj dane pierwszego ucznia.
    // EN: Delete the first student's data.
    await deleteSurveysStudentData({ userId: 'student-del-0001', db: env.DB });

    // PL: Został tylko drugi uczeń, a licznik nadal wynosi 2.
    // EN: Only the second student is left, and the counter is still 2.
    const participation = await db.select().from(surveyParticipation);
    const options = await db.select().from(surveyOptions);
    expect(participation.map((row) => row.userId)).toEqual(['student-del-0002']);
    expect(options[0]?.votes).toBe(2);
  });
});
