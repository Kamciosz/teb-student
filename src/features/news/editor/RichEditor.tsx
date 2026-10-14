/**
 * PL: Edytor treści wpisu na Tiptap: pole z formatowaniem, pasek narzędzi i licznik znaków. Ten plik ładuje się leniwie (LazyEditor.tsx), więc ekrany ucznia nie pobierają Tiptapa. Treść zmienia się jako dokument JSON, a lista dozwolonych elementów jest ta sama co na serwerze (document/extensions.ts). Wklejony HTML (Word, Google Docs) przechodzi przez cleanPastedHtml.
 * EN: The entry content editor on Tiptap: a field with formatting, a toolbar and a character counter. This file loads lazily (LazyEditor.tsx), so student screens do not download Tiptap. The content changes as a JSON document, and the allowed element list is the same as on the server (document/extensions.ts). Pasted HTML (Word, Google Docs) goes through cleanPastedHtml.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/document/extensions.ts::NEWS_EXTENSIONS
 * @uses src/features/news/editor/EditorToolbar.tsx::EditorToolbar
 * @uses src/features/news/editor/pasteWord.ts::cleanPastedHtml
 * @used_by src/features/news/editor/LazyEditor.tsx::RichEditor
 */

import type { JSONContent } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { NEWS_EXTENSIONS } from './document/extensions';
import { MAX_TEXT_CHARS } from './document/limits';
import { EditorToolbar } from './EditorToolbar';
import { cleanPastedHtml } from './pasteWord';
import { SCREEN, TEXTS } from './texts';

/**
 * PL: Dane edytora.
 * EN: Editor data.
 */
export type RichEditorProps = {
  /** PL: Treść początkowa (po powrocie z innego kroku) albo null dla pustego wpisu. EN: The initial content (after returning from another step) or null for an empty entry. */
  content: JSONContent | null;
  /** PL: Wywoływane po każdej zmianie: dokument i liczba znaków tekstu. EN: Called after every change: the document and the number of text characters. */
  onChange: (body: JSONContent, textLength: number) => void;
};

/**
 * PL: Licznik znaków pod polem. Odświeża się przy każdej zmianie dokumentu.
 * EN: The character counter under the field. It refreshes on every document change.
 *
 * @param props - PL: edytor. EN: the editor.
 * @returns PL: akapit z licznikiem. EN: a paragraph with the counter.
 */
function Counter({ editor }: { editor: Editor }) {
  const length = useEditorState({ editor, selector: ({ editor: current }) => current.state.doc.textContent.length });
  return <p className="editor-counter">{TEXTS.counter(length, MAX_TEXT_CHARS)}</p>;
}

/**
 * PL: Rysuje edytor z paskiem narzędzi i licznikiem znaków.
 * EN: Draws the editor with the toolbar and the character counter.
 *
 * @param props - PL: treść początkowa i funkcja zmiany. EN: the initial content and the change function.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export default function RichEditor({ content, onChange }: RichEditorProps) {
  // PL: Edytor Tiptap. Pole ma etykietę „Opis” dla czytnika ekranu.
  // EN: The Tiptap editor. The field has the "Opis" label for a screen reader.
  const editor = useEditor({
    extensions: NEWS_EXTENSIONS,
    content,
    editorProps: {
      attributes: { class: 'editor-surface', role: 'textbox', 'aria-multiline': 'true', 'aria-label': SCREEN.bodyLabel },
      transformPastedHTML: cleanPastedHtml,
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON(), current.state.doc.textContent.length),
  });

  // PL: Edytor tworzy się w następnym kroku renderowania.
  // EN: The editor is created in the next render step.
  if (!editor) return null;

  return (
    <div className="editor-box">
      <EditorToolbar editor={editor} />
      {/* PL: Pole tekstowe z treścią wpisu. EN: The text field with the entry content. */}
      <EditorContent editor={editor} />
      <Counter editor={editor} />
    </div>
  );
}
