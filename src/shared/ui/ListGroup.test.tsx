/**
 * PL: Test grupy listy: nagłówek i przypis pojawiają się tylko wtedy, gdy są podane, a wiersze trafiają do bloku. Grupa nie jest sterowna.
 * EN: Test of the list group: the header and the footnote appear only when given, and the rows go into the block. The group is not a control.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-17
 * @uses src/shared/ui/ListGroup.tsx::ListGroup
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
import { ListGroup } from './ListGroup';

describe('grupa listy / the list group', () => {
  it('nagłówek, blok z wierszami i przypis w tej kolejności / the header, the block with the rows and the footnote in this order', () => {
    const html = renderToString(
      <ListGroup header="Motyw" footer="Wybór dotyczy tego telefonu.">
        <p>wiersz</p>
      </ListGroup>,
    );

    expect(html.indexOf('Motyw')).toBeLessThan(html.indexOf('ui-list-group-block'));
    expect(html.indexOf('ui-list-group-block')).toBeLessThan(html.indexOf('Wybór dotyczy'));
    expect(html).toContain('<p>wiersz</p>');
  });

  it('bez nagłówka i przypisu nie zostawia pustego miejsca / without a header and a footnote it leaves no empty space', () => {
    const html = renderToString(<ListGroup>wiersz</ListGroup>);

    expect(html).not.toContain('ui-list-group-header');
    expect(html).not.toContain('ui-list-group-footer');
    expect(html).toContain('class="ui-list-group-block"');
  });
});
