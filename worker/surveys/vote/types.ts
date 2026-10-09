/**
 * PL: Typy odpowiedzi serwera podtoru 5a: to, co telefon dostaje na liście ankiet i w szczegółach ankiety. Nigdzie nie ma tu liczników głosów ani numeru ucznia: telefon ma ich nie dostać.
 *     Telefon ma własną kopię tych typów (src/features/surveys/vote/types.ts), bo kod telefonu i serwera nie importują się nawzajem.
 * EN: The server response types of subtrack 5a: what the phone receives in the survey list and the survey details. There are no vote counters and no student id here: the phone must not receive them.
 *     The phone has its own copy of these types (src/features/surveys/vote/types.ts), because phone and server code do not import each other.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by worker/surveys/vote/queries.ts::listSurveys
 * @used_by worker/surveys/vote/queries.ts::getSurveyDetail
 * @used_by src/features/surveys/vote/types.ts::SurveyList
 */

/**
 * PL: Aktywna ankieta na liście.
 * EN: An active survey in the list.
 */
export type ActiveSurvey = {
  /** PL: Numer ankiety. EN: The survey id. */
  id: string;
  /** PL: Krótki temat nad tytułem albo null. EN: The short topic above the title, or null. */
  label: string | null;
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Ile pytań ma ankieta. EN: How many questions the survey has. */
  questionCount: number;
  /** PL: Dni do końca, razem z dzisiejszym, co najmniej 1. EN: Days left, including today, at least 1. */
  daysLeft: number;
  /** PL: Czy ten uczeń już ją wypełnił. EN: Whether this student has already filled it in. */
  hasVoted: boolean;
};

/**
 * PL: Zakończona ankieta na liście.
 * EN: An ended survey in the list.
 */
export type EndedSurvey = {
  /** PL: Numer ankiety. EN: The survey id. */
  id: string;
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Ostatni dzień ankiety, RRRR-MM-DD. EN: The last day of the survey, YYYY-MM-DD. */
  endsOn: string;
};

/**
 * PL: Odpowiedź serwera na listę ankiet.
 * EN: The server response to the survey list.
 */
export type SurveyList = {
  /** PL: Trwające ankiety, najpierw te, które kończą się najwcześniej. EN: Running surveys, the earliest ending first. */
  active: ActiveSurvey[];
  /** PL: Zakończone ankiety, najnowsza pierwsza. EN: Ended surveys, the newest first. */
  ended: EndedSurvey[];
};

/**
 * PL: Odpowiedź do wyboru w pytaniu. Bez licznika głosów.
 * EN: An answer option of a question. Without the vote counter.
 */
export type SurveyOption = {
  /** PL: Numer odpowiedzi. EN: The option id. */
  id: string;
  /** PL: Treść odpowiedzi. EN: The option text. */
  label: string;
};

/**
 * PL: Pytanie z odpowiedziami.
 * EN: A question with its options.
 */
export type SurveyQuestion = {
  /** PL: Numer pytania. EN: The question id. */
  id: string;
  /** PL: Treść pytania. EN: The question text. */
  prompt: string;
  /** PL: Odpowiedzi w kolejności A, B, C, D. EN: The options in the order A, B, C, D. */
  options: SurveyOption[];
};

/**
 * PL: Szczegóły ankiety do wypełnienia.
 * EN: The details of a survey to fill in.
 */
export type SurveyDetail = {
  /** PL: Numer ankiety. EN: The survey id. */
  id: string;
  /** PL: Krótki temat albo null. EN: The short topic, or null. */
  label: string | null;
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Czy ankieta jeszcze trwa. EN: Whether the survey is still running. */
  isActive: boolean;
  /** PL: Czy ten uczeń już ją wypełnił. EN: Whether this student has already filled it in. */
  hasVoted: boolean;
  /** PL: Pytania w kolejności. EN: The questions in order. */
  questions: SurveyQuestion[];
};
