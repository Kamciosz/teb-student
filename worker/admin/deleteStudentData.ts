/**
 * PL: Kasuje dane ucznia z modułu admin przy usunięciu konta: jego role w panelu. Kody zaproszeń zostają, bo nie mają wystawcy (leżą w tabeli verification podtoru 1b bez numeru ucznia). Profil (podtor 7) wywoła funkcję przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the admin module when the account is deleted: their panel roles. Invitation codes stay, because they have no issuer (they live in the verification table of subtrack 1b without a student id). Profile (subtrack 7) calls the function through the list in worker/shared/accountDeletion.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/db/schema/admin.ts::panelRoles
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @used_by worker/admin/index.ts::deleteAdminStudentData
 * @used_by worker/admin/deleteStudentData.test.ts::deleteAdminStudentData
 */

// PL: Warunek „równa się” i klient bazy do kasowania.
// EN: The "equals" condition and the database client for deleting.
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela ról w panelu.
// EN: The panel roles table.
import { panelRoles } from '../db/schema/admin';
// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../shared';

/**
 * PL: Kasuje dane ucznia z modułu admin. Role innych uczniów zostają.
 * EN: Deletes the student's data from the admin module. Other students' roles stay.
 *
 * @param input - PL: numer ucznia, którego dane znikają, i baza. EN: the id of the student whose data goes away, and the database.
 * @returns PL: obietnica, która kończy się po skasowaniu. EN: a promise that settles after the deletion.
 * @throws PL: przy błędzie bazy, żeby usuwanie konta się zatrzymało. EN: on a database error, so the account deletion stops.
 */
export async function deleteAdminStudentData(input: DeleteStudentDataInput): Promise<void> {
  // PL: Skasuj role tylko tego ucznia (warunek WHERE po numerze ucznia).
  // EN: Delete only this student's roles (a WHERE condition on the student id).
  await drizzle(input.db).delete(panelRoles).where(eq(panelRoles.userId, input.userId));
}
