/**
 * PL: Teksty i daty w ekranach ankiet w panelu (podtor 5b): odmiana „pytanie, pytania, pytań”, „odpowiedź, odpowiedzi”, data krótka „15.10” i długa „19.10.2026” oraz ostatni dzień nowej ankiety liczony w czasie polskim. Czysta logika bez Reacta.
 * EN: Texts and dates on the survey panel screens (subtrack 5b): the Polish plural forms of "question" and "response", the short date "15.10" and the long date "19.10.2026", and the last day of a new survey counted in Polish time. Pure logic without React.
 *
 * @author Jakub
 * @since 2026-10-12
 * @used_by src/features/surveys/admin/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/admin/ResultsScreen.tsx::ResultsScreen
 * @used_by src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 * @used_by src/features/surveys/admin/format.test.ts::pluralPl
 */

// PL: Od ilu odpowiedzi serwer pokazuje wyniki. Telefon zna liczbę tylko do podpisu na liście, a prawdziwy próg egzekwuje serwer (worker/surveys/admin/results.ts).
// EN: From how many responses the server shows the results. The phone knows the number only for the caption on the list, and the server enforces the real threshold (worker/surveys/admin/results.ts).
export const MIN_RESPONSES = 5;

// PL: Litery odpowiedzi w kolejności (od 2 do 5 odpowiedzi w pytaniu).
// EN: The option letters in order (2 to 5 options in a question).
export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

// PL: Strefa czasu szkoły: ostatni dzień ankiety to dzień w Polsce.
// EN: The school's time zone: the last day of a survey is a day in Poland.
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

// PL: Ile milisekund ma doba.
// EN: How many milliseconds a day has.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * PL: Wybiera formę słowa dla liczby po polsku: 1 pytanie, 2 pytania, 5 pytań, 12 pytań, 22 pytania.
 * EN: Picks the Polish word form for a number: 1 pytanie, 2 pytania, 5 pytań, 12 pytań, 22 pytania.
 *
 * @param count - PL: liczba. EN: the number.
 * @param forms - PL: formy dla 1, dla 2–4 i dla reszty. EN: the forms for 1, for 2–4 and for the rest.
 * @returns PL: właściwa forma. EN: the right form.
 */
export function pluralPl(count: number, forms: readonly [string, string, string]): string {
  // PL: Jedynka ma własną formę.
  // EN: One has its own form.
  if (count === 1) return forms[0];

  // PL: 2–4 mają formę mnogą, ale nie 12–14 (tam jak przy 5).
  // EN: 2–4 take the few form, but not 12–14 (those go like 5).
  const lastDigit = count % 10;
  const isTeen = count % 100 >= 12 && count % 100 <= 14;
  return lastDigit >= 2 && lastDigit <= 4 && !isTeen ? forms[1] : forms[2];
}

/**
 * PL: Opisuje liczbę pytań, na przykład „3 pytania”.
 * EN: Describes the number of questions, for example "3 pytania".
 *
 * @param count - PL: liczba pytań. EN: the number of questions.
 * @returns PL: liczba ze słowem. EN: the number with the word.
 */
export function describeQuestions(count: number): string {
  return `${count} ${pluralPl(count, ['pytanie', 'pytania', 'pytań'])}`;
}

/**
 * PL: Opisuje liczbę odpowiedzi (osób), na przykład „12 odpowiedzi”.
 * EN: Describes the number of responses (people), for example "12 odpowiedzi".
 *
 * @param count - PL: liczba odpowiedzi. EN: the number of responses.
 * @returns PL: liczba ze słowem. EN: the number with the word.
 */
export function describeResponses(count: number): string {
  return `${count} ${pluralPl(count, ['odpowiedź', 'odpowiedzi', 'odpowiedzi'])}`;
}

/**
 * PL: Zamienia datę RRRR-MM-DD na krótką „15.10”: dzień bez zera na początku, miesiąc z zerem (jak „6.10” i „30.09” w EKRANY.md).
 * EN: Turns a YYYY-MM-DD date into the short "15.10": the day without a leading zero, the month with one (like "6.10" and "30.09" in EKRANY.md).
 *
 * @param isoDate - PL: data RRRR-MM-DD. EN: the YYYY-MM-DD date.
 * @returns PL: data „D.MM”. EN: the date as "D.MM".
 */
export function formatShortDate(isoDate: string): string {
  const [, month = '', day = ''] = isoDate.split('-');
  return `${Number(day)}.${month}`;
}

/**
 * PL: Liczy ostatni dzień nowej ankiety i podaje go jako „19.10.2026”. Czas trwania liczy się od dnia publikacji, więc 7 dni od 12.10 to 19.10 (tak samo liczy serwer).
 * EN: Counts the last day of a new survey and gives it as "19.10.2026". The duration counts from the publication day, so 7 days from 12.10 is 19.10 (the server counts the same way).
 *
 * @param now - PL: chwila publikacji. EN: the moment of publication.
 * @param durationDays - PL: czas trwania w dniach. EN: the duration in days.
 * @returns PL: data „D.MM.RRRR”. EN: the date as "D.MM.YYYY".
 */
export function lastDayLabel(now: Date, durationDays: number): string {
  // PL: Dzisiejszy dzień w czasie polskim, a nie w strefie telefonu.
  // EN: Today in Polish time, not in the phone's time zone.
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: SCHOOL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  // PL: Dodaj dni do północy UTC tej daty, żeby czas letni nie przesunął wyniku.
  // EN: Add the days to the UTC midnight of that date, so daylight saving time does not shift the result.
  const end = new Date(Date.parse(`${pick('year')}-${pick('month')}-${pick('day')}T00:00:00Z`) + durationDays * MS_PER_DAY);
  const [year, month, day] = end.toISOString().slice(0, 10).split('-');
  return `${Number(day)}.${month}.${year}`;
}
