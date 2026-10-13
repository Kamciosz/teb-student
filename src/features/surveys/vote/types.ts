/**
 * PL: Typy danych, które telefon dostaje z serwera podtoru 5a. Kształt jest ten sam co w worker/surveys/vote/types.ts. Telefon nigdy nie dostaje liczników głosów.
 * EN: Types of the data the phone receives from the subtrack 5a server. The shape is the same as in worker/surveys/vote/types.ts. The phone never receives the vote counters.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by src/features/surveys/vote/surveyApi.ts::fetchSurveyList
 * @used_by src/features/surveys/vote/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 */

/** PL: Trwająca ankieta na liście. EN: A running survey on the list. */
export type ActiveSurvey = {
  id: string;
  label: string | null;
  title: string;
  questionCount: number;
  daysLeft: number;
  hasVoted: boolean;
  /** PL: Godzina zamknięcia (ISO) albo null, gdy ankieta kończy się tylko dniem. EN: The closing hour (ISO), or null when the survey ends only by its day. */
  closesAt: string | null;
};

/** PL: Zamknięta ankieta na liście. EN: A closed survey on the list. */
export type EndedSurvey = {
  id: string;
  title: string;
  endsOn: string;
  /** PL: Dzień, w którym ankieta faktycznie się zamknęła. EN: The day the survey actually closed. */
  endedOn: string;
};

/** PL: Lista ankiet: trwające i zakończone. EN: The survey list: running and ended. */
export type SurveyList = {
  active: ActiveSurvey[];
  ended: EndedSurvey[];
};

/** PL: Jedna odpowiedź do wyboru. EN: One option to choose. */
export type SurveyOption = {
  id: string;
  label: string;
};

/** PL: Jedno pytanie z odpowiedziami. EN: One question with its options. */
export type SurveyQuestion = {
  id: string;
  prompt: string;
  options: SurveyOption[];
};

/** PL: Ankieta z pytaniami. EN: A survey with its questions. */
export type SurveyDetail = {
  id: string;
  label: string | null;
  title: string;
  isActive: boolean;
  hasVoted: boolean;
  /** PL: Godzina zamknięcia (ISO) albo null. EN: The closing hour (ISO) or null. */
  closesAt: string | null;
  questions: SurveyQuestion[];
};

/** PL: Odpowiedzi ucznia: numer pytania i numer wybranej odpowiedzi. EN: The student's answers: a question id and the chosen option id. */
export type AnswerMap = Record<string, string>;
