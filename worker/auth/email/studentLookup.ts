/**
 * PL: Wyszukiwanie uczniów dla panelu Samorządu (podtor 8): po szkolnym adresie, po liście numerów i liczenie wszystkich kont. Panel nie czyta tabeli user sam, bo moduły czytają tylko własne tabele i cudze drzwi. Odpowiedź zawiera tylko numer, imię i adres, czyli to, co panel pokazuje administratorowi.
 * EN: Student lookup for the Student Council panel (subtrack 8): by school address, by a list of ids, and counting all accounts. The panel does not read the user table itself, because modules read only their own tables and other modules' doors. The answer holds only the id, the name and the address, which is what the panel shows to the administrator.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/db/schema/auth.ts::user
 * @used_by worker/auth/email/index.ts::findStudentByEmail
 * @used_by worker/auth/email/index.ts::listStudentsByIds
 * @used_by worker/auth/email/index.ts::countStudents
 */

// PL: Drizzle: warunek równości, warunek „numer na liście” i licznik wierszy.
// EN: Drizzle: the equality condition, the "id in the list" condition and the row counter.
import { count, eq, inArray } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela kont.
// EN: The accounts table.
import { user } from '../../db/schema/auth';

/**
 * PL: Uczeń w takiej postaci, w jakiej widzi go panel Samorządu: bez klasy, zdjęcia i sesji.
 * EN: A student in the form the Student Council panel sees: without class, photo and sessions.
 */
export type StudentSummary = {
  /** PL: Numer konta. EN: The account id. */
  id: string;
  /** PL: Imię na koncie, puste do czasu ustawienia w profilu. EN: The name on the account, empty until set in the profile. */
  name: string;
  /** PL: Szkolny adres małymi literami. EN: The school address in lowercase. */
  email: string;
};

/** PL: Kolumny zwracane panelowi. EN: The columns returned to the panel. */
const SUMMARY_COLUMNS = { id: user.id, name: user.name, email: user.email };

/**
 * PL: Szuka ucznia po szkolnym adresie. Wielkość liter i spacje na brzegach nie mają znaczenia.
 * EN: Looks up a student by school address. Letter case and edge spaces do not matter.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param email - PL: adres wpisany przez administratora. EN: the address typed by the administrator.
 * @returns PL: uczeń albo null, gdy nikt nie ma takiego adresu. EN: the student, or null when nobody has this address.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function findStudentByEmail(db: D1Database, email: string): Promise<StudentSummary | null> {
  // PL: Konta mają adres małymi literami, więc wpis sprowadzamy do tej samej postaci.
  // EN: Accounts store the address in lowercase, so we bring the input to the same form.
  const [row] = await drizzle(db).select(SUMMARY_COLUMNS).from(user).where(eq(user.email, email.trim().toLowerCase()));
  return row ?? null;
}

/**
 * PL: Zwraca uczniów o podanych numerach. Numery bez konta są pomijane, a kolejność nie jest gwarantowana.
 * EN: Returns the students with the given ids. Ids without an account are skipped, and the order is not guaranteed.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param ids - PL: numery kont. EN: the account ids.
 * @returns PL: lista uczniów, pusta dla pustej listy numerów. EN: the list of students, empty for an empty list of ids.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function listStudentsByIds(db: D1Database, ids: string[]): Promise<StudentSummary[]> {
  // PL: Pusta lista nie ma o co pytać bazy.
  // EN: An empty list has nothing to ask the database.
  if (ids.length === 0) return [];
  return drizzle(db).select(SUMMARY_COLUMNS).from(user).where(inArray(user.id, ids));
}

/**
 * PL: Liczy wszystkie konta uczniów, czyli osoby, które się zalogowały.
 * EN: Counts all student accounts, that is the people who signed in.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @returns PL: liczba kont. EN: the number of accounts.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function countStudents(db: D1Database): Promise<number> {
  const [row] = await drizzle(db).select({ total: count() }).from(user);
  return row?.total ?? 0;
}
