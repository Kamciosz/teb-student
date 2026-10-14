/**
 * PL: Testy przygotowania zdjęcia: gdy przeglądarka nie umie zdjęcia odczytać (HEIC, HEIF), nie wysyłamy oryginału z EXIF (w tym z lokalizacją GPS), tylko zwracamy komunikat.
 * EN: Tests of the photo preparation: when the browser cannot read the photo (HEIC, HEIF), we do not send the original with its EXIF (including the GPS location), we return a message instead.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/sendMediaFile.ts::sendMediaFile
 * @uses src/features/media/imagePipeline.ts::preparePhoto
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest (w tym podstawianie globalnych funkcji).
// EN: Vitest test functions (including stubbing global functions).
import { afterEach, describe, expect, it, vi } from 'vitest';
// PL: Funkcja wysyłki, od której zaczyna się cała ścieżka zdjęcia.
// EN: The send function where the whole photo path starts.
import { sendMediaFile } from './sendMediaFile';

// PL: Po każdym teście przywracamy prawdziwe funkcje globalne.
// EN: After each test we restore the real global functions.
afterEach(() => {
  vi.unstubAllGlobals();
});

// PL: Grupa testów zdjęć, których przeglądarka nie dekoduje.
// EN: A group of tests for photos the browser does not decode.
describe('sendMediaFile dla zdjęć, których przeglądarka nie czyta', () => {
  // PL: Przeglądarka nie dekoduje HEIC, więc dekodowanie się nie udaje. Oryginał nie może pójść na serwer.
  // EN: The browser does not decode HEIC, so decoding fails. The original must not go to the server.
  it.each(['image/heic', 'image/heif'])('%s: nie wysyła oryginalnego pliku / does not send the original file', async (mime) => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('Nie umiem odczytać')));
    // PL: Serwer odpowiada jak przy udanym zapisie, więc widać, czy plik w ogóle poszedł.
    // EN: The server answers as for a successful save, so we can see whether the file was sent at all.
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ id: 'test-id' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchSpy);
    // PL: Plik z udawanymi bajtami; w prawdziwym zdjęciu EXIF z lokalizacją siedzi w nagłówku.
    // EN: A file with fake bytes; in a real photo the EXIF with the location sits in the header.
    const file = new File(['exif-gps-bajty'], 'zdjecie.heic', { type: mime });

    const result = await sendMediaFile(file);

    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
