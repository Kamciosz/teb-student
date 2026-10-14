/**
 * PL: Sprawdza, czy plik jest zdjęciem dołączonym do któregoś zgłoszenia. Takie zdjęcie widzi tylko autor i administracja.
 * EN: Checks whether a file is a photo attached to some report. Such a photo is seen only by its author and the administration.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses worker/db/schema/reports.ts::reports
 * @used_by worker/reports/index.ts::isReportPhoto
 * @used_by worker/media/guardReportPhoto.ts::guardReportPhoto
 */

// PL: Klient bazy D1, funkcja porównania i tabela zgłoszeń.
// EN: The D1 database client, the comparison function and the reports table.
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { reports } from '../../db/schema/reports';

/**
 * PL: Zwraca `true`, gdy plik o podanym numerze jest zdjęciem jakiegokolwiek zgłoszenia.
 * EN: Returns `true` when the file with the given id is the photo of any report.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param photoId - PL: numer pliku. EN: the file id.
 * @returns PL: `true` dla zdjęcia zgłoszenia, inaczej `false`. EN: `true` for a report photo, otherwise `false`.
 */
export async function isReportPhoto(db: D1Database, photoId: string): Promise<boolean> {
  const row = await drizzle(db).select({ id: reports.id }).from(reports).where(eq(reports.photoId, photoId)).limit(1).get();
  return row !== undefined;
}
