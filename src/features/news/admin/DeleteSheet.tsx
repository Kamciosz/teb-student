/**
 * PL: Arkusz potwierdzenia usunięcia wpisu, wzorowany na arkuszu z ekranu 6.3c (przyciemnienie, arkusz od krawędzi do krawędzi, przycisk główny i „Anuluj”). Usunięcie jest nieodwracalne, więc nie dzieje się od jednego dotknięcia. Escape i dotknięcie przyciemnienia zamykają arkusz.
 * EN: The confirmation sheet for deleting an entry, modelled on the sheet from screen 6.3c (a dimmed screen, an edge-to-edge sheet, the main button and "Anuluj"). Deleting cannot be undone, so it does not happen on one tap. Escape and tapping the dimmed area close the sheet.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/admin/texts.ts::TO_AGREE
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::DeleteSheet
 */

import { useEffect, useRef } from 'react';
import type { PanelEntry } from './api';
import { SCREEN, TO_AGREE } from './texts';

/**
 * PL: Dane arkusza.
 * EN: The sheet data.
 */
export type DeleteSheetProps = {
  /** PL: Wpis do usunięcia. EN: The entry to delete. */
  entry: PanelEntry;
  /** PL: Czy usuwanie trwa (przyciski wyłączone). EN: Whether deleting is in progress (the buttons are off). */
  isDeleting: boolean;
  /** PL: Potwierdzenie usunięcia. EN: Confirming the deletion. */
  onConfirm: () => void;
  /** PL: Zamknięcie arkusza bez usuwania. EN: Closing the sheet without deleting. */
  onCancel: () => void;
};

/**
 * PL: Rysuje arkusz. Fokus trafia na „Anuluj”, żeby przypadkowy Enter niczego nie usunął.
 * EN: Draws the sheet. The focus goes to "Anuluj", so an accidental Enter deletes nothing.
 *
 * @param props - PL: wpis i funkcje arkusza. EN: the entry and the sheet functions.
 * @returns PL: drzewo elementów arkusza. EN: the tree of sheet elements.
 */
export function DeleteSheet({ entry, isDeleting, onConfirm, onCancel }: DeleteSheetProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // PL: Po otwarciu ustaw fokus na „Anuluj” i zamykaj arkusz klawiszem Escape.
  // EN: After opening, focus "Anuluj" and close the sheet with the Escape key.
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // PL: Przyciemnienie z arkuszem: tytuł, podpis z tytułem wpisu, przycisk główny i „Anuluj”.
  // EN: The dimmed area with the sheet: the title, the hint with the entry title, the main button and "Anuluj".
  return (
    <div className="na-backdrop" onClick={onCancel}>
      <div className="na-sheet" role="dialog" aria-modal="true" aria-labelledby="na-sheet-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="na-sheet-title">{TO_AGREE.sheet.title}</h2>
        <p>{entry.status === 'draft' ? TO_AGREE.sheet.draftHint(entry.title) : TO_AGREE.sheet.publishedHint(entry.title)}</p>
        <button type="button" className="na-btn" disabled={isDeleting} onClick={onConfirm}>{TO_AGREE.sheet.confirm}</button>
        <button ref={cancelRef} type="button" className="na-btn na-btn-outline" disabled={isDeleting} onClick={onCancel}>{SCREEN.cancel}</button>
      </div>
    </div>
  );
}
