/**
 * PL: Arkusz (sheet) to okno wysuwane od dołu, np. wybór lub potwierdzenie. Używa natywnego <dialog>, więc fokus wraca do przycisku, który go otworzył, a Escape zamyka okno. Gdy otwarty, przeglądarka blokuje resztę strony. Zamknięcie przez Escape idzie do onClose.
 * EN: A sheet is a window that slides up from the bottom, for example a choice or a confirmation. It uses the native <dialog>, so the focus returns to the button that opened it, and Escape closes the window. When open, the browser blocks the rest of the page. Closing with Escape goes to onClose.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Sheet.css::.ui-sheet
 * @used_by src/shared/index.ts::Sheet
 */

// PL: Hooki Reacta: unikalny numer, odwołanie do elementu i skutek po wyrenderowaniu.
// EN: React hooks: a unique id, a reference to the element and an effect after rendering.
import { useEffect, useId, useRef, type ReactNode } from 'react';
// PL: Style arkusza.
// EN: The sheet styles.
import './Sheet.css';

/**
 * PL: Właściwości arkusza: czy otwarty, co robi zamknięcie, tytuł dla czytnika i treść.
 * EN: Sheet properties: whether it is open, what closing does, the title for the screen reader and the content.
 */
export type SheetProps = {
  /** PL: Czy arkusz jest otwarty. EN: Whether the sheet is open. */
  open: boolean;
  /** PL: Wywoływane przy Escape; to rodzic decyduje, czy zamknąć (ustawia open na false). EN: Called on Escape; the parent decides whether to close (sets open to false). */
  onClose: () => void;
  /** PL: Tytuł arkusza, czytany jako nazwa okna. EN: The sheet title, read as the window name. */
  title: string;
  children: ReactNode;
  className?: string;
};

/**
 * PL: Rysuje arkusz. Otwarcie i zamknięcie idzie przez showModal i close, bo tylko one dają fokus i blokadę tła. Escape nie zamyka sam, tylko zgłasza onClose, żeby rodzic miał ostatnie słowo.
 * EN: Draws the sheet. Opening and closing go through showModal and close, because only they give the focus and the background block. Escape does not close by itself, it only reports onClose, so the parent has the last word.
 *
 * @param props - PL: stan, zamknięcie, tytuł i treść. EN: the state, the close action, the title and the content.
 * @returns PL: okno arkusza. EN: the sheet window.
 */
export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  // PL: Numer dla tytułu, żeby okno wskazywało swój tytuł (aria-labelledby).
  // EN: An id for the title, so the window points at its own title (aria-labelledby).
  const titleId = useId();
  // PL: Odwołanie do elementu dialog, żeby sterować nim z efektu.
  // EN: A reference to the dialog element, to control it from the effect.
  const dialogRef = useRef<HTMLDialogElement>(null);

  // PL: Po zmianie open otwórz modalnie albo zamknij, zależnie od stanu. Warunek unika podwójnego wywołania.
  // EN: After a change of open, open it as a modal or close it, depending on the state. The check avoids a double call.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // PL: Połącz klasę bazową z klasą od wywołującego.
  // EN: Join the base class with the caller's class.
  const classes = ['ui-sheet', className].filter(Boolean).join(' ');

  return (
    <dialog
      ref={dialogRef}
      className={classes}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // PL: Escape przeglądarka zamyka sama; przechwytujemy to, żeby stan w rodzicu został zgodny.
        // EN: The browser closes on Escape by itself; we catch it so the parent state stays in step.
        event.preventDefault();
        onClose();
      }}
    >
      <div className="ui-sheet-body">
        <h2 id={titleId} className="ui-sheet-title">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
