/**
 * PL: Test funkcji deleteAdminStudentData. Sprawdza, że role ucznia w panelu znikają, role innego ucznia zostają, wpisy dziennika, w których uczeń jest sprawcą albo tematem, też znikają (a cudze zostają), a nieznany uczeń niczego nie zmienia i nie rzuca błędu.
 * EN: Test of the deleteAdminStudentData function. Checks that the student's panel roles go away, another student's roles stay, the diary entries where the student is the actor or the subject go away too (others stay), and an unknown student changes nothing and does not throw.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/admin/deleteStudentData.ts::deleteAdminStudentData
 * @uses worker/db/schema/admin.ts::diaryEntries
 * @uses worker/db/seed/admin.ts::ADMIN_SEED
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (binding DB, tabele ze schematu).
// EN: The Worker test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
// PL: Klient bazy do wpisania i odczytu ról.
// EN: The database client to insert and read the roles.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele ról i dziennika oraz dane testowe: administrator i członek redakcji.
// EN: The roles and diary tables and the test data: an administrator and an editorial team member.
import { diaryEntries, panelRoles } from '../db/schema/admin';
import { ADMIN_SEED, ADMIN_SEED_ADMIN_ID, ADMIN_SEED_EDITOR_ID } from '../db/seed/admin';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { deleteAdminStudentData } from './deleteStudentData';

/**
 * PL: Numery uczniów, którzy mają rolę w panelu.
 * EN: The ids of the students that have a panel role.
 *
 * @returns PL: posortowane numery uczniów. EN: the sorted student ids.
 */
async function roleOwners(): Promise<string[]> {
  // PL: Przeczytaj wszystkie wiersze ról i zostaw same numery uczniów.
  // EN: Read all the role rows and keep only the student ids.
  const rows = await drizzle(env.DB).select({ userId: panelRoles.userId }).from(panelRoles);
  return rows.map((row) => row.userId).sort();
}

// PL: Przed każdym testem wyczyść dziennik i wpisz od nowa role testowe.
// EN: Before every test clear the diary and insert the test roles anew.
beforeEach(async () => {
  await drizzle(env.DB).delete(diaryEntries);
  await drizzle(env.DB).delete(panelRoles);
  await drizzle(env.DB).insert(panelRoles).values(ADMIN_SEED);
});

// PL: Grupa testów kasowania danych ucznia z modułu admin.
// EN: A group of tests for deleting the student's data from the admin module.
describe('deleteAdminStudentData', () => {
  it('kasuje role ucznia, cudze zostają / deletes the student roles, the other stay', async () => {
    // PL: Skasuj dane administratora z danych testowych.
    // EN: Delete the data of the administrator from the test data.
    const result = await deleteAdminStudentData({ userId: ADMIN_SEED_ADMIN_ID, db: env.DB });

    // PL: Funkcja niczego nie zwraca, a została tylko rola redakcji.
    // EN: The function returns nothing and only the editorial role is left.
    expect(result).toBeUndefined();
    expect(await roleOwners()).toEqual([ADMIN_SEED_EDITOR_ID]);
  });

  it('kasuje wpisy dziennika, w których uczeń jest sprawcą albo tematem, cudze zostają / deletes the diary entries where the student is the actor or the subject, the others stay', async () => {
    // PL: Wpisy: administrator jest sprawcą, administrator jest tematem, dwa wpisy nie dotyczą administratora.
    // EN: Entries: the administrator is the actor, the administrator is the subject, two entries do not concern the administrator.
    await drizzle(env.DB).insert(diaryEntries).values([
      { actorId: ADMIN_SEED_ADMIN_ID, action: 'invite_issued', targetId: null, at: 1 },
      { actorId: ADMIN_SEED_EDITOR_ID, action: 'council_granted', targetId: ADMIN_SEED_ADMIN_ID, at: 2 },
      { actorId: ADMIN_SEED_EDITOR_ID, action: 'editor_granted', targetId: 'inny-uczen', at: 3 },
      { actorId: ADMIN_SEED_EDITOR_ID, action: 'invite_issued', targetId: null, at: 4 },
    ]);

    // PL: Skasuj dane administratora.
    // EN: Delete the administrator's data.
    await deleteAdminStudentData({ userId: ADMIN_SEED_ADMIN_ID, db: env.DB });

    // PL: Zostały tylko wpisy, w których administrator nie występuje.
    // EN: Only the entries where the administrator does not appear are left.
    const rows = await drizzle(env.DB).select({ at: diaryEntries.at }).from(diaryEntries);
    expect(rows.map((row) => row.at).sort()).toEqual([3, 4]);
  });

  it('nieznany uczeń nic nie zmienia / an unknown student changes nothing', async () => {
    // PL: Skasuj dane ucznia, który nie ma ról.
    // EN: Delete the data of a student who has no roles.
    await deleteAdminStudentData({ userId: 'nie-ma-takiego', db: env.DB });

    // PL: Obie role z danych testowych zostały.
    // EN: Both roles from the test data are still there.
    expect(await roleOwners()).toEqual([ADMIN_SEED_ADMIN_ID, ADMIN_SEED_EDITOR_ID].sort());
  });
});
