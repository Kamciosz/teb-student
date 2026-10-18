/**
 * PL: Krok 2 kreatora (ekran 5.2): tytuł w polu z grupy i treść w edytorze z paskiem narzędzi. „Dalej” działa dopiero wtedy, gdy tytuł i treść nie są puste.
 * EN: Wizard step 2 (screen 5.2): the title in a field of a group and the content in the editor with the toolbar. "Dalej" works only when the title and the content are not empty.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::TextField
 * @uses src/features/news/editor/LazyEditor.tsx::LazyEditor
 * @uses src/features/news/editor/document/limits.ts::MAX_TITLE_CHARS
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::ContentStep
 */

import type { JSONContent } from '@tiptap/core';
import { Button, ListGroup, TextField } from '../../../shared';
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
      <h2 id="editor-step-heading">{SCREEN.contentHeading}</h2>
      {/* PL: Pole tytułu z limitem znaków, w grupie jak w ustawieniach iOS. EN: The title field with a character limit, in a group as in the iOS settings. */}
      <ListGroup>
        <TextField className="editor-field" label={SCREEN.titleLabel} type="text" value={title} maxLength={MAX_TITLE_CHARS} onChange={(event) => onTitle(event.target.value)} />
      </ListGroup>
      {/* PL: Nagłówek „Opis” opisuje edytor, który ładuje się leniwie. EN: The "Opis" header describes the editor, which loads lazily. */}
      <ListGroup header={SCREEN.bodyLabel}>
        <LazyEditor content={body} onChange={onBody} />
      </ListGroup>
      <Button disabled={!canContinue} onClick={onNext}>{SCREEN.next}</Button>
    </section>
  );
}
