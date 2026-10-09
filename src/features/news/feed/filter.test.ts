/**
 * PL: Testy filtra listy aktualności i zapisu czasu publikacji.
 * EN: Tests of the news list filter and the publication time format.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/filter.ts::filterEntries
 * @uses src/features/news/feed/format.ts::formatRelative
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { filterEntries } from './filter';
import { formatDay, formatRelative } from './format';
import type { NewsEntrySummary, NewsType } from './types';

/**
 * PL: Składa wpis testowy o podanym typie.
 * EN: Builds a test entry of the given type.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @param type - PL: typ wpisu. EN: the entry type.
 * @returns PL: wpis. EN: an entry.
 */
function entry(id: string, type: NewsType): NewsEntrySummary {
  return { id, type, source: 'Samorząd', publishedAt: '2026-10-09T10:00:00.000Z', title: id, excerpt: '' };
}

// PL: Grupa testów filtra.
// EN: A group of filter tests.
describe('filterEntries', () => {
  // PL: Przykładowa lista z dwoma typami.
  // EN: A sample list with two types.
  const entries = [entry('a', 'sport'), entry('b', 'news'), entry('c', 'sport')];

  // PL: „Wszystkie” zostawia całą listę.
  // EN: "all" keeps the whole list.
  it('wszystkie zostawia całą listę / all keeps the whole list', () => {
    expect(filterEntries(entries, 'all')).toEqual(entries);
  });

  // PL: Typ zostawia tylko swoje wpisy w tej samej kolejności.
  // EN: A type keeps only its own entries in the same order.
  it('typ zostawia tylko swoje wpisy / a type keeps only its own entries', () => {
    expect(filterEntries(entries, 'sport').map((item) => item.id)).toEqual(['a', 'c']);
    expect(filterEntries(entries, 'event')).toEqual([]);
  });
});

// PL: Grupa testów zapisu czasu.
// EN: A group of time format tests.
describe('formatRelative', () => {
  // PL: Stała chwila porównania: 2026-10-09 10:00 UTC.
  // EN: The fixed comparison moment: 2026-10-09 10:00 UTC.
  const now = Date.UTC(2026, 9, 9, 10, 0, 0);
  const ago = (ms: number) => new Date(now - ms).toISOString();

  // PL: Kolejne progi: minuty, godziny, wczoraj, dni i data.
  // EN: The successive thresholds: minutes, hours, yesterday, days and the date.
  it('wybiera zapis według wieku wpisu / picks the format by entry age', () => {
    expect(formatRelative(ago(20 * 60_000), now)).toBe('20 min temu');
    expect(formatRelative(ago(3 * 3_600_000), now)).toBe('3 godz. temu');
    expect(formatRelative(ago(30 * 3_600_000), now)).toBe('wczoraj');
    expect(formatRelative(ago(5 * 86_400_000), now)).toBe('5 dni temu');
    expect(formatRelative(ago(10 * 86_400_000), now)).toBe(formatDay(ago(10 * 86_400_000)));
  });

  // PL: Data ma dzień i miesiąc w strefie szkoły.
  // EN: The date has the day and month in the school time zone.
  it('zapisuje datę jako dzień.miesiąc / writes the date as day.month', () => {
    expect(formatDay('2026-10-12T10:00:00.000Z')).toBe('12.10');
  });
});
