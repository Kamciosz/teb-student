/**
 * PL: Zapytania do bazy podtoru 5a: lista ankiet, szczegóły ankiety, zapis głosu i kasowanie śladu wypełnienia. Każda funkcja dostaje bazę jako parametr, żeby dało się ją sprawdzić na innej bazie.
 *     Zapis głosu to jedna paczka (db.batch, w D1 jedna transakcja): wiersz „kto głosował”, zwiększenie liczników i teksty krótkich odpowiedzi (bez numeru ucznia). Telefon nigdy nie dostaje liczników ani tekstów, bo zapytania o odpowiedzi ich nie wybierają.
 * EN: The subtrack 5a database queries: the survey list, the survey details, writing a vote and deleting the participation trace. Every function takes the database as a parameter, so it can be checked on another database.
 *     Writing a vote is one batch (db.batch, one transaction in D1): the "who voted" row, the counter increments and the short-answer texts (without a student id). The phone never receives the counters or the texts, because the option queries do not select them.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/db/schema/surveys.ts::surveys
 * @uses worker/surveys/vote/surveyList.ts::buildSurveyList
 * @used_by worker/surveys/vote/routes.ts::surveysVoteApp
 * @used_by worker/surveys/vote/deleteStudentData.ts::deleteSurveysStudentData
 * @used_by worker/surveys/vote/queries.test.ts::buildParticipationDelete
 */

// PL: Funkcje Drizzle do warunków, liczenia i zmiany licznika.
// EN: Drizzle functions for conditions, counting and changing the counter.
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
// PL: Tabele modułu surveys.
// EN: The tables of the surveys module.
import { surveyOptions, surveyParticipation, surveyQuestions, surveys, surveyTextAnswers } from '../../db/schema/surveys';
// PL: Typ paczki zapytań D1 (pierwsza pozycja jest wymagana).
// EN: The type of a D1 query batch (the first item is required).
import type { BatchItem } from 'drizzle-orm/batch';
// PL: Baza i rozpoznanie błędu drugiego głosu.
// EN: The database and the recognition of the second-vote error.
import { isUniqueViolation, type VoteDatabase } from './database';
// PL: Składanie listy ankiet.
// EN: Building the survey list.
import { buildSurveyList, type SurveyRow } from './surveyList';
// PL: Tekst krótkiej odpowiedzi po sprawdzeniu.
// EN: A short-answer text after the check.
import type { TextAnswer } from './validation';
// PL: Kształty odpowiedzi.
// EN: The response shapes.
import type { SurveyList, SurveyQuestion } from './types';

/**
 * PL: Błąd rzucany, gdy uczeń już wypełnił tę ankietę.
 * EN: The error thrown when the student has already filled in this survey.
 */
export class AlreadyVotedError extends Error {}

/**
 * PL: Podaje listę ankiet dla ucznia.
 * EN: Gives the survey list for a student.
 *
 * @param db - PL: baza. EN: the database.
 * @param userId - PL: numer ucznia (do oznaczenia wypełnionych). EN: the student id (to mark the filled ones).
 * @param today - PL: dzisiejsza data, RRRR-MM-DD. EN: today's date, YYYY-MM-DD.
 * @param now - PL: ta sama chwila, z której wzięto today. EN: the same moment today was taken from.
 * @returns PL: lista trwających i zakończonych ankiet. EN: the list of running and ended surveys.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function listSurveys(db: VoteDatabase, userId: string, today: string, now: Date): Promise<SurveyList> {
  // PL: Wszystkie ankiety. Tabela jest mała (kilka ankiet w semestrze).
  // EN: All the surveys. The table is small (a few surveys a semester).
  const rows = await db.select().from(surveys);

  // PL: Liczba pytań w każdej ankiecie.
  // EN: The number of questions in every survey.
  const counts = await db
    .select({ surveyId: surveyQuestions.surveyId, total: sql<number>`count(*)` })
    .from(surveyQuestions)
    .groupBy(surveyQuestions.surveyId);

  // PL: Ankiety, które ten uczeń już wypełnił.
  // EN: The surveys this student has already filled in.
  const voted = await db
    .select({ surveyId: surveyParticipation.surveyId })
    .from(surveyParticipation)
    .where(eq(surveyParticipation.userId, userId));

  // PL: Złóż listę z tego, co zwróciła baza.
  // EN: Build the list from what the database returned.
  return buildSurveyList({
    rows,
    questionCounts: new Map(counts.map((item) => [item.surveyId, item.total])),
    votedIds: new Set(voted.map((item) => item.surveyId)),
    today,
    now,
  });
}

/**
 * PL: Szuka ankiety po numerze.
 * EN: Looks up a survey by id.
 *
 * @param db - PL: baza. EN: the database.
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @returns PL: wiersz ankiety albo null, gdy jej nie ma. EN: the survey row, or null when it does not exist.
 */
export async function findSurvey(db: VoteDatabase, surveyId: string): Promise<SurveyRow | null> {
  // PL: Jedno zapytanie z limitem 1.
  // EN: One query with a limit of 1.
  const rows = await db.select().from(surveys).where(eq(surveys.id, surveyId)).limit(1);
  return rows[0] ?? null;
}

/**
 * PL: Sprawdza, czy uczeń już wypełnił ankietę.
 * EN: Checks whether the student has already filled in the survey.
 *
 * @param db - PL: baza. EN: the database.
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @param userId - PL: numer ucznia. EN: the student id.
 * @returns PL: prawda, gdy zapis „kto głosował” istnieje. EN: true when the "who voted" record exists.
 */
