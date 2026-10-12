/**
 * PL: Testy ról w panelu: wybór najwyższej roli, porównanie z rolą minimalną i odczyt roli ucznia z prawdziwej bazy D1 (bez ról innych uczniów).
 * EN: Tests of the panel roles: picking the highest role, comparing it with the minimum role and reading a student's role from a real D1 database (without other students' roles).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/admin/panelRoles.ts::highestPanelRole
 * @uses worker/admin/panelRoles.ts::isRoleEnough
 * @uses worker/admin/panelRoles.ts::getPanelLevel
 * @uses worker/db/seed/admin.ts::ADMIN_SEED
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1.
// EN: The Worker test environment with the D1 database.
import { env } from 'cloudflare:workers';
// PL: Klient bazy do wpisania ról.
// EN: The database client to insert the roles.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela ról i dane testowe: administrator i członek redakcji.
// EN: The roles table and the test data: an administrator and an editorial team member.
import { panelRoles } from '../db/schema/admin';
import { ADMIN_SEED, ADMIN_SEED_ADMIN_ID, ADMIN_SEED_EDITOR_ID } from '../db/seed/admin';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { getPanelLevel, highestPanelRole, isRoleEnough } from './panelRoles';

// PL: Przed każdym testem wpisz od nowa role testowe.
// EN: Before every test insert the test roles anew.
beforeEach(async () => {
  await drizzle(env.DB).delete(panelRoles);
  await drizzle(env.DB).insert(panelRoles).values(ADMIN_SEED);
});

// PL: Grupa testów wyboru najwyższej roli.
// EN: A group of tests for picking the highest role.
describe('highestPanelRole', () => {
  it('bez ról oddaje null / returns null without roles', () => {
    expect(highestPanelRole([])).toBeNull();
  });

  it('wybiera najwyższą rolę bez względu na kolejność / picks the highest role regardless of order', () => {
    expect(highestPanelRole(['council', 'editor'])).toBe('council');
    expect(highestPanelRole(['admin', 'editor', 'council'])).toBe('admin');
    expect(highestPanelRole(['editor'])).toBe('editor');
  });
});

// PL: Grupa testów porównania z rolą minimalną: macierz dostępu z docs/projekt/EKRANY.md, przepływ 6.
// EN: A group of tests for the comparison with the minimum role: the access matrix from docs/projekt/EKRANY.md, flow 6.
describe('isRoleEnough', () => {
  it('redakcja ma tylko Wpisy, Samorząd i administrator więcej / the newspaper team has Entries only, the Council and the administrator more', () => {
    expect(isRoleEnough('editor', 'editor')).toBe(true);
    expect(isRoleEnough('editor', 'council')).toBe(false);
    expect(isRoleEnough('council', 'editor')).toBe(true);
    expect(isRoleEnough('council', 'council')).toBe(true);
    expect(isRoleEnough('council', 'admin')).toBe(false);
    expect(isRoleEnough('admin', 'admin')).toBe(true);
  });

  it('bez roli nic nie wystarcza / without a role nothing is enough', () => {
    expect(isRoleEnough(null, 'editor')).toBe(false);
  });
});

// PL: Grupa testów odczytu roli z bazy.
// EN: A group of tests for reading the role from the database.
describe('getPanelLevel', () => {
  it('czyta rolę ucznia, a cudze role ignoruje / reads the student role and ignores other roles', async () => {
    expect(await getPanelLevel(env.DB, ADMIN_SEED_ADMIN_ID)).toBe('admin');
    expect(await getPanelLevel(env.DB, ADMIN_SEED_EDITOR_ID)).toBe('editor');
  });

  it('uczeń bez roli dostaje null / a student without a role gets null', async () => {
    expect(await getPanelLevel(env.DB, 'nie-ma-roli')).toBeNull();
  });

  it('uczeń z dwiema rolami dostaje wyższą / a student with two roles gets the higher one', async () => {
    // PL: Dopisz Samorząd uczniowi, który ma już redakcję.
    // EN: Add the Council role to a student who already has the editorial one.
    await drizzle(env.DB).insert(panelRoles).values({ userId: ADMIN_SEED_EDITOR_ID, role: 'council', grantedAt: 1 });
    expect(await getPanelLevel(env.DB, ADMIN_SEED_EDITOR_ID)).toBe('council');
  });
});
