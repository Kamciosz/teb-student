/**
 * PL: Test funkcji deleteProfileStudentData. Sprawdza, że profil ucznia znika, cudzy profil zostaje, a nieznany uczeń niczego nie zmienia i nie rzuca błędu.
 * EN: Test of the deleteProfileStudentData function. Checks that the student's profile goes away, another student's profile stays, and an unknown student changes nothing and does not throw.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/profile/deleteStudentData.ts::deleteProfileStudentData
 * @uses worker/db/seed/profile.ts::PROFILE_SEED
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (binding DB, tabele ze schematu).
// EN: The Worker test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
// PL: Drizzle dla D1, tabela profili i dane testowe.
// EN: Drizzle for D1, the profiles table and the test data.
import { drizzle } from 'drizzle-orm/d1';
import { profiles } from '../db/schema/profile';
import { PROFILE_OTHER_STUDENT_ID, PROFILE_SEED, PROFILE_SEED_STUDENT_ID } from '../db/seed/profile';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { deleteProfileStudentData } from './deleteStudentData';

/**
 * PL: Numery uczniów, którzy mają wiersz w tabeli profili.
 * EN: The ids of the students that have a row in the profiles table.
 *
 * @returns PL: posortowane numery uczniów. EN: the sorted student ids.
 */
async function profileOwners(): Promise<string[]> {
  const rows = await drizzle(env.DB).select({ userId: profiles.userId }).from(profiles);
  return rows.map((row) => row.userId).sort();
}

// PL: Przed każdym testem tabela ma tylko dane testowe.
// EN: Before every test the table holds only the test data.
beforeEach(async () => {
  await drizzle(env.DB).delete(profiles);
  await drizzle(env.DB).insert(profiles).values(PROFILE_SEED);
});

// PL: Grupa testów kasowania danych ucznia z modułu profile.
// EN: A group of tests for deleting the student's data from the profile module.
describe('deleteProfileStudentData', () => {
  // PL: Profil ucznia znika, a profil drugiego ucznia zostaje.
  // EN: The student's profile goes away and the other student's profile stays.
  it('kasuje profil ucznia, cudzy zostaje / deletes the student profile, the other stays', async () => {
    const result = await deleteProfileStudentData({ userId: PROFILE_SEED_STUDENT_ID, db: env.DB });

    expect(result).toBeUndefined();
    expect(await profileOwners()).toEqual([PROFILE_OTHER_STUDENT_ID]);
  });

  // PL: Nieznany uczeń niczego nie zmienia i nie rzuca błędu.
  // EN: An unknown student changes nothing and does not throw.
  it('nieznany uczeń nic nie zmienia / an unknown student changes nothing', async () => {
    await deleteProfileStudentData({ userId: 'nie-ma-takiego', db: env.DB });

    expect(await profileOwners()).toEqual([PROFILE_SEED_STUDENT_ID, PROFILE_OTHER_STUDENT_ID].sort());
  });
});
