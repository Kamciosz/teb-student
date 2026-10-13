/**
 * PL: Składanie wyników ankiety i próg prywatności: wyniki są widoczne dopiero od 5 odpowiedzi (docs/PLAN_APLIKACJI.md, część 3). Czysta logika bez bazy.
 *     Poniżej progu odpowiedź nie ma pola `questions`, więc rozkład głosów w ogóle nie trafia do JSON-a. Zapytania (queries.ts) poniżej progu nie pobierają nawet liczników głosów.
 * EN: Building the survey results and the privacy threshold: results are visible only from 5 responses (docs/PLAN_APLIKACJI.md, part 3). Pure logic without the database.
 *     Below the threshold the response has no `questions` field, so the vote distribution never gets into the JSON. The queries (queries.ts) do not even fetch the vote counters below the threshold.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/surveys/admin/types.ts::SurveyResults
 * @used_by worker/surveys/admin/queries.ts::findResults
 * @used_by worker/surveys/admin/results.test.ts::shapeResults
 */

import type { OptionResult, QuestionResult, QuestionType, SurveyResults } from './types';

// PL: Od ilu odpowiedzi pokazujemy wyniki. Przy mniejszej liczbie łatwo rozpoznać, kto głosował.
// EN: From how many responses the results are shown. With fewer, it is easy to tell who voted.
export const MIN_RESPONSES = 5;

/**
 * PL: Liczy udział odpowiedzi w pełnych procentach. Pytanie bez głosów daje 0, nie dzielenie przez zero.
 * EN: Counts the share of an option in whole percent. A question without votes gives 0, not a division by zero.
 *
 * @param votes - PL: głosy na odpowiedź. EN: the votes for the option.
 * @param total - PL: wszystkie głosy w pytaniu. EN: all the votes in the question.
 * @returns PL: udział od 0 do 100. EN: the share from 0 to 100.
 */
export function percentOf(votes: number, total: number): number {
  // PL: Bez głosów nie ma udziału.
  // EN: Without votes there is no share.
  if (total === 0) return 0;
  return Math.round((votes / total) * 100);
}

/**
 * PL: Dodaje udział w procentach do odpowiedzi jednego pytania.
 * EN: Adds the percent share to the options of one question.
 *
 * @param prompt - PL: treść pytania. EN: the question text.
 * @param type - PL: rodzaj pytania. EN: the question type.
 * @param options - PL: odpowiedzi z liczbą głosów, w kolejności. EN: the options with their vote counts, in order.
 * @returns PL: pytanie z udziałami. EN: the question with shares.
 */
export function toQuestionResult(prompt: string, type: QuestionType, options: { label: string; votes: number }[]): QuestionResult {
  // PL: Udział liczymy od sumy głosów tego pytania. Przy wielokrotnym wyborze to suma zaznaczeń, więc udziały nie sumują się do 100 w osobach.
  // EN: The share is counted from the vote sum of this question. With multiple choice it is the sum of checked boxes, so the shares do not add up to 100 in people.
  const total = options.reduce((sum, option) => sum + option.votes, 0);
  const withShare: OptionResult[] = options.map((option) => ({ ...option, percent: percentOf(option.votes, total) }));
  return { prompt, type, options: withShare };
}

/**
 * PL: Składa odpowiedź z wynikami. Pytania dopisuje tylko wtedy, gdy odpowiedzi jest co najmniej tyle, co próg.
 * EN: Builds the results response. It adds the questions only when there are at least as many responses as the threshold.
 *
 * @param survey - PL: dane ankiety bez wyników. EN: the survey data without results.
 * @param responseCount - PL: liczba osób, które wypełniły ankietę. EN: the number of people who filled the survey in.
 * @param loadQuestions - PL: funkcja pobierająca rozkład głosów, wołana tylko od progu. EN: the function that fetches the vote distribution, called only from the threshold.
 * @returns PL: wyniki z rozkładem albo tylko z liczbą odpowiedzi. EN: the results with the distribution, or with the response count only.
 */
export async function shapeResults(
  survey: Omit<SurveyResults, 'responseCount' | 'minResponses' | 'questions'>,
  responseCount: number,
  loadQuestions: () => Promise<QuestionResult[]>,
): Promise<SurveyResults> {
  // PL: Pola wspólne dla obu przypadków.
  // EN: The fields common to both cases.
  const base = { ...survey, responseCount, minResponses: MIN_RESPONSES };

  // PL: Za mało odpowiedzi: zwróć samą liczbę, a rozkładu nawet nie pobieraj.
  // EN: Too few responses: return the count only, and do not even fetch the distribution.
  if (responseCount < MIN_RESPONSES) return base;

  // PL: Od progu: dopisz pytania z głosami i udziałami.
  // EN: From the threshold: add the questions with votes and shares.
  return { ...base, questions: await loadQuestions() };
}
