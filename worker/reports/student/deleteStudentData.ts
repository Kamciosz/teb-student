/**
 * PL: Kasuje dane ucznia z modułu reports przy usunięciu konta: zeruje autora jego zgłoszeń, zeruje jego numer przy zmianach etapu, które sam wykonał (gdy konto należało do osoby z Samorządu), i usuwa jego dołączenia „Mnie też”. Zgłoszenia i odpowiedzi zostają dla Samorządu, ale bez autora (docs/PLAN_APLIKACJI.md, część 3: „Jej zgłoszenia i wpisy zostają, ale bez autora”). Dołączenia znikają całkiem, bo wiążą konto z jego głosem. Profil (podtor 7) wywoła funkcję przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the reports module when the account is deleted: clears the author of their reports, clears their id on the stage changes they made (when the account belonged to a Student Council member), and deletes their "Me too" joins. The reports and answers stay for the Student Council, but without an author (docs/PLAN_APLIKACJI.md, part 3). The joins go away completely, because they tie the account to its vote. Profile (subtrack 7) calls the function through the list in worker/shared/accountDeletion.ts.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/schema/reports.ts::reportJoins
 * @uses worker/db/schema/reports.ts::reportStageChanges
 * @used_by worker/reports/student/index.ts::deleteReportsStudentData
 * @used_by worker/reports/student/deleteStudentData.test.ts::deleteReportsStudentData
 */

// PL: Warunek WHERE po numerze autora albo ucznia.
// EN: The WHERE condition on the author or student id.
import { eq } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../../shared';
// PL: Tabele zgłoszeń i dołączeń.
// EN: The reports and joins tables.
import { reportJoins, reports, reportStageChanges } from '../../db/schema/reports';

/**
 * PL: Zeruje autora zgłoszeń ucznia, zeruje jego numer w historii zmian etapu i usuwa jego dołączenia. Zgłoszenia, odpowiedzi i dołączenia innych osób zostają bez zmian.
 * EN: Clears the author of the student's reports, clears the student's id in the stage history and deletes the student's joins. Other people's reports, answers and joins stay unchanged.
 *
 * @param input - PL: numer ucznia, którego dane znikają, i baza D1. EN: the id of the student whose data goes away, and the D1 database.
 * @returns PL: obietnica, która kończy się po zapisie. EN: a promise that settles after the writes.
 * @throws PL: błąd, gdy baza odrzuci zapytanie, żeby usuwanie konta się zatrzymało. EN: an error when the database rejects the query, so the account deletion stops.
 */
export async function deleteReportsStudentData(input: DeleteStudentDataInput): Promise<void> {
  // PL: Zacznij od bazy D1 opakowanej w Drizzle.
  // EN: Start with the D1 database wrapped in Drizzle.
  const db = drizzle(input.db);
  // PL: Wyzeruj autora tylko w zgłoszeniach tego ucznia (WHERE po numerze autora).
  // EN: Clear the author only in this student's reports (WHERE on the author id).
  await db.update(reports).set({ authorId: null }).where(eq(reports.authorId, input.userId));
  // PL: Wyzeruj numer osoby z Samorządu w historii, żeby konto nie zostawiało śladu w zmianach etapu.
  // EN: Clear the Student Council member's id in the history, so the account leaves no trace in the stage changes.
  await db.update(reportStageChanges).set({ changedBy: null }).where(eq(reportStageChanges.changedBy, input.userId));
  // PL: Usuń dołączenia tego ucznia, żeby jego głos nie zostawał po koncie.
  // EN: Delete this student's joins, so their vote does not stay after the account.
  await db.delete(reportJoins).where(eq(reportJoins.userId, input.userId));
}
