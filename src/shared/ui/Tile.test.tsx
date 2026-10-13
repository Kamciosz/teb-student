/**
 * PL: Test kafla: klasa i treść w znaczniku, zawijanie i brak poziomego przewijania w CSS. Kafel sam nie ma klawiatury ani stanu wyłączenia (nie jest sterowny), więc tych testów tu nie ma. Gdy kafel jest linkiem, fokus rysuje base.css, a klawisz Enter obsługuje przeglądarka.
 * EN: Test of the tile: the class and the content in the markup, wrapping and no horizontal scrolling in CSS. The tile itself has no keyboard or disabled state (it is not a control), so such tests are not here. When the tile is a link, base.css draws the focus and the browser handles the Enter key.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Tile.tsx::Tile
 * @uses src/shared/ui/Tile.css::.ui-tile
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
// PL: Arkusz stylów jako tekst.
// EN: The style sheet as text.
import tileCss from './Tile.css?raw';

describe('kafel / the tile', () => {
  it('rysuje treść w klasie ui-tile od razu / draws the content in the ui-tile class right away', () => {
    const html = renderToString(<Tile>Ankiety: 2</Tile>);

    expect(html).toContain('class="ui-tile"');
    expect(html).toContain('Ankiety: 2');
  });

  it('łączy klasę od wywołującego z klasą bazową / joins the caller class with the base class', () => {
    expect(renderToString(<Tile className="pulpit-kafel">x</Tile>)).toContain('class="ui-tile pulpit-kafel"');
  });

  it('CSS: tekst zawija się i kafel może się zwęzić przy 320 px / CSS: text wraps and the tile can narrow at 320 px', () => {
    expect(tileCss).toContain('min-width: 0');
    expect(tileCss).toContain('overflow-wrap: anywhere');
  });

  it('CSS: nie wyłącza obwódki fokusa, gdy kafel jest linkiem / CSS: does not turn the focus outline off when the tile is a link', () => {
    expect(tileCss).not.toMatch(/outline:\s*(none|0)\b/);
  });
});
