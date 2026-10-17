/**
 * PL: Testy stanu dnia (bellDayStatus): przed lekcjami, w trakcie lekcji i przerwy, po lekcjach, weekend i pusty plan. Czas jest udawany (Europe/Warsaw, CEST = +02:00 w październiku 2026). Plan PRZYKŁADOWY w tym pliku nie jest planem szkoły.
 * EN: Tests of the state of the day (bellDayStatus): before lessons, during a lesson and a break, after lessons, weekend and empty plan. The time is faked (Europe/Warsaw, CEST = +02:00 in October 2026). The EXAMPLE plan in this file is not the school's plan.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/index.ts::bellDayStatus
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest, sterowanie czasem i podmiana modułu planu.
// EN: Vitest test functions, clock control and the plan module stub.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bellDayStatus } from './index';

// PL: Plan PRZYKŁADOWY trzymany w zmiennej, którą test może zmieniać.
// EN: The EXAMPLE plan held in a variable the test can change.
const plan = vi.hoisted(() => ({
  BELL_PLAN: [] as { start: string; end: string }[],
}));
vi.mock('./bellPlan', () => plan);

// PL: Dni testowe: 13.10.2026 to wtorek, 17.10 sobota, 18.10 niedziela. Czas podajemy z przesunięciem +02:00 (czas letni w Warszawie).
// EN: Test days: 13.10.2026 is a Tuesday, 17.10 a Saturday, 18.10 a Sunday. Times are given with the +02:00 offset (summer time in Warsaw).
const TUESDAY = '2026-10-13';
const SATURDAY = '2026-10-17';
const SUNDAY = '2026-10-18';

// PL: Stan dnia dla podanej chwili w czasie polskim.
// EN: The state of the day for a given moment in Polish time.
function statusAt(iso: string): string {
  return bellDayStatus(new Date(iso));
}

beforeEach(() => {
  // PL: Sterowany zegar i przykładowy plan przed każdym testem.
  // EN: A controlled clock and the example plan before each test.
  vi.useFakeTimers();
  plan.BELL_PLAN = [
    { start: '08:00', end: '08:45' },
    { start: '08:55', end: '09:40' },
  ];
});

afterEach(() => {
  vi.useRealTimers();
});

describe('plan przykładowy', () => {
  it('przed pierwszą lekcją (także tuż przed jej początkiem) daje „before”', () => {
    // PL: 07:00 i 07:59:59 to jeszcze przed 08:00.
    // EN: 07:00 and 07:59:59 are still before 08:00.
    expect(statusAt(`${TUESDAY}T07:00:00+02:00`)).toBe('before');
    expect(statusAt(`${TUESDAY}T07:59:59+02:00`)).toBe('before');
  });

  it('w trakcie lekcji daje „during”, a początek lekcji jest włącznie', () => {
    // PL: 08:00 to już pierwsza lekcja, 08:10 też.
    // EN: 08:00 is already the first lesson, and so is 08:10.
    expect(statusAt(`${TUESDAY}T08:00:00+02:00`)).toBe('during');
    expect(statusAt(`${TUESDAY}T08:10:00+02:00`)).toBe('during');
  });

  it('w przerwie między lekcjami daje „during”', () => {
    // PL: Przerwa 08:45–08:55, o 08:50 licznik pokazuje przerwę.
    // EN: The break is 08:45–08:55, at 08:50 the countdown shows the break.
    expect(statusAt(`${TUESDAY}T08:50:00+02:00`)).toBe('during');
  });

  it('w czasie ostatniej lekcji daje „during”', () => {
    // PL: 09:30 to trwająca druga (ostatnia) lekcja 08:55–09:40.
    // EN: 09:30 is the second (last) lesson 08:55–09:40, still on.
    expect(statusAt(`${TUESDAY}T09:30:00+02:00`)).toBe('during');
  });

  it('od końca ostatniej lekcji (włącznie) daje „after”', () => {
    // PL: Koniec lekcji jest wyłączny, więc 09:40:00 to już po lekcjach, a 09:39:59 jeszcze w trakcie.
    // EN: The end of a lesson is exclusive, so 09:40:00 is already after lessons, and 09:39:59 still during.
    expect(statusAt(`${TUESDAY}T09:39:59+02:00`)).toBe('during');
    expect(statusAt(`${TUESDAY}T09:40:00+02:00`)).toBe('after');
  });

  it('późnym popołudniem w dzień roboczy daje „after”', () => {
    // PL: 17:00 w poniedziałek–piątek, po ostatniej lekcji.
    // EN: 17:00 on a working day, after the last lesson.
    expect(statusAt(`${TUESDAY}T17:00:00+02:00`)).toBe('after');
  });
});

describe('weekend', () => {
  it('sobota daje „day-off”, nawet w godzinach lekcji', () => {
    // PL: Sobota 08:10 to godzina lekcji w dzień roboczy, a mimo to to dzień wolny.
    // EN: Saturday 08:10 is a lesson hour on a working day, and it is still a day off.
    expect(statusAt(`${SATURDAY}T08:10:00+02:00`)).toBe('day-off');
  });

  it('niedziela daje „day-off”, nawet gdy plan jest wpisany', () => {
    // PL: Niedziela 08:10 w planie przykładowym to lekcja, ale dzień wolny wygrywa.
    // EN: Sunday 08:10 is a lesson in the example plan, but the day off wins.
    expect(statusAt(`${SUNDAY}T08:10:00+02:00`)).toBe('day-off');
  });

  it('weekend przy pustym planie też daje „day-off”, a nie „no-plan”', () => {
    // PL: Pusty plan w weekend: dzień wolny ma pierwszeństwo.
    // EN: An empty plan at the weekend: the day off comes first.
    plan.BELL_PLAN = [];
    expect(statusAt(`${SATURDAY}T10:00:00+02:00`)).toBe('day-off');
  });
});

describe('pusty plan', () => {
  it('w dzień roboczy bez wpisanego planu daje „no-plan” o każdej porze', () => {
    // PL: Przed, w trakcie i po godzinach: bez planu nic nie zgadujemy.
    // EN: Before, during and after the hours: without a plan we guess nothing.
    plan.BELL_PLAN = [];
    expect(statusAt(`${TUESDAY}T07:00:00+02:00`)).toBe('no-plan');
    expect(statusAt(`${TUESDAY}T08:10:00+02:00`)).toBe('no-plan');
    expect(statusAt(`${TUESDAY}T17:00:00+02:00`)).toBe('no-plan');
  });
});

describe('domyślna chwila', () => {
  it('bez podanej chwili używa zegara i daje stan z aktualnego czasu', () => {
    // PL: Udawany zegar na 07:00 we wtorek, bez argumentów funkcja używa „teraz”.
    // EN: The fake clock is set to 07:00 on Tuesday, with no arguments the function uses "now".
    vi.setSystemTime(new Date(`${TUESDAY}T07:00:00+02:00`));
    expect(bellDayStatus()).toBe('before');
  });
});
