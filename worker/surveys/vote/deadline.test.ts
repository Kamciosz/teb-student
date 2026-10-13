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
import { closedOn, daysLeft, isSurveyActive, isSurveyOpen, shownClosesAt, warsawToday } from './deadline';

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

// PL: Grupa testów zamknięcia ankiety bez godziny i z godziną.
// EN: A group of tests for closing a survey without an hour and with an hour.
describe('isSurveyOpen', () => {
  it('bez godziny liczy się tylko dzień / without an hour only the day counts', () => {
    expect(isSurveyOpen('2026-10-31', null, '2026-10-31', new Date('2026-10-31T23:59:00Z'))).toBe(true);
    expect(isSurveyOpen('2026-10-31', null, '2026-11-01', new Date('2026-11-01T00:01:00Z'))).toBe(false);
  });

  it('przed godziną zamknięcia jest otwarta, w chwili zamknięcia już nie / open before the closing hour, closed from that moment on', () => {
    const closesAt = new Date('2026-10-29T12:00:00Z');
    expect(isSurveyOpen('2026-11-05', closesAt, '2026-10-29', new Date('2026-10-29T11:59:59Z'))).toBe(true);
    expect(isSurveyOpen('2026-11-05', closesAt, '2026-10-29', closesAt)).toBe(false);
  });

  it('po ostatnim dniu jest zamknięta, nawet gdy godzina jeszcze nie minęła / closed after the last day, even when the hour has not passed', () => {
    const closesAt = new Date('2026-11-10T12:00:00Z');
    expect(isSurveyOpen('2026-10-31', closesAt, '2026-11-01', new Date('2026-11-01T08:00:00Z'))).toBe(false);
  });
});

// PL: Grupa testów godziny, którą pokazujemy w aplikacji.
// EN: A group of tests for the hour we show in the app.
describe('shownClosesAt', () => {
  it('bez godziny daje null / without an hour gives null', () => {
    expect(shownClosesAt('2026-10-31', null)).toBeNull();
  });

  it('godzina przed końcem ostatniego dnia zostaje / an hour before the end of the last day stays', () => {
    const closesAt = new Date('2026-10-29T20:00:00Z');
    expect(shownClosesAt('2026-10-31', closesAt)).toBe(closesAt);
  });

  it('godzina po ostatnim dniu jest ukryta / an hour after the last day is hidden', () => {
    expect(shownClosesAt('2026-10-30', new Date('2026-11-02T10:00:00Z'))).toBeNull();
  });
});

// PL: Grupa testów dnia zamknięcia zakończonej ankiety.
// EN: A group of tests for the closing day of an ended survey.
describe('closedOn', () => {
  it('bez godziny to ostatni dzień / without an hour it is the last day', () => {
    expect(closedOn('2026-09-30', null)).toBe('2026-09-30');
  });

  it('zamknięta godziną wcześniej pokazuje dzień zamknięcia / closed earlier by an hour shows the closing day', () => {
    expect(closedOn('2026-11-05', new Date('2026-10-29T08:00:00Z'))).toBe('2026-10-29');
  });
});
