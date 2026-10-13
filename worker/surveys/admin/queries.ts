/**
 * PL: Zapytania do bazy podtoru 5b: lista ankiet z liczbą odpowiedzi, wyniki jednej ankiety i zapis nowej ankiety. Każda funkcja dostaje bazę jako parametr, żeby dało się ją sprawdzić na innej bazie.
 *     Liczba odpowiedzi to liczba osób. Gdy ankieta ma pytanie jednokrotnego wyboru, bierzemy sumę głosów w takim pytaniu (każda osoba odpowiada na wszystkie pytania, więc suma to liczba osób). Bierzemy liczniki, a nie tabelę „kto głosował”, bo ta traci wiersz przy usunięciu konta ucznia, a licznik zostaje.
 *     Wyjątek od tej zasady: ankieta złożona tylko z pytań wielokrotnego wyboru. Tam suma zaznaczeń to nie liczba osób, więc liczba osób bierze się z tabeli „kto głosował” (survey_participation). Przy usunięciu konta takiej ankiecie ubywa osoba w liczbie odpowiedzi.
 * EN: The subtrack 5b database queries: the survey list with the response count, the results of one survey and writing a new survey. Every function takes the database as a parameter, so it can be checked on another database.
 *     The response count is the number of people. When a survey has a single-choice question, we take the vote sum of that question (every person answers all the questions, so the sum is the number of people). We take the counters, not the "who voted" table, because that one loses its row when a student account is deleted, while the counter stays.
 *     The exception: a survey made only of multiple-choice questions. There the sum of checked boxes is not the number of people, so the number of people comes from the "who voted" table (survey_participation). When an account is deleted, such a survey loses one person in its response count.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/db/schema/surveys.ts::surveys
 * @uses worker/surveys/admin/results.ts::shapeResults
 * @used_by worker/surveys/admin/routes.ts::surveysAdminApp
 */

import { asc, eq, inArray, sql } from 'drizzle-orm';
// PL: Typ bazy D1 w Drizzle.
// EN: The D1 database type in Drizzle.
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { surveyOptions, surveyParticipation, surveyQuestions, surveys } from '../../db/schema/surveys';
import { isRunning, warsawToday } from './dates';
import { shapeResults, toQuestionResult } from './results';
import type { PanelSurvey, PanelSurveyList, SurveyResults } from './types';
import type { NewSurvey } from './validation';

/** PL: Baza podtoru 5b. EN: The subtrack 5b database. */
export type PanelDatabase = DrizzleD1Database;

/**
 * PL: Liczy pytania i odpowiedzi każdej ankiety. Liczba odpowiedzi to liczba osób: z pytań jednokrotnego wyboru (największa suma głosów), a gdy ich nie ma, z tabeli „kto głosował”.
 * EN: Counts the questions and responses of every survey. The response count is the number of people: from the single-choice questions (the biggest vote sum), and when there are none, from the "who voted" table.
 *
 * @param db - PL: baza. EN: the database.
 * @returns PL: mapa numeru ankiety na liczbę pytań i odpowiedzi. EN: a map from the survey id to the question and response counts.
 */
