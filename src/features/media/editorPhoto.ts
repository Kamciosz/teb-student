/**
 * PL: Zdjęcie do treści wpisu w edytorze: przygotowanie JPEG, wysyłka na POST /api/media/upload i adres do wyświetlenia. Błąd zamieniamy na wyjątek z polskim komunikatem. Oryginału nie wysyłamy nawet wtedy, gdy przeglądarka go nie czyta, bo niósłby EXIF z lokalizacją.
 * EN: A photo for the post content in the editor: JPEG preparation, upload to POST /api/media/upload, and the address to display. An error becomes an exception with a Polish message. We do not send the original even when the browser cannot read it, because it would carry EXIF with the location.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/media/imagePipeline.ts::preparePhoto
 * @uses src/features/media/uploadFile.ts::uploadFile
 * @uses src/features/media/mediaUrls.ts::mediaUrls
 * @used_by src/features/media/index.ts::uploadEditorPhoto
 * @used_by src/features/media/editorPhoto.test.ts::uploadEditorPhoto
 */

// PL: Przygotowanie zdjęcia i wysyłka na serwer.
// EN: Photo preparation and sending to the server.
import { preparePhoto } from './imagePipeline';
import { uploadFile } from './uploadFile';
// PL: Adres zdjęcia do wyświetlenia.
// EN: The address of the photo to display.
import { mediaUrls } from './mediaUrls';

/** PL: Zdjęcie wstawione do treści wpisu. EN: A photo inserted into the post content. */
export type EditorPhoto = { id: string; src: string; width: number | null; height: number | null };

/**
 * PL: Przygotowuje zdjęcie, wysyła je na serwer i zwraca numer, adres i wymiary po zmniejszeniu. Gdy przygotowanie albo wysyłka się nie uda, rzuca błąd z polskim komunikatem.
 * EN: Prepares the photo, sends it to the server and returns the id, the address and the dimensions after shrinking. When the preparation or the upload fails, it throws an error with a Polish message.
 *
 * @param file - PL: zdjęcie wybrane w edytorze. EN: the photo chosen in the editor.
 * @returns PL: zdjęcie gotowe do wstawienia w treści. EN: the photo ready to insert into the content.
 * @throws PL: błąd z komunikatem dla użytkownika. EN: an error with a message for the user.
 */
export async function uploadEditorPhoto(file: File): Promise<EditorPhoto> {
  // PL: Zmniejszamy zdjęcie i przerysowujemy je, żeby usunąć EXIF.
  // EN: We shrink the photo and redraw it to remove the EXIF.
  const photo = await preparePhoto(file);
  if (!photo.ok) throw new Error(photo.message);
  // PL: Wysyłamy na serwer. Serwer sprawdza rolę redaktora.
  // EN: We send it to the server. The server checks the editor role.
  const result = await uploadFile(photo);
  if (!result.ok) throw new Error(result.message);
  // PL: Adres pełnego zdjęcia z numeru pliku. Wymiary bierzemy z wysyłki (po zmniejszeniu do 1600 px), a nie z miniatury.
  // EN: The address of the full photo from the file id. The dimensions come from the upload (after shrinking to 1600 px), not from the thumbnail.
  const src = mediaUrls({ id: result.id, width: result.width, height: result.height }).full.url;
  return { id: result.id, src, width: result.width, height: result.height };
}
