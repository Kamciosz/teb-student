/**
 * PL: Testy górnego rzędu pulpitu: licznik pokazuje minuty, gdy stan jest, a bez stanu zostaje kreska i napis o braku planu. Stan dzwonka jest podstawiony, a czas udawany.
 * EN: Tests of the dashboard top row: the countdown shows minutes when there is a state, and without a state a dash and the no-plan text stay. The bell state is substituted and the time is faked.
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
import { currentBellState } from '../bell';
import type { BellState } from '../bell';

// PL: Podstawiamy tylko odczyt stanu, bo plan w main jest pusty. Reszta modułu bell nie jest potrzebna.
// EN: We substitute only the state read, because the plan in main is empty. The rest of the bell module is not needed.
vi.mock('../bell', () => ({ currentBellState: vi.fn(() => null) }));

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
  });

  it('pokazuje minuty i „do dzwonka”, gdy trwa lekcja / shows the minutes and "do dzwonka" during a lesson', () => {
    vi.mocked(currentBellState).mockReturnValue(LESSON);

    const html = renderHeader();

    expect(html).toContain('>12<');
    expect(html).toContain('>min<');
    expect(html).toContain('do dzwonka');
    expect(html).not.toContain('Brak planu dzwonków');
  });

  it('bez stanu zostawia kreskę i napis o braku planu / without a state keeps the dash and the no-plan text', () => {
    vi.mocked(currentBellState).mockReturnValue(null);

    const html = renderHeader();

    expect(html).toContain('Brak planu dzwonków');
    expect(html).toContain('–');
    expect(html).not.toContain('>min<');
  });
});
