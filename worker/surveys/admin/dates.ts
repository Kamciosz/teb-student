/**
 * PL: Daty ankiet w czasie polskim: dzisiejszy dzień i ostatni dzień nowej ankiety. Serwer działa w UTC, a ankieta trwa do końca dnia w Polsce.
 *     Podtor 5a ma własną funkcję tego samego rodzaju, ale jej drzwi (index.ts) jej nie wystawiają, więc 5b liczy daty u siebie.
 * EN: The survey dates in Polish time: today and the last day of a new survey. The server runs in UTC, while a survey lasts until the end of the day in Poland.
 *     Subtrack 5a has its own function of this kind, but its door (index.ts) does not expose it, so 5b counts the dates itself.
 *
 * @author Jakub
 * @since 2026-10-12
 * @used_by worker/surveys/admin/routes.ts::surveysAdminApp
 * @used_by worker/surveys/admin/queries.ts::listPanelSurveys
 * @used_by worker/surveys/admin/validation.ts::parseNewSurvey
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

// PL: Kształt czasu polskiego z pola „Zamknij ankietę”: RRRR-MM-DDTHH:mm.
// EN: The Polish-time shape of the "Zamknij ankietę" field: YYYY-MM-DDTHH:mm.
const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/**
 * PL: Podaje czas polski dla chwili w formie RRRR-MM-DDTHH:mm (tak jak pole formularza).
 * EN: Gives the Polish time for a moment in the YYYY-MM-DDTHH:mm form (like the form field).
 *
 * @param ms - PL: chwila w milisekundach od 1970 r. EN: the moment in milliseconds since 1970.
 * @returns PL: czas polski, RRRR-MM-DDTHH:mm. EN: the Polish time, YYYY-MM-DDTHH:mm.
 */
function warsawWallClock(ms: number): string {
  // PL: Godzina w zapisie 00–23 (h23), bo niektóre silniki podają północ jako 24.
  // EN: The hour in the 00–23 form (h23), because some engines give midnight as 24.
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: SCHOOL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(ms);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}T${pick('hour')}:${pick('minute')}`;
}

/**
 * PL: Podaje przesunięcie czasu polskiego względem UTC w danej chwili (w milisekundach, +1 h zimą i +2 h latem jako 3600000 i 7200000).
 * EN: Gives the offset of Polish time from UTC at a moment (in milliseconds, +1 h in winter and +2 h in summer as 3600000 and 7200000).
 *
 * @param ms - PL: chwila w milisekundach od 1970 r. EN: the moment in milliseconds since 1970.
 * @returns PL: przesunięcie w milisekundach. EN: the offset in milliseconds.
 */
function warsawOffsetMs(ms: number): number {
  // PL: Czas polski tej chwili, zapisany jak UTC, minus sama chwila (bez sekund) daje przesunięcie.
  // EN: The Polish time of this moment, written as UTC, minus the moment itself (without seconds) gives the offset.
  const wallAsUtc = Date.parse(`${warsawWallClock(ms)}:00Z`);
  return wallAsUtc - Math.floor(ms / 1000) * 1000;
}

/**
 * PL: Zamienia czas polski z pola formularza na chwilę (milisekundy UTC). Zwraca null, gdy zapis jest zły, data nie istnieje (np. 30 lutego) albo godzina wypada w przeskoku czasu letniego.
 * EN: Turns the Polish time from the form field into a moment (UTC milliseconds). Returns null when the text is bad, the date does not exist (e.g. 30 February) or the hour falls into the daylight saving jump.
 *
 * @param local - PL: czas polski, RRRR-MM-DDTHH:mm. EN: the Polish time, YYYY-MM-DDTHH:mm.
 * @returns PL: chwila w milisekundach UTC albo null. EN: the moment in UTC milliseconds, or null.
 */
export function warsawToUtcMs(local: string): number | null {
  if (!LOCAL_DATE_TIME.test(local)) return null;

  // PL: Ten sam zapis potraktowany jak UTC to pierwsze przybliżenie. Dwa przebiegi korekty biorą przesunięcie z właściwej chwili (także przy zmianie czasu).
  // EN: The same text read as UTC is the first guess. Two correction passes take the offset from the right moment (also across a time change).
  const wall = Date.parse(`${local}:00Z`);
  if (Number.isNaN(wall)) return null;
  const firstGuess = wall - warsawOffsetMs(wall);
  const utc = wall - warsawOffsetMs(firstGuess);

  // PL: Sprawdź, czy wynik wraca do tego samego zapisu. Tak odpadają daty, które JavaScript przelicza (30 lutego), i godziny z przeskoku.
  // EN: Check that the result turns back into the same text. This drops dates that JavaScript rolls over (30 February) and hours in the jump.
  return warsawWallClock(utc) === local ? utc : null;
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
