/**
 * PL: Polecenia lokalnej bazy D1: `reset` zakłada wszystkie tabele od zera ze schematu Drizzle, `seed` wpisuje dane testowe modułów. Działają na tej samej bazie lokalnej, której używają serwer deweloperski (npm run dev) i testy Playwright (stan w .wrangler/state). Uruchamia je package.json: `npm run db:reset` i `npm run db:seed`.
 * EN: The local D1 database commands: `reset` creates all tables from zero from the Drizzle schema, `seed` inserts the modules' test data. They work on the same local database used by the dev server (npm run dev) and the Playwright tests (state in .wrangler/state). package.json runs them: `npm run db:reset` and `npm run db:seed`.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses scripts/schemaSql.ts::generateSchemaSql
 * @uses scripts/schemaSql.ts::splitStatements
 * @uses worker/db/seed/index.ts::*
 * @uses worker/shared/seed.ts::SeedSet
 * @uses wrangler.jsonc::d1_databases
 * @used_by package.json::scripts
 */

// PL: Kasowanie katalogu z lokalną bazą.
// EN: Deleting the directory with the local database.
import { rmSync } from 'node:fs';
// PL: Składanie ścieżek.
// EN: Building paths.
import { resolve } from 'node:path';
// PL: Baza lokalna przez ten sam silnik (Miniflare), którego używa serwer deweloperski.
// EN: The local database through the same engine (Miniflare) the dev server uses.
import { getPlatformProxy } from 'wrangler';
// PL: Wczytywanie plików TypeScript z kodu serwera tak, jak robi to Vite (importy bez rozszerzenia).
// EN: Loading TypeScript files of the server code the way Vite does (imports without an extension).
import { runnerImport } from 'vite';
// PL: Drizzle: budowanie zapytań i opis tabel.
// EN: Drizzle: building queries and describing tables.
import { drizzle } from 'drizzle-orm/d1';
import { getTableColumns } from 'drizzle-orm';
// PL: SQL schematu.
// EN: The schema SQL.
import { generateSchemaSql, splitStatements } from './schemaSql.ts';
// PL: Typ zestawu danych testowych.
// EN: The test data set type.
import type { SeedSet } from '../worker/shared/seed.ts';
// PL: Typ bazy D1 (sam typ, bez globalnych typów Cloudflare, których Node.js nie ma).
// EN: The D1 database type (the type only, without the global Cloudflare types that Node.js does not have).
import type { D1Database } from '@cloudflare/workers-types';

/** PL: Katalog lokalnej bazy D1 w stanie Miniflare. EN: The local D1 directory in the Miniflare state. */
const LOCAL_D1_DIR = '.wrangler/state/v3/d1';

/** PL: D1 przyjmuje najwyżej 100 wartości w jednym zapytaniu. EN: D1 accepts at most 100 values in one query. */
const MAX_BOUND_VALUES = 100;

/** PL: Sufiks nazwy eksportu z zestawami danych testowych (zob. SeedSet). EN: The suffix of the export name that holds test data sets (see SeedSet). */
const SEED_EXPORT_SUFFIX = '_SEED_SETS';

/**
 * PL: Zakłada wszystkie tabele od zera: kasuje lokalną bazę i wykonuje SQL ze schematu.
 * EN: Creates all tables from zero: deletes the local database and runs the schema SQL.
 *
 * @returns PL: obietnica, która kończy się po założeniu tabel. EN: a promise that settles after the tables are created.
 * @throws PL: błąd, gdy schemat się nie wczytuje albo SQL jest zły. EN: an error when the schema does not load or the SQL is wrong.
 */
async function reset(): Promise<void> {
  // PL: Pobierz SQL przed skasowaniem bazy, żeby błąd w schemacie nie zostawił użytkownika bez bazy.
  // EN: Get the SQL before deleting the database, so a schema error does not leave the user without a database.
  const statements = splitStatements(generateSchemaSql());
  // PL: Skasuj starą bazę lokalną. Serwer deweloperski musi być wtedy wyłączony.
  // EN: Delete the old local database. The dev server must be stopped then.
  rmSync(resolve(process.cwd(), LOCAL_D1_DIR), { recursive: true, force: true });
  // PL: Otwórz nową, pustą bazę.
  // EN: Open a new, empty database.
  const { env, dispose } = await getPlatformProxy<{ DB: D1Database }>({ configPath: 'wrangler.jsonc' });
  try {
    // PL: Wykonaj polecenia w jednej transakcji. Pusty schemat nie ma co wykonywać.
    // EN: Run the statements in one transaction. An empty schema has nothing to run.
    if (statements.length > 0) await env.DB.batch(statements.map((statement) => env.DB.prepare(statement)));
    console.log(`Baza lokalna: założono ${statements.length} poleceń SQL ze schematu. / Local database: ${statements.length} SQL statements from the schema applied.`);
  } finally {
    // PL: Zamknij bazę, żeby zapis trafił na dysk.
    // EN: Close the database so the write reaches the disk.
    await dispose();
  }
}

