/**
 * PL: Wspólny nagłówek ekranu w stylu aplikacji systemowej. Ekran zakładki ma duży tytuł po lewej. Ekran podrzędny ma u góry pasek: „‹ Wstecz” w kolorze akcentu po lewej, krótki tytuł na środku i opcjonalną akcję po prawej.
 * EN: The shared screen header in the system app style. A tab screen has a large title on the left. A sub-screen has a bar at the top: "‹ Back" in the accent color on the left, a short title in the middle and an optional action on the right.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/shared/ui/ScreenHeader.css::.ui-screen-header
 * @used_by src/shared/index.ts::ScreenHeader
 */

// PL: Typy węzłów Reacta.
// EN: The React node types.
import type { ReactNode } from 'react';
// PL: Link do ekranu nadrzędnego.
// EN: The link to the parent screen.
import { Link } from 'react-router';
// PL: Style nagłówka.
// EN: The header styles.
import './ScreenHeader.css';

/**
 * PL: Właściwości nagłówka.
 * EN: Header properties.
 */
export type ScreenHeaderProps = {
  /** PL: Tytuł ekranu. EN: The screen title. */
  title: ReactNode;
  /** PL: Adres ekranu nadrzędnego. Gdy jest, nagłówek ma pasek z „Wstecz” i mały tytuł. EN: The parent screen address. When set, the header has a bar with "Back" and a small title. */
  backTo?: string;
  /** PL: Napis przycisku wstecz, domyślnie „Wstecz”. EN: The back button label, "Wstecz" by default. */
  backLabel?: string;
  /** PL: Mały tekst nad dużym tytułem, np. data. EN: Small text above the large title, for example the date. */
  eyebrow?: ReactNode;
  /** PL: Akcja po prawej, np. przycisk tekstowy „Edytuj”. EN: The action on the right, for example the "Edit" text button. */
  action?: ReactNode;
};

/**
 * PL: Rysuje nagłówek: duży tytuł albo pasek z powrotem. Tytuł jest jedynym nagłówkiem h1 ekranu.
 * EN: Draws the header: a large title or a bar with the way back. The title is the only h1 heading of the screen.
 *
 * @param props - PL: tytuł, powrót i akcja. EN: the title, the way back and the action.
 * @returns PL: nagłówek ekranu. EN: the screen header.
 */
export function ScreenHeader({ title, backTo, backLabel = 'Wstecz', eyebrow, action }: ScreenHeaderProps) {
  // PL: Ekran podrzędny: trzy kolumny, środkowa z tytułem. EN: A sub-screen: three columns, the middle one with the title.
  if (backTo !== undefined) {
    return (
      <header className="ui-screen-header ui-screen-header--bar">
        <Link to={backTo} className="ui-screen-header-back">
          <span aria-hidden="true">‹</span> {backLabel}
        </Link>
        <h1 className="ui-screen-header-bar-title">{title}</h1>
        <span className="ui-screen-header-action">{action}</span>
      </header>
    );
  }

  // PL: Ekran zakładki: akcja w rogu, pod nią mały tekst i duży tytuł. EN: A tab screen: the action in the corner, below it small text and the large title.
  return (
    <header className="ui-screen-header ui-screen-header--large">
      {action !== undefined ? <span className="ui-screen-header-action ui-screen-header-action--corner">{action}</span> : null}
      {eyebrow !== undefined ? <p className="ui-screen-header-eyebrow">{eyebrow}</p> : null}
      <h1 className="ui-screen-header-title">{title}</h1>
    </header>
  );
}
