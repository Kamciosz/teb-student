/**
 * PL: Zapis czasu publikacji dla ucznia: „20 min temu”, „3 godz. temu”, „wczoraj”, „5 dni temu”, a od tygodnia sama data „12.10”.
 * EN: The publication time as the student sees it: "20 min temu" (20 min ago), "3 godz. temu", "wczoraj" (yesterday), "5 dni temu", and from one week on just the date "12.10".
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/news/feed/EntryCard.tsx::formatRelative
 * @used_by src/features/news/feed/EntryScreen.tsx::formatDay
 * @used_by src/features/news/feed/format.test.ts::formatRelative
 */

// PL: Długości w milisekundach.
// EN: Lengths in milliseconds.
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// PL: Strefa szkoły, żeby data nie zależała od ustawień telefonu.
// EN: The school time zone, so the date does not depend on the phone settings.
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

/**
 * PL: Zapisuje samą datę w postaci „12.10”.
 * EN: Writes just the date as "12.10".
 *
 * @param iso - PL: chwila jako tekst ISO 8601. EN: the moment as an ISO 8601 string.
 * @returns PL: dzień i miesiąc. EN: day and month.
 */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric', timeZone: SCHOOL_TIME_ZONE });
}

/**
 * PL: Zapisuje, ile czasu minęło od publikacji.
 * EN: Writes how much time has passed since publication.
 *
 * @param iso - PL: chwila publikacji jako tekst ISO 8601. EN: the publication moment as an ISO 8601 string.
 * @param now - PL: chwila porównania w milisekundach (w testach stała). EN: the comparison moment in milliseconds (fixed in tests).
 * @returns PL: tekst dla ucznia. EN: the text for the student.
 */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const elapsed = now - new Date(iso).getTime();
  if (elapsed < MINUTE) return 'przed chwilą';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min temu`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} godz. temu`;
  if (elapsed < 2 * DAY) return 'wczoraj';
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)} dni temu`;
  return formatDay(iso);
}
