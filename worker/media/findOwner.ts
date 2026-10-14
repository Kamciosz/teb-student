/**
 * PL: Sprawdza plik zdjęcia po numerze: czy istnieje i kto go wysłał. Moduł zgłoszeń (podtor 4a) używa tego, żeby uczeń mógł dołączyć tylko własne zdjęcie.
 * EN: Checks a photo by its id: whether it exists and who uploaded it. The reports module (subtrack 4a) uses it so a student can attach only their own photo.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses worker/db/schema/media.ts::mediaFiles
 * @used_by worker/media/index.ts::findMediaOwner
 */

// PL: Warunek WHERE po numerze pliku.
// EN: The WHERE condition on the file id.
import { eq } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela plików.
// EN: The files table.
import { mediaFiles } from '../db/schema/media';

/**
 * PL: Zwraca autora pliku. Brak pliku daje undefined, plik bez autora (po usunięciu konta) daje null.
 * EN: Returns the author of the file. A missing file gives undefined, a file without an author (after the account was deleted) gives null.
 *
 * @param db - PL: baza D1 (env.DB). EN: the D1 database (env.DB).
 * @param id - PL: numer pliku. EN: the file id.
 * @returns PL: undefined, gdy brak pliku; null, gdy plik bez autora; numer autora w innym przypadku. EN: undefined when there is no file; null when the file has no author; otherwise the author id.
 */
export async function findMediaOwner(db: D1Database, id: string): Promise<string | null | undefined> {
  const row = await drizzle(db).select({ uploadedBy: mediaFiles.uploadedBy }).from(mediaFiles).where(eq(mediaFiles.id, id)).get();
  return row === undefined ? undefined : row.uploadedBy;
}
