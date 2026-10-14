/**
 * PL: Testy logiki licznika do dzwonka: lekcja, przerwa, przed pierwszą, po ostatniej, weekend, zmiana czasu letniego i zimowego (Europe/Warsaw), prawdziwy plan szkoły i sanity jego wpisów. Numery lekcji są od 0. Plan PRZYKŁADOWY w tym pliku nie jest planem szkoły.
 * EN: Tests of the bell countdown logic: lesson, break, before the first, after the last, weekend, summer and winter time change (Europe/Warsaw), the real school plan and a sanity check of its entries. Lesson numbers start from 0. The EXAMPLE plan in this file is not the school's plan.
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
// PL: Logika licznika, zegar strefy szkoły i prawdziwy plan.
// EN: The countdown logic, the school zone clock and the real plan.
import { bellStateAt, getBellState, warsawClock } from './bellState';
import { BELL_PLAN, type Lesson } from './bellPlan';

// PL: PRZYKŁAD planu do testów (nie prawdziwy plan szkoły). Lekcje numerowane od 0.
// EN: EXAMPLE plan for the tests (not the school's real plan). Lessons numbered from 0.
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

describe('prawdziwy plan szkoły (BELL_PLAN)', () => {
  it('plan ma 13 lekcji, numerowanych od 0 do 12', () => {
    // PL: Liczba lekcji z planu szkoły. Gdy ktoś usunie wpis, test to złapie.
    // EN: The number of lessons in the school plan. If someone removes an entry, this test catches it.
    expect(BELL_PLAN).toHaveLength(13);
  });

  it('przed pierwszą lekcją (07:09:59) nic nie pokazuje', () => {
    // PL: Pierwsza lekcja zaczyna się o 07:10, więc o 07:09:59 licznika nie ma.
    // EN: The first lesson starts at 07:10, so at 07:09:59 there is no countdown.
    expect(bellStateAt(BELL_PLAN, clock(3, 7, 9, 59))).toBeNull();
  });

  it('lekcja 0 trwa od 07:10 i o 07:30 zostaje 25 minut, następna jest lekcja 1 o 08:00', () => {
    // PL: 07:30 w środę to lekcja 0 (07:10–07:55): do końca 25 minut.
    // EN: 07:30 on a Wednesday is lesson 0 (07:10–07:55): 25 minutes to the end.
    expect(bellStateAt(BELL_PLAN, clock(3, 7, 30))).toEqual({ kind: 'lesson', lessonNo: 0, minutesLeft: 25, next: { lessonNo: 1, start: '08:00' } });
  });

  it('o 07:55 lekcja 0 się kończy i zaczyna się przerwa do lekcji 1', () => {
    // PL: Koniec jest wyłączony: o 07:55 to już przerwa, do 08:00 zostało 5 minut.
    // EN: The end is exclusive: at 07:55 it is already a break, 5 minutes to 08:00.
    expect(bellStateAt(BELL_PLAN, clock(3, 7, 55))).toEqual({ kind: 'break', minutesLeft: 5, next: { lessonNo: 1, start: '08:00' } });
  });

  it('przerwa przed lekcją 1 o 07:57 pokazuje 3 minuty do 08:00', () => {
    // PL: 07:57 to przerwa między lekcją 0 a lekcją 1: do 08:00 zostały 3 minuty.
    // EN: 07:57 is the break between lesson 0 and lesson 1: 3 minutes to 08:00.
    expect(bellStateAt(BELL_PLAN, clock(3, 7, 57))).toEqual({ kind: 'break', minutesLeft: 3, next: { lessonNo: 1, start: '08:00' } });
  });

  it('w środku dnia lekcja 6 o 12:40 ma 40 minut, następna jest lekcja 7 o 13:25', () => {
    // PL: Lekcja 6 trwa 12:35–13:20: o 12:40 zostaje 40 minut.
    // EN: Lesson 6 runs 12:35–13:20: at 12:40, 40 minutes are left.
    expect(bellStateAt(BELL_PLAN, clock(3, 12, 40))).toEqual({ kind: 'lesson', lessonNo: 6, minutesLeft: 40, next: { lessonNo: 7, start: '13:25' } });
  });

  it('ostatnia lekcja 12 o 18:00 ma 20 minut i nie ma następnej', () => {
    // PL: Lekcja 12 trwa 17:35–18:20: o 18:00 zostaje 20 minut, a po niej nie ma lekcji, więc next to null.
    // EN: Lesson 12 runs 17:35–18:20: at 18:00, 20 minutes are left, and no lesson follows, so next is null.
    expect(bellStateAt(BELL_PLAN, clock(3, 18, 0))).toEqual({ kind: 'lesson', lessonNo: 12, minutesLeft: 20, next: null });
  });

  it('po lekcjach o 18:30 nic nie pokazuje', () => {
    // PL: Ostatnia lekcja kończy się o 18:20, o 18:30 licznika nie ma.
    // EN: The last lesson ends at 18:20, at 18:30 there is no countdown.
    expect(bellStateAt(BELL_PLAN, clock(3, 18, 30))).toBeNull();
  });

  it('w sobotę o 09:00 nic nie pokazuje, choć to pora lekcji', () => {
    // PL: W sobotę nie ma lekcji, więc licznika nie ma, nawet o 09:00.
    // EN: There are no lessons on Saturday, so there is no countdown, even at 09:00.
    expect(bellStateAt(BELL_PLAN, clock(6, 9, 0))).toBeNull();
  });

  it('14.10.2026 o 07:30 w Warszawie (czas letni, 05:30 UTC) to lekcja 0', () => {
    // PL: Chwila w czasie, a nie zegar: 05:30 UTC to 07:30 w Warszawie.
    // EN: A moment in time, not a clock: 05:30 UTC is 07:30 in Warsaw.
    expect(getBellState(BELL_PLAN, new Date('2026-10-14T05:30:00Z'))).toEqual({ kind: 'lesson', lessonNo: 0, minutesLeft: 25, next: { lessonNo: 1, start: '08:00' } });
  });
});

describe('plan przykładowy (PRZYKŁAD)', () => {
  it('w czasie lekcji liczy minuty do końca lekcji, a numer lekcji od 0', () => {
    // PL: 09:10 to lekcja 1 (08:55–09:40): zostało 30 minut.
    // EN: 09:10 is lesson 1 (08:55–09:40): 30 minutes left.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 9, 10))).toEqual({ kind: 'lesson', lessonNo: 1, minutesLeft: 30, next: { lessonNo: 2, start: '09:50' } });
  });

  it('początek lekcji jest włącznie', () => {
    // PL: 08:00:00 to już lekcja 0, pełne 45 minut.
    // EN: 08:00:00 is already lesson 0, a full 45 minutes.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 8, 0))).toEqual({ kind: 'lesson', lessonNo: 0, minutesLeft: 45, next: { lessonNo: 1, start: '08:55' } });
  });

  it('zaokrągla minuty w górę: 14 min 30 s pokazuje się jako 15', () => {
    // PL: 08:30:30 do końca lekcji o 08:45 zostaje 14 min 30 s, pokazujemy 15.
    // EN: At 08:30:30 with the lesson ending at 08:45, 14 min 30 s remain; we show 15.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 8, 30, 30))).toEqual({ kind: 'lesson', lessonNo: 0, minutesLeft: 15, next: { lessonNo: 1, start: '08:55' } });
  });

  it('w przerwie liczy minuty do początku następnej lekcji', () => {
    // PL: 08:50 to przerwa między lekcją 0 a lekcją 1: do 08:55 zostało 5 minut.
    // EN: 08:50 is the break between lesson 0 and lesson 1: 5 minutes to 08:55.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 8, 50))).toEqual({ kind: 'break', minutesLeft: 5, next: { lessonNo: 1, start: '08:55' } });
  });

  it('w przerwie wskazuje lekcję, do której zostało', () => {
    // PL: 09:45 to przerwa przed lekcją 2 (09:50): zostało 5 minut, a następna jest lekcja 2.
    // EN: 09:45 is the break before lesson 2 (09:50): 5 minutes left, and the next one is lesson 2.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 9, 45))).toEqual({ kind: 'break', minutesLeft: 5, next: { lessonNo: 2, start: '09:50' } });
  });

  it('w ostatniej lekcji dnia nie ma następnej lekcji', () => {
    // PL: 10:00 to lekcja 2, ostatnia z przykładu (09:50–10:35): następnej nie ma, więc next to null.
    // EN: 10:00 is lesson 2, the last of the example (09:50–10:35): there is no next one, so next is null.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 10, 0))).toEqual({ kind: 'lesson', lessonNo: 2, minutesLeft: 35, next: null });
  });

  it('koniec lekcji to już przerwa (koniec jest wyłączony)', () => {
    // PL: 08:45:00 kończy lekcję 0: od tej chwili to przerwa, do 08:55 zostaje 10 minut.
    // EN: 08:45:00 ends lesson 0: from this moment it is a break, 10 minutes to 08:55.
    expect(bellStateAt(EXAMPLE_PLAN, clock(1, 8, 45))).toEqual({ kind: 'break', minutesLeft: 10, next: { lessonNo: 1, start: '08:55' } });
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
    // PL: Sobota (6) i niedziela (7) o 09:10, czyli w porze lekcji 1.
    // EN: Saturday (6) and Sunday (7) at 09:10, the time of lesson 1.
    expect(bellStateAt(EXAMPLE_PLAN, clock(6, 9, 10))).toBeNull();
    expect(bellStateAt(EXAMPLE_PLAN, clock(7, 9, 10))).toBeNull();
  });
});

describe('strefa czasu Europe/Warsaw', () => {
  it('czas zimowy i letni daje tę samą godzinę lekcyjną (23.10 CEST, 26.10 CET)', () => {
    // PL: 23.10.2026 08:10 w Warszawie to 06:10 UTC (czas letni); 26.10.2026 08:10 to 07:10 UTC (czas zimowy). Oba muszą dać ten sam stan.
    // EN: 23.10.2026 08:10 in Warsaw is 06:10 UTC (summer time); 26.10.2026 08:10 is 07:10 UTC (winter time). Both must give the same state.
    expect(getBellState(EXAMPLE_PLAN, new Date('2026-10-23T06:10:00Z'))).toEqual({ kind: 'lesson', lessonNo: 0, minutesLeft: 35, next: { lessonNo: 1, start: '08:55' } });
    expect(getBellState(EXAMPLE_PLAN, new Date('2026-10-26T07:10:00Z'))).toEqual({ kind: 'lesson', lessonNo: 0, minutesLeft: 35, next: { lessonNo: 1, start: '08:55' } });
  });

  it('czas letni i zimowy wiosną: 27.03 CET, 30.03 CEST', () => {
    // PL: 27.03.2026 08:10 w Warszawie to 07:10 UTC (czas zimowy); 30.03.2026 08:10 to 06:10 UTC (czas letni).
    // EN: 27.03.2026 08:10 in Warsaw is 07:10 UTC (winter time); 30.03.2026 08:10 is 06:10 UTC (summer time).
    expect(getBellState(EXAMPLE_PLAN, new Date('2026-03-27T07:10:00Z'))).toEqual({ kind: 'lesson', lessonNo: 0, minutesLeft: 35, next: { lessonNo: 1, start: '08:55' } });
    expect(getBellState(EXAMPLE_PLAN, new Date('2026-03-30T06:10:00Z'))).toEqual({ kind: 'lesson', lessonNo: 0, minutesLeft: 35, next: { lessonNo: 1, start: '08:55' } });
  });

  it('zegar liczy dzień tygodnia i godzinę w Warszawie, nie w strefie komputera', () => {
    // PL: Niedziela 2026-10-25 o 23:30 UTC to już poniedziałek 26.10 00:30 w Warszawie (czas zimowy).
    // EN: Sunday 2026-10-25 at 23:30 UTC is already Monday 26.10 01:30 in Warsaw (winter time).
    expect(warsawClock(new Date('2026-10-25T23:30:00Z'))).toEqual({ weekday: 1, secondsOfDay: 30 * 60 });
  });
});

describe('sanity wpisów planu (BELL_PLAN)', () => {
  it('każda godzina ma format HH:MM, początek jest przed końcem, lekcje nie nakładają się', () => {
    // PL: Ten test łapie literówki przy wpisywaniu planu, zanim trafią do licznika.
    // EN: This test catches typos made while entering the plan, before they reach the countdown.
    const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
    const toMinutes = (time: string) => {
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute;
    };
    for (const [index, lesson] of BELL_PLAN.entries()) {
      expect(lesson.start, `lekcja ${index}`).toMatch(hhmm);
      expect(lesson.end, `lekcja ${index}`).toMatch(hhmm);
      expect(toMinutes(lesson.start), `lekcja ${index}: początek przed końcem`).toBeLessThan(toMinutes(lesson.end));
      if (index > 0) {
        expect(toMinutes(lesson.start), `lekcja ${index}: nie nakłada się na poprzednią`).toBeGreaterThanOrEqual(toMinutes(BELL_PLAN[index - 1].end));
      }
    }
  });
});
