/**
 * PL: Termin ankiety: dzisiejsza data w Polsce, sprawdzenie, czy ankieta trwa, i liczba dni do końca. Czysta logika bez bazy, więc łatwa do przetestowania.
 *     Ankieta trwa do końca dnia ends_on, a ten dzień liczy się jako dzień do końca (ostatniego dnia zostaje „1 dzień”).
 * EN: The survey deadline: today's date in Poland, a check whether the survey is running, and the number of days left. Pure logic without the database, so it is easy to test.
 *     A survey runs until the end of the ends_on day, and that day counts as a day left (on the last day "1 dzień" is left).
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by worker/surveys/vote/queries.ts::listSurveys
 * @used_by worker/surveys/vote/routes.ts::surveysVoteApp
 * @used_by worker/surveys/vote/deadline.test.ts::daysLeft
 */

// PL: Strefa czasu szkoły. Data ankiety to dzień w Polsce, a serwer działa w UTC.
// EN: The school's time zone. The survey date is a day in Poland, while the server runs in UTC.
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

// PL: Ile milisekund ma doba. Do liczenia różnicy dni między datami.
// EN: How many milliseconds a day has. For counting the difference in days between dates.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * PL: Podaje dzisiejszą datę w Polsce.
 * EN: Gives today's date in Poland.
 *
 * @param now - PL: chwila, dla której liczymy datę (zegar serwera). EN: the moment to compute the date for (the server clock).
 * @returns PL: data w formacie RRRR-MM-DD. EN: the date in YYYY-MM-DD format.
 */
export function warsawToday(now: Date): string {
  // PL: Rozbij datę na rok, miesiąc i dzień w czasie polskim, bo to nie zależy od ustawień serwera.
  // EN: Split the date into year, month and day in Polish time, because it does not depend on the server settings.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SCHOOL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  // PL: Wyjmij część po nazwie. Gdy jej nie ma, to błąd środowiska, a nie danych.
  // EN: Take a part by name. When it is missing, it is an environment error, not a data error.
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

/**
 * PL: Sprawdza, czy ankieta jeszcze trwa. Daty RRRR-MM-DD porównują się jak tekst.
 * EN: Checks whether the survey is still running. YYYY-MM-DD dates compare like text.
 *
 * @param endsOn - PL: ostatni dzień ankiety. EN: the last day of the survey.
 * @param today - PL: dzisiejsza data z warsawToday. EN: today's date from warsawToday.
 * @returns PL: prawda w ostatnim dniu i przed nim. EN: true on the last day and before it.
 */
export function isSurveyActive(endsOn: string, today: string): boolean {
  // PL: Ostatni dzień jeszcze się liczy, dopiero następny kończy ankietę.
  // EN: The last day still counts, only the next one ends the survey.
  return today <= endsOn;
}

/**
 * PL: Liczy dni do końca ankiety, razem z dniem dzisiejszym.
 * EN: Counts the days left to the end of the survey, including today.
 *
 * @param endsOn - PL: ostatni dzień ankiety. EN: the last day of the survey.
 * @param today - PL: dzisiejsza data z warsawToday. EN: today's date from warsawToday.
 * @returns PL: liczba dni, co najmniej 1 dla trwającej ankiety. EN: the number of days, at least 1 for a running survey.
 */
export function daysLeft(endsOn: string, today: string): number {
  // PL: Obie daty jako północ UTC, żeby różnica była pełną liczbą dób bez przesunięcia czasu letniego.
  // EN: Both dates as UTC midnight, so the difference is a whole number of days without the daylight-saving shift.
  const difference = Date.parse(`${endsOn}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);

  // PL: Dzień dzisiejszy liczy się jako jeden z dni do końca.
  // EN: Today counts as one of the days left.
  return Math.round(difference / MS_PER_DAY) + 1;
}
