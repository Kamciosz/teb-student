/**
 * PL: Krok 3 kreatora (ekran 5.3): podgląd wpisu w tym samym wyglądzie, który zobaczy uczeń. Kafel to EntryCard z listy (podtor 3a), treść to RichContent z widoku szczegółów. Pod podglądem są przyciski „Zapisz szkic i dokończ później” i „Opublikuj” oraz komunikat o błędzie zapisu.
 * EN: Wizard step 3 (screen 5.3): the entry preview in the same look the student will see. The tile is EntryCard from the list (subtrack 3a), the content is RichContent from the details view. Under the preview are the "Zapisz szkic i dokończ później" and "Opublikuj" buttons and the save error message.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/feed/index.ts::EntryCard
 * @uses src/features/news/feed/index.ts::RichContent
 * @uses src/features/news/editor/previewEntry.ts::previewEntry
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::PreviewStep
 */

import type { JSONContent } from '@tiptap/core';
import { useState } from 'react';
import { EntryCard, RichContent } from '../feed';
import { previewEntry } from './previewEntry';
import { SCREEN, TO_AGREE } from './texts';
import type { EntryType } from './TypeStep';

/**
 * PL: Dane kroku.
 * EN: Step data.
 */
export type PreviewStepProps = {
  /** PL: Typ wpisu. EN: The entry type. */
  type: EntryType;
  /** PL: Tytuł. EN: The title. */
  title: string;
  /** PL: Treść. EN: The content. */
  body: JSONContent;
  /** PL: Czy trwa wysyłka (przyciski wyłączone). EN: Whether sending is in progress (the buttons are off). */
  isSaving: boolean;
  /** PL: Komunikat o błędzie wysyłki albo null. EN: The sending error message or null. */
  message: string | null;
  /** PL: Zapis jako szkic albo publikacja. EN: Saving as a draft or publishing. */
  onSave: (status: 'draft' | 'published') => void;
};

/**
 * PL: Rysuje krok 3.
 * EN: Draws step 3.
 *
 * @param props - PL: wpis i funkcja zapisu. EN: the entry and the save function.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function PreviewStep({ type, title, body, isSaving, message, onSave }: PreviewStepProps) {
  // PL: Chwila liczona raz, przy wejściu w krok 3, żeby kafel nie zmieniał się przy każdym renderze. EN: The moment is counted once, when entering step 3, so the tile does not change on every render.
  const [publishedAt] = useState(() => new Date().toISOString());
  return (
    <section className="editor-step" aria-labelledby="editor-step-heading">
      <h1 id="editor-step-heading">{SCREEN.previewHeading}</h1>
      {/* PL: Kafel z listy. Podgląd nie ma adresu na serwerze, więc kliknięcie kafla nic nie otwiera: przechwytujemy je na wrapperze, zanim dojdzie do linku (react-router nie nawiguje po preventDefault). Fokus klawiatury zostaje na kaflu. EN: The list tile. The preview has no address on the server, so clicking the tile opens nothing: we catch the click on the wrapper before it reaches the link (react-router does not navigate after preventDefault). Keyboard focus stays on the tile. */}
      <div onClickCapture={(event) => event.preventDefault()}>
        <EntryCard entry={previewEntry(type, title, body, publishedAt)} />
      </div>
      {/* PL: Treść jak w szczegółach wpisu. Linki i film działają jak u ucznia. EN: The content as in the entry details. Links and the video work as for the student. */}
      <RichContent body={body} />
      <button type="button" className="editor-button editor-button--outline editor-button--wide" disabled={isSaving} onClick={() => onSave('draft')}>{SCREEN.saveDraft}</button>
      <button type="button" className="editor-button editor-button--wide" disabled={isSaving} onClick={() => onSave('published')}>{isSaving ? TO_AGREE.saving : SCREEN.publish}</button>
      {/* PL: Błąd zapisu. Czytnik ekranu odczytuje go od razu. EN: The save error. A screen reader reads it at once. */}
      {message ? <p role="alert" className="editor-error">{message}</p> : null}
    </section>
  );
}
