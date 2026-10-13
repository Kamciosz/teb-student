/**
 * PL: Wysyłka pliku do serwera: POST /api/media/upload z typem w nagłówku i wymiarami w adresie. Błędy zamieniamy na polskie komunikaty dla użytkownika.
 * EN: Sending the file to the server: POST /api/media/upload with the type in the header and the dimensions in the address. Errors become Polish messages for the user.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/media/sendMediaFile.ts::sendMediaFile
 * @used_by src/features/media/uploadFile.test.ts::uploadErrorMessage
 */

/** PL: Adres API podtoru 2. EN: The API address of subtrack 2. */
const API_URL = '/api/media';

/** PL: Plik gotowy do wysłania z wymiarami (albo null, gdy nieznane). EN: A file ready to send with its dimensions (or null when unknown). */
export type UploadBody = { body: Blob; mime: string; width: number | null; height: number | null };

/** PL: Wynik wysyłki: numer pliku i wymiary, albo komunikat po polsku. EN: The upload result: the file id and the dimensions, or a Polish message. */
export type UploadResult =
  | { ok: true; id: string; width: number | null; height: number | null }
  | { ok: false; message: string };

/**
 * PL: Zwraca polski komunikat dla kodu odpowiedzi serwera.
 * EN: Returns a Polish message for the server response code.
 *
 * @param status - PL: kod odpowiedzi HTTP. EN: the HTTP response code.
 * @returns PL: komunikat dla użytkownika. EN: the message for the user.
 */
export function uploadErrorMessage(status: number): string {
  if (status === 401) return 'Zaloguj się, aby wysłać plik.';
  if (status === 403) return 'Nie masz uprawnień do wysyłania zdjęć i filmów.';
  if (status === 413) return 'Plik jest za duży.';
  if (status === 415) return 'Ten typ pliku nie jest obsługiwany.';
  return 'Nie udało się wysłać pliku. Spróbuj ponownie.';
}

/**
 * PL: Wysyła plik na serwer i zwraca numer pliku albo komunikat. Błąd sieci też dostaje komunikat.
 * EN: Sends the file to the server and returns the file id or a message. A network error also gets a message.
 *
 * @param file - PL: plik do wysłania. EN: the file to send.
 * @returns PL: wynik wysyłki. EN: the upload result.
 */
export async function uploadFile(file: UploadBody): Promise<UploadResult> {
  const query = file.width === null || file.height === null ? '' : `?width=${file.width}&height=${file.height}`;
  let response: Response;
  try {
    response = await fetch(`${API_URL}/upload${query}`, {
      method: 'POST',
      headers: { 'content-type': file.mime },
      body: file.body,
      credentials: 'same-origin',
    });
  } catch {
    return { ok: false, message: 'Brak połączenia. Sprawdź internet i spróbuj ponownie.' };
  }
  if (!response.ok) return { ok: false, message: uploadErrorMessage(response.status) };
  const data = (await response.json()) as { id: string };
  return { ok: true, id: data.id, width: file.width, height: file.height };
}
