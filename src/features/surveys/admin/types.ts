/**
 * PL: Typy odpowiedzi serwera ankiet w panelu (podtor 5b), po stronie telefonu. To kopia typów z worker/surveys/admin/types.ts, bo kod telefonu i serwera nie importują się nawzajem. Wyniki poniżej progu 5 odpowiedzi nie mają pola `questions`.
 * EN: The survey panel server response types (subtrack 5b), on the phone side. This is a copy of the types from worker/surveys/admin/types.ts, because phone and server code do not import each other. Results below the threshold of 5 responses have no `questions` field.
 *
 * @author Jakub
 * @since 2026-10-12
 * @used_by src/features/surveys/admin/surveyApi.ts::fetchPanelSurveys
 * @used_by src/features/surveys/admin/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/admin/ResultsScreen.tsx::ResultsScreen
 */

/** PL: Jedna ankieta na liście w panelu. EN: One survey in the panel list. */
export type PanelSurvey = {
  /** PL: Numer ankiety. EN: The survey id. */
  id: string;
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Liczba pytań. EN: The number of questions. */
  questionCount: number;
  /** PL: Ostatni dzień ankiety, RRRR-MM-DD. EN: The last day of the survey, YYYY-MM-DD. */
  endsOn: string;
  /** PL: Chwila zamknięcia w milisekundach UTC albo null, gdy ankieta kończy się tylko ostatnim dniem. EN: The closing moment in UTC milliseconds, or null when the survey ends only on its last day. */
  closesAt: number | null;
  /** PL: Ile osób wypełniło ankietę. EN: How many people filled the survey in. */
  responseCount: number;
};

/** PL: Lista ankiet w panelu. EN: The panel survey list. */
export type PanelSurveyList = {
  /** PL: Trwające ankiety. EN: Running surveys. */
  active: PanelSurvey[];
  /** PL: Zakończone ankiety. EN: Ended surveys. */
  ended: PanelSurvey[];
};

/** PL: Jedna odpowiedź w wynikach. EN: One option in the results. */
export type OptionResult = {
  /** PL: Treść odpowiedzi. EN: The option text. */
  label: string;
  /** PL: Ile osób ją wybrało. EN: How many people picked it. */
  votes: number;
  /** PL: Udział w pełnych procentach. EN: The share in whole percent. */
  percent: number;
};

/** PL: Rodzaj pytania: jeden wybór albo wiele wyborów. EN: The question type: single or multiple choice. */
export type QuestionType = 'single_choice' | 'multiple_choice';

/** PL: Jedno pytanie w wynikach. EN: One question in the results. */
export type QuestionResult = {
  /** PL: Treść pytania. EN: The question text. */
  prompt: string;
  /** PL: Rodzaj pytania: przy wielu wyborach liczba to zaznaczenia, a nie osoby. EN: The question type: with multiple choice the number is checked boxes, not people. */
  type: QuestionType;
  /** PL: Odpowiedzi w kolejności A, B, C, D, E. EN: The options in the order A, B, C, D, E. */
  options: OptionResult[];
};

/** PL: Wyniki jednej ankiety. EN: The results of one survey. */
export type SurveyResults = {
  /** PL: Numer ankiety. EN: The survey id. */
  id: string;
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Ostatni dzień ankiety, RRRR-MM-DD. EN: The last day of the survey, YYYY-MM-DD. */
  endsOn: string;
  /** PL: Liczba pytań. EN: The number of questions. */
  questionCount: number;
  /** PL: Ile osób wypełniło ankietę. EN: How many people filled the survey in. */
  responseCount: number;
  /** PL: Od ilu odpowiedzi serwer pokazuje wyniki. EN: From how many responses the server shows the results. */
  minResponses: number;
  /** PL: Rozkład głosów. Serwer wysyła go tylko od progu odpowiedzi. EN: The vote distribution. The server sends it only from the response threshold. */
  questions?: QuestionResult[];
};

/** PL: Treść zapytania o utworzenie ankiety. EN: The body of the request that creates a survey. */
export type NewSurveyBody = {
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Pytania z rodzajem i odpowiedziami (tylko treść). EN: The questions with their type and options (text only). */
  questions: { prompt: string; type: QuestionType; options: string[] }[];
  /** PL: Czas trwania w dniach: 3, 7 albo 14. EN: The duration in days: 3, 7 or 14. */
  durationDays: number;
  /** PL: Termin zamknięcia RRRR-MM-DDTHH:mm (czas polski) albo null, gdy go nie ma. EN: The closing time YYYY-MM-DDTHH:mm (Polish time), or null when there is none. */
  closesAt: string | null;
};
