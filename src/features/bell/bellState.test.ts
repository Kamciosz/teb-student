/**
 * PL: Testy logiki licznika do dzwonka: lekcja, przerwa, przed pierwszą, po ostatniej, weekend, zmiana czasu letniego i zimowego (Europe/Warsaw) oraz sanity prawdziwego planu. Plan PRZYKŁADOWY w tym pliku nie jest planem szkoły.
 * EN: Tests of the bell countdown logic: lesson, break, before the first, after the last, weekend, summer and winter time change (Europe/Warsaw) and a sanity check of the real plan. The EXAMPLE plan in this file is not the school's plan.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/bellState.ts::bellStateAt
 * @uses src/features/bell/bellPlan.ts::BELL_PLAN
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Logika licznika, zegar strefy szkoły i prawdziwy plan (pusty w main).
// EN: The countdown logic, the school zone clock and the real plan (empty in main).
import { bellStateAt, getBellState, warsawClock } from './bellState';
import { BELL_PLAN, type Lesson } from './bellPlan';

// PL: PRZYKŁAD planu do testów (nie prawdziwy plan szkoły). Prawdziwy plan wpisze Kacper w bellPlan.ts.
// EN: EXAMPLE plan for the tests (not the school's real plan). Kacper enters the real plan in bellPlan.ts.
const EXAMPLE_PLAN: readonly Lesson[] = [
  { start: '08:00', end: '08:45' },
  { start: '08:55', end: '09:40' },
  { start: '09:50', end: '10:35' },
];

// PL: Zegar dla danego dnia tygodnia (1 = poniedziałek) i godziny:minuty:sekundy.
// EN: A clock for a given day of week (1 = Monday) and hour:minute:second.
function clock(weekday: number, hour: number, minute: number, second = 0) {
  return { weekday, secondsOfDay: hour * 3600 + minute * 60 + second };
}

describe('pusty plan (BELL_PLAN w main)', () => {
  it('nigdy nie pokazuje licznika w żadnej minucie tygodnia', () => {
    // PL: Przejście co minutę przez cały tydzień (7 dni x 1440 minut).
    // EN: Walk every minute of the week (7 days x 1440 minutes).
    for (let weekday = 1; weekday <= 7; weekday += 1) {
      for (let minute = 0; minute < 1440; minute += 1) {
        expect(bellStateAt(BELL_PLAN, clock(weekday, Math.floor(minute / 60), minute % 60))).toBeNull();
      }
    }
  });
});

describe('plan przykładowy (PRZYKŁAD)', () => {
  it('w czasie lekcji liczy minuty do końca lekcji, a numer lekcji od 1', () => {
    // PL: 09:10 to druga lekcja (08:55–09:40): zostało 30 minut.
    // EN: 09:10 is the second lesson (08:55–09:40): 30 minutes left.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 9, 10))).toEqual({ kind: 'lesson', lessonNo: 2, minutesLeft: 30 });
  });

  it('początek lekcji jest włącznie', () => {
    // PL: 08:00:00 to już pierwsza lekcja, pełne 45 minut.
    // EN: 08:00:00 is already the first lesson, a full 45 minutes.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 8, 0))).toEqual({ kind: 'lesson', lessonNo: 1, minutesLeft: 45 });
  });

  it('zaokrągla minuty w górę: 14 min 30 s pokazuje się jako 15', () => {
    // PL: 08:30:30 do końca lekcji o 08:45 zostaje 14 min 30 s, pokazujemy 15.
    // EN: At 08:30:30 with the lesson ending at 08:45, 14 min 30 s remain; we show 15.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 8, 30, 30))).toEqual({ kind: 'lesson', lessonNo: 1, minutesLeft: 15 });
  });

  it('w przerwie liczy minuty do początku następnej lekcji', () => {
    // PL: 08:50 to przerwa między pierwszą a drugą lekcją: do 08:55 zostało 5 minut.
    // EN: 08:50 is the break between the first and second lesson: 5 minutes to 08:55.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 8, 50))).toEqual({ kind: 'break', minutesLeft: 5 });
  });

  it('koniec lekcji to już przerwa (koniec jest wyłączony)', () => {
    // PL: 08:45:00 kończy pierwszą lekcję: od tej chwili to przerwa, do 08:55 zostaje 10 minut.
    // EN: 08:45:00 ends the first lesson: from this moment it is a break, 10 minutes to 08:55.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 8, 45))).toEqual({ kind: 'break', minutesLeft: 10 });
  });

  it('przed pierwszą lekcją nic nie pokazuje', () => {
    // PL: 07:59:59 jest przed pierwszą lekcją: licznika nie ma.
    // EN: 07:59:59 is before the first lesson: no countdown.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 7, 59, 59))).toBeNull();
  });

  it('po ostatniej lekcji nic nie pokazuje', () => {
    // PL: 10:35:00 kończy ostatnią lekcję, a po niej nie ma następnej przerwy.
    // EN: 10:35:00 ends the last lesson, and no break follows it.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 10, 35))).toBeNull();
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 11, 0))).toBeNull();
  });

  it('w weekend nic nie pokazuje, nawet w godzinach lekcji', () => {
    // PL: Sobota (6) i niedziela (7) o 09:10, czyli w porze drugiej lekcji.
    // EN: Saturday (6) and Sunday (7) at 09:10, the time of the second lesson.
    expect(bellStateAt(EXAMPLE_PLAN, clock(6, 9, 10))).toBeNull();
    expect(bellStateAt(EXAMPLE_PLAN, clock(7, 9, 10))).toBeNull();
  });
});

describe('strefa czasu Europe/Warsaw', () => {
  it('czas zimowy i letni daje tę samą godzinę lekcyjną (23.10 CEST, 26.10 CET)', () => {
    // PL: 23.10.2026 08:10 w Warszawie to 06:10 UTC (czas letni); 26.10.2026 08:10 to 07:10 UTC (czas zimowy). Oba muszą dać ten sam stan.
    // EN: 23.10.2026 08:10 in Warsaw is 06:10 UTC (summer time); 26.10.2026 08:10 is 07:10 UTC (winter time). Both must give the same state.
    expect(getBellState(EXAMPLE_PLAN, new Date('2026-10-23T06:10:00Z'))).toEqual({ kind: 'lesson', lessonNo: 1, minutesLeft: 35 });
    expect(getBellState(EXAMPLE_PLAN, new Date('2026-10-26T07:10:00Z'))).toEqual({ kind: 'lesson', lessonNo: 1, minutesLeft: 35 });
  });

  it('czas letni i zimowy wiosną: 27.03 CET, 30.03 CEST', () => {
    // PL: 27.03.2026 08:10 w Warszawie to 07:10 UTC (czas zimowy); 30.03.2026 08:10 to 06:10 UTC (czas letni).
    // EN: 27.03.2026 08:10 in Warsaw is 07:10 UTC (winter time); 30.03.2026 08:10 is 06:10 UTC (summer time).
    expect(getBellState(EXAMPLE_PLAN, new Date('2026-03-27T07:10:00Z'))).toEqual({ kind: 'lesson', lessonNo: 1, minutesLeft: 35 });
    expect(getBellState(EXAMPLE_PLAN, new Date('2026-03-30T06:10:00Z'))).toEqual({ kind: 'lesson', lessonNo: 1, minutesLeft: 35 });
  });

  it('zegar liczy dzień tygodnia i godzinę w Warszawie, nie w strefie komputera', () => {
    // PL: Niedziela 2026-10-25 o 23:30 UTC to już poniedziałek 26.10 00:30 w Warszawie (czas zimowy).
    // EN: Sunday 2026-10-25 at 23:30 UTC is already Monday 26.10 01:30 in Warsaw (winter time).
    expect(warsawClock(new Date('2026-10-25T23:30:00Z'))).toEqual({ weekday: 1, secondsOfDay: 30 * 60 });
  });
});

describe('sanity prawdziwego planu (BELL_PLAN)', () => {
  it('każda godzina ma format HH:MM, początek jest przed końcem, lekcje nie nakładają się', () => {
    // PL: Ten test łapie literówki Kacpra, zanim trafią do licznika. Dla pustego planu przechodzi.
    // EN: This test catches Kacper's typos before they reach the countdown. It passes for an empty plan.
    const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
    const toMinutes = (time: string) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };
    for (const [index, lesson] of BELL_PLAN.entries()) {
      expect(lesson.start, `lekcja ${index + 1}`).toMatch(hhmm);
      expect(lesson.end, `lekcja ${index + 1}`).toMatch(hhmm);
      expect(toMinutes(lesson.start), `lekcja ${index + 1}: początek przed końcem`).toBeLessThan(toMinutes(lesson.end));
      if (index > 0) {
        expect(toMinutes(lesson.start), `lekcja ${index + 1}: nie nakłada się na poprzednią`).toBeGreaterThanOrEqual(toMinutes(BELL_PLAN[index - 1].end));
      }
    }
  });
});
