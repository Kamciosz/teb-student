/**
 * PL: Jedno wejście do wysyłki: film idzie przez reguły filmu (rozmiar, potem długość) i bez przeróbek, a zdjęcie przez przygotowanie JPEG. Wynik to numer pliku albo polski komunikat.
 * EN: One entry point for sending: a video goes through the video rules (size, then length) and is sent unchanged, and a photo goes through the JPEG preparation. The result is a file id or a Polish message.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/videoRules.ts::checkVideoFile
 * @uses src/features/media/imagePipeline.ts::preparePhoto
 * @uses src/features/media/imagePipeline.ts::readVideoDuration
 * @uses src/features/media/uploadFile.ts::uploadFile
 * @used_by src/features/media/MediaScreen.tsx::MediaScreen
 */

// PL: Reguły filmu i przygotowanie zdjęcia.
// EN: The video rules and the photo preparation.
import { checkVideoFile } from './videoRules';
import { preparePhoto, readVideoDuration } from './imagePipeline';
// PL: Wysyłka na serwer.
// EN: Sending to the server.
import { uploadFile, type UploadResult } from './uploadFile';

/**
 * PL: Wysyła wybrany plik: film bez przeróbek po sprawdzeniu, zdjęcie po przygotowaniu.
 * EN: Sends the chosen file: a video unchanged after the check, a photo after preparation.
 *
 * @param file - PL: plik wybrany przez użytkownika. EN: the file chosen by the user.
 * @returns PL: wynik wysyłki. EN: the upload result.
 */
export async function sendMediaFile(file: File): Promise<UploadResult> {
  if (file.type.startsWith('video/')) return sendVideo(file);
  return sendPhoto(file);
}

/**
 * PL: Sprawdza film (rozmiar przed długością) i wysyła go bez zmian.
 * EN: Checks the video (size before length) and sends it unchanged.
 *
 * @param file - PL: plik filmu. EN: the video file.
 * @returns PL: wynik wysyłki. EN: the upload result.
 */
async function sendVideo(file: File): Promise<UploadResult> {
  const check = await checkVideoFile(file, () => readVideoDuration(file));
  if (!check.ok) return { ok: false, message: check.message };
  return uploadFile({ body: file, mime: file.type, width: null, height: null });
}

/**
 * PL: Przygotowuje zdjęcie i wysyła je.
 * EN: Prepares the photo and sends it.
 *
 * @param file - PL: plik zdjęcia. EN: the photo file.
 * @returns PL: wynik wysyłki. EN: the upload result.
 */
async function sendPhoto(file: File): Promise<UploadResult> {
  const photo = await preparePhoto(file);
  if (!photo.ok) return { ok: false, message: photo.message };
  return uploadFile(photo);
}
