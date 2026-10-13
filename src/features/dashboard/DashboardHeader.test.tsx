/**
 * PL: Testy górnego rzędu pulpitu: licznik pokazuje minuty, gdy stan jest, a bez stanu zostaje kreska i napis: „Brak planu dzwonków” bez planu albo „Po lekcjach” z planem. Stan dzwonka i sprawdzenie planu są podstawione, a czas udawany.
 * EN: Tests of the dashboard top row: the countdown shows minutes when there is a state, and without a state a dash stays with "Brak planu dzwonków" (no plan) or "Po lekcjach" (a plan). The bell state and the plan check are substituted and the time is faked.
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
// PL: Testowany komponent i odczyt stanu dzwonka (podstawiony poniżej).
// EN: The tested component and the bell state read (substituted below).
import { DashboardHeader } from './DashboardHeader';
import { currentBellState, hasBellPlan } from '../bell';
import type { BellState } from '../bell';

// PL: Podstawiamy tylko odczyt stanu i sprawdzenie planu, bo plan w main jest pusty. Reszta modułu bell nie jest potrzebna.
// EN: We substitute only the state read and the plan check, because the plan in main is empty. The rest of the bell module is not needed.
vi.mock('../bell', () => ({
  currentBellState: vi.fn(() => null),
  hasBellPlan: vi.fn(() => false),
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
    vi.mocked(hasBellPlan).mockReset();
    vi.mocked(hasBellPlan).mockReturnValue(false);
  });

  it('pokazuje minuty i „do dzwonka”, gdy trwa lekcja / shows the minutes and "do dzwonka" during a lesson', () => {
    vi.mocked(currentBellState).mockReturnValue(LESSON);

    const html = renderHeader();

    expect(html).toContain('>12<');
    expect(html).toContain('>min<');
    expect(html).toContain('do dzwonka');
    expect(html).not.toContain('Brak planu dzwonków');
  });

  it('bez planu pokazuje kreskę i „Brak planu dzwonków” / without a plan shows the dash and "Brak planu dzwonków"', () => {
    vi.mocked(currentBellState).mockReturnValue(null);
    vi.mocked(hasBellPlan).mockReturnValue(false);

    const html = renderHeader();

    expect(html).toContain('Brak planu dzwonków');
    expect(html).not.toContain('Po lekcjach');
    expect(html).toContain('–');
    expect(html).not.toContain('>min<');
  });

  it('z planu poza lekcjami pokazuje „Po lekcjach” / with a plan outside lessons shows "Po lekcjach"', () => {
    vi.setSystemTime(new Date('2026-10-23T17:00:00Z'));
    vi.mocked(currentBellState).mockReturnValue(null);
    vi.mocked(hasBellPlan).mockReturnValue(true);

    const html = renderHeader();

    expect(html).toContain('Po lekcjach');
    expect(html).not.toContain('Brak planu dzwonków');
    expect(html).not.toContain('>min<');
  });
});
