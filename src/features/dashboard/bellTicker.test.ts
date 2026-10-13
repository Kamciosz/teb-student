/**
 * PL: Testy odświeżania licznika: co 30 sekund, pauza przy ukrytej karcie, natychmiastowy odczyt po powrocie i zatrzymanie. Czas udawany (vi.useFakeTimers), strona podstawiona.
 * EN: Tests of the countdown refresh: every 30 seconds, a pause while the tab is hidden, an immediate read on return, and stopping. Time is faked (vi.useFakeTimers), the page is substituted.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/dashboard/bellTicker.ts::startBellTicker
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Testowany moduł i jego stałą odświeżania.
// EN: The tested module and its refresh constant.
import { BELL_REFRESH_MS, startBellTicker, type VisibilityTarget } from './bellTicker';
// PL: Stan licznika do podstawienia.
// EN: The countdown state to substitute.
import type { BellState } from '../bell';

// PL: Przykładowy stan: trwa lekcja, zostało 12 minut.
// EN: A sample state: a lesson is on, 12 minutes left.
const LESSON: BellState = { kind: 'lesson', lessonNo: 2, minutesLeft: 12, next: null };

/**
 * PL: Podstawia stronę z zmienną widocznością i zdarzeniem jej zmiany.
 * EN: Substitutes a page with a changeable visibility and its change event.
 *
 * @param visibilityState - PL: stan początkowy. EN: the starting state.
 * @returns PL: strona, funkcja zmiany widoczności i liczba zarejestrowanych słuchaczy. EN: the page, a function that changes the visibility, and the number of registered listeners.
 */
function fakePage(visibilityState: DocumentVisibilityState) {
  // PL: Zbiór słuchaczy, żeby test mógł sprawdzić, że zostali usunięci.
  // EN: The set of listeners, so the test can check they were removed.
  const listeners = new Set<() => void>();
  const page: VisibilityTarget = {
    visibilityState,
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
  };
  // PL: Zmiana widoczności zapisuje nowy stan i woła słuchaczy, jak przeglądarka.
  // EN: A visibility change saves the new state and calls the listeners, as the browser does.
  const change = (next: DocumentVisibilityState) => {
    page.visibilityState = next;
    listeners.forEach((listener) => listener());
  };
  return { page, change, listeners };
}

describe('startBellTicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('czyta stan od razu i potem co 30 sekund, gdy karta jest widoczna / reads at once and then every 30 seconds while visible', () => {
    const { page } = fakePage('visible');
    const read = vi.fn(() => LESSON);
    const onChange = vi.fn();
    startBellTicker({ read, onChange, page });

    expect(read).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(LESSON);

    vi.advanceTimersByTime(BELL_REFRESH_MS - 1);
    expect(read).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(read).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('nic nie czyta, gdy karta jest ukryta / reads nothing while the tab is hidden', () => {
    const { page } = fakePage('hidden');
    const read = vi.fn(() => LESSON);
    startBellTicker({ read, onChange: vi.fn(), page });

    vi.advanceTimersByTime(5 * BELL_REFRESH_MS);
    expect(read).not.toHaveBeenCalled();
  });

  it('zatrzymuje odświeżanie, gdy karta się ukryje / stops refreshing when the tab gets hidden', () => {
    const { page, change } = fakePage('visible');
    const read = vi.fn(() => LESSON);
    startBellTicker({ read, onChange: vi.fn(), page });
    expect(read).toHaveBeenCalledTimes(1);

    change('hidden');
    vi.advanceTimersByTime(5 * BELL_REFRESH_MS);
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('po powrocie czyta od razu i wraca do cyklu 30 sekund / on return reads at once and goes back to the 30 second cycle', () => {
    const { page, change } = fakePage('visible');
    const read = vi.fn(() => LESSON);
    startBellTicker({ read, onChange: vi.fn(), page });
    change('hidden');
    vi.advanceTimersByTime(10 * BELL_REFRESH_MS);

    change('visible');
    expect(read).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(BELL_REFRESH_MS);
    expect(read).toHaveBeenCalledTimes(3);
  });

  it('nie dubluje zegara, gdy karta zmienia widoczność na widoczną bez ukrycia / does not double the timer when a visible tab reports visible again', () => {
    const { page, change } = fakePage('visible');
    const read = vi.fn(() => LESSON);
    startBellTicker({ read, onChange: vi.fn(), page });

    change('visible');
    vi.advanceTimersByTime(BELL_REFRESH_MS);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it('zwrócona funkcja zatrzymuje zegar i usuwa słuchacza / the returned function stops the timer and removes the listener', () => {
    const { page, change, listeners } = fakePage('visible');
    const read = vi.fn(() => LESSON);
    const stop = startBellTicker({ read, onChange: vi.fn(), page });
    expect(listeners.size).toBe(1);

    stop();
    expect(listeners.size).toBe(0);

    vi.advanceTimersByTime(5 * BELL_REFRESH_MS);
    change('hidden');
    change('visible');
    expect(read).toHaveBeenCalledTimes(1);
  });
});
