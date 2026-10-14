/**
 * PL: Zdjęcie do zgłoszenia: przygotowujemy je na telefonie (do 1600 px, JPEG 0,8, bez EXIF) i wysyłamy na POST /api/media/report-photo. Gdy telefon nie umie odczytać pliku (np. HEIC), nic nie wysyłamy, bo oryginał mógłby nieść GPS, a zgłoszenia anonimowe nie mogą go nieść.
 * EN: A photo for a report: we prepare it on the phone (up to 1600 px, JPEG 0.8, no EXIF) and send it to POST /api/media/report-photo. When the phone cannot read the file (e.g. HEIC), we send nothing, because the original could carry GPS, and anonymous reports cannot carry it.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/media/imagePipeline.ts::resizeOnCanvas
 * @uses src/features/media/uploadFile.ts::uploadErrorMessage
 * @used_by src/features/media/index.ts::uploadReportPhoto
 * @used_by src/features/media/reportPhoto.test.ts::uploadReportPhoto
 */

// PL: Przygotowanie zdjęcia na płótnie. Bez zapasowej ścieżki z oryginałem, bo zgłoszenie nie może go nieść.
// EN: Preparing the photo on a canvas. No fallback path with the original, because a report cannot carry it.
import { resizeOnCanvas } from './imagePipeline';
// PL: Polskie komunikaty dla kodów odpowiedzi serwera.
// EN: Polish messages for the server response codes.
import { uploadErrorMessage } from './uploadFile';

/** PL: Adres trasy zdjęcia do zgłoszenia na serwerze. EN: The address of the report photo route on the server. */
const REPORT_PHOTO_URL = '/api/media/report-photo';

/**
 * PL: Błąd: telefon nie umie odczytać zdjęcia, więc nic nie wysłano. Komunikat jest dla ucznia.
 * EN: Error: the phone cannot read the photo, so nothing was sent. The message is for the student.
 */
export class ReportPhotoUnreadableError extends Error {
  /**
   * PL: Tworzy błąd z polskim komunikatem.
   * EN: Creates the error with a Polish message.
   */
  constructor() {
    super('Nie udało się odczytać tego zdjęcia. Wybierz inne zdjęcie.');
    // PL: Nazwa błędu pozwala rozpoznać go w kodzie formularza.
    // EN: The error name lets the form code recognise it.
    this.name = 'ReportPhotoUnreadableError';
  }
}

/**
 * PL: Przygotowuje zdjęcie do zgłoszenia i wysyła je na serwer. Zwraca numer pliku. Rzuca ReportPhotoUnreadableError, gdy telefon nie odczyta zdjęcia (wtedy nic nie wysyła), a zwykły Error z polskim komunikatem, gdy serwer albo sieć zawiedzie.
 * EN: Prepares a photo for a report and sends it to the server. Returns the file id. Throws ReportPhotoUnreadableError when the phone cannot read the photo (then it sends nothing), and a plain Error with a Polish message when the server or the network fails.
 *
 * @param file - PL: wybrane zdjęcie. EN: the chosen photo.
 * @returns PL: numer przesłanego pliku. EN: the id of the uploaded file.
 * @throws ReportPhotoUnreadableError - PL: telefon nie umie odczytać zdjęcia. EN: the phone cannot read the photo.
 * @throws Error - PL: brak połączenia albo błąd serwera, z polskim komunikatem. EN: no connection or a server error, with a Polish message.
 */
export async function uploadReportPhoto(file: File): Promise<{ id: string }> {
  // PL: Zmniejszamy i zapisujemy JPEG bez EXIF. Brak wyniku znaczy, że przeglądarka nie odczytała pliku.
  // EN: We shrink and save a JPEG without EXIF. No result means the browser could not read the file.
  const photo = await resizeOnCanvas(file);
  if (!photo) throw new ReportPhotoUnreadableError();

  // PL: Wysyłamy same bajty JPEG z typem w nagłówku, bez dodatkowych pól.
  // EN: We send the JPEG bytes only, with the type in the header and no extra fields.
  let response: Response;
  try {
    response = await fetch(REPORT_PHOTO_URL, {
      method: 'POST',
      headers: { 'content-type': photo.mime },
      body: photo.body,
      credentials: 'same-origin',
    });
  } catch {
    throw new Error('Brak połączenia. Sprawdź internet i spróbuj ponownie.');
  }

  // PL: Kod błędu (np. 415 dla złego typu) zamieniamy na polski komunikat.
  // EN: An error code (e.g. 415 for a wrong type) becomes a Polish message.
  if (!response.ok) throw new Error(uploadErrorMessage(response.status));

  // PL: Serwer odpowiada numerem pliku w polu id.
  // EN: The server answers with the file id in the id field.
  const data = (await response.json()) as { id: string };
  return { id: data.id };
}
