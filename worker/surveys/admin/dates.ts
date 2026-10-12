/**
 * PL: Daty ankiet w czasie polskim: dzisiejszy dzień i ostatni dzień nowej ankiety. Serwer działa w UTC, a ankieta trwa do końca dnia w Polsce.
 *     Podtor 5a ma własną funkcję tego samego rodzaju, ale jej drzwi (index.ts) jej nie wystawiają, więc 5b liczy daty u siebie.
 * EN: The survey dates in Polish time: today and the last day of a new survey. The server runs in UTC, while a survey lasts until the end of the day in Poland.
 *     Subtrack 5a has its own function of this kind, but its door (index.ts) does not expose it, so 5b counts the dates itself.
 *
 * @author Jakub
 * @since 2026-10-12
 * @used_by worker/surveys/admin/routes.ts::createSurveysAdminApp
 * @used_by worker/surveys/admin/queries.ts::listPanelSurveys
 * @used_by worker/surveys/admin/dates.test.ts::lastDayOf
 */

// PL: Strefa czasu szkoły.
// EN: The school's time zone.
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

// PL: Ile milisekund ma doba. Do dodawania dni do daty.
// EN: How many milliseconds a day has. For adding days to a date.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * PL: Podaje dzisiejszą datę w czasie polskim.
 * EN: Gives today's date in Polish time.
 *
 * @param now - PL: chwila, dla której liczymy dzień. EN: the moment to count the day for.
 * @returns PL: data RRRR-MM-DD. EN: the date as YYYY-MM-DD.
 */
export function warsawToday(now: Date): string {
  // PL: Rozbij chwilę na rok, miesiąc i dzień w czasie polskim, bo to nie zależy od ustawień serwera.
  // EN: Split the moment into year, month and day in Polish time, because it does not depend on the server settings.
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: SCHOOL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);

  // PL: Wyjmij część po nazwie. Gdy jej nie ma, to błąd środowiska, a nie danych.
  // EN: Take a part by name. When it is missing, it is an environment error, not a data error.
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

/**
 * PL: Liczy ostatni dzień ankiety. Czas trwania liczy się od dnia publikacji: 7 dni od 12.10 to 19.10.
 * EN: Counts the last day of a survey. The duration counts from the publication day: 7 days from 12.10 is 19.10.
 *
 * @param today - PL: dzień publikacji, RRRR-MM-DD. EN: the publication day, YYYY-MM-DD.
 * @param durationDays - PL: czas trwania w dniach. EN: the duration in days.
 * @returns PL: ostatni dzień, RRRR-MM-DD. EN: the last day, YYYY-MM-DD.
 */
export function lastDayOf(today: string, durationDays: number): string {
  // PL: Data jako północ UTC, żeby dodanie dób nie zależało od czasu letniego.
  // EN: The date as UTC midnight, so adding days does not depend on daylight saving time.
  const end = new Date(Date.parse(`${today}T00:00:00Z`) + durationDays * MS_PER_DAY);

  // PL: Wróć do zapisu RRRR-MM-DD (pierwsze 10 znaków zapisu ISO).
  // EN: Go back to the YYYY-MM-DD form (the first 10 characters of the ISO form).
  return end.toISOString().slice(0, 10);
}

/**
 * PL: Sprawdza, czy ankieta jeszcze trwa. Ostatni dzień się liczy, dopiero następny kończy ankietę.
 * EN: Checks whether a survey is still running. The last day still counts, only the next one ends the survey.
 *
 * @param endsOn - PL: ostatni dzień ankiety. EN: the last day of the survey.
 * @param today - PL: dzisiejsza data. EN: today's date.
 * @returns PL: prawda, gdy ankieta trwa. EN: true when the survey is running.
 */
export function isRunning(endsOn: string, today: string): boolean {
  // PL: Daty RRRR-MM-DD porównują się jak tekst.
  // EN: YYYY-MM-DD dates compare as text.
  return today <= endsOn;
}
