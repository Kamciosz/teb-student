/**
 * PL: Test funkcji countSurveyParticipations na prawdziwej bazie D1 testowego Workera. Sprawdza, że liczba obejmuje udziały we wszystkich ankietach i rośnie o jeden po nowym udziale, a wybory odpowiedzi nie wpływają na wynik.
 * EN: Test of the countSurveyParticipations function on a real D1 database of the test Worker. Checks that the number covers the participations in all surveys and grows by one after a new participation, and that the choices of answers do not change the result.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/surveys/index.ts::countSurveyParticipations
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (binding DB, tabele ze schematu).
// EN: The Worker test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
// PL: Operator równości do zapytania o jedną odpowiedź.
// EN: The equality operator for a query about one answer.
import { eq } from 'drizzle-orm';
// PL: Klient bazy do przygotowania wierszy.
// EN: The database client for preparing rows.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele ankiet.
// EN: The survey tables.
import { surveyOptions, surveyParticipation, surveyQuestions, surveys } from '../../db/schema/surveys';
// PL: Funkcja, którą sprawdzamy, importowana z drzwi modułu surveys.
// EN: The function under test, imported from the door of the surveys module.
import { countSurveyParticipations } from '../index';

// PL: Grupa testów liczby udziałów w ankietach.
// EN: A group of tests of the number of survey participations.
describe('countSurveyParticipations', () => {
  // PL: Liczba obejmuje udziały ze wszystkich ankiet, nie tylko z jednej.
  // EN: The number covers the participations of all surveys, not only one.
  it('liczy udziały we wszystkich ankietach / counts the participations of all surveys', async () => {
    // PL: Dwie ankiety z dwoma i jednym udziałem.
    // EN: Two surveys with two and one participations.
    const db = drizzle(env.DB);
    const before = await countSurveyParticipations(env.DB);
    await db.insert(surveys).values([
      { id: 'cnt-a', label: null, title: 'Liczenie A', endsOn: '2099-12-31' },
      { id: 'cnt-b', label: null, title: 'Liczenie B', endsOn: '2099-12-31' },
    ]);
    await db.insert(surveyParticipation).values([
      { surveyId: 'cnt-a', userId: 'student-cnt-0001' },
      { surveyId: 'cnt-a', userId: 'student-cnt-0002' },
      { surveyId: 'cnt-b', userId: 'student-cnt-0001' },
    ]);

    expect(await countSurveyParticipations(env.DB)).toBe(before + 3);
  });

  // PL: Nowy udział podbija liczbę dokładnie o jeden, a wybór odpowiedzi nie zmienia wyniku.
  // EN: A new participation raises the number by exactly one, and the chosen answer does not change the result.
  it('rośnie o jeden po nowym udziale i nie zależy od wyborów / grows by one after a new participation and does not depend on the choices', async () => {
    // PL: Ankieta z jednym pytaniem i odpowiedzią o liczniku 5.
    // EN: A survey with one question and an answer with the counter 5.
    const db = drizzle(env.DB);
    await db.insert(surveys).values({ id: 'cnt-c', label: null, title: 'Liczenie C', endsOn: '2099-12-31' });
    await db.insert(surveyQuestions).values({ id: 'cnt-c-1', surveyId: 'cnt-c', position: 1, prompt: 'Pytanie?' });
    await db.insert(surveyOptions).values({ id: 'cnt-c-1-a', questionId: 'cnt-c-1', position: 1, label: 'A', votes: 5 });
    const before = await countSurveyParticipations(env.DB);

    // PL: Nowy uczeń wypełnia ankietę.
    // EN: A new student fills in the survey.
    await db.insert(surveyParticipation).values({ surveyId: 'cnt-c', userId: 'student-cnt-0003' });

    expect(await countSurveyParticipations(env.DB)).toBe(before + 1);
    const [option] = await db.select().from(surveyOptions).where(eq(surveyOptions.id, 'cnt-c-1-a'));
    expect(option?.votes).toBe(5);
  });
});
