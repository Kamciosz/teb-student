/**
 * PL: Krok 2 kreatora (ekran 5.2): tytuł i treść w edytorze z paskiem narzędzi. „Dalej” działa dopiero wtedy, gdy tytuł i treść nie są puste.
 * EN: Wizard step 2 (screen 5.2): the title and the content in the editor with the toolbar. "Dalej" works only when the title and the content are not empty.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/LazyEditor.tsx::LazyEditor
 * @uses src/features/news/editor/document/limits.ts::MAX_TITLE_CHARS
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::ContentStep
 */

import type { JSONContent } from '@tiptap/core';
import { MAX_TITLE_CHARS } from './document/limits';
import { LazyEditor } from './LazyEditor';
import { SCREEN } from './texts';

/**
 * PL: Dane kroku.
 * EN: Step data.
 */
export type ContentStepProps = {
  /** PL: Tytuł. EN: The title. */
  title: string;
  /** PL: Treść (null: jeszcze nic nie wpisano). EN: The content (null: nothing typed yet). */
  body: JSONContent | null;
  /** PL: Liczba znaków tekstu w treści. EN: The number of text characters in the content. */
  textLength: number;
  /** PL: Zmiana tytułu. EN: Changing the title. */
  onTitle: (title: string) => void;
  /** PL: Zmiana treści. EN: Changing the content. */
  onBody: (body: JSONContent, textLength: number) => void;
  /** PL: Przejście do kroku 3. EN: Moving to step 3. */
  onNext: () => void;
};

/**
 * PL: Rysuje krok 2.
 * EN: Draws step 2.
 *
 * @param props - PL: tytuł, treść i funkcje zmiany. EN: the title, the content and the change functions.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function ContentStep({ title, body, textLength, onTitle, onBody, onNext }: ContentStepProps) {
  // PL: „Dalej” jest aktywne, gdy jest tytuł i jakikolwiek tekst.
  // EN: "Dalej" is active when there is a title and any text.
  const canContinue = title.trim() !== '' && textLength > 0;
  return (
    <section className="editor-step" aria-labelledby="editor-step-heading">
      <h1 id="editor-step-heading">{SCREEN.contentHeading}</h1>
      {/* PL: Pole tytułu z limitem znaków. EN: The title field with a character limit. */}
      <label className="editor-label">
        {SCREEN.titleLabel}
        <input className="editor-input" type="text" value={title} maxLength={MAX_TITLE_CHARS} onChange={(event) => onTitle(event.target.value)} />
      </label>
      {/* PL: Etykieta „Opis” opisuje edytor, który ładuje się leniwie. EN: The "Opis" label describes the editor, which loads lazily. */}
      <p className="editor-label">{SCREEN.bodyLabel}</p>
      <LazyEditor content={body} onChange={onBody} />
      <button type="button" className="editor-button editor-button--wide" disabled={!canContinue} onClick={onNext}>{SCREEN.next}</button>
    </section>
  );
}
