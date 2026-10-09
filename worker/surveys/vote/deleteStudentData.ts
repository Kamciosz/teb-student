/**
 * PL: Kasuje dane ucznia z modułu surveys przy usunięciu konta: zapis, że uczeń wypełnił ankietę (survey_participation). Odpowiedzi są anonimowe i nie wiążą się z uczniem, więc zostają w licznikach, tak jak przy każdej anonimowej ankiecie.
 *     Baza przychodzi w input.db.
 *     Profil (podtor 7) wywoła ją przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the surveys module when the account is deleted: the record that the student filled in a survey (survey_participation). The answers are anonymous and not linked to the student, so they stay in the counters, as with any anonymous survey.
 *     The database comes in input.db.
 *     Profile (subtrack 7) calls it through the list in worker/shared/accountDeletion.ts.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @uses worker/surveys/vote/queries.ts::buildParticipationDelete
 * @used_by worker/surveys/vote/index.ts::deleteSurveysStudentData
 * @used_by worker/surveys/vote/deleteStudentData.test.ts::deleteSurveysStudentData
 */

// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../../shared';
// PL: Otwarcie bazy.
// EN: Opening the database.
import { openDatabase } from './database';
// PL: Zapytanie kasujące.
// EN: The deleting query.
import { buildParticipationDelete } from './queries';

/**
 * PL: Kasuje dane ucznia z modułu surveys.
 * EN: Deletes the student's data from the surveys module.
 *
 * @param input - PL: numer ucznia, którego dane znikają. EN: the id of the student whose data goes away.
 * @returns PL: obietnica, która kończy się po skasowaniu. EN: a promise that settles after the deletion.
 * @throws PL: błąd bazy: usuwanie konta ma się wtedy zatrzymać. EN: a database error: the account deletion must stop then.
 */
export async function deleteSurveysStudentData(input: DeleteStudentDataInput): Promise<void> {
  // PL: Skasuj tylko wiersze tego ucznia (warunek WHERE po numerze ucznia).
  // EN: Delete only this student's rows (a WHERE condition on the student id).
  await buildParticipationDelete(openDatabase(input.db), input.userId);
}
