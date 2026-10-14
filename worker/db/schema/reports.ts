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
import { check, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
// PL: Funkcja sql pozwala wpisać surowy warunek SQL do ograniczenia CHECK.
// EN: The sql function lets us write a raw SQL condition for a CHECK constraint.
import { sql } from 'drizzle-orm';

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

/**
 * PL: Najwięcej znaków w odpowiedzi Samorządu przy zmianie etapu. Limit pilnuje też baza (ograniczenie CHECK); panel (podtor 4b) sprawdza go wcześniej.
 * EN: The most characters in the Student Council answer given when the stage changes. The database also enforces the limit (a CHECK constraint); the panel (subtrack 4b) checks it earlier.
 */
export const MAX_STAGE_NOTE_LENGTH = 500;

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
    /** PL: Numer pliku zdjęcia z modułu media, jeśli uczeń dołączył zdjęcie. Pusty, gdy zdjęcia nie ma. Bez klucza obcego, bo pliki należą do modułu media. EN: The id of the photo file from the media module, when the student attached a photo. Null when there is no photo. No foreign key, because the files belong to the media module. */
    photoId: text('photo_id'),
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
 * PL: Historia zmian etapu zgłoszenia: jeden wiersz na każdy etap, także pierwszy (plan rozbudowy: „zgłoszenie z historią zmian etapu”). Każdy wiersz może nieść krótką odpowiedź Samorządu, która jest widoczna dla autora zgłoszenia, także anonimowego (wzór FixMyStreet).
 * EN: The history of a report's stage changes: one row per stage, including the first one (expansion plan: "report with stage change history"). Each row may carry a short Student Council answer, which the report's author sees, anonymous ones included (the FixMyStreet pattern).
 *
 * @invariant PL: `note` ma najwyżej `MAX_STAGE_NOTE_LENGTH` znaków. EN: `note` has at most `MAX_STAGE_NOTE_LENGTH` characters.
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
    /** PL: Kto zmienił etap: numer osoby z Samorządu albo pusty przy wysłaniu zgłoszenia. Uczeń tego pola nigdy nie dostaje. EN: Who changed the stage: the Student Council member's id, or null when the report was sent. The student never gets this field. */
    changedBy: text('changed_by'),
    /** PL: Chwila zmiany, milisekundy od 1970. EN: When the change happened, milliseconds since 1970. */
    changedAt: integer('changed_at').notNull(),
    /** PL: Krótka odpowiedź Samorządu przy tej zmianie, do 500 znaków. Pusta przy wysłaniu zgłoszenia i przy zmianie bez odpowiedzi. EN: A short Student Council answer for this change, up to 500 characters. Null when the report was sent and when the change has no answer. */
    note: text('note'),
  },
  (table) => [
    // PL: Indeks po zgłoszeniu, bo historię zawsze czytamy dla jednego zgłoszenia.
    // EN: An index on the report, because we always read the history of one report.
    index('report_stage_changes_report_idx').on(table.reportId),
    // PL: Baza odrzuca odpowiedź dłuższą niż limit, nawet gdy zapis pominie walidację.
    // EN: The database rejects an answer longer than the limit, even when a write skips validation.
    check('report_stage_changes_note_max', sql.raw(`length(note) <= ${MAX_STAGE_NOTE_LENGTH}`)),
  ],
);

/**
 * PL: Dołączenie ucznia do zgłoszenia („Mnie też”). Jeden wiersz na ucznia i zgłoszenie, więc jeden głos na ucznia. Numer ucznia nie jest pokazywany nikomu poza nim samym: licznik to liczba wierszy.
 * EN: A student's "Me too" join on a report. One row per student and report, so one vote per student. The student's id is never shown to anyone but the student: the counter is the number of rows.
 *
 * @invariant PL: Para (zgłoszenie, uczeń) jest unikalna, bo to klucz główny. EN: The pair (report, student) is unique, because it is the primary key.
 */
export const reportJoins = sqliteTable(
  'report_joins',
  {
    /** PL: Zgłoszenie, do którego uczeń dołączył. Usunięcie zgłoszenia usuwa dołączenia. EN: The report the student joined. Deleting the report deletes the joins. */
    reportId: text('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    /** PL: Numer ucznia, który dołączył. Bez klucza obcego, bo tabele kont należą do podtoru 1a. EN: The id of the student who joined. No foreign key, because the account tables belong to subtrack 1a. */
    userId: text('user_id').notNull(),
    /** PL: Chwila dołączenia, milisekundy od 1970. EN: When the student joined, milliseconds since 1970. */
    createdAt: integer('created_at').notNull(),
  },
  (table) => [
    // PL: Klucz złożony pilnuje jednego głosu na ucznia i zgłoszenie.
    // EN: The composite key enforces one vote per student and report.
    primaryKey({ columns: [table.reportId, table.userId] }),
    // PL: Indeks po uczniu, bo usuwanie konta i „czy już dołączyłem” szukają po numerze ucznia.
    // EN: An index on the student, because account deletion and "have I joined" search by the student id.
    index('report_joins_user_idx').on(table.userId),
  ],
);
