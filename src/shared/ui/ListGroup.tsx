/**
 * PL: Grupowana lista w stylu iOS: mały nagłówek nad białym blokiem i przypis pod nim. Bloki są zaokrąglone na szarym tle.
 * EN: A grouped list in the iOS style: a small header above a white block and a footnote below it. The blocks are rounded on the gray background.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-17
 * @uses src/shared/ui/ListGroup.css::.ui-list-group
 * @used_by src/shared/index.ts::ListGroup
 */

// PL: Typ węzła potomnego (wierszy).
// EN: The type of the child node (the rows).
import type { ReactNode } from 'react';
// PL: Style grupy.
// EN: The group styles.
import './ListGroup.css';

/**
 * PL: Właściwości grupy: nagłówek, przypis i wiersze.
 * EN: Group properties: the header, the footnote and the rows.
 */
export type ListGroupProps = {
  /** PL: Nagłówek nad blokiem, np. „Motyw”. EN: The header above the block, for example "Motyw". */
  header?: string;
  /** PL: Przypis pod blokiem. EN: The footnote below the block. */
  footer?: string;
  /** PL: Wiersze grupy (ListRow). EN: The group rows (ListRow). */
  children: ReactNode;
  /** PL: Dodatkowa klasa od wywołującego. EN: An extra class from the caller. */
  className?: string;
};

/**
 * PL: Rysuje grupę: nagłówek (jeśli jest), blok z wierszami i przypis (jeśli jest).
 * EN: Draws the group: the header (if any), the block with the rows and the footnote (if any).
 *
 * @param props - PL: nagłówek, przypis i wiersze. EN: the header, the footnote and the rows.
 * @returns PL: sekcja listy. EN: the list section.
 */
export function ListGroup({ header, footer, children, className }: ListGroupProps) {
  // PL: Połącz klasę bazową z klasą od wywołującego.
  // EN: Join the base class with the caller's class.
  const classes = ['ui-list-group', className].filter(Boolean).join(' ');

  // PL: Nagłówek i przypis są opcjonalne; bez nich nie ma pustego miejsca.
  // EN: The header and the footnote are optional; without them there is no empty space.
  return (
    <section className={classes}>
      {header ? <h2 className="ui-list-group-header">{header}</h2> : null}
      <div className="ui-list-group-block">{children}</div>
      {footer ? <p className="ui-list-group-footer">{footer}</p> : null}
    </section>
  );
}
