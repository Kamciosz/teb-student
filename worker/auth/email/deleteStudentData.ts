/**
 * PL: Kasuje dane ucznia z modułu auth przy usunięciu konta: konto, sesje i oczekujące kody logowania. Profil (podtor 7) wywoła ją przez listę z worker/shared/accountDeletion.ts.
 * EN: Deletes the student's data from the auth module when the account is deleted: the account, the sessions and the pending sign-in codes. Profile (subtrack 7) calls it through the list in worker/shared/accountDeletion.ts.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/shared/index.ts::DeleteStudentDataInput
 * @uses worker/auth/email/runtimeAuth.ts::getRuntimeAuth
 * @used_by worker/auth/email/index.ts::deleteAuthStudentData
 * @used_by worker/auth/email/deleteStudentData.test.ts::createDeleteAuthStudentData
 */

// PL: Typ danych wejściowych, wspólny dla wszystkich modułów.
// EN: The input type shared by all modules.
import type { DeleteStudentDataInput } from '../../shared';
import { getRuntimeAuth, type RuntimeAuth } from './runtimeAuth';

/**
 * PL: Buduje funkcję kasującą. Osobna fabryka, żeby test mógł podać obiekt na pamięci zamiast D1.
 * EN: Builds the deleting function. A separate factory so a test can pass an object on memory instead of D1.
 *
 * @param getRuntime - PL: zwraca obiekt logowania. EN: returns the sign-in object.
 * @returns PL: funkcja kasująca dane ucznia. EN: the function that deletes the student's data.
 */
export function createDeleteAuthStudentData(getRuntime: () => RuntimeAuth) {
  /**
   * PL: Kasuje konto, sesje i kod logowania ucznia. Nieznany numer ucznia nic nie zmienia.
   * EN: Deletes the student's account, sessions and sign-in code. An unknown student id changes nothing.
   *
   * @param input - PL: numer ucznia, którego dane znikają. EN: the id of the student whose data goes away.
   * @returns PL: obietnica, która kończy się po skasowaniu. EN: a promise that settles after the deletion.
   * @throws PL: błąd bazy albo AuthNotConfiguredError, żeby usuwanie konta się zatrzymało. EN: a database error or AuthNotConfiguredError, so the account deletion stops.
   */
  return async function deleteAuthStudentData(input: DeleteStudentDataInput): Promise<void> {
    const { internalAdapter } = await getRuntime().auth.$context;

    // PL: Adres jest potrzebny, bo kod logowania jest zapisany pod adresem, nie pod numerem ucznia. Najpierw kod, potem konto: gdyby kasowanie konta się powiodło, a kodu nie, adres zostałby nieznany.
    // EN: The address is needed, because the sign-in code is stored under the address, not the student id. The code first, then the account: if the account deletion succeeded and the code's did not, the address would be unknown.
    const user = await internalAdapter.findUserById(input.userId);
    if (!user) return;
    await internalAdapter.deleteVerificationByIdentifier(`sign-in-otp-${user.email}`);

    // PL: Better Auth kasuje konto razem z sesjami i powiązaniami.
    // EN: Better Auth deletes the account together with its sessions and links.
    await internalAdapter.deleteUser(user.id);
  };
}

/**
 * PL: Funkcja kasująca dane ucznia z modułu auth na D1.
 * EN: The function that deletes the student's data from the auth module on D1.
 */
export const deleteAuthStudentData = createDeleteAuthStudentData(getRuntimeAuth);
