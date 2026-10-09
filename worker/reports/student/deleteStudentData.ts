/**
 * PL: Kasuje dane ucznia z modułu reports przy usunięciu konta: zeruje autora jego zgłoszeń. Zgłoszenia zostają dla Samorządu, ale bez autora (docs/PLAN_APLIKACJI.md, część 3: „Jej zgłoszenia i wpisy zostają, ale bez autora”). Profil (podtor 7) wywoła funkcję przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the reports module when the account is deleted: clears the author of their reports. The reports stay for the Student Council, but without an author (docs/PLAN_APLIKACJI.md, part 3). Profile (subtrack 7) calls the function through the list in worker/shared/accountDeletion.ts.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @uses worker/db/schema/reports.ts::reports
 * @used_by worker/reports/student/index.ts::deleteReportsStudentData
 * @used_by worker/reports/student/deleteStudentData.test.ts::deleteReportsStudentData
 */

// PL: Warunek WHERE po numerze autora.
// EN: The WHERE condition on the author id.
import { eq } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../../shared';
// PL: Tabela zgłoszeń.
// EN: The reports table.
import { reports } from '../../db/schema/reports';

/**
 * PL: Zeruje autora zgłoszeń ucznia. Zgłoszenia innych uczniów zostają bez zmian.
 * EN: Clears the author of the student's reports. Other students' reports stay unchanged.
 *
 * @param input - PL: numer ucznia, którego dane znikają, i baza D1. EN: the id of the student whose data goes away, and the D1 database.
 * @returns PL: obietnica, która kończy się po zapisie. EN: a promise that settles after the write.
 * @throws PL: błąd, gdy baza odrzuci zapytanie, żeby usuwanie konta się zatrzymało. EN: an error when the database rejects the query, so the account deletion stops.
 */
export async function deleteReportsStudentData(input: DeleteStudentDataInput): Promise<void> {
  // PL: Wyzeruj autora tylko w zgłoszeniach tego ucznia (WHERE po numerze autora).
  // EN: Clear the author only in this student's reports (WHERE on the author id).
  await drizzle(input.db).update(reports).set({ authorId: null }).where(eq(reports.authorId, input.userId));
}
