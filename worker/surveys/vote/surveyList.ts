/**
 * PL: Składa listę ankiet z wierszy bazy: dzieli na trwające i zakończone, liczy dni do końca i oznacza wypełnione. Czysta logika bez bazy, więc ma własny test.
 * EN: Builds the survey list from database rows: splits into running and ended, counts the days left and marks the filled ones. Pure logic without the database, so it has its own test.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/deadline.ts::daysLeft
 * @used_by worker/surveys/vote/queries.ts::listSurveys
 * @used_by worker/surveys/vote/surveyList.test.ts::buildSurveyList
 */

// PL: Liczenie terminu ankiety.
// EN: Counting the survey deadline.
import { daysLeft, isSurveyActive } from './deadline';
// PL: Kształt odpowiedzi listy.
// EN: The shape of the list response.
import type { ActiveSurvey, EndedSurvey, SurveyList } from './types';

// PL: Ile zakończonych ankiet pokazujemy. Starsze nikogo już nie obchodzą, a lista ma być krótka na telefonie.
// EN: How many ended surveys we show. Older ones no longer matter to anyone, and the list must stay short on a phone.
export const MAX_ENDED_SURVEYS = 10;

/**
 * PL: Wiersz ankiety z bazy.
 * EN: A survey row from the database.
 */
export type SurveyRow = {
  /** PL: Numer ankiety. EN: The survey id. */
  id: string;
  /** PL: Krótki temat albo null. EN: The short topic, or null. */
  label: string | null;
  /** PL: Tytuł. EN: The title. */
  title: string;
  /** PL: Ostatni dzień, RRRR-MM-DD. EN: The last day, YYYY-MM-DD. */
  endsOn: string;
};

/**
 * PL: Dane do złożenia listy.
 * EN: The data to build the list from.
 */
export type SurveyListInput = {
  /** PL: Wszystkie ankiety. EN: All the surveys. */
  rows: SurveyRow[];
  /** PL: Liczba pytań dla numeru ankiety. EN: The number of questions per survey id. */
  questionCounts: Map<string, number>;
  /** PL: Numery ankiet wypełnionych przez tego ucznia. EN: The ids of surveys this student has filled in. */
  votedIds: Set<string>;
  /** PL: Dzisiejsza data, RRRR-MM-DD. EN: Today's date, YYYY-MM-DD. */
  today: string;
};

/**
 * PL: Składa listę ankiet.
 * EN: Builds the survey list.
 *
 * @param input - PL: wiersze i dane pomocnicze. EN: the rows and helper data.
 * @returns PL: trwające (kończące się najwcześniej pierwsze) i zakończone (najnowsze pierwsze, najwyżej 10). EN: running (earliest ending first) and ended (newest first, at most 10).
 */
export function buildSurveyList(input: SurveyListInput): SurveyList {
  const active: ActiveSurvey[] = [];
  const ended: EndedSurvey[] = [];

  // PL: Rozdziel ankiety po terminie.
  // EN: Split the surveys by the deadline.
  for (const row of input.rows) {
    if (!isSurveyActive(row.endsOn, input.today)) {
      ended.push({ id: row.id, title: row.title, endsOn: row.endsOn });
      continue;
    }
    active.push({
      id: row.id,
      label: row.label,
      title: row.title,
      questionCount: input.questionCounts.get(row.id) ?? 0,
      daysLeft: daysLeft(row.endsOn, input.today),
      hasVoted: input.votedIds.has(row.id),
    });
  }

  // PL: Kolejność: kończące się wcześniej na górze, zakończone od najnowszej.
  // EN: The order: those ending sooner on top, ended ones from the newest.
  active.sort((a, b) => a.daysLeft - b.daysLeft);
  ended.sort((a, b) => b.endsOn.localeCompare(a.endsOn));
  return { active, ended: ended.slice(0, MAX_ENDED_SURVEYS) };
}
