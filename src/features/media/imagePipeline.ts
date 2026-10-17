/**
 * PL: Przygotowanie zdjęcia na telefonie: obrót wg orientacji z pliku, zmniejszenie do 1600 px dłuższego boku i zapis JPEG 0.8. Przerysowanie na płótnie usuwa EXIF (w tym lokalizację). Gdy przeglądarka nie umie zdjęcia odczytać (np. HEIC), nie wysyłamy oryginału, bo niósłby EXIF z lokalizacją, tylko zwracamy komunikat z prośbą o JPG lub PNG.
 * EN: Preparing a photo on the phone: rotation by the orientation from the file, shrinking to a 1600 px longer side, and saving as JPEG 0.8. Redrawing on a canvas removes EXIF (including the location). When the browser cannot read the photo (e.g. HEIC), we do not send the original, because it would carry EXIF with the location; we return a message asking for JPG or PNG instead.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/dimensions.ts::fitWithin
 * @used_by src/features/media/sendMediaFile.ts::sendMediaFile
 * @used_by src/features/media/reportPhoto.ts::uploadReportPhoto
 * @used_by src/features/media/imagePipeline.test.ts::sendMediaFile
 */

// PL: Zmniejszanie wymiarów do zadanego dłuższego boku.
// EN: Shrinking the dimensions to a given longer side.
import { fitWithin } from './dimensions';

/** PL: Dłuższy bok zdjęcia po zmniejszeniu w pikselach. EN: The longer side of the photo after shrinking, in pixels. */
export const PHOTO_MAX_SIDE = 1600;

/** PL: Jakość zapisu JPEG. EN: The JPEG save quality. */
export const PHOTO_JPEG_QUALITY = 0.8;

/**
 * PL: Komunikat, gdy przeglądarka nie umie odczytać zdjęcia. Tekst zatwierdzony przez właściciela, a docs/projekt/EKRANY.md go nie zawiera.
 * EN: The message when the browser cannot read the photo. The text is approved by the owner, because docs/projekt/EKRANY.md does not contain it.
 */
export const PHOTO_FORMAT_MESSAGE = 'Tego formatu zdjęcia nie da się wysłać. Wybierz zdjęcie w formacie JPG albo PNG.';

/** PL: Zdjęcie gotowe do wysłania. EN: A photo ready to send. */
export type PreparedPhoto = {
  ok: true;
  body: Blob;
  mime: string;
  width: number | null;
  height: number | null;
};

/** PL: Wynik przygotowania: zdjęcie albo komunikat po polsku. EN: The preparation result: a photo, or a Polish message. */
export type PhotoResult = PreparedPhoto | { ok: false; message: string };

/**
 * PL: Przygotowuje zdjęcie do wysyłki. Zmniejsza i przerysowuje je na płótnie. Gdy się nie uda, zwraca komunikat, a oryginału nie wysyła, bo mógłby nieść EXIF z lokalizacją.
 * EN: Prepares a photo for sending. It shrinks and redraws it on a canvas. When that fails, it returns a message, and does not send the original, because it could carry EXIF with the location.
 *
 * @param file - PL: wybrany plik zdjęcia. EN: the chosen photo file.
 * @returns PL: zdjęcie do wysyłki albo komunikat. EN: the photo to send, or a message.
 */
export async function preparePhoto(file: File): Promise<PhotoResult> {
  const resized = await resizeOnCanvas(file);
  if (resized) return resized;
  // PL: Przeglądarka nie umie odczytać zdjęcia (np. HEIC), więc nie wysyłamy oryginału. Prosimy o JPG albo PNG.
  // EN: The browser cannot read the photo (e.g. HEIC), so we do not send the original. We ask for JPG or PNG.
  return { ok: false, message: PHOTO_FORMAT_MESSAGE };
}

/**
 * PL: Zmniejsza zdjęcie na płótnie i zapisuje JPEG. Zwraca null, gdy przeglądarka nie umie tego zrobić.
 * EN: Shrinks the photo on a canvas and saves a JPEG. Returns null when the browser cannot do it.
 *
 * @param file - PL: plik zdjęcia. EN: the photo file.
 * @returns PL: zdjęcie po przerobieniu albo null. EN: the processed photo, or null.
 */
export async function resizeOnCanvas(file: File): Promise<PreparedPhoto | null> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return null;
  }
  const target = fitWithin({ width: bitmap.width, height: bitmap.height }, PHOTO_MAX_SIDE);
  const canvas = document.createElement('canvas');
  canvas.width = target.width;
  canvas.height = target.height;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, target.width, target.height);
  bitmap.close();
  const body = await canvasToJpeg(canvas);
  if (!body) return null;
  return { ok: true, body, mime: 'image/jpeg', width: target.width, height: target.height };
}

/**
 * PL: Zapisuje płótno jako JPEG o ustalonej jakości.
 * EN: Saves the canvas as a JPEG of the set quality.
 *
 * @param canvas - PL: płótno z przerysowanym zdjęciem. EN: the canvas with the redrawn photo.
 * @returns PL: plik JPEG albo null. EN: the JPEG file, or null.
 */
function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', PHOTO_JPEG_QUALITY));
}

/**
 * PL: Odczytuje długość filmu w sekundach przez element wideo. Zwraca null, gdy przeglądarka nie zna długości.
 * EN: Reads the length of a video in seconds through a video element. Returns null when the browser does not know the length.
 *
 * @param file - PL: plik filmu. EN: the video file.
 * @returns PL: długość w sekundach albo null. EN: the length in seconds, or null.
 */
export function readVideoDuration(file: Blob): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    // PL: Zwalniamy adres i zwracamy wynik, niezależnie od tego, jak film się wczytał.
    // EN: We release the address and return the result, however the video loaded.
    const finish = (seconds: number | null) => {
      URL.revokeObjectURL(url);
      resolve(seconds);
    };
    video.preload = 'metadata';
    video.onloadedmetadata = () => finish(Number.isFinite(video.duration) ? video.duration : null);
    video.onerror = () => finish(null);
    video.src = url;
  });
}
