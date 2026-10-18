/**
 * PL: Testy listy sekcji: kolejność według zapisu, sekcja „Do zrobienia” znika bez ankiety i zgłoszenia, a w trybie edycji przyciski „Wyżej” i „Niżej” są wyłączone na krawędziach widocznych sekcji.
 * EN: Tests of the section list: the order follows the saved one, the "Do zrobienia" section disappears without a survey and a report, and in the edit mode the "Wyżej" and "Niżej" buttons are disabled at the edges of the visible sections.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/features/dashboard/Sections.tsx::Sections
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it, vi } from 'vitest';
// PL: Renderowanie na tekst i router, którego wymagają linki wierszy.
// EN: Rendering to text and the router that the row links need.
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
// PL: Testowana lista, typ kolejności i dane pulpitu.
// EN: The tested list, the order type and the dashboard data.
import { Sections } from './Sections';
import type { SectionId } from './tileOrder';
import type { DashboardData } from './types';

// PL: Pełne dane: wpis „Ważne”, ankieta, zgłoszenie i ogłoszenia.
// EN: Full data: a "Ważne" entry, a survey, a report and announcements.
const FULL: DashboardData = {
  important: null,
  announcements: [{ id: 'n-1', title: 'Wycieczka', publishedAt: '2026-10-08T08:00:00Z' }],
  survey: { id: 'a-1', title: 'Ankieta o stołówce', daysLeft: 3 },
  report: { description: 'Zepsuty rzutnik', stage: 2, openCount: 1 },
};

// PL: Dane bez ankiety i zgłoszenia, czyli bez sekcji „Do zrobienia”.
// EN: Data without a survey and a report, so without the "Do zrobienia" section.
const EMPTY_TODO: DashboardData = { ...FULL, survey: null, report: null };

/**
 * PL: Renderuje listę sekcji w routerze.
 * EN: Renders the section list inside a router.
 *
 * @param order - PL: kolejność sekcji. EN: the order of the sections.
 * @param data - PL: dane pulpitu albo undefined. EN: the dashboard data or undefined.
 * @param editing - PL: czy trwa tryb edycji. EN: whether the edit mode is on.
 * @returns PL: HTML listy. EN: the HTML of the list.
 */
function renderSections(order: SectionId[], data: DashboardData | undefined, editing = false): string {
  return renderToString(
    <MemoryRouter>
      <Sections order={order} data={data} editing={editing} onMove={vi.fn()} />
    </MemoryRouter>,
  );
}

/**
 * PL: Sprawdza, czy przycisk o danej etykiecie jest wyłączony w HTML.
 * EN: Checks whether the button with the given label is disabled in the HTML.
 *
 * @param html - PL: HTML listy. EN: the HTML of the list.
 * @param label - PL: pełna etykieta aria-label. EN: the full aria-label.
 * @returns PL: true, gdy przycisk ma atrybut disabled. EN: true when the button has the disabled attribute.
 */
function isDisabled(html: string, label: string): boolean {
  const tag = html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`));
  if (!tag) throw new Error(`Brak przycisku: ${label}`);
  return tag[0].includes('disabled');
}

describe('Sections', () => {
  // PL: Sekcje idą w zapisanej kolejności.
  // EN: The sections follow the saved order.
  it('pokazuje sekcje w zapisanej kolejności / shows the sections in the saved order', () => {
    const html = renderSections(['informacje', 'zrobienia'], FULL);

    expect(html.indexOf('Informacje')).toBeLessThan(html.indexOf('Do zrobienia'));
  });

  // PL: Bez ankiety i zgłoszenia sekcja „Do zrobienia” znika z listy.
  // EN: Without a survey and a report the "Do zrobienia" section leaves the list.
  it('bez ankiety i zgłoszenia ukrywa „Do zrobienia” / without a survey and a report hides "Do zrobienia"', () => {
    const html = renderSections(['zrobienia', 'informacje'], EMPTY_TODO, true);

    expect(html).not.toContain('Do zrobienia');
    expect(html).toContain('Informacje');
    expect(html).not.toContain('Wyżej: Do zrobienia');
  });

  // PL: Bez danych sekcja „Informacje” pokazuje pusty stan, nie psuje listy.
  // EN: Without data the "Informacje" section shows the empty state and does not break the list.
  it('bez danych pokazuje pusty stan / without data shows the empty state', () => {
    const html = renderSections(['zrobienia', 'informacje'], undefined);

    expect(html).toContain('Nie ma jeszcze wpisów.');
    expect(html).not.toContain('Do zrobienia');
  });

  // PL: Poza edycją nie ma przycisków układania.
  // EN: Outside the edit mode there are no arranging buttons.
  it('poza edycją nie pokazuje przycisków / outside the edit mode shows no buttons', () => {
    const html = renderSections(['zrobienia', 'informacje'], FULL, false);

    expect(html).not.toContain('Wyżej');
    expect(html).not.toContain('Niżej');
  });

  // PL: W edycji pierwsza sekcja ma wyłączone „Wyżej”, a ostatnia „Niżej”.
  // EN: In the edit mode the first section has "Wyżej" disabled, and the last one "Niżej".
  it('w edycji wyłącza przyciski na krawędziach / in the edit mode disables the buttons at the edges', () => {
    const html = renderSections(['zrobienia', 'informacje'], FULL, true);

    expect(isDisabled(html, 'Wyżej: Do zrobienia')).toBe(true);
    expect(isDisabled(html, 'Niżej: Do zrobienia')).toBe(false);
    expect(isDisabled(html, 'Wyżej: Informacje')).toBe(false);
    expect(isDisabled(html, 'Niżej: Informacje')).toBe(true);
  });

  // PL: Krawędź liczy się po widocznych sekcjach: bez „Do zrobienia” jedyna sekcja „Informacje” jest pierwsza i ostatnia naraz.
  // EN: The edge counts the visible sections: without "Do zrobienia" the only section "Informacje" is first and last at once.
  it('krawędź liczy tylko widoczne sekcje / the edge counts only the visible sections', () => {
    const html = renderSections(['zrobienia', 'informacje'], EMPTY_TODO, true);

    expect(isDisabled(html, 'Wyżej: Informacje')).toBe(true);
    expect(isDisabled(html, 'Niżej: Informacje')).toBe(true);
  });
});
