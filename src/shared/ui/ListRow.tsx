/**
 * PL: Wiersz grupowanej listy: ikona opcjonalna, tytuł, podtytuł, wartość po prawej i strzałka „›”, gdy wiersz otwiera ekran. Wiersz z akcją jest przyciskiem i pod wciśnięciem zmienia tło na --tile-2.
 * EN: A row of a grouped list: an optional icon, the title, the subtitle, the value on the right and a "›" arrow when the row opens a screen. A row with an action is a button and changes its background to --tile-2 when pressed.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-17
 * @uses src/shared/ui/ListRow.css::.ui-list-row
 * @used_by src/shared/index.ts::ListRow
 */

// PL: Typy węzłów Reacta.
// EN: The React node types.
import type { ReactNode } from 'react';
// PL: Style wiersza.
// EN: The row styles.
import './ListRow.css';

/**
 * PL: Właściwości wiersza: treść, strzałka, akcja i kolor błędu.
 * EN: Row properties: the content, the arrow, the action and the error color.
 */
export type ListRowProps = {
  /** PL: Tytuł wiersza. EN: The row title. */
  title: ReactNode;
  /** PL: Podtytuł małym tekstem pod tytułem. EN: The subtitle in small text below the title. */
  subtitle?: ReactNode;
  /** PL: Wartość po prawej, np. „Automatyczny”. EN: The value on the right, for example "Automatyczny". */
  value?: ReactNode;
  /** PL: Ikona przed tytułem (ozdobna, bez tekstu). EN: An icon before the title (decorative, no text). */
  icon?: ReactNode;
  /** PL: Czy strzałka „›” ma być widoczna, bo wiersz otwiera ekran. EN: Whether the "›" arrow is shown, because the row opens a screen. */
  chevron?: boolean;
  /** PL: Czy wiersz jest czynnością na czerwono, np. „Usuń konto”. EN: Whether the row is a red action, for example "Delete account". */
  destructive?: boolean;
  /** PL: Akcja po kliknięciu. Bez niej wiersz jest zwykłym tekstem, bez przycisku. EN: The action on click. Without it the row is plain text, with no button. */
  onClick?: () => void;
  /** PL: Dodatkowa klasa od wywołującego. EN: An extra class from the caller. */
  className?: string;
};

/**
 * PL: Rysuje wiersz: przycisk, gdy jest akcja, albo zwykły blok, gdy nie ma.
 * EN: Draws the row: a button when there is an action, or a plain block when there is none.
 *
 * @param props - PL: treść i zachowanie wiersza. EN: the content and the behavior of the row.
 * @returns PL: wiersz listy. EN: the list row.
 */
export function ListRow({ title, subtitle, value, icon, chevron = false, destructive = false, onClick, className }: ListRowProps) {
  // PL: Wiersz z akcją dostaje klasę działania (wciśnięcie), a czerwony wiersz klasę błędu.
  // EN: A row with an action gets the action class (press), and a red row the error class.
  const isAction = onClick !== undefined;
  const classes = [
    'ui-list-row',
    isAction ? 'ui-list-row--action' : '',
    destructive ? 'ui-list-row--destructive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // PL: Treść wiersza jest ta sama w przycisku i w zwykłym bloku.
  // EN: The row content is the same in the button and in the plain block.
  const content = (
    <>
      {icon !== undefined ? <span className="ui-list-row-icon" aria-hidden="true">{icon}</span> : null}
      <span className="ui-list-row-text">
        <span className="ui-list-row-title">{title}</span>
        {subtitle !== undefined ? <span className="ui-list-row-subtitle">{subtitle}</span> : null}
      </span>
      {value !== undefined ? <span className="ui-list-row-value">{value}</span> : null}
      {chevron ? <span className="ui-list-row-chevron" aria-hidden="true">›</span> : null}
    </>
  );

  // PL: Przycisk ma typ „button”, żeby nie wysłał formularza. EN: The button has the "button" type, so it does not submit a form.
  if (isAction) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
}
