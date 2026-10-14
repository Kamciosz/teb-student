/**
 * PL: Okienko pod paskiem narzędzi, w którym redaktor wpisuje opis zdjęcia dla osób niewidomych (atrybut alt) i podpis. Pola mają limit MAX_CAPTION_CHARS. Escape zamyka okienko bez zmian.
 * EN: The panel under the toolbar where the editor types the photo description for blind people (the alt attribute) and the caption. The fields have the MAX_CAPTION_CHARS limit. Escape closes the panel without changes.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/editor/document/limits.ts::MAX_CAPTION_CHARS
 * @uses src/features/news/editor/photoCaption.ts::captionAttrs
 * @uses src/features/news/editor/texts.ts::TO_AGREE
 * @used_by src/features/news/editor/EditorToolbar.tsx::PhotoCaptionPanel
 */

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { MAX_CAPTION_CHARS } from './document/limits';
import { captionAttrs, type CaptionAttrs } from './photoCaption';
import { TO_AGREE } from './texts';

/**
 * PL: Dane okienka.
 * EN: Panel data.
 */
export type PhotoCaptionPanelProps = {
  /** PL: Obecny opis zdjęcia. EN: The current photo description. */
  alt: string;
  /** PL: Obecny podpis. EN: The current caption. */
  caption: string;
  /** PL: Wywoływane po „Zapisz” z przyciętymi wartościami. EN: Called after "Zapisz" (save) with the cut values. */
  onSubmit: (attrs: CaptionAttrs) => void;
  /** PL: Wywoływane po „Anuluj” i po Escape. EN: Called after "Anuluj" (cancel) and after Escape. */
  onCancel: () => void;
};

/**
 * PL: Rysuje okienko z dwoma polami i przyciskami „Zapisz” i „Anuluj”.
 * EN: Draws the panel with two fields and the "Zapisz" (save) and "Anuluj" (cancel) buttons.
 *
 * @param props - PL: dane okienka. EN: the panel data.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function PhotoCaptionPanel({ alt, caption, onSubmit, onCancel }: PhotoCaptionPanelProps) {
  // PL: Wpisane wartości, na starcie obecne wartości zdjęcia.
  // EN: The typed values, at the start the current values of the photo.
  const [altText, setAltText] = useState(alt);
  const [captionText, setCaptionText] = useState(caption);

  // PL: Zapis przycina wartości do limitu, zanim trafią do edytora.
  // EN: Saving cuts the values to the limit before they reach the editor.
  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmit(captionAttrs(altText, captionText));
  }

  // PL: Escape zamyka okienko bez zapisu.
  // EN: Escape closes the panel without saving.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    onCancel();
  }

  return (
    <form className="editor-panel" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <label className="editor-label">
        {TO_AGREE.captionPanel.alt}
        <input className="editor-input" type="text" value={altText} maxLength={MAX_CAPTION_CHARS} onChange={(event) => setAltText(event.target.value)} autoFocus />
      </label>
      <label className="editor-label">
        {TO_AGREE.captionPanel.caption}
        <input className="editor-input" type="text" value={captionText} maxLength={MAX_CAPTION_CHARS} onChange={(event) => setCaptionText(event.target.value)} />
      </label>
      <div className="editor-row">
        <button type="submit" className="editor-button">{TO_AGREE.captionPanel.save}</button>
        <button type="button" className="editor-button editor-button--outline" onClick={onCancel}>{TO_AGREE.prompt.cancel}</button>
      </div>
    </form>
  );
}
