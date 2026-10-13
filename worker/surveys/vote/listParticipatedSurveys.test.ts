/**
 * PL: Test listy ankiet jednego ucznia (listParticipatedSurveys) wywoływanej przez drzwi modułu worker/surveys/index.ts. Sprawdza, że wynik ma tylko ankiety tego ucznia, od ostatnio kończącej się, z dokładnie czterema polami, a wybory odpowiedzi i liczniki nigdy się nie pojawiają. Działa na prawdziwej bazie D1 testów.
 * EN: Test of the list of one student's surveys (listParticipatedSurveys) called through the module door worker/surveys/index.ts. Checks that the result holds only this student's surveys, the latest ending first, with exactly four fields, and that the answers chosen and the counters never appear. It runs on the real test D1 database.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/surveys/index.ts::listParticipatedSurveys
 * @uses worker/db/schema/surveys.ts::surveys
 * @uses worker/db/schema/surveys.ts::surveyParticipation
 * @used_by vitest.config.ts::include
 */

// PL: Baza testowa D1 i funkcje testowe Vitest.
// EN: The D1 test database and Vitest test functions.
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
// PL: Drizzle do wpisania ankiet testowych.
// EN: Drizzle for inserting the test surveys.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele ankiet.
// EN: The survey tables.
import { surveyOptions, surveyParticipation, surveyQuestions, surveys } from '../../db/schema/surveys';
// PL: Funkcja, którą sprawdzamy, importowana z drzwi modułu surveys.
// EN: The function under test, imported from the door of the surveys module.
import { listParticipatedSurveys } from '../index';

// PL: Grupa testów listy ankiet ucznia.
// EN: A group of tests of a student's survey list.
describe('listParticipatedSurveys', () => {
  // PL: Wynik ma tylko ankiety tego ucznia, od ostatnio kończącej się, bez wyborów i liczników.
  // EN: The result has only this student's surveys, the latest ending first, without choices and counters.
  it('zwraca tylko ankiety ucznia, bez odpowiedzi i liczników / returns only the student\'s surveys, without answers and counters', async () => {
    // PL: Trzy ankiety; jedna z pytaniem i odpowiedzią z licznikiem 3, żeby sprawdzić, że nic z tego nie wycieka.
    // EN: Three surveys; one has a question and an answer with the counter 3, to check that none of it leaks.
    const db = drizzle(env.DB);
    await db.insert(surveys).values([
      { id: 'lst-a', label: 'Zajęcia', title: 'Ankieta A', endsOn: '2099-12-31' },
      { id: 'lst-b', label: null, title: 'Ankieta B', endsOn: '2099-06-30' },
      { id: 'lst-c', label: null, title: 'Ankieta C', endsOn: '2099-01-31' },
    ]);
    await db.insert(surveyQuestions).values({ id: 'lst-a-1', surveyId: 'lst-a', position: 1, prompt: 'Pytanie A?' });
    await db.insert(surveyOptions).values({ id: 'lst-a-1-x', questionId: 'lst-a-1', position: 1, label: 'Tak', votes: 3 });
    await db.insert(surveyParticipation).values([
      { surveyId: 'lst-a', userId: 'student-lst-0001' },
      { surveyId: 'lst-b', userId: 'student-lst-0001' },
      { surveyId: 'lst-c', userId: 'student-lst-0002' },
    ]);

    // PL: Uczeń 0001 wypełnił A i B. Ankieta C jest cudza i nie może się pojawić.
    // EN: Student 0001 filled in A and B. Survey C is someone else's and must not appear.
    expect(await listParticipatedSurveys(env.DB, 'student-lst-0001')).toEqual([
      { id: 'lst-a', label: 'Zajęcia', title: 'Ankieta A', endsOn: '2099-12-31' },
      { id: 'lst-b', label: null, title: 'Ankieta B', endsOn: '2099-06-30' },
    ]);
  });

  // PL: Uczeń, który nie wypełnił żadnej ankiety, dostaje pustą listę.
  // EN: A student who filled in no survey gets an empty list.
  it('zwraca pustą listę dla ucznia bez udziałów / returns an empty list for a student without participations', async () => {
    expect(await listParticipatedSurveys(env.DB, 'student-lst-brak')).toEqual([]);
  });
});
