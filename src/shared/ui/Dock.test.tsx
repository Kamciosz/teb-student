/**
 * PL: Test dolnego paska: nazwa menu, trzy linki, bieżący ekran z aria-current, przycisk „+” z ukrytym znakiem i nazwą dla czytnika, wysokość dotyku w CSS. Linki są w routerze, więc test podaje MemoryRouter. Fokus i Tab sprawdza e2e/shared-wyglad.spec.ts.
 * EN: Test of the bottom bar: the menu name, three links, the current screen with aria-current, the "+" button with the hidden sign and the name for the screen reader, the touch height in CSS. The links need a router, so the test gives a MemoryRouter. Focus and Tab are checked by e2e/shared-wyglad.spec.ts.
 *
 * @author Bohdan
 * @since 2026-10-13
 * @uses src/shared/ui/Dock.tsx::Dock
 * @uses src/shared/ui/Dock.css::.ui-dock
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
// PL: Arkusz stylów jako tekst.
// EN: The style sheet as text.
import dockCss from './Dock.css?raw';

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

  it('linki mają klasy do stylu i wysokość dotyku co najmniej 44 px w CSS / the links have style classes and a touch height of at least 44 px in CSS', () => {
    const html = renderDock('/');

    expect(html).toContain('class="ui-dock-link"');
    expect(dockCss).toMatch(/\.ui-dock-link\s*\{[^}]*min-height:\s*44px/);
    expect(dockCss).toMatch(/\.ui-dock-add\s*\{[^}]*min-height:\s*48px/);
  });

  it('CSS: bieżący wpis ma własny styl i fokus nie jest wyłączony / CSS: the current entry has its own style and the focus is not turned off', () => {
    expect(dockCss).toContain(".ui-dock-link[aria-current='page']");
    expect(dockCss).not.toMatch(/outline:\s*(none|0)\b/);
  });
});
