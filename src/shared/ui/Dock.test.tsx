/**
 * PL: Test dolnego paska: nazwa menu, trzy linki, bieżący ekran z aria-current, przycisk „+” z ukrytym znakiem i nazwą dla czytnika oraz klasy stylu. Linki są w routerze, więc test podaje MemoryRouter.
 * EN: Test of the bottom bar: the menu name, three links, the current screen with aria-current, the "+" button with the hidden sign and the name for the screen reader, and the style classes. The links need a router, so the test gives a MemoryRouter.
 *
 * @author Bohdan
 * @since 2026-10-13
 * @uses src/shared/ui/Dock.tsx::Dock
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie komponentu do tekstu HTML.
// EN: Rendering a component to an HTML string.
import { renderToString } from 'react-dom/server';
// PL: Pamięciowy router, który da się użyć bez przeglądarki.
// EN: The in-memory router that works without a browser.
import { MemoryRouter } from 'react-router';
// PL: Komponent pod testem.
// EN: The component under test.
import { Dock } from './Dock';

// PL: Rysuje pasek na ekranie Ankiet, żeby bieżący wpis był znany.
// EN: Draws the bar on the Surveys screen, so the current entry is known.
function renderDock(path: string) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <Dock />
    </MemoryRouter>,
  );
}

describe('dolny pasek / the bottom bar', () => {
  it('ma nazwę menu i trzy linki / has the menu name and three links', () => {
    const html = renderDock('/surveys/vote');

    expect(html).toContain('class="ui-dock"');
    expect(html).toContain('aria-label="Menu główne"');
    expect(html.match(/<a /g)).toHaveLength(3);
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/reports/student"');
    expect(html).toContain('href="/surveys/vote"');
  });

  it('bieżący ekran ma aria-current="page", a pozostałe nie / the current screen has aria-current="page", the others do not', () => {
    const html = renderDock('/surveys/vote');
    // PL: Znajdź znacznik linku po adresie, bo kolejność atrybutów nie ma znaczenia.
    // EN: Find the link tag by its address, because the attribute order does not matter.
    const linkTag = (href: string) => html.match(new RegExp(`<a [^>]*href="${href}"[^>]*>`))?.[0] ?? '';

    expect(linkTag('/surveys/vote')).toContain('aria-current="page"');
    expect(linkTag('/')).not.toContain('aria-current');
  });

  it('przycisk „+” ma znak ukryty przed czytnikiem i nazwę „Zgłoś problem” / the "+" button hides the sign from the screen reader and has the name "Zgłoś problem"', () => {
    const html = renderDock('/');

    expect(html).toContain('class="ui-dock-add"');
    expect(html).toContain('<span aria-hidden="true">+</span>');
    expect(html).toContain('<span class="ui-sr-only">Zgłoś problem</span>');
  });

  it('linki mają klasy do stylu / the links have style classes', () => {
    const html = renderDock('/');

    expect(html).toContain('class="ui-dock-link"');
  });
});
