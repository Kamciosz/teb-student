/**
 * PL: Schemat bazy modułu admin (tabele Drizzle): role w panelu Samorządu. Uczeń może mieć kilka ról naraz (w ekranie 6.3b w docs/projekt/EKRANY.md Samorząd i redakcja to dwa niezależne przełączniki), więc jedna rola to jeden wiersz. Schemat modułu należy do podtoru 8 (docs/PODZIAL_PRACY.md, część 2).
 * EN: The database schema of the admin module (Drizzle tables): roles in the Student Council panel. A student can have several roles at once (in screen 6.3b in docs/projekt/EKRANY.md the Council and the editorial team are two independent switches), so one role is one row. The module schema belongs to subtrack 8 (docs/PODZIAL_PRACY.md, part 2).
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by worker/db/schema/index.ts::*
 * @used_by worker/admin/panelRoles.ts::panelRoles
 * @used_by worker/admin/deleteStudentData.ts::panelRoles
 * @used_by worker/db/seed/admin.ts::panelRoles
 * @used_by worker/admin/diary.ts::diaryEntries
 */

// PL: Funkcje Drizzle do opisu tabel SQLite (D1 to SQLite).
// EN: Drizzle functions that describe SQLite tables (D1 is SQLite).
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * PL: Role w panelu: „editor” to redakcja gazetki (tylko Wpisy), „council” to Samorząd, „admin” to administrator. Administrator nie jest nadawany w aplikacji (ekran 6.3b: „Roli administratora nie nadaje się tutaj.”), tylko wpisem w bazie.
 * EN: The panel roles: "editor" is the school newspaper team (Entries only), "council" is the Student Council, "admin" is the administrator. The administrator is not granted in the app (screen 6.3b: "Roli administratora nie nadaje się tutaj."), only by a row in the database.
 */
export const PANEL_ROLES = ['editor', 'council', 'admin'] as const;

/** PL: Jedna rola panelu. EN: One panel role. */
export type PanelRole = (typeof PANEL_ROLES)[number];

/**
 * PL: Role uczniów w panelu: jeden wiersz na parę (uczeń, rola). Uczeń bez wiersza nie ma dostępu do panelu. Wiersz znika przy odebraniu roli albo usunięciu konta.
 * EN: The students' panel roles: one row per (student, role) pair. A student without a row has no access to the panel. The row disappears when the role is revoked or the account is deleted.
 */
export const panelRoles = sqliteTable(
  'panel_roles',
  {
    /** PL: Numer ucznia (konta). Zwykły tekst bez klucza obcego, jak reports.authorId, bo tabele kont należą do podtoru 1a. Kasuje go deleteAdminStudentData. EN: The student (account) id. Plain text with no foreign key, like reports.authorId, because the account tables belong to subtrack 1a. deleteAdminStudentData deletes it. */
    userId: text('user_id').notNull(),
    /** PL: Rola, którą uczeń ma w panelu. EN: The role the student has in the panel. */
    role: text('role', { enum: PANEL_ROLES }).notNull(),
    /** PL: Chwila nadania roli, milisekundy od 1970. EN: When the role was granted, milliseconds since 1970. */
    grantedAt: integer('granted_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.role] })],
);

/**
 * PL: Akcje, które trafiają do dziennika zmian: wydanie kodu zaproszenia, nadanie i odebranie roli Samorządu albo redakcji, pobranie pliku z pilotażu. Wpis nie ma treści, tylko nazwę akcji.
 * EN: The actions that go into the change diary: issuing an invitation code, granting and revoking the Council or editorial role, downloading the pilot file. An entry has no content, only the action name.
 */
export const DIARY_ACTIONS = ['invite_issued', 'council_granted', 'council_revoked', 'editor_granted', 'editor_revoked', 'pilot_downloaded'] as const;

/** PL: Jedna akcja w dzienniku. EN: One action in the diary. */
export type DiaryAction = (typeof DIARY_ACTIONS)[number];

/**
 * PL: Dziennik zmian w panelu: jeden wiersz na jedną akcję. Kto zrobił (actorId), co (action), czego dotyczyła (targetId, numer ucznia albo pusty dla kodu i pliku) i kiedy (at). Bez treści i bez adresów e-mail. Wpisy zostają po odebraniu roli, a znikają z kontem (oba numery, actorId i targetId, kasuje deleteAdminStudentData).
 * EN: The change diary of the panel: one row per action. Who did it (actorId), what (action), what it concerned (targetId, the student id, or empty for a code and a file) and when (at). No content and no e-mail addresses. Entries stay after a role is revoked, and go with the account (deleteAdminStudentData deletes both ids, actorId and targetId).
 */
export const diaryEntries = sqliteTable('diary_entries', {
  /** PL: Numer wpisu, rośnie z kolejnymi wpisami. EN: The entry id, grows with each entry. */
  id: integer('id').primaryKey({ autoIncrement: true }),
  /** PL: Numer konta, które wykonało akcję. Zwykły tekst bez klucza obcego, jak panel_roles.user_id. EN: The id of the account that did the action. Plain text with no foreign key, like panel_roles.user_id. */
  actorId: text('actor_id').notNull(),
  /** PL: Nazwa akcji z DIARY_ACTIONS. EN: The action name from DIARY_ACTIONS. */
  action: text('action', { enum: DIARY_ACTIONS }).notNull(),
  /** PL: Numer ucznia, którego dotyczy akcja, albo pusty dla kodu zaproszenia i pliku. Kod nie trafia tu, bo to sekret. EN: The id of the student the action concerns, or empty for an invitation code and a file. A code does not go here, because it is a secret. */
  targetId: text('target_id'),
  /** PL: Chwila akcji, milisekundy od 1970. EN: When the action happened, milliseconds since 1970. */
  at: integer('at').notNull(),
});
