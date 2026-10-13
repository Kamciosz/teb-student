/**
 * PL: Kasuje dane ucznia z modułu media przy usunięciu konta: zeruje autora jego zdjęć i filmów. Pliki zostają dla redakcji, ale bez autora (tak jak zgłoszenia w podtorze 4a). Profil (podtor 7) wywoła ją przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the media module when the account is deleted: clears the author of their photos and videos. The files stay for the editorial team, but without an author (like the reports of subtrack 4a). Profile (subtrack 7) calls it through the list in worker/shared/accountDeletion.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @uses worker/db/schema/media.ts::mediaFiles
 * @used_by worker/media/index.ts::deleteMediaStudentData
 * @used_by worker/media/deleteStudentData.test.ts::deleteMediaStudentData
 */

// PL: Warunek WHERE po numerze autora.
// EN: The WHERE condition on the author id.
import { eq } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../shared';
// PL: Tabela plików.
// EN: The files table.
import { mediaFiles } from '../db/schema/media';

/**
 * PL: Zeruje autora plików ucznia. Pliki innych osób zostają bez zmian.
 * EN: Clears the author of the student's files. Other people's files stay unchanged.
 *
 * @param input - PL: numer ucznia, którego dane znikają, i baza D1. EN: the id of the student whose data goes away, and the D1 database.
 * @returns PL: obietnica, która kończy się po zapisie. EN: a promise that settles after the write.
 * @throws PL: błąd, gdy baza odrzuci zapytanie, żeby usuwanie konta się zatrzymało. EN: an error when the database rejects the query, so the account deletion stops.
 */
export async function deleteMediaStudentData(input: DeleteStudentDataInput): Promise<void> {
  // PL: Wyzeruj autora tylko w plikach tego ucznia (WHERE po numerze autora). Sam plik w R2 zostaje.
  // EN: Clear the author only in this student's files (WHERE on the author id). The file in R2 stays.
  await drizzle(input.db).update(mediaFiles).set({ uploadedBy: null }).where(eq(mediaFiles.uploadedBy, input.userId));
}
