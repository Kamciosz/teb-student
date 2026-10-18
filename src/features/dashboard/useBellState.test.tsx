/**
 * PL: Testy odświeżania górnego rzędu pulpitu z udawanym czasem: przejście przez północ (piątek na sobotę) zmienia napis dnia, a początek pierwszej lekcji zmienia pusty licznik na minuty. Bez przeładowania strony, na tym samym uruchomionym odświeżaniu.
 * EN: Tests of the dashboard top row refresh with faked time: crossing midnight (Friday to Saturday) changes the day text, and the start of the first lesson changes the empty countdown into minutes. No page reload, on the same running refresh.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/dashboard/useBellState.ts::readBellSnapshot
 * @uses src/features/dashboard/bellTicker.ts::startBellTicker
 * @uses src/features/dashboard/bellTicker.ts::BELL_REFRESH_MS
 * @uses src/features/dashboard/DashboardHero.tsx::BellReadout
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest i podstawianie modułu bell.
// EN: Vitest test functions and substitution of the bell module.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Renderowanie na tekst, bo testy działają bez DOM.
// EN: Rendering to text, because the tests run without the DOM.
import { renderToString } from 'react-dom/server';
// PL: Odczyt pulpitu, odświeżanie i rysowanie licznika (testowane).
// EN: The dashboard reading, the refresh and the countdown drawing (tested).
import { readBellSnapshot, type BellSnapshot } from './useBellState';
import { BELL_REFRESH_MS, startBellTicker, type VisibilityTarget } from './bellTicker';
import { BellReadout } from './DashboardHero';
// PL: Odczyty modułu bell do podstawienia.
// EN: The bell module reads to substitute.
import { bellDayStatus, currentBellState, type BellDayStatus, type BellState } from '../bell';

// PL: Podstawiamy tylko odczyty, bo plan w main jest pusty. Plan testowy: w dni szkolne (pon.–pt.) pierwsza lekcja trwa od 8:00 do 8:45, w weekend nie ma lekcji.
// EN: We substitute only the reads, because the plan in main is empty. The test plan: on school days (Mon.–Fri.) the first lesson runs from 8:00 to 8:45, there are no lessons at weekends.
vi.mock('../bell', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../bell')>()),
  currentBellState: vi.fn(),
  bellDayStatus: vi.fn(),
}));

// PL: Początek i koniec pierwszej lekcji w minutach od północy.
// EN: The start and the end of the first lesson, in minutes from midnight.
const FIRST_LESSON_START = 8 * 60;
const FIRST_LESSON_END = 8 * 60 + 45;

/**
 * PL: Czy to dzień szkolny (poniedziałek–piątek).
 * EN: Whether it is a school day (Monday to Friday).
 *
 * @param now - PL: chwila. EN: the moment.
 * @returns PL: prawda dla pon.–pt. EN: true for Mon. to Fri.
 */
function isSchoolDay(now: Date): boolean {
  return now.getDay() >= 1 && now.getDay() <= 5;
}

/**
 * PL: Stan dnia dla chwili według planu testowego.
 * EN: The day state for the moment according to the test plan.
 *
 * @param now - PL: chwila. EN: the moment.
 * @returns PL: stan dnia. EN: the day state.
 */
function dayStatusAt(now: Date): BellDayStatus {
  if (!isSchoolDay(now)) return 'day-off';
  const minute = now.getHours() * 60 + now.getMinutes();
  if (minute < FIRST_LESSON_START) return 'before';
  if (minute < FIRST_LESSON_END) return 'during';
  return 'after';
}

/**
 * PL: Stan licznika dla chwili według planu testowego: w trakcie lekcji minuty do jej końca, poza nią brak.
 * EN: The countdown state for the moment according to the test plan: during the lesson the minutes to its end, otherwise none.
 *
 * @param now - PL: chwila. EN: the moment.
 * @returns PL: stan licznika albo null. EN: the countdown state or null.
 */
function stateAt(now: Date): BellState | null {
  if (dayStatusAt(now) !== 'during') return null;
  const minute = now.getHours() * 60 + now.getMinutes();
  return { kind: 'lesson', lessonNo: 1, minutesLeft: FIRST_LESSON_END - minute, next: null };
}