async function countBySurvey(db: PanelDatabase): Promise<Map<string, { questionCount: number; responseCount: number }>> {
  // PL: Jeden wiersz na pytanie, z jego rodzajem. Pytanie bez odpowiedzi (nie powinno istnieć) daje sumę 0.
  // EN: One row per question, with its type. A question without options (should not exist) gives the sum 0.
  const rows = await db
    .select({ surveyId: surveyQuestions.surveyId, type: surveyQuestions.type, total: sql<number>`coalesce(sum(${surveyOptions.votes}), 0)` })
    .from(surveyQuestions)
    .leftJoin(surveyOptions, eq(surveyOptions.questionId, surveyQuestions.id))
    .groupBy(surveyQuestions.id);

  // PL: Kto już głosował, na ankietę: tylko do ankiet bez pytania jednokrotnego.
  // EN: Who has voted, per survey: needed only for the surveys without a single-choice question.
  const participants = await db
    .select({ surveyId: surveyParticipation.surveyId, people: sql<number>`count(*)` })
    .from(surveyParticipation)
    .groupBy(surveyParticipation.surveyId);
  const peopleBySurvey = new Map(participants.map((row) => [row.surveyId, row.people]));

  // PL: Zlicz pytania i weź największą sumę głosów w pytaniach jednokrotnego wyboru. Pytania wielokrotnego wyboru pomijamy: ich suma to zaznaczenia, nie osoby.
  // EN: Count the questions and take the biggest vote sum among the single-choice questions. Multiple-choice questions are skipped: their sum is checked boxes, not people.
  const singleTotals = new Map<string, { questionCount: number; singleTotal: number | null }>();
  for (const row of rows) {
    const current = singleTotals.get(row.surveyId) ?? { questionCount: 0, singleTotal: null };
    const singleTotal = row.type === 'single_choice' ? Math.max(current.singleTotal ?? 0, row.total) : current.singleTotal;
    singleTotals.set(row.surveyId, { questionCount: current.questionCount + 1, singleTotal });
  }

  // PL: Liczba osób: z pytania jednokrotnego, a w ankiecie samych wielokrotnych z tabeli „kto głosował”.
  // EN: The number of people: from a single-choice question, and in a survey of multiple-choice only from the "who voted" table.
  const counts = new Map<string, { questionCount: number; responseCount: number }>();
  for (const [surveyId, { questionCount, singleTotal }] of singleTotals) {
    counts.set(surveyId, { questionCount, responseCount: singleTotal ?? peopleBySurvey.get(surveyId) ?? 0 });
  }
  return counts;
}

/**
 * PL: Podaje listę ankiet dla panelu: trwające (najwcześniej kończące się pierwsze) i zakończone (najnowsza pierwsza). Ankieta z terminem zamknięcia, który minął, jest zakończona. Bez rozkładu głosów.
 * EN: Gives the survey list for the panel: running (the earliest ending first) and ended (the newest first). A survey whose closing time has passed is ended. Without the vote distribution.
 *
 * @param db - PL: baza. EN: the database.
 * @param now - PL: chwila sprawdzenia (dzień i godzina). EN: the moment of the check (day and hour).
 * @returns PL: lista ankiet. EN: the survey list.
 */
export async function listPanelSurveys(db: PanelDatabase, now: Date): Promise<PanelSurveyList> {
  // PL: Wszystkie ankiety i ich liczby. Tabela jest mała (kilka ankiet w semestrze).
  // EN: All the surveys and their counts. The table is small (a few surveys a semester).
  const rows = await db.select().from(surveys).orderBy(asc(surveys.endsOn));
  const counts = await countBySurvey(db);
  const items: PanelSurvey[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    endsOn: row.endsOn,
    closesAt: row.closesAt?.getTime() ?? null,
    questionCount: counts.get(row.id)?.questionCount ?? 0,
    responseCount: counts.get(row.id)?.responseCount ?? 0,
  }));

  // PL: Ankieta jest zakończona, gdy minął dzień ostatni albo jej termin zamknięcia.
  // EN: A survey is ended when its last day has passed or its closing time has come.
  const today = warsawToday(now);
  const nowMs = now.getTime();
  const isEnded = (item: PanelSurvey) => !isRunning(item.endsOn, today) || (item.closesAt !== null && item.closesAt <= nowMs);

  // PL: Podziel na trwające i zakończone. Zakończone odwracamy, żeby najnowsza była pierwsza.
  // EN: Split into running and ended. The ended ones are reversed so the newest comes first.
  return {
    active: items.filter((item) => !isEnded(item)),
    ended: items.filter(isEnded).reverse(),
  };
}

/**
 * PL: Pobiera pytania z odpowiedziami i licznikami głosów. Wołana tylko od progu odpowiedzi.
 * EN: Fetches the questions with their options and vote counters. Called only from the response threshold.
 *
 * @param db - PL: baza. EN: the database.
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @returns PL: pytania z udziałami. EN: the questions with shares.
 */
