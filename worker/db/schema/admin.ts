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
