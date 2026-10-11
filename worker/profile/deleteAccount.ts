/**
 * PL: Usuwanie konta ucznia: wywołuje funkcje kasujące dane ze wszystkich modułów (lista z worker/shared/accountDeletion.ts). Konto i sesje (moduł auth) kasujemy na samym końcu. Gdyby konto zniknęło pierwsze, a potem coś by się nie udało, uczeń straciłby sesję i nie mógłby ponowić usuwania, a jego dane by zostały.
 * EN: Deleting a student's account: calls the data-deleting functions of all modules (the list from worker/shared/accountDeletion.ts). The account and sessions (the auth module) are deleted last. If the account went first and something failed afterwards, the student would lose the session and could not retry the deletion, and their data would stay.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS (wczytywana w funkcji / loaded inside the function)
 * @used_by worker/profile/routes.ts::profileApp
 * @used_by worker/profile/deleteAccount.test.ts::deleteAccount
 */

// PL: Typ wpisu listy funkcji kasujących. Samą listę wczytujemy dopiero w funkcji (patrz niżej).
// EN: The type of a deleting-function list entry. We load the list itself only inside the function (see below).
import type { StudentDataDeleter } from '../shared/accountDeletion';

/** PL: Nazwa modułu z kontem i sesjami, który kasujemy jako ostatni. EN: The name of the module with the account and sessions, deleted last. */
const ACCOUNT_MODULE = 'auth';

/**
 * PL: Usuwa dane ucznia ze wszystkich modułów, konto na końcu. Zgłoszenia i wpisy zostają bez autora (robi to funkcja ich modułu).
 * EN: Deletes the student's data from all modules, the account last. Reports and entries stay without an author (their module's function does that).
 *
 * @param input - PL: numer ucznia i baza. EN: the student id and the database.
 * @param deleters - PL: lista funkcji kasujących; bez niej ta z worker/shared/accountDeletion.ts, test podaje własną. EN: the list of deleting functions; without it the one from worker/shared/accountDeletion.ts, a test passes its own.
 * @returns PL: obietnica, która kończy się po skasowaniu wszystkiego. EN: a promise that settles after everything is deleted.
 * @throws PL: błąd funkcji kasującej; wtedy kolejne się nie wykonują, a konto zostaje, więc uczeń może spróbować jeszcze raz. EN: the error of a deleting function; then the following ones do not run and the account stays, so the student can try again.
 */
export async function deleteAccount(input: { userId: string; db: D1Database }, deleters?: readonly StudentDataDeleter[]): Promise<void> {
  // PL: Listę wczytujemy dopiero tu, bo lista importuje także moduł profile (nas samych). Przy wczytaniu na górze pliku powstałby cykl, a wpis profilu miałby pustą funkcję kasującą (bez błędu przy starcie, za to usuwanie konta by się wywróciło).
  // EN: We load the list only here, because the list also imports the profile module (ourselves). Loading it at the top of the file would create a cycle, and the profile entry would get an empty deleting function (no error at startup, but the account deletion would crash).
  const list = deleters ?? (await import('../shared/accountDeletion')).STUDENT_DATA_DELETERS;

  // PL: Najpierw moduły z danymi, jeden po drugim, żeby pierwszy błąd zatrzymał resztę.
  // EN: First the modules with data, one by one, so the first error stops the rest.
  for (const item of list.filter((deleter) => deleter.module !== ACCOUNT_MODULE)) await item.deleteStudentData(input);

  // PL: Na końcu konto i sesje.
  // EN: Last the account and sessions.
  for (const item of list.filter((deleter) => deleter.module === ACCOUNT_MODULE)) await item.deleteStudentData(input);
}
