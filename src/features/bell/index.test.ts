/**
 * PL: Test drzwi podtoru 6: funkcja currentBellState daje stan z planu szkoły dla danej chwili. Plan jest zastąpiony PRZYKŁADEM (nie prawdziwy plan szkoły), więc test działa też przy pustym BELL_PLAN.
 * EN: Test of the subtrack 6 door: currentBellState gives the state from the school plan for a given moment. The plan is replaced by an EXAMPLE (not the school's real plan), so the test works with an empty BELL_PLAN too.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/index.ts::currentBellState
 * @uses src/features/bell/index.ts::hasBellPlan
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest, sterowanie czasem i podmiana modułu planu.
// EN: Vitest test functions, clock control and the plan module stub.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { currentBellState, hasBellPlan } from './index';

// PL: Plan PRZYKŁADOWY trzymany w zmiennej, którą test może zmieniać (w main plan jest pusty).
// EN: The EXAMPLE plan held in a variable the test can change (the plan is empty in main).
const plan = vi.hoisted(() => ({
  BELL_PLAN: [] as { start: string; end: string }[],
}));
vi.mock('./bellPlan', () => plan);

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

describe('currentBellState', () => {
  it('w czasie lekcji daje lekcję z minutami i następną lekcją', () => {
    // PL: 23.10.2026 08:10 w Warszawie (czas letni, 06:10 UTC): pierwsza lekcja, następna lekcja 1 o 08:55.
    // EN: 23.10.2026 08:10 in Warsaw (summer time, 06:10 UTC): the first lesson, the next lesson 1 at 08:55.
    expect(currentBellState(new Date('2026-10-23T06:10:00Z'))).toEqual({
      kind: 'lesson',
      lessonNo: 0,
      minutesLeft: 35,
      next: { lessonNo: 1, start: '08:55' },
    });
  });

  it('w przerwie daje przerwę z lekcją, do której zostało', () => {
    // PL: 08:50 w Warszawie: przerwa, do lekcji 1 zostało 5 minut.
    // EN: 08:50 in Warsaw: a break, 5 minutes to lesson 1.
    expect(currentBellState(new Date('2026-10-23T06:50:00Z'))).toEqual({
      kind: 'break',
      minutesLeft: 5,
      next: { lessonNo: 1, start: '08:55' },
    });
  });

  it('po ostatniej lekcji i w weekend daje null', () => {
    // PL: 11:00 w Warszawie po ostatniej lekcji oraz sobota 24.10 o 09:10.
    // EN: 11:00 in Warsaw after the last lesson, and Saturday 24.10 at 09:10.
    expect(currentBellState(new Date('2026-10-23T09:00:00Z'))).toBeNull();
    expect(currentBellState(new Date('2026-10-24T07:10:00Z'))).toBeNull();
  });

  it('przy pustym planie daje null', () => {
    // PL: Ten sam czas co w czasie lekcji, ale planu nie ma: null (licznika nie pokazujemy).
    // EN: The same time as during a lesson, but there is no plan: null (no countdown shown).
    plan.BELL_PLAN = [];
    expect(currentBellState(new Date('2026-10-23T06:10:00Z'))).toBeNull();
  });
});

describe('hasBellPlan', () => {
  it('przy pustym planie daje false', () => {
    // PL: Plan pusty: nie ma żadnej lekcji, więc false.
    // EN: The plan is empty: there is no lesson, so false.
    plan.BELL_PLAN = [];
    expect(hasBellPlan()).toBe(false);
  });

  it('z lekcją w planie daje true', () => {
    // PL: Przykładowy plan ma lekcje, więc true.
    // EN: The example plan has lessons, so true.
    expect(hasBellPlan()).toBe(true);
  });
});
