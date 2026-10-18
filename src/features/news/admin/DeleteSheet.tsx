/**
 * PL: Arkusz potwierdzenia usunięcia wpisu w stylu arkusza iOS: przyciemniony ekran, arkusz od dołu z tytułem, podpisem, przyciskiem „Usuń” i „Anuluj”. Usunięcie jest nieodwracalne, więc nie dzieje się od jednego dotknięcia. Escape i dotknięcie przyciemnienia zamykają arkusz.
 * EN: The confirmation sheet for deleting an entry in the iOS sheet style: a dimmed screen, a sheet from the bottom with the title, the hint, the "Usuń" button and "Anuluj". Deleting cannot be undone, so it does not happen on one tap. Escape and tapping the dimmed area close the sheet.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/shared/index.ts::Button
 * @uses src/features/news/admin/texts.ts::TEXTS
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::DeleteSheet
 */

import { useEffect, useRef } from 'react';
import { Button } from '../../../shared';
import type { PanelEntry } from './api';
import { SCREEN, TEXTS } from './texts';

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
 * PL: Dobiera podpis pod pytaniem: szkic, wpis w korekcie (uczeń go nie widział) albo opublikowany (uczniowie go widzą).
 * EN: Picks the hint under the question: a draft, an entry in review (students never saw it) or a published entry (students see it).
 *
 * @param entry - PL: wpis do usunięcia. EN: the entry to delete.
 * @returns PL: tekst podpisu. EN: the hint text.
 */
function hintFor(entry: PanelEntry): string {
  // PL: Każdy stan ma swój podpis, bo różnie wygląda skutek usunięcia.
  // EN: Each state has its own hint, because the effect of deleting differs.
  if (entry.status === 'draft') return TEXTS.sheet.draftHint(entry.title);
  return entry.status === 'in_review' ? TEXTS.sheet.reviewHint(entry.title) : TEXTS.sheet.publishedHint(entry.title);
}

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

  // PL: Przyciemnienie leży pod arkuszem jako osobne tło, więc arkusz zostaje wyraźny. Tytuł, podpis, przycisk główny i „Anuluj”.
  // EN: The dimmed area lies under the sheet as a separate backdrop, so the sheet stays clear. The title, the hint, the main button and "Anuluj".
  return (
    <div className="na-sheet-layer">
      <div className="na-backdrop" onClick={onCancel} />
      <div className="na-sheet" role="dialog" aria-modal="true" aria-labelledby="na-sheet-title">
        <h2 id="na-sheet-title">{TEXTS.sheet.title}</h2>
        <p>{hintFor(entry)}</p>
        <Button variant="destructive" disabled={isDeleting} onClick={onConfirm}>
          {TEXTS.sheet.confirm}
        </Button>
        <Button ref={cancelRef} variant="plain" disabled={isDeleting} onClick={onCancel}>
          {SCREEN.cancel}
        </Button>
      </div>
    </div>
  );
}
