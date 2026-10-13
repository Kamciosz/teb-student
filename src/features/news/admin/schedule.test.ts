/**
 * PL: Test znacznika zaplanowanego wpisu: kiedy się pojawia, kiedy nie, oraz godzina w strefie Europe/Warsaw przy zmianie czasu (25.10.2026 o 03:00 zmienia się na 02:00). Napisy są stałe, więc wynik nie zależy od strefy komputera ani od CI, które działa w UTC.
 * EN: Test of the scheduled tag of an entry: when it appears and when it does not, and the Europe/Warsaw hour across the time change (on 25.10.2026 03:00 becomes 02:00). The texts are fixed, so the result does not depend on the computer's zone or on CI, which runs in UTC.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/admin/schedule.ts::formatScheduled
 * @uses src/features/news/admin/schedule.ts::isScheduled
 * @uses src/features/news/admin/schedule.ts::scheduledLabel
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Typ wpisu listy i funkcje znacznika pod testem.
// EN: The list entry type and the tag functions under test.
import type { PanelEntry } from './api';
import { formatScheduled, isScheduled, scheduledLabel } from './schedule';

/** PL: „Teraz” w testach: 24.10.2026 o 14:00 w Warszawie (12:00 UTC), przed zmianą czasu. EN: "Now" in the tests: 24.10.2026 at 14:00 in Warsaw (12:00 UTC), before the time change. */
const NOW = Date.parse('2026-10-24T12:00:00Z');

/**
 * PL: Tworzy wpis testowy: opublikowany, bez chwili startu, chyba że nadpisano pola.
 * EN: Makes a test entry: published, without a start moment, unless the fields are overridden.
 *
 * @param overrides - PL: pola do zmiany. EN: the fields to change.
 * @returns PL: wpis z listy panelu. EN: the entry from the panel list.
 */
function entry(overrides: Partial<PanelEntry>): PanelEntry {
  return { id: 'w1', type: 'news', status: 'published', title: 'Dzień sportu', source: 'Samorząd', publishedAt: '2026-10-09T10:00:00.000Z', pinnedAt: null, publishAt: null, ...overrides };
}

// PL: Przed zmianą czasu jest CEST (UTC+2), po zmianie CET (UTC+1), więc godzina w Warszawie idzie inaczej niż w UTC.
// EN: Before the time change it is CEST (UTC+2), after it CET (UTC+1), so the Warsaw hour differs from UTC.
describe('formatScheduled', () => {
  // PL: Trzy chwile: przed zmianą, po zmianie i wiosną (CET), żeby sprawdzić zwykły przypadek.
  // EN: Three moments: before the change, after it, and in spring (CET), to check the usual case.
  it('zamienia chwilę na dzień.miesiąc, godzinę w Warszawie, także przy zmianie czasu / turns the moment into day.month, hour in Warsaw, also across the time change', () => {
    expect(formatScheduled('2026-10-24T23:00:00Z')).toBe('25.10, 01:00');
    expect(formatScheduled('2026-10-25T02:00:00Z')).toBe('25.10, 03:00');
    expect(formatScheduled('2030-03-05T07:30:00.000Z')).toBe('5.03, 08:30');
  });

  // PL: Godzina 02:30 w noc zmiany występuje dwa razy. Oba razy pokazujemy tę samą godzinę, bez zgadywania, która to która.
  // EN: The 02:30 hour on the change night happens twice. Both times show the same hour, without guessing which is which.
  it('w noc zmiany godzina 02:30 pojawia się dwa razy / on the change night 02:30 happens twice', () => {
    expect(formatScheduled('2026-10-25T00:30:00Z')).toBe('25.10, 02:30');
    expect(formatScheduled('2026-10-25T01:30:00Z')).toBe('25.10, 02:30');
  });

  // PL: Północ ma pokazać się jako 00, a nie 24.
  // EN: Midnight must show as 00, not 24.
  it('północ to 00, a nie 24 / midnight is 00, not 24', () => {
    expect(formatScheduled('2026-10-24T22:00:00Z')).toBe('25.10, 00:00');
  });
});

// PL: Kiedy wpis dostaje znacznik, a kiedy nie.
// EN: When an entry gets the tag, and when not.
describe('isScheduled i scheduledLabel / isScheduled and scheduledLabel', () => {
  // PL: Opublikowany wpis z chwilą startu w przyszłości dostaje znacznik z godziną w Warszawie.
  // EN: A published entry with a start moment in the future gets the tag with the Warsaw hour.
  it('opublikowany wpis z chwilą startu w przyszłości jest zaplanowany / a published entry with a start moment in the future is scheduled', () => {
    const scheduled = entry({ publishAt: '2026-10-25T02:00:00.000Z' });

    expect(isScheduled(scheduled, NOW)).toBe(true);
    expect(scheduledLabel(scheduled, NOW)).toBe('Zaplanowany na 25.10, 03:00');
  });

  // PL: Chwila startu w przeszłości znaczy, że wpis już jest u uczniów, więc znacznika nie ma.
  // EN: A start moment in the past means the entry is already with the students, so there is no tag.
  it('wpis z chwilą startu w przeszłości nie ma znacznika / an entry with a start moment in the past has no tag', () => {
    expect(scheduledLabel(entry({ publishAt: '2026-10-24T11:00:00.000Z' }), NOW)).toBeNull();
  });

  // PL: Chwila równa „teraz” nie jest już w przyszłości.
  // EN: A moment equal to "now" is no longer in the future.
  it('chwila startu równa teraz nie ma znacznika / a start moment equal to now has no tag', () => {
    expect(scheduledLabel(entry({ publishAt: '2026-10-24T12:00:00.000Z' }), NOW)).toBeNull();
  });

  // PL: Wpis bez chwili startu nie jest zaplanowany.
  // EN: An entry without a start moment is not scheduled.
  it('wpis bez chwili startu nie ma znacznika / an entry without a start moment has no tag', () => {
    expect(scheduledLabel(entry({ publishAt: null }), NOW)).toBeNull();
  });

  // PL: Szkic nie dostaje znacznika, nawet gdy ma chwilę startu.
  // EN: A draft gets no tag, even when it has a start moment.
  it('szkic nie dostaje znacznika, nawet z chwilą startu / a draft gets no tag, even with a start moment', () => {
    expect(scheduledLabel(entry({ status: 'draft', publishedAt: null, publishAt: '2026-10-25T02:00:00.000Z' }), NOW)).toBeNull();
  });
});
