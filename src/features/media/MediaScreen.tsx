/**
 * PL: Ekran podtoru 2 (wysyłka zdjęć i filmów): jedno pole wyboru pliku, komunikat o wyniku i podgląd wysłanego zdjęcia w miniaturze. Teksty są zatwierdzone przez właściciela.
 * EN: The screen of subtrack 2 (photo and video upload): one file picker, a result message and a preview of the sent photo as a thumbnail. The texts are approved by the owner.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/sendMediaFile.ts::sendMediaFile
 * @uses src/features/media/mediaUrls.ts::mediaUrls
 * @used_by src/features/media/index.ts::MediaScreen
 */

// PL: Stan ekranu i zdarzenia pola wyboru.
// EN: The screen state and the file picker events.
import { useState, type ChangeEvent } from 'react';
// PL: Wysyłka pliku i adresy miniatur.
// EN: File sending and the thumbnail addresses.
import { sendMediaFile } from './sendMediaFile';
import { mediaUrls, type MediaVariant } from './mediaUrls';

/** PL: Ostatnio wysłane zdjęcie do podglądu. EN: The last sent photo for the preview. */
type LastPhoto = MediaVariant & { alt: string };

/**
 * PL: Rysuje ekran wysyłki: wybór pliku, stan wysyłania, komunikat i podgląd zdjęcia.
 * EN: Draws the upload screen: file choice, sending state, message and photo preview.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function MediaScreen() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<LastPhoto | null>(null);

  /**
   * PL: Wysyła wybrany plik i pokazuje wynik.
   * EN: Sends the chosen file and shows the result.
   *
   * @param event - PL: zdarzenie zmiany pola pliku. EN: the file field change event.
   */
  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage('');
    const result = await sendMediaFile(file);
    setBusy(false);
    // PL: Pole zerujemy, żeby ten sam plik dało się wybrać ponownie.
    // EN: We clear the field so the same file can be chosen again.
    event.target.value = '';
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage('Plik został wysłany.');
    if (file.type.startsWith('image/')) {
      setPreview({ ...mediaUrls({ id: result.id, width: result.width, height: result.height }).thumb, alt: 'Wysłane zdjęcie' });
    }
  }

  return (
    <main className="media-screen" data-subtrack="2">
      <h1>Zdjęcia i filmy</h1>
      {/* PL: Podpowiedź, jaki plik można wybrać i jakie ma limity. EN: The hint on which file can be chosen and its limits. */}
      <p>Wybierz zdjęcie albo krótki film (do 30 sekund, do 50 MB).</p>
      <label>
        Wybierz plik
        <input type="file" accept="image/*,video/*" onChange={handleChange} disabled={busy} />
      </label>
      {busy && <p role="status">Wysyłanie…</p>}
      {!busy && message && <p role="status">{message}</p>}
      {preview && <img src={preview.url} alt={preview.alt} width={preview.width ?? undefined} height={preview.height ?? undefined} />}
    </main>
  );
}
