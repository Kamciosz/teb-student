/**
 * PL: Kasuje dane ucznia z modułu surveys przy usunięciu konta: zapis, że uczeń wypełnił ankietę (odpowiedzi są anonimowe i nie wiążą się z uczniem). Na razie nic nie robi, bo moduł nie ma jeszcze tabel z danymi ucznia. Profil (podtor 7) wywoła ją przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the surveys module when the account is deleted: the record that the student filled in a survey (answers are anonymous and not linked to the student). It does nothing for now, because the module has no tables with student data yet. Profile (subtrack 7) calls it through the list in worker/shared/accountDeletion.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @used_by worker/surveys/vote/index.ts::deleteSurveysStudentData
 * @used_by worker/surveys/vote/deleteStudentData.test.ts::deleteSurveysStudentData
 */

// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../../shared';

/**
 * PL: Kasuje dane ucznia z modułu surveys.
 * EN: Deletes the student's data from the surveys module.
 *
 * @param _input - PL: numer ucznia, którego dane znikają. Gdy funkcja zacznie kasować dane, zmienia nazwę na input. EN: the id of the student whose data goes away. When the function starts deleting data, it is renamed to input.
 * @returns PL: obietnica, która kończy się po skasowaniu. EN: a promise that settles after the deletion.
 * @throws PL: na razie nigdy. Po dodaniu zapytań błąd bazy ma przerwać usuwanie konta. EN: never for now. After queries are added, a database error must stop the account deletion.
 */
export async function deleteSurveysStudentData(_input: DeleteStudentDataInput): Promise<void> {
  // PL: Moduł nie ma jeszcze tabel z danymi ucznia, więc nie ma czego kasować. Agent podtoru 5a dopisze tu zapytanie z warunkiem WHERE po numerze ucznia i zmieni test.
  // EN: The module has no tables with student data yet, so there is nothing to delete. The agent of subtrack 5a adds a query with a WHERE condition on the student id here and changes the test.
}
