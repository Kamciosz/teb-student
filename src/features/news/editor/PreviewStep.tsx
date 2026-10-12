/**
 * PL: Krok 3 kreatora (ekran 5.3): podgląd wpisu w układzie, który zobaczy uczeń (znacznik typu, źródło z chwilą, tytuł, treść) oraz przyciski „Zapisz szkic i dokończ później” i „Opublikuj”. Pod przyciskami jest komunikat o błędzie zapisu.
 * EN: Wizard step 3 (screen 5.3): the entry preview in the layout the student will see (the type tag, the source with the moment, the title, the content) and the "Zapisz szkic i dokończ później" and "Opublikuj" buttons. Under the buttons is the save error message.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/LazyEditor.tsx::LazyPreview
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::PreviewStep
 */

import type { JSONContent } from '@tiptap/core';
import { LazyPreview } from './LazyEditor';
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
  return (
    <section className="editor-step" aria-labelledby="editor-step-heading">
      <h1 id="editor-step-heading">{SCREEN.previewHeading}</h1>
      {/* PL: Podgląd wpisu jak u ucznia: znacznik typu, źródło z chwilą, tytuł i treść. EN: The entry preview as for the student: the type tag, the source with the moment, the title and the content. */}
      <article className="editor-entry">
        <p className="editor-entry__meta">
          <span className="editor-tag">{SCREEN.types[type]}</span>
          <small>Samorząd · teraz</small>
        </p>
        <h2 className="editor-entry__title">{title}</h2>
        <LazyPreview content={body} />
      </article>
      <button type="button" className="editor-button editor-button--outline editor-button--wide" disabled={isSaving} onClick={() => onSave('draft')}>{SCREEN.saveDraft}</button>
      <button type="button" className="editor-button editor-button--wide" disabled={isSaving} onClick={() => onSave('published')}>{isSaving ? TO_AGREE.saving : SCREEN.publish}</button>
      {/* PL: Błąd zapisu. Czytnik ekranu odczytuje go od razu. EN: The save error. A screen reader reads it at once. */}
      {message ? <p role="alert" className="editor-error">{message}</p> : null}
    </section>
  );
}
