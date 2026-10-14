/**
 * PL: Przycisk „Zdjęcie” na pasku edytora. Otwiera wybór pliku, wysyła zdjęcie przez uploadEditorPhoto i wstawia je do treści wpisu. Podczas wysyłki blokuje przycisk i pokazuje informację, a błąd pokazuje po polsku pod paskiem.
 * EN: The "Zdjęcie" button on the editor toolbar. It opens the file picker, sends the photo with uploadEditorPhoto and inserts it into the entry content. While sending it disables the button and shows a note, and it shows the error in Polish under the toolbar.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/media/index.ts::uploadEditorPhoto
 * @uses src/features/news/editor/photoNode.ts::photoImageNode
 * @uses src/features/news/editor/photoNode.ts::photoErrorMessage
 * @uses src/features/news/editor/texts.ts::TO_AGREE
 * @used_by src/features/news/editor/EditorToolbar.tsx::PhotoButton
 */

import type { Editor } from '@tiptap/core';
import { useRef, useState, type ChangeEvent } from 'react';
import { uploadEditorPhoto } from '../../media';
import { photoErrorMessage, photoImageNode } from './photoNode';
import { TO_AGREE } from './texts';

/**
 * PL: Dane przycisku.
 * EN: Button data.
 */
export type PhotoButtonProps = {
  /** PL: Edytor, do którego wstawiamy zdjęcie. EN: The editor the photo is inserted into. */
  editor: Editor;
  /** PL: Wywoływane z adresem wstawionego zdjęcia. EN: Called with the address of the inserted photo. */
  onInserted: (src: string) => void;
};

/**
 * PL: Rysuje przycisk „Zdjęcie”, ukryte pole wyboru pliku i komunikat o wysyłce albo o błędzie.
 * EN: Draws the "Zdjęcie" button, the hidden file input and the note about the upload or the error.
 *
 * @param props - PL: edytor. EN: the editor.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function PhotoButton({ editor, onInserted }: PhotoButtonProps) {
  // PL: Ukryte pole wyboru pliku, otwierane przyciskiem.
  // EN: The hidden file input, opened by the button.
  const input = useRef<HTMLInputElement>(null);
  // PL: Czy trwa wysyłka i ostatni komunikat błędu (null: brak).
  // EN: Whether an upload is running and the last error message (null: none).
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PL: Po wyborze pliku wyczyść pole (żeby ten sam plik dało się wybrać ponownie), wyślij zdjęcie i wstaw je do treści.
  // EN: After a file is picked, clear the field (so the same file can be picked again), send the photo and insert it into the content.
  async function handleChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setSending(true);
    setError(null);
    try {
      const photo = await uploadEditorPhoto(file);
      if (editor.isDestroyed) return;
      // PL: Kursor zostaje za zdjęciem, a nie na nim, bo zaznaczone zdjęcie zamieniłoby się w tekst przy pierwszym znaku.
      // EN: The cursor stays after the photo, not on it, because a selected photo would be replaced by the first typed character.
      editor.chain().focus().insertContent(photoImageNode(photo), { updateSelection: false }).run();
      onInserted(photo.src);
    } catch (failure) {
      setError(photoErrorMessage(failure));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button type="button" className="editor-tool" aria-label={TO_AGREE.buttons.photo} disabled={sending} onClick={() => input.current?.click()}>
        {TO_AGREE.buttons.photo}
      </button>
      <input ref={input} type="file" accept="image/*" hidden onChange={handleChange} />
      {/* PL: Informacja podczas wysyłki. EN: The note while sending. */}
      {sending ? <p className="editor-toolbar__message" role="status">{TO_AGREE.photo.sending}</p> : null}
      {/* PL: Błąd pod paskiem, czytany przez czytnik ekranu. EN: The error under the toolbar, read by a screen reader. */}
      {error ? <p className="editor-toolbar__message editor-error" role="alert">{error}</p> : null}
    </>
  );
}