async function loadQuestionResults(db: PanelDatabase, surveyId: string) {
  // PL: Pytania ankiety w kolejności.
  // EN: The survey questions in order.
  const questions = await db.select({ id: surveyQuestions.id, prompt: surveyQuestions.prompt, type: surveyQuestions.type }).from(surveyQuestions).where(eq(surveyQuestions.surveyId, surveyId)).orderBy(asc(surveyQuestions.position));
  if (questions.length === 0) return [];

  // PL: Odpowiedzi tych pytań w kolejności, razem z licznikami.
  // EN: The options of those questions in order, with their counters.
  const options = await db
    .select({ questionId: surveyOptions.questionId, label: surveyOptions.label, votes: surveyOptions.votes })
    .from(surveyOptions)
    .where(inArray(surveyOptions.questionId, questions.map((question) => question.id)))
    .orderBy(asc(surveyOptions.position));

  // PL: Dopasuj odpowiedzi do pytań i policz udziały.
  // EN: Match the options to the questions and count the shares.
  return questions.map((question) => toQuestionResult(question.prompt, question.type, options.filter((option) => option.questionId === question.id)));
}

/**
 * PL: Podaje wyniki jednej ankiety. Poniżej progu odpowiedzi tylko liczbę odpowiedzi, bez rozkładu głosów.
 * EN: Gives the results of one survey. Below the response threshold only the response count, without the vote distribution.
 *
 * @param db - PL: baza. EN: the database.
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @returns PL: wyniki albo null, gdy nie ma takiej ankiety. EN: the results, or null when there is no such survey.
 */
export async function findResults(db: PanelDatabase, surveyId: string): Promise<SurveyResults | null> {
  // PL: Ankieta musi istnieć.
  // EN: The survey must exist.
  const [survey] = await db.select().from(surveys).where(eq(surveys.id, surveyId)).limit(1);
  if (survey === undefined) return null;

  // PL: Policz odpowiedzi, a rozkład głosów pobierz dopiero, gdy próg jest spełniony.
  // EN: Count the responses, and fetch the vote distribution only once the threshold is met.
  const counts = (await countBySurvey(db)).get(survey.id) ?? { questionCount: 0, responseCount: 0 };
  const meta = { id: survey.id, title: survey.title, endsOn: survey.endsOn, questionCount: counts.questionCount };
  return shapeResults(meta, counts.responseCount, () => loadQuestionResults(db, survey.id));
}

/**
 * PL: Zapisuje nową ankietę z pytaniami i odpowiedziami w jednej paczce (w D1 to jedna transakcja). Odpowiedzi wkładamy osobno dla każdego pytania, bo D1 przyjmuje do 100 wartości na zapytanie.
 * EN: Writes a new survey with its questions and options in one batch (one transaction in D1). The options are inserted separately for each question, because D1 accepts up to 100 values per query.
 *
 * @param db - PL: baza. EN: the database.
 * @param survey - PL: sprawdzona ankieta. EN: the validated survey.
 * @param endsOn - PL: ostatni dzień ankiety, RRRR-MM-DD. EN: the last day of the survey, YYYY-MM-DD.
 * @returns PL: numer nowej ankiety. EN: the id of the new survey.
 * @throws PL: błąd bazy (nic nie zostaje zapisane). EN: a database error (nothing is written).
 */
export async function insertSurvey(db: PanelDatabase, survey: NewSurvey, endsOn: string): Promise<string> {
  // PL: Numery nadaje serwer, telefon ich nie podaje.
  // EN: The server assigns the ids, the phone does not give them.
  const surveyId = crypto.randomUUID();
  const questionRows = survey.questions.map((question, index) => ({ id: crypto.randomUUID(), surveyId, position: index + 1, prompt: question.prompt, type: question.type }));
  const optionInserts = survey.questions.map((question, index) =>
    db.insert(surveyOptions).values(question.options.map((label, position) => ({ id: crypto.randomUUID(), questionId: questionRows[index]!.id, position: position + 1, label }))),
  );

  // PL: Ankieta, pytania i odpowiedzi w jednej transakcji: albo wszystko, albo nic.
  // EN: The survey, questions and options in one transaction: all or nothing.
  await db.batch([
    db.insert(surveys).values({ id: surveyId, title: survey.title, endsOn, closesAt: survey.closesAt === null ? null : new Date(survey.closesAt) }),
    db.insert(surveyQuestions).values(questionRows),
    ...optionInserts,
  ]);
  return surveyId;
}
