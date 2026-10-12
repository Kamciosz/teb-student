/**
 * PL: Dane testowe modułu admin: wymyślone role w panelu do lokalnej bazy. Uczennica z danych testowych auth (`seed-user-1`) jest administratorem, a drugi uczeń (`seed-user-2`) ma rolę redakcji, żeby test mógł sprawdzić, że zmiana albo usunięcie nie rusza cudzych ról. Trzeci uczeń (`seed-user-3`) nie ma roli.
 * EN: The test data of the admin module: invented panel roles for the local database. The student from the auth test data (`seed-user-1`) is an administrator and the second student (`seed-user-2`) has the editorial role, so a test can check that a change or a deletion leaves other people's roles alone. The third student (`seed-user-3`) has no role.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/db/schema/admin.ts::panelRoles
 * @uses worker/shared/seed.ts::SeedSet
 * @used_by worker/db/seed/index.ts::*
 * @used_by scripts/db.ts::ADMIN_SEED_SETS
 * @used_by worker/admin/deleteStudentData.test.ts::ADMIN_SEED
 */

// PL: Tabela ról (wartość, bo trafia do zestawu).
// EN: The roles table (a value, because it goes into the set).
import { panelRoles } from '../schema/admin';
// PL: Typ zestawu danych testowych, wspólny dla modułów.
// EN: The test data set type shared by the modules.
import type { SeedSet } from '../../shared';

/** PL: Numer ucznia z danych testowych auth, który jest administratorem. EN: The id of the student from the auth test data who is an administrator. */
export const ADMIN_SEED_ADMIN_ID = 'seed-user-1';

/** PL: Numer ucznia z danych testowych auth, który ma rolę redakcji. EN: The id of the student from the auth test data who has the editorial role. */
export const ADMIN_SEED_EDITOR_ID = 'seed-user-2';

/** PL: Chwila nadania ról testowych: 12.10.2026, 8:00 czasu polskiego. EN: The moment the test roles were granted: 12 Oct 2026, 8:00 Polish time. */
const SEED_GRANTED_AT = Date.UTC(2026, 9, 12, 6, 0);

/**
 * PL: Role testowe: administrator i członek redakcji.
 * EN: Test roles: an administrator and an editorial team member.
 */
export const ADMIN_SEED: (typeof panelRoles.$inferInsert)[] = [
  { userId: ADMIN_SEED_ADMIN_ID, role: 'admin', grantedAt: SEED_GRANTED_AT },
  { userId: ADMIN_SEED_EDITOR_ID, role: 'editor', grantedAt: SEED_GRANTED_AT },
];

/**
 * PL: Zestaw danych testowych, który wpisuje `npm run db:seed`.
 * EN: The test data set that `npm run db:seed` inserts.
 */
export const ADMIN_SEED_SETS: SeedSet[] = [{ table: panelRoles, rows: ADMIN_SEED }];
