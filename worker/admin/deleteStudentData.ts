/**
 * PL: Kasuje dane ucznia z modułu admin przy usunięciu konta: jego role w panelu i wpisy dziennika, w których jest sprawcą albo tematem. Kody zaproszeń zostają, bo nie mają wystawcy (leżą w tabeli verification podtoru 1b bez numeru ucznia). Profil (podtor 7) wywoła funkcję przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the admin module when the account is deleted: their panel roles and the diary entries where they are the actor or the subject. Invitation codes stay, because they have no issuer (they live in the verification table of subtrack 1b without a student id). Profile (subtrack 7) calls the function through the list in worker/shared/accountDeletion.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/db/schema/admin.ts::panelRoles
 * @uses worker/db/schema/admin.ts::diaryEntries
 * @uses worker/admin/diary.ts::diaryEntriesOfStudent
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @used_by worker/admin/index.ts::deleteAdminStudentData
 * @used_by worker/admin/deleteStudentData.test.ts::deleteAdminStudentData
 */

// PL: Warunek „równa się” i klient bazy do kasowania.
// EN: The "equals" condition and the database client for deleting.
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele ról w panelu i dziennika zmian oraz warunek wpisów ucznia.
// EN: The panel roles and change diary tables and the condition for a student's entries.
import { diaryEntries, panelRoles } from '../db/schema/admin';
import { diaryEntriesOfStudent } from './diary';
// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../shared';

/**
 * PL: Kasuje dane ucznia z modułu admin: jego role i wpisy w dzienniku, w których jest sprawcą albo tematem. Role i wpisy idą jednym batchem. Role innych uczniów zostają.
 * EN: Deletes the student's data from the admin module: their roles and the diary entries where they are the actor or the subject. The roles and entries go in one batch. Other students' roles stay.
 *
 * @param input - PL: numer ucznia, którego dane znikają, i baza. EN: the id of the student whose data goes away, and the database.
 * @returns PL: obietnica, która kończy się po skasowaniu. EN: a promise that settles after the deletion.
 * @throws PL: przy błędzie bazy, żeby usuwanie konta się zatrzymało. EN: on a database error, so the account deletion stops.
 */
export async function deleteAdminStudentData(input: DeleteStudentDataInput): Promise<void> {
  // PL: Skasuj role i wpisy dziennika tego ucznia (warunki WHERE po numerze ucznia), w jednym batchu.
  // EN: Delete this student's roles and diary entries (WHERE conditions on the student id), in one batch.
  const db = drizzle(input.db);
  await db.batch([
    db.delete(panelRoles).where(eq(panelRoles.userId, input.userId)),
    db.delete(diaryEntries).where(diaryEntriesOfStudent(input.userId)),
  ]);
}
