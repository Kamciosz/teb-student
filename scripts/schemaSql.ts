/**
 * PL: Zamienia schemat Drizzle (worker/db/schema/) na polecenia SQL, które zakładają wszystkie tabele od zera. To jedyne miejsce, które to robi: polecenie db:reset i testy Vitest biorą tabele stąd, więc baza lokalna i testowa nie mogą się rozjechać. Nie ma katalogu migracji (docs/STANDARD_KODU.md, część 7).
 * EN: Turns the Drizzle schema (worker/db/schema/) into the SQL statements that create all tables from zero. This is the only place that does it: the db:reset command and the Vitest tests take the tables from here, so the local and the test database cannot drift apart. There is no migrations directory (docs/STANDARD_KODU.md, part 7).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses drizzle.config.ts::default
 * @uses worker/db/schema/index.ts::*
 * @used_by scripts/db.ts::main
 * @used_by vitest.config.ts::default
 */

// PL: Uruchamianie drizzle-kit jako osobnego procesu.
// EN: Running drizzle-kit as a separate process.
import { execFileSync } from 'node:child_process';
// PL: Składanie ścieżek.
// EN: Building paths.
import { resolve } from 'node:path';

/**
 * PL: Prosi drizzle-kit o SQL, który tworzy cały schemat z pustej bazy. Polecenie `export` nie zapisuje niczego na dysku i nie porównuje z poprzednimi wersjami, więc nie ma plików migracji.
 * EN: Asks drizzle-kit for the SQL that creates the whole schema from an empty database. The `export` command writes nothing to disk and compares with no earlier versions, so there are no migration files.
 *
 * @returns PL: tekst SQL; pusty, gdy żaden moduł nie ma jeszcze tabel. EN: the SQL text; empty when no module has tables yet.
 * @throws PL: błąd, gdy schemat nie wczytuje się (na przykład błąd w pliku tabeli). EN: an error when the schema does not load (for example a mistake in a table file).
 */
export function generateSchemaSql(): string {
  // PL: Plik drizzle-kit uruchamiamy przez Node, a nie przez npx, żeby działał tak samo na każdym systemie.
  // EN: We run the drizzle-kit file through Node and not through npx, so it works the same on every system.
  const drizzleKit = resolve(process.cwd(), 'node_modules/drizzle-kit/bin.cjs');
  // PL: Ustawienia schematu są w drizzle.config.ts, w katalogu głównym repozytorium.
  // EN: The schema settings are in drizzle.config.ts, in the repository root.
  const output = execFileSync(process.execPath, [drizzleKit, 'export', '--config', 'drizzle.config.ts'], { encoding: 'utf8' });
  return output.trim();
}

/**
 * PL: Dzieli SQL na pojedyncze polecenia. Drizzle kończy każde polecenie średnikiem na końcu linii, a średnik w środku polecenia nie stoi na końcu linii.
 * EN: Splits the SQL into single statements. Drizzle ends every statement with a semicolon at the end of a line, and a semicolon inside a statement is not at the end of a line.
 *
 * @param sql - PL: tekst SQL z generateSchemaSql. EN: the SQL text from generateSchemaSql.
 * @returns PL: lista poleceń, każde z końcowym średnikiem; pusta lista dla pustego SQL. EN: the list of statements, each with a trailing semicolon; an empty list for empty SQL.
 */
export function splitStatements(sql: string): string[] {
  // PL: Puste SQL oznacza schemat bez tabel.
  // EN: Empty SQL means a schema with no tables.
  if (sql.trim() === '') return [];
  // PL: Tnij po średniku na końcu linii i odrzuć puste kawałki.
  // EN: Cut after a semicolon at the end of a line and drop empty pieces.
  return sql
    .split(/;[ \t]*\r?\n/)
    .map((statement) => statement.trim())
    .filter((statement) => statement !== '')
    .map((statement) => `${statement.replace(/;$/, '')};`);
}
