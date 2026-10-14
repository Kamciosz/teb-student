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

// PL: Plany PRZYKŁADOWE trzymane w zmiennej, którą test może zmieniać (w main oba są puste).
// EN: EXAMPLE plans held in a variable the test can change (both are empty in main).
const plan = vi.hoisted(() => ({
  BELL_PLAN: [] as { start: string; end: string }[],
  SHORTENED_BELL_PLAN: [] as { start: string; end: string }[],
}));
vi.mock('./bellPlan', () => plan);

beforeEach(() => {
  // PL: Sterowany zegar i przykładowe plany przed każdym testem.
  // EN: A controlled clock and the example plans before each test.
  vi.useFakeTimers();
  plan.BELL_PLAN = [
    { start: '08:00', end: '08:45' },
    { start: '08:55', end: '09:40' },
  ];
  // PL: Plan skrócony: jedna krótka lekcja, żeby było widać, który plan wybrano.
  // EN: The shortened plan: one short lesson, so it is clear which plan was chosen.
  plan.SHORTENED_BELL_PLAN = [{ start: '08:00', end: '08:30' }];
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

  it('w dniu skróconym bierze plan skrócony', () => {
    // PL: 23.10.2026 08:10 w Warszawie, dzień 23.10 jest na liście skróconych: plan skrócony kończy się o 08:30, więc zostaje 20 minut i nie ma następnej lekcji.
    // EN: 23.10.2026 08:10 in Warsaw, and 23.10 is on the shortened list: the shortened plan ends at 08:30, so 20 minutes are left and there is no next lesson.
    expect(currentBellState(new Date('2026-10-23T06:10:00Z'), new Set(['2026-10-23']))).toEqual({
      kind: 'lesson',
      lessonNo: 0,
      minutesLeft: 20,
      next: null,
    });
  });

  it('w dniu nieskróconym bierze plan zwykły, nawet gdy inny dzień jest skrócony', () => {
    // PL: 23.10.2026 08:10 w Warszawie, a na liście skróconych jest tylko 24.10: zwykły plan, 35 minut i następna lekcja.
    // EN: 23.10.2026 08:10 in Warsaw, and only 24.10 is on the shortened list: the regular plan, 35 minutes and the next lesson.
    expect(currentBellState(new Date('2026-10-23T06:10:00Z'), new Set(['2026-10-24']))).toEqual({
      kind: 'lesson',
      lessonNo: 0,
      minutesLeft: 35,
      next: { lessonNo: 1, start: '08:55' },
    });
  });

  it('dzień skrócony liczy się według czasu polskiego, nie UTC', () => {
    // PL: 25.10.2026 23:30 UTC to już 26.10 00:30 w Warszawie. Dzień 25.10 na liście nie zmienia planu tej chwili, a 26.10 już tak. Plan skrócony ma lekcję od 00:00, żeby to było widać.
    // EN: 25.10.2026 23:30 UTC is already 26.10 00:30 in Warsaw. The day 25.10 on the list does not change the plan at this moment, but 26.10 does. The shortened plan has a lesson from 00:00 so this shows.
    plan.SHORTENED_BELL_PLAN = [{ start: '00:00', end: '01:00' }];
    const moment = new Date('2026-10-25T23:30:00Z');
    expect(currentBellState(moment, new Set(['2026-10-25']))).toBeNull();
    expect(currentBellState(moment, new Set(['2026-10-26']))).toEqual({
      kind: 'lesson',
      lessonNo: 0,
      minutesLeft: 30,
      next: null,
    });
  });
});

describe('hasBellPlan', () => {
  it('przy pustym planie daje false', () => {
    // PL: Plan zwykły pusty, dzień nieskrócony: nie ma żadnej lekcji, więc false.
    // EN: The regular plan is empty, the day is not shortened: there is no lesson, so false.
    plan.BELL_PLAN = [];
    expect(hasBellPlan(new Date('2026-10-23T06:10:00Z'))).toBe(false);
  });

  it('z lekcją w planie daje true', () => {
    // PL: Domyślny przykładowy plan ma lekcje, więc true.
    // EN: The default example plan has lessons, so true.
    expect(hasBellPlan(new Date('2026-10-23T06:10:00Z'))).toBe(true);
  });

  it('w dniu skróconym z pustym planem skróconym daje false', () => {
    // PL: Zwykły plan ma lekcje, ale dzień 23.10 jest skrócony, a plan skrócony jest pusty: false, bo to ten plan obowiązuje.
    // EN: The regular plan has lessons, but 23.10 is shortened and the shortened plan is empty: false, because that plan applies.
    plan.SHORTENED_BELL_PLAN = [];
    expect(hasBellPlan(new Date('2026-10-23T06:10:00Z'), new Set(['2026-10-23']))).toBe(false);
  });

  it('w dniu nieskróconym nie patrzy na pusty plan skrócony', () => {
    // PL: Plan skrócony pusty, ale dzień 23.10 nie jest skrócony: plan zwykły ma lekcje, więc true.
    // EN: The shortened plan is empty, but 23.10 is not shortened: the regular plan has lessons, so true.
    plan.SHORTENED_BELL_PLAN = [];
    expect(hasBellPlan(new Date('2026-10-23T06:10:00Z'), new Set(['2026-10-24']))).toBe(true);
  });
});
