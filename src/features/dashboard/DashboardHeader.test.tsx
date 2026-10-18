/**
 * PL: Testy nagłówka pulpitu: tytuł „Dzisiaj”, podpis „Cześć · data” i przycisk „Edytuj”, który w trybie edycji zmienia się w „Gotowe”.
 * EN: Tests of the dashboard header: the "Dzisiaj" title, the "Cześć · date" caption and the "Edytuj" button, which becomes "Gotowe" in the edit mode.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/features/dashboard/DashboardHeader.tsx::DashboardHeader
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Renderowanie na tekst i router, którego wymagają linki w nagłówku.
// EN: Rendering to text and the router that the links in the header need.
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
// PL: Testowany nagłówek.
// EN: The tested header.
import { DashboardHeader } from './DashboardHeader';

/**
 * PL: Renderuje nagłówek pulpitu w routerze.
 * EN: Renders the dashboard header inside a router.
 *
 * @param editing - PL: czy trwa tryb edycji. EN: whether the edit mode is on.
 * @returns PL: HTML nagłówka. EN: the HTML of the header.
 */
function renderHeader(editing: boolean): string {
  return renderToString(
    <MemoryRouter>
      <DashboardHeader editing={editing} onToggleEdit={() => {}} />
    </MemoryRouter>,
  );
}

describe('DashboardHeader', () => {
  // PL: Tytuł ekranu i podpis z powitaniem.
  // EN: The screen title and the greeting caption.
  it('pokazuje tytuł „Dzisiaj” i podpis „Cześć” / shows the "Dzisiaj" title and the "Cześć" caption', () => {
    const html = renderHeader(false);

    expect(html).toContain('Dzisiaj');
    expect(html).toContain('Cześć');
  });

  // PL: Poza edycją przycisk mówi „Edytuj”.
  // EN: Outside the edit mode the button says "Edytuj".
  it('poza edycją pokazuje „Edytuj” / outside the edit mode shows "Edytuj"', () => {
    const html = renderHeader(false);

    expect(html).toContain('Edytuj');
    expect(html).not.toContain('Gotowe');
  });

  // PL: W trybie edycji przycisk mówi „Gotowe”.
  // EN: In the edit mode the button says "Gotowe".
  it('w edycji pokazuje „Gotowe” / in the edit mode shows "Gotowe"', () => {
    const html = renderHeader(true);

    expect(html).toContain('Gotowe');
    expect(html).not.toContain('Edytuj');
  });
});
