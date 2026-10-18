/**
 * PL: Przycisk „Zdjęcie” na pasku edytora. Otwiera wybór pliku, wysyła zdjęcie przez uploadEditorPhoto i wstawia je do treści wpisu. Podczas wysyłki blokuje przycisk. Komunikaty (wysyłka, błąd) pokazuje pasek przez stan przekazany z zewnątrz, bo leżą pod paskiem, a nie w jego przewijanym rzędzie.
 * EN: The "Zdjęcie" button on the editor toolbar. It opens the file picker, sends the photo with uploadEditorPhoto and inserts it into the entry content. While sending it disables the button. The messages (the upload, the error) are shown by the toolbar from the state passed in, because they sit under the toolbar, not in its scrolling row.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/media/index.ts::uploadEditorPhoto
 * @uses src/features/news/editor/photoNode.ts::photoImageNode
 * @uses src/features/news/editor/photoNode.ts::photoErrorMessage
 * @uses src/features/news/editor/texts.ts::TEXTS
 * @used_by src/features/news/editor/EditorToolbar.tsx::PhotoButton
 */

import type { Editor } from '@tiptap/core';
import { useRef, type ChangeEvent } from 'react';
import { uploadEditorPhoto } from '../../media';
import { photoErrorMessage, photoImageNode } from './photoNode';
import { TEXTS } from './texts';

/**
 * PL: Stan wysyłki zdjęcia: czy trwa wysyłka i ostatni komunikat błędu (null: brak).
 * EN: The state of the photo upload: whether an upload is running and the last error message (null: none).
 */
export type PhotoStatus = { sending: boolean; error: string | null };

/**
 * PL: Dane przycisku.
 * EN: Button data.
 */
export type PhotoButtonProps = {
  /** PL: Edytor, do którego wstawiamy zdjęcie. EN: The editor the photo is inserted into. */
  editor: Editor;
  /** PL: Wywoływane z adresem wstawionego zdjęcia. EN: Called with the address of the inserted photo. */
  onInserted: (src: string) => void;
  /** PL: Aktualny stan wysyłki, trzymany przez pasek. EN: The current upload state, kept by the toolbar. */
  status: PhotoStatus;
  /** PL: Wywoływane przy każdej zmianie stanu wysyłki. EN: Called on every change of the upload state. */
  onStatus: (status: PhotoStatus) => void;
};

/**
 * PL: Rysuje przycisk „Zdjęcie” i ukryte pole wyboru pliku.
 * EN: Draws the "Zdjęcie" button and the hidden file input.
 *
 * @param props - PL: edytor, stan wysyłki i wywołania. EN: the editor, the upload state and the callbacks.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function PhotoButton({ editor, onInserted, status, onStatus }: PhotoButtonProps) {
  // PL: Ukryte pole wyboru pliku, otwierane przyciskiem.
  // EN: The hidden file input, opened by the button.
  const input = useRef<HTMLInputElement>(null);

  // PL: Po wyborze pliku wyczyść pole (żeby ten sam plik dało się wybrać ponownie), wyślij zdjęcie i wstaw je do treści.
  // EN: After a file is picked, clear the field (so the same file can be picked again), send the photo and insert it into the content.
  async function handleChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    onStatus({ sending: true, error: null });
    try {
      const photo = await uploadEditorPhoto(file);
      if (!editor.isDestroyed) {
        // PL: Kursor zostaje za zdjęciem, a nie na nim, bo zaznaczone zdjęcie zamieniłoby się w tekst przy pierwszym znaku.
        // EN: The cursor stays after the photo, not on it, because a selected photo would be replaced by the first typed character.
        editor.chain().focus().insertContent(photoImageNode(photo), { updateSelection: false }).run();
        onInserted(photo.src);
      }
      onStatus({ sending: false, error: null });
    } catch (failure) {
      onStatus({ sending: false, error: photoErrorMessage(failure) });
    }
  }

  return (
    <>
      <button type="button" className="editor-tool" aria-label={TEXTS.buttons.photo} disabled={status.sending} onClick={() => input.current?.click()}>
        {TEXTS.buttons.photo}
      </button>
      <input ref={input} type="file" accept="image/*" hidden onChange={handleChange} />
    </>
  );
}
