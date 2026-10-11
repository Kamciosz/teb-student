/**
 * PL: Kasuje dane ucznia z modułu profile przy usunięciu konta: wiersz profilu (imię, klasa, szkoła i wybór palety). Profil (podtor 7) wywołuje ją przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the profile module when the account is deleted: the profile row (name, class, school and palette choice). Profile (subtrack 7) calls it through the list in worker/shared/accountDeletion.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @uses worker/db/schema/profile.ts::profiles
 * @used_by worker/profile/index.ts::deleteProfileStudentData
 * @used_by worker/profile/deleteStudentData.test.ts::deleteProfileStudentData
 */

// PL: Warunek równości i Drizzle dla D1.
// EN: The equality condition and Drizzle for D1.
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela profili.
// EN: The profiles table.
import { profiles } from '../db/schema/profile';
// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../shared';

/**
 * PL: Kasuje dane ucznia z modułu profile. Cudze profile zostają.
 * EN: Deletes the student's data from the profile module. Other people's profiles stay.
 *
 * @param input - PL: numer ucznia, którego dane znikają, i baza. EN: the id of the student whose data goes away, and the database.
 * @returns PL: obietnica, która kończy się po skasowaniu. EN: a promise that settles after the deletion.
 * @throws PL: przy błędzie bazy, żeby usuwanie konta się zatrzymało. EN: on a database error, so the account deletion stops.
 */
export async function deleteProfileStudentData(input: DeleteStudentDataInput): Promise<void> {
  // PL: Skasuj profil tylko tego ucznia (warunek WHERE po numerze ucznia).
  // EN: Delete only this student's profile (a WHERE condition on the student id).
  await drizzle(input.db).delete(profiles).where(eq(profiles.userId, input.userId));
}
