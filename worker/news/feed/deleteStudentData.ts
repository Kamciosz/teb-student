/**
 * PL: Kasuje dane ucznia z modułu news przy usunięciu konta: zdejmuje autorstwo z jego wpisów, a same wpisy zostają. Profil (podtor 7) wywoła ją przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the news module when the account is deleted: removes the authorship from his or her entries, while the entries themselves stay. Profile (subtrack 7) calls it through the list in worker/shared/accountDeletion.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @uses worker/db/schema/news.ts::newsEntries
 * @used_by worker/news/feed/index.ts::deleteNewsStudentData
 * @used_by worker/news/feed/deleteStudentData.test.ts::deleteNewsStudentData
 */

// PL: Funkcje Drizzle do warunku i zmiany wierszy.
// EN: Drizzle functions for a condition and for changing rows.
import { eq } from 'drizzle-orm';
// PL: Połączenie Drizzle z D1.
// EN: The Drizzle connection to D1.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela wpisów.
// EN: The entries table.
import { newsEntries } from '../../db/schema';
// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../../shared';

/**
 * PL: Kasuje dane ucznia z modułu news: wpisy tego konta tracą autora (author_user_id ustawia się na pusty), a wpisy zostają.
 * EN: Deletes the student's data from the news module: the entries of this account lose their author (author_user_id is set to empty), and the entries stay.
 *
 * @param input - PL: numer ucznia i baza D1. EN: the id of the student and the D1 database.
 * @returns PL: obietnica, która kończy się po skasowaniu. EN: a promise that settles after the deletion.
 * @throws PL: błąd bazy, który przerywa usuwanie konta. EN: a database error, which stops the account deletion.
 */
export async function deleteNewsStudentData(input: DeleteStudentDataInput): Promise<void> {
  // PL: Zdejmujemy autorstwo tylko z wpisów tego ucznia. Cudzych wpisów nie ruszamy.
  // EN: We remove the authorship only from this student's entries. Other people's entries are not touched.
  await drizzle(input.db)
    .update(newsEntries)
    .set({ authorUserId: null })
    .where(eq(newsEntries.authorUserId, input.userId));
}
