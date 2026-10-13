/**
 * PL: Testy wyszukiwania uczniów dla panelu Samorządu, wywoływane przez drzwi modułu worker/auth/index.ts. Test oblewa, gdy drzwi przestaną wystawiać findStudentByEmail, listStudentsByIds albo countStudents. Działają na prawdziwej bazie D1 testów.
 * EN: Tests of the student lookup for the Student Council panel, called through the module door worker/auth/index.ts. The test fails when the door stops exposing findStudentByEmail, listStudentsByIds or countStudents. They run on the real test D1 database.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/auth/index.ts::findStudentByEmail
 * @uses worker/auth/index.ts::listStudentsByIds
 * @uses worker/auth/index.ts::countStudents
 * @used_by vitest.config.ts::include
 */

// PL: Baza testowa D1 i funkcje testowe Vitest.
// EN: The D1 test database and Vitest test functions.
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
// PL: Drizzle do wpisania kont testowych.
// EN: Drizzle for inserting the test accounts.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela kont.
// EN: The accounts table.
import { user } from '../../db/schema/auth';
// PL: Funkcje, które sprawdzamy, wzięte z drzwi modułu, tak jak bierze je panel.
// EN: The functions under test, taken from the module door, the way the panel takes them.
import { countStudents, findStudentByEmail, listStudentsByIds } from '../index';

/**
 * PL: Wpisuje konto testowe z wymyślonymi danymi. Każdy test ma własne numery i adresy, więc testy nie zależą od siebie.
 * EN: Inserts a test account with made-up data. Every test has its own ids and addresses, so the tests do not depend on each other.
 *
 * @param id - PL: numer konta. EN: the account id.
 * @param name - PL: imię. EN: the name.
 * @param email - PL: adres małymi literami. EN: the lowercase address.
 * @returns PL: obietnica, która kończy się po zapisie. EN: a promise that settles after saving.
 */
async function insertStudent(id: string, name: string, email: string): Promise<void> {
  await drizzle(env.DB).insert(user).values({ id, name, email, emailVerified: true });
}

// PL: Grupa testów szukania po adresie.
// EN: A group of lookup-by-address tests.
describe('findStudentByEmail', () => {
  // PL: Wielkie litery i spacje w adresie nie przeszkadzają, a odpowiedź ma tylko trzy pola.
  // EN: Capitals and spaces in the address do not matter, and the answer has only three fields.
  it('znajduje ucznia mimo wielkich liter i spacji / finds a student despite capitals and spaces', async () => {
    await insertStudent('lookup-ola', 'Ola', 'ola.lookup@teb.edu.pl');
    expect(await findStudentByEmail(env.DB, '  Ola.Lookup@TEB.edu.pl ')).toEqual({
      id: 'lookup-ola',
      name: 'Ola',
      email: 'ola.lookup@teb.edu.pl',
    });
  });

  // PL: Nieznany adres daje null.
  // EN: An unknown address gives null.
  it('zwraca null dla nieznanego adresu / returns null for an unknown address', async () => {
    expect(await findStudentByEmail(env.DB, 'nikt.lookup@teb.edu.pl')).toBeNull();
  });
});

// PL: Grupa testów listy po numerach.
// EN: A group of list-by-ids tests.
describe('listStudentsByIds', () => {
  // PL: Zwraca tylko wskazane konta i pomija numery bez konta.
  // EN: Returns only the given accounts and skips ids without an account.
  it('zwraca wskazanych uczniów i pomija nieznane numery / returns the given students and skips unknown ids', async () => {
    await insertStudent('lookup-jan', '', 'jan.lookup@teb.edu.pl');
    await insertStudent('lookup-ewa', 'Ewa', 'ewa.lookup@teb.edu.pl');
    const students = await listStudentsByIds(env.DB, ['lookup-jan', 'lookup-brak']);
    expect(students).toEqual([{ id: 'lookup-jan', name: '', email: 'jan.lookup@teb.edu.pl' }]);
  });

  // PL: Pusta lista numerów daje pustą listę.
  // EN: An empty list of ids gives an empty list.
  it('zwraca pustą listę dla pustych numerów / returns an empty list for empty ids', async () => {
    expect(await listStudentsByIds(env.DB, [])).toEqual([]);
  });
});

// PL: Grupa testów liczenia kont.
// EN: A group of account counting tests.
describe('countStudents', () => {
  // PL: Nowe konto zwiększa liczbę o jeden.
  // EN: A new account raises the number by one.
  it('liczy konta / counts accounts', async () => {
    const before = await countStudents(env.DB);
    await insertStudent('lookup-count', 'Ada', 'ada.lookup@teb.edu.pl');
    expect(await countStudents(env.DB)).toBe(before + 1);
  });
});
