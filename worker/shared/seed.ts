/**
 * PL: Typ zestawu danych testowych: tabela i wiersze do wpisania poleceniem `npm run db:seed`. Plik nie używa typów Cloudflare, więc importuje go także skrypt Node.js scripts/db.ts.
 * EN: The type of a test data set: a table and the rows to insert with the `npm run db:seed` command. The file uses no Cloudflare types, so the Node.js script scripts/db.ts imports it too.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by worker/shared/index.ts::SeedSet
 * @used_by scripts/db.ts::collectSeedSets
 * @used_by worker/db/seed/index.ts::*
 */

// PL: Typ tabeli Drizzle dla SQLite (D1).
// EN: The Drizzle table type for SQLite (D1).
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';

/**
 * PL: Jeden zestaw danych testowych: tabela i wiersze do wpisania. Moduł wystawia listę zestawów w worker/db/seed/<moduł>.ts pod nazwą `<MODUŁ>_SEED_SETS` (na przykład `REPORTS_SEED_SETS`). Polecenie `npm run db:seed` wpisuje wszystkie zestawy w jednej transakcji z odroczonymi kluczami obcymi, więc kolejność zestawów nie ma znaczenia.
 * EN: One set of test data: a table and the rows to insert. A module exposes the list of sets in worker/db/seed/<module>.ts under the name `<MODULE>_SEED_SETS` (for example `REPORTS_SEED_SETS`). The `npm run db:seed` command inserts all sets in one transaction with deferred foreign keys, so the order of the sets does not matter.
 *
 * @invariant PL: Wiersze mają dokładnie pola tabeli (`table.$inferInsert`). EN: The rows have exactly the table fields (`table.$inferInsert`).
 */
export type SeedSet<T extends SQLiteTable = SQLiteTable> = {
  /** PL: Tabela, do której idą wiersze. EN: The table the rows go into. */
  table: T;
  /** PL: Wymyślone wiersze (bez prawdziwych danych osobowych). EN: The invented rows (no real personal data). */
  rows: T['$inferInsert'][];
};
