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
};

/** PL: Zakończona ankieta na liście. EN: An ended survey on the list. */
export type EndedSurvey = {
  id: string;
  title: string;
  endsOn: string;
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
  questions: SurveyQuestion[];
};

/** PL: Odpowiedzi ucznia: numer pytania i numer wybranej odpowiedzi. EN: The student's answers: a question id and the chosen option id. */
export type AnswerMap = Record<string, string>;
