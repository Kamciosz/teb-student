/**
 * PL: Zasady krótkiej odpowiedzi po stronie telefonu: jak przycinamy tekst, jak liczymy znaki i kiedy można wysłać odpowiedź. Liczymy punkty kodowe, a nie jednostki UTF-16, tak samo jak serwer, więc polskie litery i emoji liczą się tak samo na telefonie i na serwerze.
 * EN: The short-answer rules on the phone: how the text is trimmed, how characters are counted and when the answer can be sent. We count code points, not UTF-16 units, the same way as the server, so Polish letters and emoji count the same on the phone and on the server.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/surveys/vote/QuestionStep.tsx::QuestionStep
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyQuestions
 * @used_by src/features/surveys/vote/surveyApi.ts::sendAnswers
 */

/** PL: Najwięcej znaków krótkiej odpowiedzi po przycięciu. Ta sama wartość co MAX_TEXT_LENGTH w worker/surveys/vote/validation.ts. EN: The most characters of a short answer after trimming. The same value as MAX_TEXT_LENGTH in worker/surveys/vote/validation.ts. */
export const SHORT_TEXT_MAX_LENGTH = 200;

/**
 * PL: Przycina tekst z obu stron, tak jak serwer.
 * EN: Trims the text on both ends, as the server does.
 *
 * @param raw - PL: tekst wpisany przez ucznia. EN: the text typed by the student.
 * @returns PL: tekst bez spacji na początku i na końcu. EN: the text without leading and trailing spaces.
 */
export function cleanShortText(raw: string): string {
  return raw.trim();
}

/**
 * PL: Liczy znaki jako punkty kodowe: polska litera albo emoji to jeden znak.
 * EN: Counts characters as code points: a Polish letter or an emoji is one character.
 *
 * @param value - PL: tekst do policzenia. EN: the text to count.
 * @returns PL: liczba znaków. EN: the number of characters.
 */
export function countShortTextCharacters(value: string): number {
  return [...value].length;
}

/**
 * PL: Czy odpowiedź można wysłać: po przycięciu ma od 1 do 200 znaków.
 * EN: Whether the answer can be sent: after trimming it has from 1 to 200 characters.
 *
 * @param raw - PL: tekst wpisany przez ucznia. EN: the text typed by the student.
 * @returns PL: true, gdy tekst mieści się w granicach. EN: true when the text is within the limits.
 */
export function isShortTextReady(raw: string): boolean {
  const length = countShortTextCharacters(cleanShortText(raw));
  return length >= 1 && length <= SHORT_TEXT_MAX_LENGTH;
}
