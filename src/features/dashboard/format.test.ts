/**
 * PL: Test formatowania tekstów pulpitu: data u góry, wiek wpisu, krótka data i podpis liczby dni.
 * EN: Test of the dashboard text formatting: the date at the top, the entry age, the short date and the day count caption.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/format.ts::formatToday
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje pod testem.
// EN: The functions under test.
import { formatAge, formatShortDate, formatToday, surveyDeadlineText } from './format';

/** PL: Chwila odniesienia testów: wtorek 6 października 2026, 12:00 czasu polskiego (10:00 UTC). EN: The reference moment of the tests: Tuesday 6 October 2026, 12:00 Polish time (10:00 UTC). */
const NOW = new Date('2026-10-06T10:00:00Z');

// PL: Grupa testów daty u góry.
// EN: A group of tests of the date at the top.
describe('formatToday', () => {
  // PL: Wzór z makiety: dzień tygodnia wielką literą, przecinek, dzień i miesiąc bez zer.
  // EN: The mockup pattern: the weekday with a capital letter, a comma, the day and month without zeros.
  it('daje „Wtorek, 6.10” jak w makiecie / gives "Wtorek, 6.10" as in the mockup', () => {
    expect(formatToday(NOW)).toBe('Wtorek, 6.10');
  });

  // PL: Dzień liczymy w strefie szkoły: 23:30 UTC 5.10 to już 6.10 w Polsce.
  // EN: We count the day in the school time zone: 23:30 UTC on 5.10 is already 6.10 in Poland.
  it('liczy dzień w strefie szkoły, nie UTC / counts the day in the school time zone, not UTC', () => {
    expect(formatToday(new Date('2026-10-05T23:30:00Z'))).toBe('Wtorek, 6.10');
  });
});

// PL: Grupa testów wieku wpisu.
// EN: A group of tests of the entry age.
describe('formatAge', () => {
  // PL: Czas przed chwilą NOW, w milisekundach, zamieniony na tekst ISO.
  // EN: A time before the NOW moment, in milliseconds, turned into an ISO text.
  const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

  // PL: Minuty, godziny, wczoraj i dni, jak „20 min” z makiety.
  // EN: Minutes, hours, yesterday and days, like the "20 min" from the mockup.
  it('opisuje wiek wpisu krótko / describes the entry age briefly', () => {
    expect(formatAge(ago(20_000), NOW.getTime())).toBe('teraz');
    expect(formatAge(ago(20 * 60_000), NOW.getTime())).toBe('20 min');
    expect(formatAge(ago(3 * 3_600_000), NOW.getTime())).toBe('3 godz.');
    expect(formatAge(ago(30 * 3_600_000), NOW.getTime())).toBe('wczoraj');
    expect(formatAge(ago(4 * 86_400_000), NOW.getTime())).toBe('4 dni');
  });

  // PL: Wpis starszy niż tydzień ma datę, a wpis „z przyszłości” liczy się jak świeży.
  // EN: An entry older than a week gets the date, and an entry "from the future" counts as fresh.
  it('stary wpis ma datę, a wpis z przyszłości jest świeży / an old entry gets the date, a future entry is fresh', () => {
    expect(formatAge('2026-09-20T10:00:00Z', NOW.getTime())).toBe('20.09');
    expect(formatAge(new Date(NOW.getTime() + 5 * 60_000).toISOString(), NOW.getTime())).toBe('teraz');
  });
});

// PL: Grupa testów krótkiej daty i terminu ankiety.
// EN: A group of tests of the short date and the survey deadline.
describe('formatShortDate i surveyDeadlineText', () => {
  // PL: Data wiersza ogłoszenia jak „12.10”.
  // EN: The announcement row date like "12.10".
  it('formatuje krótką datę / formats the short date', () => {
    expect(formatShortDate('2026-10-12T08:00:00Z')).toBe('12.10');
  });

  // PL: Zero albo mniej to „dziś”, jeden to „dzień”, reszta to „dni”.
  // EN: Zero or less is "dziś", one is "dzień", the rest is "dni".
  it('odmienia termin ankiety / inflects the survey deadline', () => {
    expect(surveyDeadlineText(0)).toBe('dziś');
    expect(surveyDeadlineText(1)).toBe('jeszcze 1 dzień');
    expect(surveyDeadlineText(3)).toBe('jeszcze 3 dni');
  });
});
