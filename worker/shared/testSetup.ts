/**
 * PL: Przygotowanie bazy w testach Vitest: przed każdym plikiem testów zakłada w env.DB wszystkie tabele ze schematu Drizzle. Test podtoru niczego nie zakłada sam: importuje swoją tabelę z worker/db/schema/ i używa env.DB. Plik jest wpisany w vitest.config.ts (setupFiles) i nie jest testem.
 * EN: Database preparation in Vitest tests: before every test file it creates all tables from the Drizzle schema in env.DB. A subtrack test creates nothing itself: it imports its table from worker/db/schema/ and uses env.DB. The file is listed in vitest.config.ts (setupFiles) and is not a test.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses vitest.config.ts::miniflare
 * @used_by vitest.config.ts::setupFiles
 */

// PL: applyD1Migrations wykonuje listę poleceń SQL na bazie i zapamiętuje, że już je wykonała.
// EN: applyD1Migrations runs a list of SQL statements on a database and remembers it already ran them.
import { applyD1Migrations } from 'cloudflare:test';
// PL: Środowisko testowe z bazą D1 (binding DB).
// EN: The test environment with the D1 database (the DB binding).
import { env } from 'cloudflare:workers';

// PL: Polecenia SQL schematu: vitest.config.ts wkłada je do bindingu TEST_SCHEMA_STATEMENTS jako tekst JSON.
// EN: The schema SQL statements: vitest.config.ts puts them into the TEST_SCHEMA_STATEMENTS binding as JSON text.
const statements: string[] = JSON.parse((env as unknown as { TEST_SCHEMA_STATEMENTS: string }).TEST_SCHEMA_STATEMENTS);

// PL: Załóż tabele. Schemat bez tabel nie ma co zakładać.
// EN: Create the tables. A schema with no tables has nothing to create.
if (statements.length > 0) await applyD1Migrations(env.DB, [{ name: 'schema', queries: statements }]);
