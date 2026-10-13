/**
 * PL: Testy czasu warszawskiego w edytorze. Dowodzą, że dzień i godzina z formularza zamieniają się w tę samą chwilę niezależnie od strefy przeglądarki, także w dniu zmiany czasu (25 października 2026), a puste albo niemożliwe wartości dają null.
 * EN: Tests of the Warsaw time in the editor. They prove that the day and the time from the form turn into the same moment whatever the browser's zone is, also on the clock-change day (25 October 2026), and that empty or impossible values give null.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/editor/warsawTime.ts::warsawToEpochMs
 * @uses src/features/news/editor/warsawTime.ts::formatWarsawMoment
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
import { formatWarsawMoment, warsawToEpochMs } from './warsawTime';

describe('warsawToEpochMs: zamiana dnia i godziny na chwilę / turning a day and a time into a moment', () => {
  it('latem Warszawa jest o dwie godziny przed UTC / in summer Warsaw is two hours ahead of UTC', () => {
    expect(warsawToEpochMs('2026-07-01', '12:00')).toBe(Date.UTC(2026, 6, 1, 10, 0));
  });

  it('zimą Warszawa jest o godzinę przed UTC / in winter Warsaw is one hour ahead of UTC', () => {
    expect(warsawToEpochMs('2026-01-15', '12:00')).toBe(Date.UTC(2026, 0, 15, 11, 0));
  });

  it('dzień przed zmianą czasu liczy przesunięcie letnie / the day before the clock change uses the summer offset', () => {
    expect(warsawToEpochMs('2026-10-24', '12:00')).toBe(Date.UTC(2026, 9, 24, 10, 0));
  });

  it('dzień po zmianie czasu liczy przesunięcie zimowe / the day after the clock change uses the winter offset', () => {
    expect(warsawToEpochMs('2026-10-26', '12:00')).toBe(Date.UTC(2026, 9, 26, 11, 0));
  });
});

describe('warsawToEpochMs: puste i niemożliwe wartości / empty and impossible values', () => {
  it('pusty dzień albo pusta godzina daje null / an empty day or an empty time gives null', () => {
    expect(warsawToEpochMs('', '12:00')).toBeNull();
    expect(warsawToEpochMs('2026-10-26', '')).toBeNull();
  });

  it('dzień, którego nie ma w kalendarzu, daje null / a day that is not in the calendar gives null', () => {
    expect(warsawToEpochMs('2026-02-31', '12:00')).toBeNull();
  });

  it('godzina spoza doby daje null / a time outside the day gives null', () => {
    expect(warsawToEpochMs('2026-10-26', '24:00')).toBeNull();
    expect(warsawToEpochMs('2026-10-26', '12:60')).toBeNull();
  });

  it('zły kształt daty albo godziny daje null / a wrong shape of the date or the time gives null', () => {
    expect(warsawToEpochMs('26.10.2026', '12:00')).toBeNull();
    expect(warsawToEpochMs('2026-10-26', '12')).toBeNull();
  });
});

describe('formatWarsawMoment: zdanie po polsku / a Polish sentence', () => {
  it('podaje dzień tygodnia, dzień, miesiąc i godzinę po polsku / gives the weekday, day, month and time in Polish', () => {
    expect(formatWarsawMoment(Date.UTC(2026, 9, 26, 11, 0))).toBe('poniedziałek, 26 października o 12:00');
  });

  it('godzina jest w strefie Warszawy, nie UTC / the time is in Warsaw\'s zone, not UTC', () => {
    expect(formatWarsawMoment(Date.UTC(2026, 9, 24, 10, 0))).toBe('sobota, 24 października o 12:00');
  });
});
