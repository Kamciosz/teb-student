/**
 * PL: Sprawdza zdjęcie dołączone do zgłoszenia ucznia: plik musi istnieć i należeć do ucznia, który wysyła zgłoszenie. Bez zdjęcia nie ma czego sprawdzać.
 * EN: Checks the photo attached to a student's report: the file must exist and belong to the student who sends the report. With no photo there is nothing to check.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses worker/media/index.ts::findMediaOwner
 * @used_by worker/reports/student/routes.ts::reportsStudentApp
 * @used_by worker/reports/student/routes.test.ts::reportsStudentApp
 */

// PL: Sprawdzenie właściciela pliku przez drzwi modułu media.
// EN: The owner check of the file through the door of the media module.
import { findMediaOwner } from '../../media';

/**
 * PL: Powód odrzucenia zdjęcia: kod błędu dla telefonu i status HTTP.
 * EN: The reason to reject the photo: an error code for the phone and an HTTP status.
 */
export type PhotoProblem = { status: 400 | 403; error: 'photo_not_found' | 'photo_forbidden' };

/**
 * PL: Zwraca powód odrzucenia zdjęcia albo `null`, gdy zdjęcie jest w porządku lub go nie ma.
 * EN: Returns the reason to reject the photo, or `null` when the photo is fine or there is none.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param studentId - PL: numer ucznia z sesji. EN: the student id from the session.
 * @param photoId - PL: numer zdjęcia z zapytania albo `null`. EN: the photo id from the request, or `null`.
 * @returns PL: `null` albo powód: 400, gdy pliku nie ma; 403, gdy plik jest cudzy albo bez autora. EN: `null` or the reason: 400 when there is no file; 403 when the file is someone else's or has no author.
 */
export async function checkReportPhoto(db: D1Database, studentId: string, photoId: string | null): Promise<PhotoProblem | null> {
  // PL: Zgłoszenie bez zdjęcia jest poprawne.
  // EN: A report without a photo is valid.
  if (photoId === null) return null;

  // PL: Numer autora pliku: undefined, gdy pliku nie ma; null, gdy plik nie ma autora.
  // EN: The author id of the file: undefined when there is no file; null when the file has no author.
  const owner = await findMediaOwner(db, photoId);
  if (owner === undefined) return { status: 400, error: 'photo_not_found' };

  // PL: Cudzy plik albo plik bez autora nie może trafić do zgłoszenia tego ucznia.
  // EN: Someone else's file, or a file without an author, cannot go into this student's report.
  if (owner !== studentId) return { status: 403, error: 'photo_forbidden' };
  return null;
}
