/**
 * PL: Test terminu ankiety: data w Polsce, ostatni dzień ankiety i liczba dni do końca.
 * EN: Test of the survey deadline: the date in Poland, the last day of a survey and the number of days left.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/deadline.ts::daysLeft
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { daysLeft, isSurveyActive, warsawToday } from './deadline';

// PL: Grupa testów daty w Polsce.
// EN: A group of tests for the date in Poland.
describe('warsawToday', () => {
  it('po północy w Polsce jest już następny dzień / after midnight in Poland it is already the next day', () => {
    // PL: 22:30 UTC w lecie to 00:30 następnego dnia w Polsce (UTC+2).
    // EN: 22:30 UTC in summer is 00:30 of the next day in Poland (UTC+2).
    expect(warsawToday(new Date('2026-10-09T22:30:00Z'))).toBe('2026-10-10');
  });

  it('zimą różnica to jedna godzina / in winter the difference is one hour', () => {
    // PL: 22:30 UTC zimą to 23:30 tego samego dnia w Polsce (UTC+1).
    // EN: 22:30 UTC in winter is 23:30 of the same day in Poland (UTC+1).
    expect(warsawToday(new Date('2026-12-01T22:30:00Z'))).toBe('2026-12-01');
  });
});

// PL: Grupa testów ostatniego dnia ankiety.
// EN: A group of tests for the last day of a survey.
describe('isSurveyActive', () => {
  it('ostatni dzień ankieta jeszcze trwa, następnego już nie / on the last day the survey still runs, the next day it does not', () => {
    expect(isSurveyActive('2026-10-31', '2026-10-31')).toBe(true);
    expect(isSurveyActive('2026-10-31', '2026-11-01')).toBe(false);
  });
});

// PL: Grupa testów liczby dni do końca.
// EN: A group of tests for the number of days left.
describe('daysLeft', () => {
  it('ostatniego dnia zostaje 1 dzień / on the last day 1 day is left', () => {
    expect(daysLeft('2026-10-31', '2026-10-31')).toBe(1);
  });

  it('liczy dzisiejszy dzień, więc od 29.10 do 31.10 są 3 dni / counts today, so from 29.10 to 31.10 there are 3 days', () => {
    expect(daysLeft('2026-10-31', '2026-10-29')).toBe(3);
  });

  it('nie myli się przy zmianie czasu na zimowy / is not fooled by the switch to winter time', () => {
    // PL: Zmiana czasu jest 25.10.2026, a doba UTC ma zawsze 24 godziny, więc wynik się nie przesuwa.
    // EN: The time change is on 25.10.2026, and a UTC day always has 24 hours, so the result does not shift.
    expect(daysLeft('2026-10-27', '2026-10-24')).toBe(4);
  });
});
