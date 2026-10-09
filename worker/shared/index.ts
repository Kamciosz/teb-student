/**
 * PL: Drzwi wspólnej części serwera (podtor 0): typy, które mają wszystkie moduły. Lista funkcji kasujących leży osobno w accountDeletion.ts, bo importuje moduły. Gdyby ten plik ją wystawiał, powstałby cykl: moduł wczytuje ten plik, a ten plik wczytuje moduł.
 * EN: The door of the shared part of the server (subtrack 0): the types every module has. The list of deleting functions lives separately in accountDeletion.ts, because it imports the modules. If this file exposed it, a cycle would appear: a module loads this file and this file loads the module.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by worker/auth/email/deleteStudentData.ts::DeleteStudentDataInput
 * @used_by worker/shared/accountDeletion.ts::DeleteStudentData
 */

/**
 * PL: Dane wejściowe funkcji kasującej dane ucznia. Obiekt, żeby dało się dodać pole (na przykład dostęp do bazy lub do R2) bez zmiany wszystkich modułów.
 * EN: The input of a function that deletes a student's data. An object, so a field (for example access to the database or to R2) can be added without changing every module.
 */
export type DeleteStudentDataInput = {
  /** PL: Numer ucznia (konta), którego dane znikają. EN: The id of the student (account) whose data goes away. */
  userId: string;
};

/**
 * PL: Funkcja kasująca dane ucznia z jednego modułu. Kończy się po skasowaniu, a przy błędzie bazy rzuca wyjątek, żeby usuwanie konta się zatrzymało.
 * EN: A function that deletes a student's data from one module. It settles after the deletion and throws on a database error, so the account deletion stops.
 */
export type DeleteStudentData = (input: DeleteStudentDataInput) => Promise<void>;
