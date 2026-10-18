/**
 * PL: Test czystych funkcji widoku zgłoszeń ucznia: nazwa etapu i krótka data.
 * EN: Test of the pure functions of the student reports view: the stage name and the short date.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/reportView.ts::stageLabel
 * @uses src/features/reports/student/reportView.ts::formatShortDate
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { formatShortDate, stageLabel } from './reportView';

// PL: Grupa testów nazwy etapu.
// EN: A group of tests for the stage name.
describe('stageLabel', () => {
  // PL: Kod etapu zamienia się na nazwę z listy.
  // EN: A stage code turns into the name from the list.
  it.each([
    ['received', 'Przyjęte'],
    ['in_progress', 'W trakcie'],
    ['resolved', 'Załatwione'],
  ])('etap %s to „%s” / stage %s', (stage, expected) => {
    // PL: Porównaj z nazwą z listy.
    // EN: Compare with the name from the list.
    expect(stageLabel(stage)).toBe(expected);
  });

  // PL: Nieznany kod nie znika z ekranu, tylko wraca jako tekst.
  // EN: An unknown code does not vanish from the screen, it comes back as text.
  it('nieznany kod wraca bez zmian / an unknown code comes back unchanged', () => {
    // PL: Sprawdź kod spoza listy.
    // EN: Check a code outside the list.
    expect(stageLabel('coś-nowego')).toBe('coś-nowego');
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
