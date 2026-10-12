/**
 * PL: Podgląd treści wpisu: ten sam dokument rysuje Tiptap w trybie tylko do odczytu, w ramce o stylu czytnika ucznia (znaczniki h2, p, ul, blockquote). Ładuje się leniwie razem z edytorem. Dokument pochodzi z edytora, a nie z HTML od użytkownika.
 * EN: The entry content preview: Tiptap draws the same document in read-only mode, in a frame styled like the student reader (the h2, p, ul and blockquote tags). It loads lazily together with the editor. The document comes from the editor, not from user HTML.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/document/extensions.ts::NEWS_EXTENSIONS
 * @used_by src/features/news/editor/LazyEditor.tsx::RichPreview
 */

import type { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { NEWS_EXTENSIONS } from './document/extensions';

/**
 * PL: Dane podglądu.
 * EN: Preview data.
 */
export type RichPreviewProps = {
  /** PL: Dokument z edytora. EN: The document from the editor. */
  content: JSONContent;
};

/**
 * PL: Rysuje treść w trybie tylko do odczytu.
 * EN: Draws the content in read-only mode.
 *
 * @param props - PL: dokument. EN: the document.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export default function RichPreview({ content }: RichPreviewProps) {
  // PL: Edytor bez możliwości pisania: tylko rysuje dokument.
  // EN: An editor without typing: it only draws the document.
  const editor = useEditor({ extensions: NEWS_EXTENSIONS, content, editable: false });
  return <EditorContent editor={editor} className="editor-preview" />;
}
