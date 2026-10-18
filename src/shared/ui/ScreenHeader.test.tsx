/**
 * PL: Test nagłówka ekranu: ekran zakładki ma duży tytuł bez powrotu, a ekran podrzędny ma link „Wstecz” do ekranu nadrzędnego.
 * EN: Test of the screen header: a tab screen has a large title without a way back, and a sub-screen has a "Back" link to the parent screen.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/shared/ui/ScreenHeader.tsx::ScreenHeader
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie komponentu do tekstu HTML.
// EN: Rendering a component to an HTML string.
import { renderToString } from 'react-dom/server';
// PL: Router w pamięci, bo link potrzebuje routera.
// EN: An in-memory router, because the link needs a router.
import { MemoryRouter } from 'react-router';
// PL: Komponent pod testem.
// EN: The component under test.
import { ScreenHeader } from './ScreenHeader';

describe('nagłówek ekranu / the screen header', () => {
  it('ekran zakładki ma duży tytuł i mały tekst nad nim / a tab screen has a large title and small text above it', () => {
    const html = renderToString(
      <MemoryRouter>
        <ScreenHeader title="Dzisiaj" eyebrow="Niedziela, 18.10" />
      </MemoryRouter>,
    );

    expect(html).toContain('ui-screen-header--large');
    expect(html).toContain('<h1 class="ui-screen-header-title">Dzisiaj</h1>');
    expect(html).toContain('Niedziela, 18.10');
    expect(html).not.toContain('Wstecz');
  });

  it('ekran podrzędny ma link „Wstecz” do ekranu nadrzędnego / a sub-screen has a "Back" link to the parent screen', () => {
    const html = renderToString(
      <MemoryRouter>
        <ScreenHeader title="Ustawienia" backTo="/profile" backLabel="Profil" />
      </MemoryRouter>,
    );

    expect(html).toContain('ui-screen-header--bar');
    expect(html).toContain('href="/profile"');
    expect(html).toContain('Profil');
    expect(html).toContain('<h1 class="ui-screen-header-bar-title">Ustawienia</h1>');
  });

  it('tytuł z fokusem przyjmuje fokus z kodu / a title with focus accepts focus from code', () => {
    const html = renderToString(
      <MemoryRouter>
        <ScreenHeader title="Wpis" backTo="/news/feed" focusTitle />
      </MemoryRouter>,
    );

    expect(html).toContain('tabindex="-1"');
  });
});
