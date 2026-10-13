/**
 * PL: Reguły filmu po stronie telefonu: najwyżej 50 MB i najwyżej 30 sekund. Rozmiar sprawdzamy przed odczytem długości, bo to tanie. Film nie jest przekodowywany, więc za duży albo za długi film po prostu nie zostaje wysłany.
 * EN: The video rules on the phone side: at most 50 MB and at most 30 seconds. We check the size before reading the length, because it is cheap. The video is not transcoded, so a video that is too big or too long is simply not sent.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/media/sendMediaFile.ts::sendMediaFile
 * @used_by src/features/media/videoRules.test.ts::checkVideoFile
 */

/** PL: Jeden megabajt w bajtach. EN: One megabyte in bytes. */
const MEGABYTE = 1024 * 1024;

/** PL: Najwięcej bajtów filmu. EN: The most bytes of a video. */
export const VIDEO_MAX_BYTES = 50 * MEGABYTE;

/** PL: Najdłuższy film w sekundach. EN: The longest video in seconds. */
export const VIDEO_MAX_SECONDS = 30;

/** PL: Wynik sprawdzenia: w porządku albo komunikat po polsku dla użytkownika. EN: The check result: fine, or a Polish message for the user. */
export type VideoCheck = { ok: true } | { ok: false; message: string };

/**
 * PL: Sprawdza rozmiar filmu. Robimy to przed odczytem długości, żeby nie czytać ogromnego pliku.
 * EN: Checks the size of the video. We do it before reading the length, so we do not read a huge file.
 *
 * @param bytes - PL: rozmiar pliku w bajtach. EN: the file size in bytes.
 * @returns PL: wynik sprawdzenia. EN: the check result.
 */
export function checkVideoSize(bytes: number): VideoCheck {
  // PL: Ponad limit film odrzucamy od razu.
  // EN: Above the limit we reject the video at once.
  if (bytes > VIDEO_MAX_BYTES) return { ok: false, message: 'Film jest za duży. Można wysłać najwyżej 50 MB.' };
  return { ok: true };
}

/**
 * PL: Sprawdza długość filmu. Gdy przeglądarka nie umie odczytać długości, film odrzucamy.
 * EN: Checks the length of the video. When the browser cannot read the length, we reject the video.
 *
 * @param seconds - PL: długość w sekundach albo null, gdy nie udało się jej odczytać. EN: the length in seconds, or null when it could not be read.
 * @returns PL: wynik sprawdzenia. EN: the check result.
 */
export function checkVideoDuration(seconds: number | null): VideoCheck {
  // PL: Bez odczytu długości nie wiemy, czy film mieści się w limicie.
  // EN: Without the length we do not know whether the video fits the limit.
  if (seconds === null) return { ok: false, message: 'Nie udało się odczytać filmu. Spróbuj inny plik.' };
  // PL: Film dłuższy niż limit odrzucamy.
  // EN: A video longer than the limit is rejected.
  if (seconds > VIDEO_MAX_SECONDS) return { ok: false, message: 'Film jest za długi. Może mieć najwyżej 30 sekund.' };
  return { ok: true };
}

/**
 * PL: Sprawdza cały film: najpierw rozmiar, a długość czytamy dopiero wtedy, gdy rozmiar jest w porządku.
 * EN: Checks the whole video: the size first, and the length is read only when the size is fine.
 *
 * @param file - PL: rozmiar filmu. EN: the size of the video.
 * @param readDuration - PL: odczyt długości w sekundach (wywoływany tylko przy poprawnym rozmiarze). EN: reads the length in seconds (called only when the size is fine).
 * @returns PL: wynik sprawdzenia. EN: the check result.
 */
export async function checkVideoFile(
  file: { size: number },
  readDuration: () => Promise<number | null>,
): Promise<VideoCheck> {
  const bySize = checkVideoSize(file.size);
  if (!bySize.ok) return bySize;
  return checkVideoDuration(await readDuration());
}
