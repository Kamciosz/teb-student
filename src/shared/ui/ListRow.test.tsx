/**
 * PL: Test wiersza listy: zwykły wiersz to blok bez przycisku, wiersz z akcją to przycisk typu „button”, a strzałka i kolor błędu pojawiają się tylko, gdy są potrzebne.
 * EN: Test of the list row: a plain row is a block without a button, a row with an action is a "button" type button, and the arrow and the error color appear only when needed.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-17
 * @uses src/shared/ui/ListRow.tsx::ListRow
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie komponentu do tekstu HTML.
// EN: Rendering a component to an HTML string.
import { renderToString } from 'react-dom/server';
// PL: Komponent pod testem.
// EN: The component under test.
import { ListRow } from './ListRow';
// PL: Router w pamięci, bo link potrzebuje routera. EN: An in-memory router, because the link needs a router.
import { MemoryRouter } from 'react-router';

describe('wiersz listy / the list row', () => {
  it('zwykły wiersz to blok bez przycisku, z tytułem i wartością / a plain row is a block without a button, with the title and the value', () => {
    const html = renderToString(<ListRow title="Motyw" value="Automatyczny" />);

    expect(html).toContain('class="ui-list-row"');
    expect(html).not.toContain('<button');
    expect(html).toContain('Motyw');
    expect(html).toContain('class="ui-list-row-value">Automatyczny</span>');
  });

  it('podtytuł pojawia się pod tytułem / the subtitle appears below the title', () => {
    const html = renderToString(<ListRow title="Zgłoszenia" subtitle="2 nowe" />);

    expect(html.indexOf('Zgłoszenia')).toBeLessThan(html.indexOf('2 nowe'));
    expect(html).toContain('class="ui-list-row-subtitle">2 nowe</span>');
  });

  it('strzałka pojawia się tylko przy wierszu, który otwiera ekran / the arrow appears only at a row that opens a screen', () => {
    const withArrow = renderToString(<ListRow title="Profil" chevron />);
    const withoutArrow = renderToString(<ListRow title="Profil" />);

    expect(withArrow).toContain('ui-list-row-chevron');
    expect(withArrow).toContain('aria-hidden="true">›</span>');
    expect(withoutArrow).not.toContain('ui-list-row-chevron');
  });

  it('wiersz z akcją jest przyciskiem typu „button” i ma klasę wciśnięcia / a row with an action is a "button" type button and has the press class', () => {
    const html = renderToString(<ListRow title="Motyw" onClick={() => undefined} />);

    expect(html).toContain('<button type="button" class="ui-list-row ui-list-row--action"');
  });

  it('czerwony wiersz ma klasę błędu / a red row has the error class', () => {
    const html = renderToString(<ListRow title="Usuń konto" destructive onClick={() => undefined} />);

    expect(html).toContain('ui-list-row--destructive');
  });

  it('ikona jest ozdobna i ukryta przed czytnikiem / the icon is decorative and hidden from the screen reader', () => {
    const html = renderToString(<ListRow title="Klucze" icon={<svg />} />);

    expect(html).toContain('class="ui-list-row-icon" aria-hidden="true"');
  });

  it('wiersz z adresem to link ze strzałką / a row with an address is a link with the arrow', () => {
    const html = renderToString(
      <MemoryRouter>
        <ListRow title="Ustawienia" to="/profile/ustawienia" />
      </MemoryRouter>,
    );

    expect(html).toContain('href="/profile/ustawienia"');
    expect(html).toContain('ui-list-row--action');
    expect(html).toContain('class="ui-list-row-chevron"');
    expect(html).not.toContain('<button');
  });
});
