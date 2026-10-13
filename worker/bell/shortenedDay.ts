/**
 * PL: Dni skrócone podtoru 6: sprawdzanie daty z adresu (RRRR-MM-DD, prawdziwa data w kalendarzu) i dzisiejszy dzień w czasie polskim. Bez zależności od innych modułów, bo ich drzwi nie wystawiają tych funkcji.
 * EN: Shortened days of subtrack 6: checking the date from the address (YYYY-MM-DD, a real calendar date) and today's day in Polish time. No dependency on other modules, because their doors do not expose these functions.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @used_by worker/bell/routes.ts::bellApp
 * @used_by worker/bell/routes.test.ts::parseShortenedDay
 */

// PL: Strefa czasu szkoły. Dzień liczymy zawsze stąd, niezależnie od ustawień serwera.
// EN: The school's time zone. The day is always counted from here, whatever the server settings.
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

// PL: Format RRRR-MM-DD: cztery cyfry roku, dwie miesiąca, dwie dnia.
// EN: The YYYY-MM-DD format: four digits of year, two of month, two of day.
const DAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/**
 * PL: Sprawdza datę z adresu. Zwraca ją, gdy ma format RRRR-MM-DD i istnieje w kalendarzu (nie ma 30.02 ani 13. miesiąca), w przeciwnym razie null.
 * EN: Checks the date from the address. Returns it when it has the YYYY-MM-DD format and exists in the calendar (no 30.02 or 13th month), otherwise null.
 *
 * @param value - PL: tekst z adresu. EN: the text from the address.
 * @returns PL: data albo null. EN: the date or null.
 */
export function parseShortenedDay(value: string): string | null {
  // PL: Najpierw kształt, potem kalendarz.
  // EN: First the shape, then the calendar.
  if (!DAY_FORMAT.test(value)) return null;
  // PL: Data jako północ UTC. Gdy dnia nie ma (30.02), JS ją przesuwa i zapis nie zgadza się z wejściem.
  // EN: The date as UTC midnight. When the day does not exist (30.02), JS shifts it and the text no longer matches the input.
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? value : null;
}

/**
 * PL: Dzisiejszy dzień w czasie polskim, w formacie RRRR-MM-DD.
 * EN: Today's day in Polish time, in the YYYY-MM-DD format.
 *
 * @param now - PL: chwila w czasie. EN: the moment in time.
 * @returns PL: dzień RRRR-MM-DD. EN: the day as YYYY-MM-DD.
 */
export function warsawDay(now: Date): string {
  // PL: Rozbij chwilę na rok, miesiąc i dzień w strefie szkoły.
  // EN: Split the moment into year, month and day in the school zone.
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: SCHOOL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  // PL: Wyjmij część po nazwie, nie po pozycji.
  // EN: Take a part by name, not by position.
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}