/**
 * PL: Zbiera zestawy danych testowych z worker/db/seed/index.ts: każdy eksport o nazwie kończącej się na _SEED_SETS.
 * EN: Collects the test data sets from worker/db/seed/index.ts: every export whose name ends with _SEED_SETS.
 *
 * @returns PL: lista zestawów wszystkich modułów. EN: the list of sets of all modules.
 */
async function collectSeedSets(): Promise<SeedSet[]> {
  // PL: Wczytaj plik zbierający dane testowe.
  // EN: Load the file that collects the test data.
  const { module } = await runnerImport<Record<string, unknown>>(resolve(process.cwd(), 'worker/db/seed/index.ts'), { configFile: false });
  // PL: Weź eksporty o właściwej nazwie i połącz ich listy.
  // EN: Take the exports with the right name and join their lists.
  return Object.entries(module)
    .filter(([name]) => name.endsWith(SEED_EXPORT_SUFFIX))
    .flatMap(([, sets]) => sets as SeedSet[]);
}

/**
 * PL: Wpisuje dane testowe do lokalnej bazy w jednej transakcji z odroczonymi kluczami obcymi.
 * EN: Inserts the test data into the local database in one transaction with deferred foreign keys.
 *
 * @returns PL: obietnica, która kończy się po wpisaniu danych. EN: a promise that settles after the data is inserted.
 * @throws PL: błąd, gdy baza nie ma tabel (najpierw `npm run db:reset`) albo wiersz łamie schemat. EN: an error when the database has no tables (run `npm run db:reset` first) or a row breaks the schema.
 */
async function seed(): Promise<void> {
  // PL: Zestawy danych wszystkich modułów.
  // EN: The data sets of all modules.
  const sets = await collectSeedSets();
  const { env, dispose } = await getPlatformProxy<{ DB: D1Database }>({ configPath: 'wrangler.jsonc' });
  try {
    // PL: Odrocz klucze obce do końca transakcji, bo kolejność zestawów między modułami jest dowolna.
    // EN: Defer the foreign keys to the end of the transaction, because the order of sets between modules is arbitrary.
    const statements = [env.DB.prepare('PRAGMA defer_foreign_keys = on')];
    for (const set of sets) {
      // PL: Tnij wiersze na kawałki, żeby zmieścić się w limicie wartości w jednym zapytaniu.
      // EN: Cut the rows into chunks to fit the limit of values in one query.
      const columnCount = Object.keys(getTableColumns(set.table)).length;
      const chunkSize = Math.max(1, Math.floor(MAX_BOUND_VALUES / columnCount));
      for (let start = 0; start < set.rows.length; start += chunkSize) {
        const { sql, params } = drizzle(env.DB).insert(set.table).values(set.rows.slice(start, start + chunkSize)).toSQL();
        statements.push(env.DB.prepare(sql).bind(...params));
      }
    }
    // PL: Bez wierszy nie ma czego wpisywać (zostaje tylko PRAGMA).
    // EN: Without rows there is nothing to insert (only the PRAGMA remains).
    if (statements.length > 1) {
      try {
        await env.DB.batch(statements);
      } catch (error) {
        // PL: Miniflare pisze tylko „internal error”, więc dopisz najczęstsze przyczyny.
        // EN: Miniflare writes only "internal error", so add the most common causes.
        throw new Error('Wpisanie danych testowych się nie udało: brak tabel (najpierw npm run db:reset), powtórzony klucz (db:seed działa raz po db:reset) albo wiersz bez istniejącego rodzica (klucz obcy). / Inserting the test data failed: no tables (run npm run db:reset first), a repeated key (db:seed runs once after db:reset) or a row without an existing parent (foreign key).', { cause: error });
      }
    }
    console.log(`Baza lokalna: wpisano dane testowe z ${sets.length} zestawów. / Local database: test data from ${sets.length} sets inserted.`);
  } finally {
    // PL: Zamknij bazę, żeby zapis trafił na dysk.
    // EN: Close the database so the write reaches the disk.
    await dispose();
  }
}

// PL: Polecenie z linii poleceń: `reset` albo `seed`.
// EN: The command from the command line: `reset` or `seed`.
const command = process.argv[2];
if (command === 'reset') await reset();
else if (command === 'seed') await seed();
else throw new Error(`Nieznane polecenie „${command}”, użyj reset albo seed. / Unknown command "${command}", use reset or seed.`);
