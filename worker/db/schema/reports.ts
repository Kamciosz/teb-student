/**
 * PL: Schemat bazy modułu reports (tabele Drizzle): zgłoszenia uczniów i historia zmian ich etapu. Schemat modułu należy do podtoru 4a (docs/PODZIAL_PRACY.md, część 2). Podtor 4b (panel) czyta te tabele i zmienia etap, ale ich nie zmienia: brakujące pole zgłasza zgłoszeniem dla 4a.
 * EN: The database schema of the reports module (Drizzle tables): student reports and the history of their stage changes. A module's schema belongs to subtrack 4a (docs/PODZIAL_PRACY.md, part 2). Subtrack 4b (panel) reads these tables and changes the stage, but does not change the tables: a missing field is requested with an issue for 4a.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by worker/db/schema/index.ts::*
 * @used_by worker/reports/student/reportsRepository.ts::reports
 * @used_by worker/reports/student/validation.ts::REPORT_CATEGORIES
 * @used_by worker/reports/student/deleteStudentData.ts::reports
 */

// PL: Funkcje Drizzle do opisu tabel SQLite (D1 to SQLite).
// EN: Drizzle functions that describe SQLite tables (D1 is SQLite).
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * PL: Czego dotyczy zgłoszenie. Kody są stałe i po angielsku, polskie nazwy są tylko na ekranie (docs/projekt/EKRANY.md, ekran 3.1).
 * EN: What a report is about. The codes are stable and in English; the Polish labels exist only on the screen (docs/projekt/EKRANY.md, screen 3.1).
 */
export const REPORT_CATEGORIES = ['room_equipment', 'safety', 'idea', 'other'] as const;

/**
 * PL: Gdzie jest problem. Polskie nazwy: ekran 3.2.
 * EN: Where the problem is. Polish labels: screen 3.2.
 */
export const REPORT_PLACES = ['classroom', 'corridor', 'restroom', 'locker_room', 'gym', 'field'] as const;

/**
 * PL: Etapy zgłoszenia w kolejności: przyjęte, w trakcie, załatwione (docs/PLAN_APLIKACJI.md, część 7).
 * EN: The report stages in order: received, in progress, resolved (docs/PLAN_APLIKACJI.md, part 7).
 */
export const REPORT_STAGES = ['received', 'in_progress', 'resolved'] as const;

/** PL: Kod kategorii zgłoszenia. EN: A report category code. */
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
/** PL: Kod miejsca. EN: A place code. */
export type ReportPlace = (typeof REPORT_PLACES)[number];
/** PL: Kod etapu. EN: A stage code. */
export type ReportStage = (typeof REPORT_STAGES)[number];

/**
 * PL: Zgłoszenie ucznia.
 * EN: A student's report.
 *
 * @invariant PL: Gdy `isAnonymous` jest prawdą, żaden widok dla Samorządu (podtor 4b, pulpit) nie zwraca `authorId`. Numer autora jest w bazie tylko po to, żeby uczeń widział swoje zgłoszenia. EN: When `isAnonymous` is true, no Student Council view (subtrack 4b, dashboard) returns `authorId`. The author id is in the database only so the student can see their own reports.
 * @invariant PL: `authorId` może być pusty: usunięcie konta zeruje to pole, a zgłoszenie zostaje bez autora (docs/PLAN_APLIKACJI.md, część 3). EN: `authorId` may be null: deleting the account clears this field and the report stays without an author (docs/PLAN_APLIKACJI.md, part 3).
 */
export const reports = sqliteTable(
  'reports',
  {
    /** PL: Numer zgłoszenia (UUID). EN: The report id (UUID). */
    id: text('id').primaryKey(),
    /** PL: Numer konta autora albo pusty po usunięciu konta. Bez klucza obcego, bo tabele kont należą do podtoru 1a. EN: The author's account id, or null after the account is deleted. No foreign key, because the account tables belong to subtrack 1a. */
    authorId: text('author_id'),
    /** PL: Czy zgłoszenie jest anonimowe dla Samorządu. Domyślnie tak. EN: Whether the report is anonymous to the Student Council. True by default. */
    isAnonymous: integer('is_anonymous', { mode: 'boolean' }).notNull().default(true),
    /** PL: Czego dotyczy zgłoszenie. EN: What the report is about. */
    category: text('category', { enum: REPORT_CATEGORIES }).notNull(),
    /** PL: Gdzie jest problem. EN: Where the problem is. */
    place: text('place', { enum: REPORT_PLACES }).notNull(),
    /** PL: Dokładne miejsce wpisane przez ucznia, na przykład „Sala 112”. Może być puste. EN: The exact place typed by the student, for example "Sala 112". May be null. */
    placeDetail: text('place_detail'),
    /** PL: Opis problemu: jedno lub dwa zdania. EN: The problem description: one or two sentences. */
    description: text('description').notNull(),
    /** PL: Bieżący etap. EN: The current stage. */
    stage: text('stage', { enum: REPORT_STAGES }).notNull().default('received'),
    /** PL: Chwila wysłania, milisekundy od 1970. EN: When the report was sent, milliseconds since 1970. */
    createdAt: integer('created_at').notNull(),
    /** PL: Chwila ostatniej zmiany etapu, milisekundy od 1970. Dla załatwionego zgłoszenia to data załatwienia. EN: When the stage last changed, milliseconds since 1970. For a resolved report this is the resolution date. */
    updatedAt: integer('updated_at').notNull(),
  },
  // PL: Indeks po autorze, bo „Moje zgłoszenia” zawsze szukają po numerze ucznia.
  // EN: An index on the author, because "Moje zgłoszenia" always search by the student id.
  (table) => [index('reports_author_idx').on(table.authorId)],
);

/**
 * PL: Historia zmian etapu zgłoszenia: jeden wiersz na każdy etap, także pierwszy (plan rozbudowy: „zgłoszenie z historią zmian etapu”).
 * EN: The history of a report's stage changes: one row per stage, including the first one (expansion plan: "report with stage change history").
 */
export const reportStageChanges = sqliteTable(
  'report_stage_changes',
  {
    /** PL: Numer wiersza (UUID). EN: The row id (UUID). */
    id: text('id').primaryKey(),
    /** PL: Zgłoszenie, którego dotyczy zmiana. Usunięcie zgłoszenia usuwa jego historię. EN: The report the change belongs to. Deleting the report deletes its history. */
    reportId: text('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    /** PL: Etap, na który zgłoszenie weszło. EN: The stage the report moved to. */
    stage: text('stage', { enum: REPORT_STAGES }).notNull(),
    /** PL: Kto zmienił etap: numer osoby z Samorządu albo pusty przy wysłaniu zgłoszenia. EN: Who changed the stage: the Student Council member's id, or null when the report was sent. */
    changedBy: text('changed_by'),
    /** PL: Chwila zmiany, milisekundy od 1970. EN: When the change happened, milliseconds since 1970. */
    changedAt: integer('changed_at').notNull(),
  },
  // PL: Indeks po zgłoszeniu, bo historię zawsze czytamy dla jednego zgłoszenia.
  // EN: An index on the report, because we always read the history of one report.
  (table) => [index('report_stage_changes_report_idx').on(table.reportId)],
);
