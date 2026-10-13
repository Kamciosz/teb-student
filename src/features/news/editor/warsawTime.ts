/**
 * PL: Czas warszawski w edytorze: zamienia dzień i godzinę wpisane w formularzu na chwilę (milisekundy od 1970 roku) i chwilę z powrotem na zdanie po polsku. Strefa Europe/Warsaw jest zawsze ta sama, niezależnie od strefy telefonu, a przesunięcie (czas letni albo zimowy) liczymy dla konkretnego dnia.
 * EN: Warsaw time in the editor: turns the day and the time typed in the form into a moment (milliseconds since 1970) and the moment back into a Polish sentence. The zone Europe/Warsaw is always the same, whatever the phone's zone is, and the offset (summer or winter time) is counted for the given day.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/news/editor/PreviewStep.tsx::PreviewStep
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::EntryWizard
 * @used_by src/features/news/editor/warsawTime.test.ts::warsawToEpochMs
 */

// PL: Strefa, w której pisze redakcja i czyta uczeń.
// EN: The zone in which the editors write and the students read.
const ZONE = 'Europe/Warsaw';

// PL: Składniki chwili w tej strefie, w porządku od roku do sekundy.
// EN: The parts of a moment in this zone, from the year to the second.
const WALL_CLOCK = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const DAY_TEXT = new Intl.DateTimeFormat('pl-PL', { timeZone: ZONE, weekday: 'long', day: 'numeric', month: 'long' });
const CLOCK_TEXT = new Intl.DateTimeFormat('pl-PL', { timeZone: ZONE, hour: '2-digit', minute: '2-digit' });

// PL: Kształt daty z pola „date” (RRRR-MM-DD) i godziny z pola „time” (GG:MM).
// EN: The shape of the date from the "date" field (YYYY-MM-DD) and of the time from the "time" field (HH:MM).
const DATE_SHAPE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_SHAPE = /^(\d{2}):(\d{2})$/;

/**
 * PL: Przesunięcie Warszawy względem UTC w danej chwili, w milisekundach (1 albo 2 godziny).
 * EN: Warsaw's offset from UTC at the given moment, in milliseconds (1 or 2 hours).
 *
 * @param epoch - PL: chwila w milisekundach. EN: the moment in milliseconds.
 * @returns PL: przesunięcie w milisekundach. EN: the offset in milliseconds.
 */
function offsetAt(epoch: number): number {
  const parts = Object.fromEntries(WALL_CLOCK.formatToParts(new Date(epoch)).map((part) => [part.type, Number(part.value)]));
  const wallAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return wallAsUtc - Math.floor(epoch / 1000) * 1000;
}

/**
 * PL: Zamienia dzień i godzinę z formularza na chwilę. Zwraca null, gdy któreś pole jest puste albo nie istnieje taka data (na przykład 31 lutego).
 * EN: Turns the day and the time from the form into a moment. Returns null when a field is empty or there is no such date (for example 31 February).
 *
 * @param date - PL: dzień w formacie RRRR-MM-DD. EN: the day in the YYYY-MM-DD format.
 * @param time - PL: godzina w formacie GG:MM. EN: the time in the HH:MM format.
 * @returns PL: chwila w milisekundach albo null. EN: the moment in milliseconds, or null.
 */
export function warsawToEpochMs(date: string, time: string): number | null {
  const day = DATE_SHAPE.exec(date);
  const clock = TIME_SHAPE.exec(time);
  if (!day || !clock) return null;
  const [year, month, dayOfMonth, hour, minute] = [...day.slice(1), ...clock.slice(1)].map(Number);
  if (hour > 23 || minute > 59) return null;
  const wall = Date.UTC(year, month - 1, dayOfMonth, hour, minute);
  const check = new Date(wall);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== dayOfMonth) return null;
  // PL: Pierwsze przybliżenie daje przesunięcie z chwili „jakby UTC”. Drugi krok bierze przesunięcie z właściwej chwili, więc wychodzi dobrze także przy zmianie czasu.
  // EN: The first guess takes the offset at the "as if UTC" moment. The second step takes the offset at the right moment, so it is correct also around the clock change.
  const firstGuess = wall - offsetAt(wall);
  return wall - offsetAt(firstGuess);
}

/**
 * PL: Zdanie o chwili publikacji po polsku, w strefie Warszawy, np. „poniedziałek, 26 października o 12:00”.
 * EN: A Polish sentence about the publication moment, in Warsaw's zone, e.g. "poniedziałek, 26 października o 12:00".
 *
 * @param epoch - PL: chwila w milisekundach. EN: the moment in milliseconds.
 * @returns PL: dzień i godzina po polsku. EN: the day and the time in Polish.
 */
export function formatWarsawMoment(epoch: number): string {
  return `${DAY_TEXT.format(epoch)} o ${CLOCK_TEXT.format(epoch)}`;
}
