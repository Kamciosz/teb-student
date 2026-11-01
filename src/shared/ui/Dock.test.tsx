/**
 * PL: Test dolnego paska: nazwa menu, pięć linków z napisami, bieżący ekran z aria-current, brak przycisku „+”, odstęp pod treścią i klasy stylu. Linki są w routerze, więc test podaje MemoryRouter.
 * EN: Test of the bottom bar: the menu name, five links with their labels, the current screen with aria-current, no "+" button, the space under the content and the style classes. The links need a router, so the test gives a MemoryRouter.
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
  it('ma nazwę menu i pięć linków / has the menu name and five links', () => {
    const html = renderDock('/surveys/vote');

    expect(html).toContain('class="ui-dock"');
    expect(html).toContain('aria-label="Menu główne"');
    expect(html.match(/<a /g)).toHaveLength(5);
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/news/feed"');
    expect(html).toContain('href="/reports/student/moje"');
    expect(html).toContain('href="/surveys/vote"');
    expect(html).toContain('href="/profile"');
  });

  it('każdy link ma napis pod ikoną / every link has a label under the icon', () => {
    const html = renderDock('/');

    for (const label of ['Pulpit', 'Aktualności', 'Zgłoszenia', 'Ankiety', 'Profil']) {
      expect(html).toContain(`<span class="ui-dock-label">${label}</span>`);
    }
  });

  it('bieżący ekran ma aria-current="page", a pozostałe nie / the current screen has aria-current="page", the others do not', () => {
    const html = renderDock('/surveys/vote');
    // PL: Znajdź znacznik linku po adresie, bo kolejność atrybutów nie ma znaczenia.
    // EN: Find the link tag by its address, because the attribute order does not matter.
    const linkTag = (href: string) => html.match(new RegExp(`<a [^>]*href="${href}"[^>]*>`))?.[0] ?? '';

    expect(linkTag('/surveys/vote')).toContain('aria-current="page"');
    expect(linkTag('/')).not.toContain('aria-current');
    expect(linkTag('/news/feed')).not.toContain('aria-current');
  });

  it('nie ma przycisku dodawania „+” / has no "+" add button', () => {
    const html = renderDock('/');

    expect(html).not.toContain('ui-dock-add');
    expect(html).not.toContain('>+<');
    expect(html).not.toContain('Zgłoś problem');
  });

  it('przed paskiem jest odstęp ukryty przed czytnikiem / there is a space before the bar, hidden from the screen reader', () => {
    const html = renderDock('/');

    expect(html).toContain('<div class="ui-dock-spacer" aria-hidden="true"></div>');
    expect(html.indexOf('ui-dock-spacer')).toBeLessThan(html.indexOf('class="ui-dock"'));
  });

  it('linki mają klasy do stylu / the links have style classes', () => {
    const html = renderDock('/');

    expect(html).toContain('class="ui-dock-link"');
  });
});
