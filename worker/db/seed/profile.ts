/**
 * PL: Dane testowe modułu profile: wymyślone profile do lokalnej bazy. Jeden profil należy do ucznia z danych testowych auth (`seed-user-1`, ekran 2.4 w docs/projekt/EKRANY.md: „Ola”, „3TA”), drugi do innego ucznia (`seed-user-2`), żeby test mógł sprawdzić, że zmiana albo usunięcie nie rusza cudzego profilu.
 * EN: The test data of the profile module: invented profiles for the local database. One profile belongs to the student from the auth test data (`seed-user-1`, screen 2.4 in docs/projekt/EKRANY.md: "Ola", "3TA"), the other to another student (`seed-user-2`), so a test can check that a change or a deletion leaves other people's profile alone.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses worker/db/schema/profile.ts::profiles
 * @uses worker/shared/seed.ts::SeedSet
 * @used_by worker/db/seed/index.ts::*
 * @used_by scripts/db.ts::PROFILE_SEED_SETS
 * @used_by worker/profile/profile.test.ts::PROFILE_SEED
 */

// PL: Tabela (wartość, bo trafia do zestawu) i jej typ wiersza.
// EN: The table (a value, because it goes into the set) and its row type.
import { profiles } from '../schema/profile';
// PL: Typ zestawu danych testowych, wspólny dla modułów.
// EN: The test data set type shared by the modules.
import type { SeedSet } from '../../shared';

/** PL: Numer ucznia z danych testowych auth, do którego należy pierwszy profil. EN: The id of the student from the auth test data that the first profile belongs to. */
export const PROFILE_SEED_STUDENT_ID = 'seed-user-1';

/** PL: Numer innego ucznia z danych testowych auth. EN: The id of another student from the auth test data. */
export const PROFILE_OTHER_STUDENT_ID = 'seed-user-2';

/**
 * PL: Profile testowe: uczennica z ekranu 2.4 (technikum) i inny uczeń (liceum, paleta CG).
 * EN: Test profiles: the student from screen 2.4 (technical school) and another student (lyceum, palette CG).
 */
export const PROFILE_SEED: (typeof profiles.$inferInsert)[] = [
  { userId: PROFILE_SEED_STUDENT_ID, name: 'Ola', className: '3TA', school: 'T', palette: 'CE', updatedAt: Date.UTC(2026, 9, 9, 8, 0) },
  { userId: PROFILE_OTHER_STUDENT_ID, name: 'Kuba', className: '2LA', school: 'L', palette: 'CG', updatedAt: Date.UTC(2026, 9, 9, 9, 0) },
];

/** PL: Zestawy dla `npm run db:seed`. EN: The sets for `npm run db:seed`. */
export const PROFILE_SEED_SETS: SeedSet[] = [{ table: profiles, rows: PROFILE_SEED }];
