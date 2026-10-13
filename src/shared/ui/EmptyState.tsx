/**
 * PL: Pusty stan, czyli komunikat, gdy na ekranie nie ma jeszcze danych, np. „Nie ma ankiet”. Może mieć dodatkową treść, np. przycisk. Sam nie jest sterowny.
 * EN: An empty state, that is a message when a screen has no data yet, for example "There are no surveys". It can hold extra content, for example a button. It is not a control by itself.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/EmptyState.css::.ui-empty
 * @used_by src/shared/index.ts::EmptyState
 */

// PL: Typ węzła treści z Reacta.
// EN: The React content node type.
import type { ReactNode } from 'react';
// PL: Style pustego stanu.
// EN: The empty state styles.
import './EmptyState.css';

/**
 * PL: Właściwości pustego stanu: tytuł, a dodatkowa treść jest opcjonalna.
 * EN: Empty state properties: a title, and the extra content is optional.
 */
export type EmptyStateProps = {
  /** PL: Krótki komunikat, np. „Nie ma ankiet”. EN: A short message, for example "There are no surveys". */
  title: string;
  /** PL: Dodatkowa treść pod tytułem, np. przycisk. EN: Extra content below the title, for example a button. */
  children?: ReactNode;
  className?: string;
};

/**
 * PL: Rysuje pusty stan. Treść dodatkowa pojawia się tylko wtedy, gdy ją podano.
 * EN: Draws the empty state. The extra content appears only when it is given.
 *
 * @param props - PL: tytuł i opcjonalna treść. EN: the title and the optional content.
 * @returns PL: pusty stan. EN: the empty state.
 */
export function EmptyState({ title, children, className }: EmptyStateProps) {
  // PL: Połącz klasę bazową z klasą od wywołującego.
  // EN: Join the base class with the caller's class.
  const classes = ['ui-empty', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <p className="ui-empty-title">{title}</p>
      {children ? <div className="ui-empty-body">{children}</div> : null}
    </div>
  );
}
