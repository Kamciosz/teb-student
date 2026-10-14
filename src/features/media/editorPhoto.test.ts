/**
 * PL: Testy wysyłki zdjęcia do edytora: zdjęcie idzie na POST /api/media/upload z wymiarami po zmniejszeniu, wynik ma adres /api/media/<id>, a błąd serwera daje polski komunikat.
 * EN: Tests of sending a photo to the editor: the photo goes to POST /api/media/upload with the dimensions after shrinking, the result has the address /api/media/<id>, and a server error gives a Polish message.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/media/editorPhoto.ts::uploadEditorPhoto
 * @uses src/features/media/imagePipeline.ts::PHOTO_FORMAT_MESSAGE
 * @uses src/features/media/uploadFile.ts::uploadErrorMessage
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest (w tym podstawianie globalnych funkcji).
// EN: Vitest test functions (including stubbing global functions).
import { afterEach, describe, expect, it, vi } from 'vitest';
// PL: Funkcja, którą sprawdzamy, i komunikaty, których oczekujemy.
// EN: The function under test, and the messages we expect.
import { uploadEditorPhoto } from './editorPhoto';
import { PHOTO_FORMAT_MESSAGE } from './imagePipeline';
import { uploadErrorMessage } from './uploadFile';

// PL: Po każdym teście przywracamy prawdziwe funkcje globalne.
// EN: After each test we restore the real global functions.
afterEach(() => {
  vi.unstubAllGlobals();
});

// PL: Podstawia przeglądarkę: zdjęcie o podanym rozmiarze i płótno, które zapisuje JPEG. Test działa bez prawdziwego obrazu.
// EN: Stubs the browser: a photo of the given size and a canvas that saves a JPEG. The test runs without a real image.
function stubBrowserPhoto(width: number, height: number) {
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width, height, close: vi.fn() })));
  // PL: Płótno z kontekstem do rysowania i zapisem JPEG.
  // EN: A canvas with a drawing context and a JPEG save.
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage: vi.fn() }),
    toBlob: (callback: (blob: Blob | null) => void) => callback(new Blob(['jpeg'], { type: 'image/jpeg' })),
  };
  vi.stubGlobal('document', { createElement: () => canvas });
}

// PL: Serwer odpowiada jak przy udanym zapisie z numerem pliku.
// EN: The server answers as for a successful save with a file id.
function stubServer(status: number, body: unknown) {
  const fetchSpy = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

// PL: Grupa testów wysyłki zdjęcia do edytora.
// EN: A group of tests for sending a photo to the editor.
describe('uploadEditorPhoto', () => {
  // PL: Zdjęcie 4000×3000 zmniejszamy do 1600×1200, więc test sprawdza, że wysyłamy wymiary po zmniejszeniu.
  // EN: A 4000×3000 photo shrinks to 1600×1200, so the test checks that we send the dimensions after shrinking.
  it('wysyła JPEG na POST /api/media/upload z wymiarami po zmniejszeniu / sends the JPEG to POST /api/media/upload with the dimensions after shrinking', async () => {
    stubBrowserPhoto(4000, 3000);
    const fetchSpy = stubServer(201, { id: 'abc' });
    const file = new File(['zdjecie'], 'zdjecie.jpg', { type: 'image/jpeg' });

    await uploadEditorPhoto(file);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/media/upload?width=1600&height=1200');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'content-type': 'image/jpeg' });
  });

  // PL: Wynik ma numer pliku, adres /api/media/<id> i wymiary po zmniejszeniu (nie oryginału).
  // EN: The result has the file id, the address /api/media/<id> and the dimensions after shrinking (not the original's).
  it('zwraca numer, adres /api/media/<id> i wymiary po zmniejszeniu / returns the id, the address /api/media/<id> and the dimensions after shrinking', async () => {
    stubBrowserPhoto(4000, 3000);
    stubServer(201, { id: 'abc' });
    const file = new File(['zdjecie'], 'zdjecie.jpg', { type: 'image/jpeg' });

    const photo = await uploadEditorPhoto(file);

    expect(photo).toEqual({ id: 'abc', src: '/api/media/abc', width: 1600, height: 1200 });
  });

  // PL: Błąd uprawnień (403) zamienia się na polski komunikat z wyjątku.
  // EN: A permission error (403) becomes a Polish message in the exception.
  it('403 rzuca polski komunikat o uprawnieniach / 403 throws the Polish permission message', async () => {
    stubBrowserPhoto(4000, 3000);
    stubServer(403, { error: 'forbidden' });
    const file = new File(['zdjecie'], 'zdjecie.jpg', { type: 'image/jpeg' });

    await expect(uploadEditorPhoto(file)).rejects.toThrow(uploadErrorMessage(403));
  });

  // PL: Błąd serwera (500) daje ogólny komunikat z możliwością ponowienia.
  // EN: A server error (500) gives a general message with a chance to retry.
  it('500 rzuca ogólny komunikat z ponowieniem / 500 throws the general message with a retry', async () => {
    stubBrowserPhoto(4000, 3000);
    stubServer(500, { error: 'internal' });
    const file = new File(['zdjecie'], 'zdjecie.jpg', { type: 'image/jpeg' });

    await expect(uploadEditorPhoto(file)).rejects.toThrow('Nie udało się wysłać pliku. Spróbuj ponownie.');
  });

  // PL: Zdjęcia, których przeglądarka nie czyta (HEIC), nie wysyłamy w oryginale, bo niesie EXIF z lokalizacją. Dostajemy komunikat i żadnego zapytania do serwera.
  // EN: Photos the browser cannot read (HEIC) are not sent as the original, because it carries EXIF with the location. We get a message and no request to the server.
  it('HEIC rzuca komunikat o formacie i nie wysyła nic / HEIC throws the format message and sends nothing', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('Nie umiem odczytać')));
    const fetchSpy = stubServer(201, { id: 'abc' });
    const file = new File(['exif-gps-bajty'], 'zdjecie.heic', { type: 'image/heic' });

    await expect(uploadEditorPhoto(file)).rejects.toThrow(PHOTO_FORMAT_MESSAGE);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
