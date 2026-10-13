/**
 * PL: Test kafla: klasa i treść w znaczniku oraz łączenie klasy od wywołującego. Kafel sam nie ma klawiatury ani stanu wyłączenia (nie jest sterowny), więc tych testów tu nie ma.
 * EN: Test of the tile: the class and the content in the markup, and joining the caller class. The tile itself has no keyboard or disabled state (it is not a control), so such tests are not here.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Tile.tsx::Tile
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
import { Tile } from './Tile';

describe('kafel / the tile', () => {
  it('rysuje treść w klasie ui-tile od razu / draws the content in the ui-tile class right away', () => {
    const html = renderToString(<Tile>Ankiety: 2</Tile>);

    expect(html).toContain('class="ui-tile"');
    expect(html).toContain('Ankiety: 2');
  });

  it('łączy klasę od wywołującego z klasą bazową / joins the caller class with the base class', () => {
    expect(renderToString(<Tile className="pulpit-kafel">x</Tile>)).toContain('class="ui-tile pulpit-kafel"');
  });
});
