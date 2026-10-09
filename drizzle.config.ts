/**
 * PL: Ustawienia Drizzle Kit. Mówią, gdzie leży schemat bazy i że baza to SQLite (D1). Nie ma tu katalogu migracji, bo do pilotażu bazę tworzymy od nowa ze schematu (AGENTS.md, „Założenia architektury”, punkt 1).
 * EN: Drizzle Kit settings. They say where the database schema is and that the database is SQLite (D1). There is no migrations directory, because until the pilot we create the database from scratch from the schema (AGENTS.md, "Założenia architektury", point 1).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/db/schema/index.ts::*
 * @used_by scripts/schemaSql.ts::generateSchemaSql
 */

// PL: defineConfig podpowiada edytorowi, jakie ustawienia są dozwolone.
// EN: defineConfig tells the editor which settings are allowed.
import { defineConfig } from 'drizzle-kit';

// PL: Ustawienia, które czyta drizzle-kit.
// EN: The settings read by drizzle-kit.
export default defineConfig({
  // PL: D1 to SQLite w chmurze Cloudflare.
  // EN: D1 is SQLite in the Cloudflare cloud.
  dialect: 'sqlite',
  // PL: Plik, który zbiera tabele wszystkich modułów (każdy moduł ma tam swój wiersz).
  // EN: The file that collects the tables of all modules (every module has its row there).
  schema: './worker/db/schema/index.ts',
});
