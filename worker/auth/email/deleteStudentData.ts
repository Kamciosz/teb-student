/**
 * PL: Kasuje dane ucznia z modułu auth przy usunięciu konta: konto, sesje i oczekujące kody logowania. Profil (podtor 7) wywoła ją przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the auth module when the account is deleted: the account, the sessions and the pending sign-in codes. Profile (subtrack 7) calls it through the list in worker/shared/accountDeletion.ts.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @uses worker/db/schema/auth.ts::user
 * @used_by worker/auth/email/index.ts::deleteAuthStudentData
 * @used_by worker/auth/email/deleteStudentData.test.ts::deleteAuthStudentData
 */

// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../../shared';
// PL: Zapytania do D1 przez Drizzle.
// EN: Queries to D1 through Drizzle.
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele modułu auth.
// EN: The auth module tables.
import { user, verification } from '../../db/schema/auth';

/**
 * PL: Kasuje konto, sesje i kod logowania ucznia. Nieznany numer ucznia nic nie zmienia.
 * EN: Deletes the student's account, sessions and sign-in code. An unknown student id changes nothing.
 *
 * @param input - PL: numer ucznia, którego dane znikają, i baza D1. EN: the id of the student whose data goes away, and the D1 database.
 * @returns PL: obietnica, która kończy się po skasowaniu. EN: a promise that settles after the deletion.
 * @throws PL: błąd bazy, żeby usuwanie konta się zatrzymało. EN: a database error, so the account deletion stops.
 */
export async function deleteAuthStudentData(input: DeleteStudentDataInput): Promise<void> {
  const db = drizzle(input.db);

  // PL: Adres jest potrzebny, bo kod logowania jest zapisany pod adresem, nie pod numerem ucznia.
  // EN: The address is needed, because the sign-in code is stored under the address, not the student id.
  const [student] = await db.select({ email: user.email }).from(user).where(eq(user.id, input.userId));
  if (!student) return;

  // PL: Jedna paczka: kod i konto znikają razem. Sesje i powiązania znikają z kontem (klucze obce z onDelete cascade).
  // EN: One batch: the code and the account go away together. The sessions and links go with the account (foreign keys with onDelete cascade).
  await db.batch([
    db.delete(verification).where(eq(verification.identifier, `sign-in-otp-${student.email}`)),
    db.delete(user).where(eq(user.id, input.userId)),
  ]);
}
