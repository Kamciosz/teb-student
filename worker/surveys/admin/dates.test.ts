/**
 * PL: Test dat ankiet w panelu (podtor 5b): ostatni dzień liczony od dnia publikacji, przejście przez koniec miesiąca i roku, dzień w czasie polskim oraz koniec ankiety.
 * EN: Test of the panel survey dates (subtrack 5b): the last day counted from the publication day, crossing the end of a month and a year, the day in Polish time and the end of a survey.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/surveys/admin/dates.ts::lastDayOf
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { isRunning, lastDayOf, warsawToday, warsawToUtcMs } from './dates';

describe('lastDayOf', () => {
  it('7 dni od 12.10 to ostatni dzień 19.10 / 7 days from 12.10 is the last day 19.10', () => {
    expect(lastDayOf('2026-10-12', 7)).toBe('2026-10-19');
  });

  it('przechodzi przez koniec miesiąca i roku / crosses the end of a month and a year', () => {
    expect(lastDayOf('2026-10-30', 3)).toBe('2026-11-02');
    expect(lastDayOf('2026-12-30', 14)).toBe('2027-01-13');
  });
});

describe('warsawToday', () => {
  it('po północy w Polsce to już następny dzień, choć w UTC jeszcze nie / after midnight in Poland it is already the next day, while in UTC it is not', () => {
    // 22:30 UTC w lecie to 00:30 następnego dnia w Polsce.
    expect(warsawToday(new Date('2026-10-12T22:30:00Z'))).toBe('2026-10-13');
    expect(warsawToday(new Date('2026-10-12T10:00:00Z'))).toBe('2026-10-12');
  });
});

describe('warsawToUtcMs', () => {
  it('czas letni i zimowy: 12:00 w Warszawie to 10:00 UTC latem i 11:00 UTC zimą / summer and winter time: 12:00 in Warsaw is 10:00 UTC in summer and 11:00 UTC in winter', () => {
    expect(warsawToUtcMs('2026-10-20T12:00')).toBe(Date.parse('2026-10-20T10:00:00Z'));
    expect(warsawToUtcMs('2026-11-20T12:00')).toBe(Date.parse('2026-11-20T11:00:00Z'));
  });

  it('godzina zero i ostatnia minuta dnia / midnight and the last minute of the day', () => {
    expect(warsawToUtcMs('2026-10-20T00:00')).toBe(Date.parse('2026-10-19T22:00:00Z'));
    expect(warsawToUtcMs('2026-10-20T23:59')).toBe(Date.parse('2026-10-20T21:59:00Z'));
  });

  it('odrzuca zły zapis, datę, której nie ma, i godzinę z przeskoku czasu / rejects a bad text, a date that does not exist and an hour in the time jump', () => {
    expect(warsawToUtcMs('20.10.2026 12:00')).toBeNull();
    expect(warsawToUtcMs('2026-02-30T12:00')).toBeNull();
    // PL: 29.03.2026 o 02:30 nie istnieje w Warszawie (zegar przeskakuje z 02:00 na 03:00).
    // EN: 29.03.2026 at 02:30 does not exist in Warsaw (the clock jumps from 02:00 to 03:00).
    expect(warsawToUtcMs('2026-03-29T02:30')).toBeNull();
  });
});

describe('isRunning', () => {
  it('ostatni dzień jeszcze trwa, następny nie / the last day still runs, the next one does not', () => {
    expect(isRunning('2026-10-19', '2026-10-19')).toBe(true);
    expect(isRunning('2026-10-19', '2026-10-20')).toBe(false);
  });
});
