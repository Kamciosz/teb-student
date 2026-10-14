/**
 * PL: Testy górnego rzędu pulpitu: licznik pokazuje minuty, gdy stan jest, a bez stanu zostaje kreska i napis zależny od stanu dnia: „Brak planu dzwonków” bez planu, „Dziś nie ma lekcji” w dzień wolny, „Lekcje jeszcze się nie zaczęły” przed lekcjami, „Trwa lekcja” w trakcie i „Po lekcjach” po nich. Stan dzwonka i stan dnia są podstawione, a czas udawany.
 * EN: Tests of the dashboard top row: the countdown shows minutes when there is a state, and without a state a dash stays with a text that depends on the day's state: "Brak planu dzwonków" without a plan, "Dziś nie ma lekcji" on a day off, "Lekcje jeszcze się nie zaczęły" before the lessons, "Trwa lekcja" during them and "Po lekcjach" after them. The bell state and the day state are substituted and the time is faked.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/dashboard/DashboardHeader.tsx::DashboardHeader
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest i podstawianie modułu.
// EN: Vitest test functions and module substitution.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Renderowanie na tekst i router, którego wymaga Link.
// EN: Rendering to text and the router that Link needs.
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
// PL: Testowany komponent i odczyt stanu dzwonka oraz stanu dnia (podstawione poniżej).
// EN: The tested component and the bell state and the day state reads (substituted below).
import { DashboardHeader } from './DashboardHeader';
import { bellDayStatus, currentBellState } from '../bell';
import type { BellDayStatus, BellState } from '../bell';

// PL: Podstawiamy tylko odczyt stanu i stan dnia, bo plan w main jest pusty. Reszta modułu bell nie jest potrzebna.
// EN: We substitute only the state read and the day state, because the plan in main is empty. The rest of the bell module is not needed.
vi.mock('../bell', () => ({
  currentBellState: vi.fn(() => null),
  bellDayStatus: vi.fn((): BellDayStatus => 'no-plan'),
}));

// PL: Przykładowy stan: trwa lekcja, zostało 12 minut.
// EN: A sample state: a lesson is on, 12 minutes left.
const LESSON: BellState = { kind: 'lesson', lessonNo: 2, minutesLeft: 12, next: null };

/**
 * PL: Renderuje górny rząd pulpitu w routerze.
 * EN: Renders the dashboard top row inside a router.
 *
 * @returns PL: HTML rzędu. EN: the HTML of the row.
 */
function renderHeader(): string {
  return renderToString(
    <MemoryRouter>
      <DashboardHeader editing={false} onToggleEdit={() => {}} />
    </MemoryRouter>,
  );
}

describe('DashboardHeader: licznik do dzwonka', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T07:10:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(currentBellState).mockReset();
    vi.mocked(currentBellState).mockReturnValue(null);
    vi.mocked(bellDayStatus).mockReset();
    vi.mocked(bellDayStatus).mockReturnValue('no-plan');
  });

  it('pokazuje minuty i „do dzwonka”, gdy trwa lekcja / shows the minutes and "do dzwonka" during a lesson', () => {
    vi.mocked(currentBellState).mockReturnValue(LESSON);
    vi.mocked(bellDayStatus).mockReturnValue('during');

    const html = renderHeader();

    expect(html).toContain('>12<');
    expect(html).toContain('>min<');
    expect(html).toContain('do dzwonka');
    expect(html).not.toContain('Brak planu dzwonków');
    expect(html).not.toContain('Trwa lekcja');
  });

  it('bez planu pokazuje kreskę i „Brak planu dzwonków” / without a plan shows the dash and "Brak planu dzwonków"', () => {
    vi.mocked(bellDayStatus).mockReturnValue('no-plan');

    const html = renderHeader();

    expect(html).toContain('Brak planu dzwonków');
    expect(html).not.toContain('Po lekcjach');
    expect(html).toContain('–');
    expect(html).not.toContain('>min<');
  });

  it('w dzień wolny pokazuje „Dziś nie ma lekcji” / on a day off shows "Dziś nie ma lekcji"', () => {
    vi.mocked(bellDayStatus).mockReturnValue('day-off');

    const html = renderHeader();

    expect(html).toContain('Dziś nie ma lekcji');
    expect(html).not.toContain('Po lekcjach');
    expect(html).not.toContain('Brak planu dzwonków');
    expect(html).not.toContain('>min<');
  });

  it('przed lekcjami pokazuje „Lekcje jeszcze się nie zaczęły” / before the lessons shows "Lekcje jeszcze się nie zaczęły"', () => {
    vi.mocked(bellDayStatus).mockReturnValue('before');

    const html = renderHeader();

    expect(html).toContain('Lekcje jeszcze się nie zaczęły');
    expect(html).not.toContain('Po lekcjach');
    expect(html).not.toContain('Brak planu dzwonków');
    expect(html).not.toContain('>min<');
  });

  it('w trakcie bez stanu licznika pokazuje „Trwa lekcja” / during the lessons without a countdown state shows "Trwa lekcja"', () => {
    vi.mocked(bellDayStatus).mockReturnValue('during');

    const html = renderHeader();

    expect(html).toContain('Trwa lekcja');
    expect(html).not.toContain('Po lekcjach');
    expect(html).not.toContain('>min<');
  });

  it('po lekcjach pokazuje „Po lekcjach” / after the lessons shows "Po lekcjach"', () => {
    vi.setSystemTime(new Date('2026-10-23T17:00:00Z'));
    vi.mocked(bellDayStatus).mockReturnValue('after');

    const html = renderHeader();

    expect(html).toContain('Po lekcjach');
    expect(html).not.toContain('Brak planu dzwonków');
    expect(html).not.toContain('>min<');
  });
});
