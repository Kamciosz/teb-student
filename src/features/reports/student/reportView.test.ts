/**
 * PL: Test czystych funkcji widoku „Moje zgłoszenia”: segmenty paska etapu i krótka data.
 * EN: Test of the pure functions of the "Moje zgłoszenia" view: the stage bar segments and the short date.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/reportView.ts::stageSegments
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { formatShortDate, stageSegments } from './reportView';

// PL: Grupa testów paska etapu.
// EN: A group of tests for the stage bar.
describe('stageSegments', () => {
  // PL: Każdy etap zapala tyle segmentów, ile ma numer.
  // EN: Every stage lights as many segments as its position.
  it.each([
    ['received', [true, false, false]],
    ['in_progress', [true, true, false]],
    ['resolved', [true, true, true]],
  ])('etap %s / stage %s', (stage, expected) => {
    // PL: Porównaj z oczekiwanym paskiem.
    // EN: Compare with the expected bar.
    expect(stageSegments(stage)).toEqual(expected);
  });

  // PL: Nieznany etap z serwera nie psuje listy.
  // EN: An unknown stage from the server does not break the list.
  it('nieznany etap świeci jak „przyjęte” / an unknown stage lights like "received"', () => {
    // PL: Sprawdź etap spoza listy.
    // EN: Check a stage outside the list.
    expect(stageSegments('coś-nowego')).toEqual([true, false, false]);
  });
});

// PL: Grupa testów krótkiej daty.
// EN: A group of tests for the short date.
describe('formatShortDate', () => {
  // PL: Data bez zer wiodących.
  // EN: A date without leading zeros.
  it('pokazuje dzień i miesiąc bez zer / shows day and month without zeros', () => {
    // PL: 6 października 2026, godzina 8:00 UTC.
    // EN: 6 October 2026, 8:00 UTC.
    expect(formatShortDate(Date.UTC(2026, 9, 6, 8, 0))).toBe('6.10');
  });

  // PL: Granica doby liczy się w czasie szkoły, nie UTC.
  // EN: The day boundary counts in school time, not UTC.
  it('liczy dobę w czasie szkoły / counts the day in school time', () => {
    // PL: 5 października 23:30 UTC to już 6 października w Warszawie.
    // EN: 5 October 23:30 UTC is already 6 October in Warsaw.
    expect(formatShortDate(Date.UTC(2026, 9, 5, 23, 30))).toBe('6.10');
  });
});
