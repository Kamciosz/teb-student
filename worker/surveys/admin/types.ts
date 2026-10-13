/**
 * PL: Typy odpowiedzi serwera podtoru 5b (ankiety w panelu): lista ankiet z liczbą odpowiedzi i wyniki. Wyniki poniżej progu nie mają pola `questions`, więc rozkład głosów nie opuszcza serwera.
 *     Telefon ma własną kopię tych typów (src/features/surveys/admin/types.ts), bo kod telefonu i serwera nie importują się nawzajem.
 * EN: The server response types of subtrack 5b (surveys in the panel): the survey list with the response count and the results. Results below the threshold have no `questions` field, so the vote distribution never leaves the server.
 *     The phone has its own copy of these types (src/features/surveys/admin/types.ts), because phone and server code do not import each other.
 *
 * @author Jakub
 * @since 2026-10-12
 * @used_by worker/surveys/admin/queries.ts::listPanelSurveys
 * @used_by worker/surveys/admin/results.ts::buildResults
 * @used_by worker/surveys/admin/routes.ts::surveysAdminApp
 * @uses worker/db/schema/surveys.ts::QUESTION_TYPES
 */

// PL: Lista rodzajów pytań z tabeli pytań (typy, nie wartości, więc nic nie trafia do kodu wykonywanego).
// EN: The list of question types from the questions table (types only, so nothing lands in the running code).
import type { QUESTION_TYPES } from '../../db/schema/surveys';

/**
 * PL: Jedna ankieta na liście w panelu.
 * EN: One survey in the panel list.
 */
export type PanelSurvey = {
  /** PL: Numer ankiety. EN: The survey id. */
  id: string;
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Ile pytań ma ankieta. EN: How many questions the survey has. */
  questionCount: number;
  /** PL: Ostatni dzień ankiety, RRRR-MM-DD (czas polski). EN: The last day of the survey, YYYY-MM-DD (Polish time). */
  endsOn: string;
  /** PL: Chwila zamknięcia w milisekundach UTC albo null, gdy ankieta kończy się tylko ostatnim dniem. EN: The closing moment in UTC milliseconds, or null when the survey ends only on its last day. */
  closesAt: number | null;
  /** PL: Ile osób wypełniło ankietę (osób, a nie głosów). EN: How many people filled the survey in (people, not votes). */
  responseCount: number;
};

/**
 * PL: Lista ankiet w panelu: trwające i zakończone.
 * EN: The panel survey list: running and ended.
 */
export type PanelSurveyList = {
  /** PL: Trwające ankiety, najpierw te, które kończą się najwcześniej. EN: Running surveys, the earliest ending first. */
  active: PanelSurvey[];
  /** PL: Zakończone ankiety, najnowsza pierwsza. EN: Ended surveys, the newest first. */
  ended: PanelSurvey[];
};

/**
 * PL: Jedna odpowiedź w wynikach: liczba głosów i udział w pełnych procentach.
 * EN: One option in the results: the vote count and the share in whole percent.
 */
export type OptionResult = {
  /** PL: Treść odpowiedzi. EN: The option text. */
  label: string;
  /** PL: Ile osób ją wybrało. EN: How many people picked it. */
  votes: number;
  /** PL: Udział w pytaniu, zaokrąglony do pełnych procent. EN: The share of the question, rounded to whole percent. */
  percent: number;
};

/**
 * PL: Rodzaj pytania z listy QUESTION_TYPES (schemat podtoru 5a): jednokrotny albo wielokrotny wybór.
 * EN: The question type from the QUESTION_TYPES list (the schema of subtrack 5a): single or multiple choice.
 */
export type QuestionType = (typeof QUESTION_TYPES)[number];

/**
 * PL: Jedno pytanie w wynikach.
 * EN: One question in the results.
 */
export type QuestionResult = {
  /** PL: Treść pytania. EN: The question text. */
  prompt: string;
  /** PL: Rodzaj pytania: od niego zależy, czy wynik to osoby, czy zaznaczenia. EN: The question type: it decides whether the result counts people or checked boxes. */
  type: QuestionType;
  /** PL: Odpowiedzi w kolejności A, B, C, D, E. EN: The options in the order A, B, C, D, E. */
  options: OptionResult[];
};

/**
 * PL: Wyniki jednej ankiety. Gdy odpowiedzi jest mniej niż próg, pola `questions` nie ma.
 * EN: The results of one survey. When there are fewer responses than the threshold, the `questions` field is absent.
 */
export type SurveyResults = {
  /** PL: Numer ankiety. EN: The survey id. */
  id: string;
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Ostatni dzień ankiety, RRRR-MM-DD. EN: The last day of the survey, YYYY-MM-DD. */
  endsOn: string;
  /** PL: Ile pytań ma ankieta. EN: How many questions the survey has. */
  questionCount: number;
  /** PL: Ile osób wypełniło ankietę. EN: How many people filled the survey in. */
  responseCount: number;
  /** PL: Od ilu odpowiedzi pokazujemy wyniki. EN: From how many responses the results are shown. */
  minResponses: number;
  /** PL: Rozkład głosów. Jest tylko od progu odpowiedzi. EN: The vote distribution. Present only from the threshold of responses. */
  questions?: QuestionResult[];
};
