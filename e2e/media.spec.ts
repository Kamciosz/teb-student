/**
 * PL: Test wysyłki w podtorze 2: zdjęcie zmniejszone do 1600 px i bez EXIF, za duży film odrzucony przed wysyłką oraz komunikat po odpowiedzi 403. Wysyłkę podstawiamy przez page.route, bo serwer wymaga zalogowanego redaktora.
 * EN: Test of the upload in subtrack 2: a photo shrunk to 1600 px and without EXIF, an oversized video rejected before sending, and a message after a 403 response. The upload is stubbed with page.route, because the server requires a signed-in editor.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/MediaScreen.tsx::MediaScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page } from '@playwright/test';
// PL: Zapis plików testowych na dysk.
// EN: Writing the test files to disk.
import { writeFileSync } from 'node:fs';

/** PL: Adres ekranu podtoru 2. EN: The address of the subtrack 2 screen. */
const SCREEN_PATH = '/media/wysylka';

/** PL: Wzorzec adresu wysyłki na serwer. EN: The pattern of the upload address on the server. */
const UPLOAD_URL = '**/api/media/upload*';

/** PL: Komunikat dla za dużego filmu. EN: The message for an oversized video. */
const TOO_LARGE_VIDEO = 'Film jest za duży. Można wysłać najwyżej 50 MB.';

/** PL: Rozmiar filmu: megabajt ponad limit 50 MB. EN: The video size: one megabyte above the 50 MB limit. */
const OVERSIZED_VIDEO_BYTES = 51 * 1024 * 1024;

/** PL: Znacznik nagłówka EXIF, którego nie może być w wysłanym pliku. EN: The EXIF header marker that must not be in the sent file. */
const EXIF_MARK = Buffer.from('Exif\0\0', 'latin1');

/** PL: Najdłuższy bok zdjęcia po zmniejszeniu. EN: The longer side of the photo after shrinking. */
const MAX_SIDE = 1600;

/** PL: Wysłane żądanie: adres, typ zawartości i treść. EN: A sent request: the address, the content type and the body. */
type Posted = { url: string; type: string; body: Buffer };

/**
 * PL: Tworzy w przeglądarce zdjęcie JPEG o podanych wymiarach (kolorowy gradient na płótnie).
 * EN: Creates a JPEG photo of the given size in the browser (a colourful gradient on a canvas).
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param width - PL: szerokość w pikselach. EN: the width in pixels.
 * @param height - PL: wysokość w pikselach. EN: the height in pixels.
 * @returns PL: bajty pliku JPEG. EN: the bytes of the JPEG file.
 */
async function makePhotoInBrowser(page: Page, width: number, height: number): Promise<Buffer> {
  const dataUrl = await page.evaluate(
    ({ w, h }: { w: number; h: number }) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('brak kontekstu płótna / no canvas context');
      const gradient = context.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#2060c0');
      gradient.addColorStop(1, '#f0a020');
      context.fillStyle = gradient;
      context.fillRect(0, 0, w, h);
      return canvas.toDataURL('image/jpeg', 0.9);
    },
    { w: width, h: height },
  );
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

/**
 * PL: Wkleja do JPEG segment EXIF (APP1) tuż za znacznikiem SOI, jak robi aparat.
 * EN: Inserts an EXIF (APP1) segment right after the SOI marker into a JPEG, as a camera does.
 *
 * @param jpeg - PL: plik JPEG bez EXIF. EN: the JPEG file without EXIF.
 * @returns PL: plik JPEG z EXIF. EN: the JPEG file with EXIF.
 */
function withExif(jpeg: Buffer): Buffer {
  // PL: Minimalny nagłówek TIFF: MM, liczba 42, przesunięcie 8, zero wpisów, brak następnego katalogu.
  // EN: A minimal TIFF header: MM, number 42, offset 8, zero entries, no next directory.
  const tiff = Buffer.from('4d4d002a00000008' + '0000' + '00000000', 'hex');
  const payload = Buffer.concat([EXIF_MARK, tiff]);
  const length = Buffer.alloc(2);
  length.writeUInt16BE(payload.length + 2);
  const segment = Buffer.concat([Buffer.from([0xff, 0xe1]), length, payload]);
  return Buffer.concat([jpeg.subarray(0, 2), segment, jpeg.subarray(2)]);
}

/**
 * PL: Odczytuje wymiary JPEG z ramki SOF (szerokość i wysokość).
 * EN: Reads the JPEG dimensions from the SOF frame (width and height).
 *
 * @param jpeg - PL: bajty pliku JPEG. EN: the bytes of the JPEG file.
 * @returns PL: szerokość i wysokość w pikselach. EN: the width and height in pixels.
 */
