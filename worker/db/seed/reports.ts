/**
 * PL: Dane testowe modułu reports: wymyślone zgłoszenia i ich historia do lokalnej bazy. To dwa zgłoszenia z ekranu 3.5 (docs/projekt/EKRANY.md) jednego wymyślonego ucznia oraz jedno zgłoszenie innego ucznia, żeby test mógł sprawdzić, że „Moje zgłoszenia” nie pokazują cudzych.
 * EN: The test data of the reports module: invented reports and their history for the local database. These are the two reports from screen 3.5 (docs/projekt/EKRANY.md) of one invented student and one report of another student, so a test can check that "Moje zgłoszenia" do not show other people's.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/seed/auth.ts::AUTH_SEED_USERS
 * @uses worker/shared/seed.ts::SeedSet
 * @used_by worker/db/seed/index.ts::*
 * @used_by scripts/db.ts::REPORTS_SEED_SETS
 * @used_by worker/reports/student/routes.test.ts::REPORTS_SEED
 */

// PL: Tabele (wartości, bo trafiają do zestawów) i ich typy wierszy.
// EN: The tables (values, because they go into the sets) and their row types.
import { reportStageChanges, reports } from '../schema/reports';
// PL: Typ zestawu danych testowych, wspólny dla modułów.
// EN: The test data set type shared by the modules.
import type { SeedSet } from '../../shared';
/** PL: Numer ucznia z danych testowych auth (`seed-user-1`), do którego należą dwa pierwsze zgłoszenia. EN: The id of the student from the auth test data (`seed-user-1`) that the first two reports belong to. */
export const SEED_STUDENT_ID = 'seed-user-1';

/** PL: Numer innego ucznia z danych testowych auth (`seed-user-2`). EN: The id of another student from the auth test data (`seed-user-2`). */
export const OTHER_STUDENT_ID = 'seed-user-2';

/**
 * PL: Zgłoszenia testowe: „W trakcie” i „Załatwione” ucznia oraz jedno cudze.
 * EN: Test reports: the student's "in progress" and "resolved" ones, and one belonging to someone else.
 */
export const REPORTS_SEED: (typeof reports.$inferInsert)[] = [
  {
    id: 'seed-projektor',
    authorId: SEED_STUDENT_ID,
    isAnonymous: true,
    category: 'room_equipment',
    place: 'classroom',
    placeDetail: 'Sala 204',
    description: 'Nie działa projektor w sali 204',
    stage: 'in_progress',
    createdAt: Date.UTC(2026, 9, 6, 8, 0),
    updatedAt: Date.UTC(2026, 9, 7, 8, 0),
  },
  {
    id: 'seed-okno',
    authorId: SEED_STUDENT_ID,
    isAnonymous: true,
    category: 'room_equipment',
    place: 'classroom',
    placeDetail: 'Sala 112',
    description: 'Okno się nie domyka w sali 112',
    stage: 'resolved',
    createdAt: Date.UTC(2026, 8, 29, 8, 0),
    updatedAt: Date.UTC(2026, 9, 2, 8, 0),
  },
  {
    id: 'seed-cudze',
    authorId: OTHER_STUDENT_ID,
    isAnonymous: false,
    category: 'safety',
    place: 'corridor',
    placeDetail: null,
    description: 'Mokra podłoga na korytarzu przy szatni',
    stage: 'received',
    createdAt: Date.UTC(2026, 9, 8, 8, 0),
    updatedAt: Date.UTC(2026, 9, 8, 8, 0),
  },
];

/**
 * PL: Historia etapów zgłoszeń testowych: każdy etap, na który zgłoszenie weszło.
 * EN: The stage history of the test reports: every stage a report moved to.
 */
export const REPORT_STAGE_CHANGES_SEED: (typeof reportStageChanges.$inferInsert)[] = [
  { id: 'seed-projektor-1', reportId: 'seed-projektor', stage: 'received', changedBy: null, changedAt: Date.UTC(2026, 9, 6, 8, 0) },
  { id: 'seed-projektor-2', reportId: 'seed-projektor', stage: 'in_progress', changedBy: 'samorzad-testowy', changedAt: Date.UTC(2026, 9, 7, 8, 0) },
  { id: 'seed-okno-1', reportId: 'seed-okno', stage: 'received', changedBy: null, changedAt: Date.UTC(2026, 8, 29, 8, 0) },
  { id: 'seed-okno-2', reportId: 'seed-okno', stage: 'in_progress', changedBy: 'samorzad-testowy', changedAt: Date.UTC(2026, 8, 30, 8, 0) },
  { id: 'seed-okno-3', reportId: 'seed-okno', stage: 'resolved', changedBy: 'samorzad-testowy', changedAt: Date.UTC(2026, 9, 2, 8, 0) },
  { id: 'seed-cudze-1', reportId: 'seed-cudze', stage: 'received', changedBy: null, changedAt: Date.UTC(2026, 9, 8, 8, 0) },
];

/**
 * PL: Zestawy danych testowych modułu reports dla `npm run db:seed` i testów serwera: zgłoszenia i ich historia.
 * EN: The test data sets of the reports module for `npm run db:seed` and the server tests: the reports and their history.
 */
export const REPORTS_SEED_SETS: SeedSet[] = [
  { table: reports, rows: REPORTS_SEED },
  { table: reportStageChanges, rows: REPORT_STAGE_CHANGES_SEED },
];