export async function hasVoted(db: VoteDatabase, surveyId: string, userId: string): Promise<boolean> {
  // PL: Szukamy wiersza o kluczu (ankieta, uczeń).
  // EN: We look for the row with the key (survey, student).
  const rows = await db
    .select({ surveyId: surveyParticipation.surveyId })
    .from(surveyParticipation)
    .where(and(eq(surveyParticipation.surveyId, surveyId), eq(surveyParticipation.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

/**
 * PL: Pobiera pytania ankiety z odpowiedziami, w kolejności. Nie wybiera liczników głosów.
 * EN: Fetches the survey questions with their options, in order. Does not select the vote counters.
 *
 * @param db - PL: baza. EN: the database.
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @returns PL: pytania z odpowiedziami. EN: the questions with options.
 */
export async function loadQuestions(db: VoteDatabase, surveyId: string): Promise<SurveyQuestion[]> {
  // PL: Pytania ankiety w kolejności.
  // EN: The survey questions in order.
  const questions = await db
    .select({ id: surveyQuestions.id, type: surveyQuestions.type, prompt: surveyQuestions.prompt })
    .from(surveyQuestions)
    .where(eq(surveyQuestions.surveyId, surveyId))
    .orderBy(asc(surveyQuestions.position));
  if (questions.length === 0) return [];

  // PL: Odpowiedzi tych pytań w kolejności. Kolumny wypisane ręcznie, żeby nie wziąć licznika votes.
  // EN: The options of those questions in order. Columns listed by hand, so the votes counter is not taken.
  const options = await db
    .select({ id: surveyOptions.id, questionId: surveyOptions.questionId, label: surveyOptions.label })
    .from(surveyOptions)
    .where(inArray(surveyOptions.questionId, questions.map((question) => question.id)))
    .orderBy(asc(surveyOptions.position));

  // PL: Dopasuj odpowiedzi do ich pytań.
  // EN: Match the options to their questions.
  return questions.map((question) => ({
    ...question,
    options: options.filter((option) => option.questionId === question.id).map(({ id, label }) => ({ id, label })),
  }));
}

/**
 * PL: Zapisuje głos: wiersz „kto głosował”, zwiększenie liczników wybranych odpowiedzi i teksty krótkich odpowiedzi, w jednej paczce. Teksty są zapisane bez numeru ucznia, a liczniki to jedyne miejsce z wyborami.
 * EN: Writes a vote: the "who voted" row, the counter increments of the picked options and the short-answer texts, in one batch. The texts are stored without a student id, and the counters are the only place with the picks.
 *
 * @param db - PL: baza. EN: the database.
 * @param vote - PL: numer ankiety, numer ucznia, numery wybranych odpowiedzi i teksty. EN: the survey id, the student id, the ids of the picked options and the texts.
 * @throws PL: AlreadyVotedError, gdy uczeń już głosował (paczka cofa się w całości, także teksty); inny błąd bazy bez zmian. EN: AlreadyVotedError when the student has already voted (the batch rolls back entirely, texts included); any other database error unchanged.
 */
export async function recordVote(
  db: VoteDatabase,
  vote: { surveyId: string; userId: string; optionIds: string[]; texts: TextAnswer[] },
): Promise<void> {
  try {
    // PL: Wiersz „kto głosował” jest pierwszy, żeby złamany klucz drugiego głosu został wykryty przed resztą. Pozostałe pozycje dokładamy tylko wtedy, gdy są potrzebne: pusta lista w inArray albo values([]) nie przechodzi w drizzle.
    // EN: The "who voted" row goes first, so a broken key of a second vote is found before the rest. The other items are added only when needed: an empty list in inArray or values([]) does not work in drizzle.
    const statements: [BatchItem<'sqlite'>, ...BatchItem<'sqlite'>[]] = [
      db.insert(surveyParticipation).values({ surveyId: vote.surveyId, userId: vote.userId }),
    ];
    if (vote.optionIds.length > 0) {
      statements.push(
        db
          .update(surveyOptions)
          .set({ votes: sql`${surveyOptions.votes} + 1` })
          .where(inArray(surveyOptions.id, vote.optionIds)),
      );
    }
    if (vote.texts.length > 0) {
      // PL: Tekst bez numeru ucznia: wiersz ma tylko pytanie i treść.
      // EN: The text without a student id: the row has only the question and the text.
      statements.push(
        db.insert(surveyTextAnswers).values(vote.texts.map((item) => ({ questionId: item.questionId, text: item.text }))),
      );
    }

    // PL: Paczka w D1 to jedna transakcja: złamany klucz drugiego głosu cofa też liczniki i teksty.
    // EN: A batch in D1 is one transaction: the broken key of a second vote also rolls back the counters and the texts.
    await db.batch(statements);
  } catch (error) {
    // PL: Drugi głos tego ucznia to nie awaria, tylko odpowiedź „już wypełniona”.
    // EN: A second vote from this student is not a failure, only the answer "already filled in".
    if (isUniqueViolation(error)) throw new AlreadyVotedError('already voted');
    throw error;
  }
}

/**
 * PL: Buduje zapytanie kasujące ślad wypełnienia ankiet jednego ucznia. Wydzielone, żeby test sprawdził warunek WHERE bez uruchamiania bazy.
 * EN: Builds the query that deletes one student's survey participation trace. Split out, so a test can check the WHERE condition without running the database.
 *
 * @param db - PL: baza. EN: the database.
 * @param userId - PL: numer ucznia. EN: the student id.
 * @returns PL: zapytanie do wykonania. EN: the query to run.
 */
export function buildParticipationDelete(db: VoteDatabase, userId: string) {
  // PL: Warunek WHERE po numerze ucznia: cudze wiersze zostają.
  // EN: A WHERE condition on the student id: other people's rows stay.
  return db.delete(surveyParticipation).where(eq(surveyParticipation.userId, userId));
}
