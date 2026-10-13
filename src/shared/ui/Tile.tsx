/**
 * PL: Kafel, czyli jasna powierzchnia na kartę z treścią (np. kafelek pulpitu). Sam nie jest interaktywny. Gdy kafelek ma być linkiem, daj klasę „ui-tile” elementowi „a”, a fokus i obwódkę rysuje base.css.
 * EN: A tile, that is a light surface for a card with content (for example a dashboard tile). It is not interactive by itself. When the tile should be a link, give the "ui-tile" class to an "a" element; base.css draws the focus and the outline.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Tile.css::.ui-tile
 * @used_by src/shared/index.ts::Tile
 */

// PL: Typy właściwości elementu div z Reacta.
// EN: The React div property types.
import type { ComponentProps } from 'react';
// PL: Style kafla.
// EN: The tile styles.
import './Tile.css';

/**
 * PL: Właściwości kafla: zwykły div.
 * EN: Tile properties: a plain div.
 */
export type TileProps = ComponentProps<'div'>;

/**
 * PL: Rysuje kafel. Klasa bazowa ma wygląd powierzchni, a klasa od wywołującego dokłada resztę.
 * EN: Draws the tile. The base class gives the surface look, and the caller's class adds the rest.
 *
 * @param props - PL: zwykłe właściwości div. EN: the usual div properties.
 * @returns PL: kafel. EN: the tile.
 */
export function Tile({ className, ...rest }: TileProps) {
  // PL: Połącz klasę bazową z klasą od wywołującego.
  // EN: Join the base class with the caller's class.
  const classes = ['ui-tile', className].filter(Boolean).join(' ');

  return <div className={classes} {...rest} />;
}
