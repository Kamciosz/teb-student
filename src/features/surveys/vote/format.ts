/**
 * PL: Teksty z liczbami po polsku: dni, pytania, minuty i data zakończenia. Polski ma trzy formy liczby (1 pytanie, 2 pytania, 5 pytań), więc złożenie napisu w ekranie by się rozjechało.
 * EN: Texts with numbers in Polish: days, questions, minutes and the end date. Polish has three number forms (1 pytanie, 2 pytania, 5 pytań), so assembling the text inside a screen would go wrong.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by src/features/surveys/vote/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/vote/format.test.ts::pluralPl
 */

// PL: Czas na jedno pytanie w sekundach. Z niego liczymy „1 minuta” na liście. To oszacowanie, a nie pomiar.
// EN: Time per question in seconds. The "1 minuta" on the list is computed from it. It is an estimate, not a measurement.
const SECONDS_PER_QUESTION = 20;

// PL: Sekund w minucie.
// EN: Seconds in a minute.
const SECONDS_PER_MINUTE = 60;

/**
 * PL: Wybiera formę słowa dla liczby. Forma 1 dla 1, forma 2 dla liczb kończących się na 2–4 (poza 12–14), forma 5 dla reszty.
 * EN: Picks the word form for a number. Form 1 for 1, form 2 for numbers ending in 2–4 (except 12–14), form 5 for the rest.
 *
 * @param count - PL: liczba całkowita nieujemna. EN: a non-negative integer.
 * @param forms - PL: trzy formy, np. dla pytania: pytanie, pytania, pytań. EN: three forms, e.g. for a question: pytanie, pytania, pytań.
 * @returns PL: właściwa forma. EN: the right form.
 */
export function pluralPl(count: number, forms: readonly [string, string, string]): string {
  // PL: Jeden to osobna forma.
  // EN: One has its own form.
  if (count === 1) return forms[0];

  // PL: Dwie ostatnie cyfry 12–14 mają formę „5”, mimo że kończą się na 2–4.
  // EN: The last two digits 12–14 take the "5" form, although they end in 2–4.
  const lastTwo = count % 100;
  const last = count % 10;
  const isFew = last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14);
  return isFew ? forms[1] : forms[2];
}

/**
 * PL: Szacowany czas wypełnienia w minutach, co najmniej 1.
 * EN: The estimated time to fill in, in minutes, at least 1.
 *
 * @param questionCount - PL: liczba pytań. EN: the number of questions.
 * @returns PL: minuty. EN: minutes.
 */
export function estimateMinutes(questionCount: number): number {
  // PL: Zaokrąglamy w górę, żeby nie obiecać za mało, i nigdy nie schodzimy poniżej minuty.
  // EN: We round up so as not to promise too little, and never go below one minute.
  return Math.max(1, Math.ceil((questionCount * SECONDS_PER_QUESTION) / SECONDS_PER_MINUTE));
}

/**
 * PL: Opis ankiety na liście, np. „3 pytania · 1 minuta”.
 * EN: The survey description on the list, e.g. "3 pytania · 1 minuta".
 *
 * @param questionCount - PL: liczba pytań. EN: the number of questions.
 * @returns PL: napis. EN: the text.
 */
export function describeSurvey(questionCount: number): string {
  const minutes = estimateMinutes(questionCount);
  const questions = `${questionCount} ${pluralPl(questionCount, ['pytanie', 'pytania', 'pytań'])}`;
  return `${questions} · ${minutes} ${pluralPl(minutes, ['minuta', 'minuty', 'minut'])}`;
}

/**
 * PL: Słowo pod licznikiem dni: „dzień” dla 1, „dni” dla reszty.
 * EN: The word under the day counter: "dzień" for 1, "dni" for the rest.
 *
 * @param days - PL: liczba dni. EN: the number of days.
 * @returns PL: słowo. EN: the word.
 */
export function daysWord(days: number): string {
  return days === 1 ? 'dzień' : 'dni';
}

/**
 * PL: Zamienia datę RRRR-MM-DD na „D.MM”, np. 2026-09-30 na „30.09”, jak w makiecie.
 * EN: Turns a YYYY-MM-DD date into "D.MM", e.g. 2026-09-30 into "30.09", as in the mockup.
 *
 * @param isoDate - PL: data w formacie RRRR-MM-DD. EN: a date in the YYYY-MM-DD format.
 * @returns PL: dzień i miesiąc. EN: day and month.
 */
export function formatShortDate(isoDate: string): string {
  // PL: Rozbij datę na części. Dzień zapisujemy bez zera z przodu, miesiąc z zerem.
  // EN: Split the date into parts. The day is written without a leading zero, the month with one.
  const [, month = '', day = ''] = isoDate.split('-');
  return `${Number(day)}.${month}`;
}
