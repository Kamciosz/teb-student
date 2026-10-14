/**
 * PL: Testy wysyłki zdjęcia do zgłoszenia: dobre zdjęcie idzie na właściwy adres, nieczytelne zdjęcie rzuca ReportPhotoUnreadableError i nic nie wysyła, a błąd serwera daje błąd z polskim komunikatem.
 * EN: Tests of sending a photo for a report: a good photo goes to the right address, an unreadable photo throws ReportPhotoUnreadableError and sends nothing, and a server error gives an error with a Polish message.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/media/reportPhoto.ts::uploadReportPhoto
 * @uses src/features/media/reportPhoto.ts::ReportPhotoUnreadableError
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { ReportPhotoUnreadableError, uploadReportPhoto } from './reportPhoto';

/** PL: Zdjęcie testowe. EN: A test photo. */
const PHOTO = new File(['zdjecie'], 'zgloszenie.heic', { type: 'image/heic' });

/** PL: Ślad wywołań płótna z testu. EN: A record of the canvas calls from the test. */
type CanvasSpy = { width: number; height: number; toBlobArgs: unknown[] };

// PL: Płótno, które zapisuje rozmiar i argumenty zapisu JPEG.
// EN: A canvas that records its size and the JPEG save arguments.
let canvasSpy: CanvasSpy;

// PL: Podmieniamy przeglądarkowe funkcje, bo testy działają bez przeglądarki.
// EN: We replace the browser functions, because the tests run without a browser.
beforeEach(() => {
  canvasSpy = { width: 0, height: 0, toBlobArgs: [] };
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 4000, height: 3000, close: vi.fn() })));
  vi.stubGlobal('document', {
    createElement: () => ({
      get width() {
        return canvasSpy.width;
      },
      set width(value: number) {
        canvasSpy.width = value;
      },
      get height() {
        return canvasSpy.height;
      },
      set height(value: number) {
        canvasSpy.height = value;
      },
      getContext: () => ({ drawImage: vi.fn() }),
      toBlob: (callback: (blob: Blob) => void, ...args: unknown[]) => {
        canvasSpy.toBlobArgs = args;
        callback(new Blob(['jpeg'], { type: 'image/jpeg' }));
      },
    }),
  });
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ id: 'f-1' }), { status: 200 })));
});

// PL: Przywracamy oryginalne funkcje po każdym teście.
// EN: We restore the original functions after every test.
afterEach(() => {
  vi.unstubAllGlobals();
});

// PL: Grupa testów wysyłki zdjęcia do zgłoszenia.
// EN: A group of tests for sending a photo for a report.
describe('uploadReportPhoto', () => {
  // PL: Dobre zdjęcie jest zmniejszone do 1600 px, zapisane jako JPEG 0,8 i wysłane na adres zgłoszeń.
  // EN: A good photo is shrunk to 1600 px, saved as JPEG 0.8, and sent to the report address.
  it('wysyła zmniejszony JPEG na adres zdjęcia do zgłoszenia / sends the shrunk JPEG to the report photo address', async () => {
    const result = await uploadReportPhoto(PHOTO);

    expect(result).toEqual({ id: 'f-1' });
    expect(canvasSpy.width).toBe(1600);
    expect(canvasSpy.height).toBe(1200);
    expect(canvasSpy.toBlobArgs).toEqual(['image/jpeg', 0.8]);

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/media/report-photo');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'content-type': 'image/jpeg' });
  });

  // PL: Nieczytelne zdjęcie (np. HEIC, którego przeglądarka nie zdekoduje) rzuca własny błąd i nie wysyła nic, także oryginału.
  // EN: An unreadable photo (e.g. HEIC that the browser cannot decode) throws its own error and sends nothing, the original included.
  it('nieczytelne zdjęcie rzuca ReportPhotoUnreadableError i nic nie wysyła / an unreadable photo throws ReportPhotoUnreadableError and sends nothing', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => Promise.reject(new Error('nie da się odczytać'))));

    await expect(uploadReportPhoto(PHOTO)).rejects.toBeInstanceOf(ReportPhotoUnreadableError);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  // PL: Serwer odrzuca zły typ kodem 415, więc ucznia dostaje polski komunikat o typie pliku.
  // EN: The server rejects a wrong type with code 415, so the student gets a Polish message about the file type.
  it('błąd 415 serwera daje polski komunikat o typie / a 415 from the server gives a Polish message about the type', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 415 })));

    await expect(uploadReportPhoto(PHOTO)).rejects.toThrow('Ten typ pliku nie jest obsługiwany.');
  });

  // PL: Inny błąd serwera (np. 500) daje ogólny komunikat z możliwością ponowienia.
  // EN: Another server error (e.g. 500) gives a general message with a chance to retry.
  it('błąd 500 serwera daje ogólny komunikat / a 500 from the server gives a general message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })));

    await expect(uploadReportPhoto(PHOTO)).rejects.toThrow('Nie udało się wysłać pliku. Spróbuj ponownie.');
  });
});