function readJpegSize(jpeg: Buffer): { width: number; height: number } {
  // PL: Przeskakujemy segmenty z długością, aż trafimy na ramkę SOF (C0-C3).
  // EN: We skip the segments with a length until we reach the SOF frame (C0-C3).
  let offset = 2;
  while (offset + 4 <= jpeg.length) {
    const marker = jpeg[offset + 1];
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: jpeg.readUInt16BE(offset + 5), width: jpeg.readUInt16BE(offset + 7) };
    }
    offset += 2 + jpeg.readUInt16BE(offset + 2);
  }
  throw new Error('brak ramki SOF w JPEG / no SOF frame in the JPEG');
}

/**
 * PL: Podstawia wysyłkę: zapamiętuje każde żądanie i odpowiada kodem podanym w argumencie.
 * EN: Stubs the upload: remembers every request and answers with the given status.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param posted - PL: lista, do której trafiają żądania. EN: the list the requests go to.
 * @param status - PL: kod odpowiedzi serwera. EN: the server response code.
 * @param json - PL: treść odpowiedzi. EN: the response body.
 */
async function stubUpload(page: Page, posted: Posted[], status: number, json: object): Promise<void> {
  await page.route(UPLOAD_URL, async (route) => {
    const request = route.request();
    posted.push({ url: request.url(), type: request.headers()['content-type'] ?? '', body: request.postDataBuffer() ?? Buffer.alloc(0) });
    await route.fulfill({ status, json });
  });
}

// PL: Zdjęcie 2400 na 1200 z EXIF: po wysyłce najdłuższy bok ma 1600 px, a w pliku nie ma EXIF.
// EN: A 2400 by 1200 photo with EXIF: after sending the longest side is 1600 px, and the file has no EXIF.
test('zdjęcie z EXIF zmniejszone do 1600 px i bez EXIF / a photo with EXIF shrunk to 1600 px and without EXIF', async ({ page }, testInfo) => {
  await page.goto(SCREEN_PATH);
  const original = withExif(await makePhotoInBrowser(page, 2400, 1200));
  // PL: Sprawdzamy, że wejście naprawdę ma EXIF, inaczej test nic nie dowodzi.
  // EN: We check that the input really has EXIF, otherwise the test proves nothing.
  expect(original.includes(EXIF_MARK)).toBe(true);
  const path = testInfo.outputPath('zdjecie.jpg');
  writeFileSync(path, original);

  const posted: Posted[] = [];
  await stubUpload(page, posted, 201, { id: 'test-zdjecie' });
  await page.locator('input[type="file"]').setInputFiles(path);

  await expect(page.getByRole('status')).toHaveText('Plik został wysłany.');
  expect(posted).toHaveLength(1);
  const [post] = posted;
  expect(post.type).toBe('image/jpeg');
  expect(readJpegSize(post.body)).toEqual({ width: MAX_SIDE, height: 800 });
  expect(post.body.includes(EXIF_MARK)).toBe(false);
  await expect(page.getByRole('img', { name: 'Wysłane zdjęcie' })).toHaveAttribute('src', '/api/media/test-zdjecie');
});

// PL: Film 51 MB jest odrzucany przed wysyłką, więc żądanie do serwera nie idzie wcale.
// EN: A 51 MB video is rejected before sending, so no request goes to the server at all.
test('film za duży odrzucony przed wysyłką / an oversized video rejected before sending', async ({ page }, testInfo) => {
  await page.goto(SCREEN_PATH);
  const posted: Posted[] = [];
  await stubUpload(page, posted, 201, { id: 'nie-powinno-byc' });
  const path = testInfo.outputPath('za-duzy.mp4');
  writeFileSync(path, Buffer.alloc(OVERSIZED_VIDEO_BYTES));

  await page.locator('input[type="file"]').setInputFiles(path);

  await expect(page.getByRole('status')).toHaveText(TOO_LARGE_VIDEO);
  expect(posted).toHaveLength(0);
});

// PL: Uczeń bez roli redaktora dostaje 403 i widzi polski komunikat, a nie techniczny kod.
// EN: A student without the editor role gets 403 and sees a Polish message, not a technical code.
test('odpowiedź 403 daje polski komunikat / a 403 response gives a Polish message', async ({ page }, testInfo) => {
  await page.goto(SCREEN_PATH);
  const posted: Posted[] = [];
  await stubUpload(page, posted, 403, { error: 'forbidden' });
  const path = testInfo.outputPath('uczen.jpg');
  writeFileSync(path, await makePhotoInBrowser(page, 800, 600));

  await page.locator('input[type="file"]').setInputFiles(path);

  await expect(page.getByRole('status')).toHaveText('Nie masz uprawnień do wysyłania zdjęć i filmów.');
  expect(posted).toHaveLength(1);
});