/**
 * PL: Uruchamia odświeżanie tak jak hook (odczyt pulpitu, widoczna karta) i zbiera każdy odczyt. Zwraca zbiór odczytów i funkcję zatrzymania.
 * EN: Starts the refresh as the hook does (dashboard reading, visible tab) and collects every reading. Returns the readings and the stop function.
 *
 * @returns PL: odczyty i funkcja zatrzymania. EN: the readings and the stop function.
 */
function startRefresh(): { readings: BellSnapshot[]; stop: () => void } {
  const page: VisibilityTarget = {
    visibilityState: 'visible',
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  const readings: BellSnapshot[] = [];
  const stop = startBellTicker({ read: readBellSnapshot, onChange: (snapshot) => readings.push(snapshot), page });
  return { readings, stop };
}

/**
 * PL: Rysuje licznik z odczytu na tekst, tak jak pulpit.
 * EN: Draws the countdown from a reading to text, as the dashboard does.
 *
 * @param snapshot - PL: odczyt pulpitu. EN: the dashboard reading.
 * @returns PL: HTML licznika. EN: the HTML of the countdown.
 */
function readoutHtml(snapshot: BellSnapshot): string {
  return renderToString(<BellReadout state={snapshot.state} day={snapshot.day} />);
}

describe('odświeżanie górnego rzędu pulpitu / dashboard top row refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(currentBellState).mockImplementation(() => stateAt(new Date()));
    vi.mocked(bellDayStatus).mockImplementation(() => dayStatusAt(new Date()));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(currentBellState).mockReset();
    vi.mocked(bellDayStatus).mockReset();
  });

  it('przejście przez północ zmienia napis dnia z „Po lekcjach” na „Dziś nie ma lekcji” / crossing midnight changes "Po lekcjach" to "Dziś nie ma lekcji"', () => {
    // PL: Piątek 23:59:30, po lekcjach, licznik pusty.
    // EN: Friday 23:59:30, after the lessons, the countdown empty.
    vi.setSystemTime(new Date(2026, 9, 16, 23, 59, 30));
    const { readings, stop } = startRefresh();
    expect(readings[0].state).toBeNull();
    expect(readoutHtml(readings[0])).toContain('Po lekcjach');

    // PL: Jeden takt zegara: sobota 00:00:00. Licznik nadal pusty, więc bez nowego obiektu React nie narysowałby napisu dnia.
    // EN: One clock tick: Saturday 00:00:00. The countdown is still empty, so without a new object React would not draw the day text.
    vi.advanceTimersByTime(BELL_REFRESH_MS);
    expect(readings).toHaveLength(2);
    expect(readings[1]).not.toBe(readings[0]);
    expect(readings[1].state).toBeNull();
    expect(readoutHtml(readings[1])).toContain('Dziś nie ma lekcji');
    expect(readoutHtml(readings[1])).not.toContain('Po lekcjach');
    stop();
  });

  it('początek pierwszej lekcji zmienia napis „Lekcje jeszcze się nie zaczęły” na licznik / the start of the first lesson changes "Lekcje jeszcze się nie zaczęły" to the countdown', () => {
    // PL: Poniedziałek 07:59:30, przed lekcjami, licznik pusty.
    // EN: Monday 07:59:30, before the lessons, the countdown empty.
    vi.setSystemTime(new Date(2026, 9, 12, 7, 59, 30));
    const { readings, stop } = startRefresh();
    expect(readings[0].state).toBeNull();
    expect(readoutHtml(readings[0])).toContain('Lekcje jeszcze się nie zaczęły');
    expect(readoutHtml(readings[0])).not.toContain('>min<');

    // PL: Takt zegara o 8:00:00: lekcja się zaczyna, licznik pokazuje minuty.
    // EN: The clock tick at 8:00:00: the lesson starts, the countdown shows minutes.
    vi.advanceTimersByTime(BELL_REFRESH_MS);
    expect(readings).toHaveLength(2);
    expect(readings[1]).not.toBe(readings[0]);
    expect(readings[1].state).not.toBeNull();
    expect(readoutHtml(readings[1])).toContain('>45<');
    expect(readoutHtml(readings[1])).toContain('>min<');
    expect(readoutHtml(readings[1])).toContain('do dzwonka');
    expect(readoutHtml(readings[1])).not.toContain('Lekcje jeszcze się nie zaczęły');
    stop();
  });
});
