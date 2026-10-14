/**
 * PL: Porównuje bazę D1 ze schematem z scripts/schemaSql.ts i wypisuje polecenia SQL, które dopisują brakujące tabele i kolumny. Nic nie wykonuje w bazie: wynik trzeba przejrzeć i uruchomić samemu, np. `npx wrangler d1 execute teb-student --local --file wynik.sql`.
 * EN: Compares the D1 database with the schema from scripts/schemaSql.ts and prints the SQL statements that add the missing tables and columns. It runs nothing against the database: review the output and run it yourself, e.g. `npx wrangler d1 execute teb-student --local --file out.sql`.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-14
 * @uses scripts/schemaSql.ts::generateSchemaSql
 * @uses scripts/schemaSql.ts::splitStatements
 * @uses wrangler.jsonc::d1_databases
 * @used_by docs/zmiany/build-db-roznice-schematu.md::instrukcja
 */

// PL: Uruchamianie wranglera jako osobnego procesu (zapytanie do bazy).
// EN: Running Wrangler as a separate process (the query to the database).
import { execFileSync } from 'node:child_process';
// PL: Odczyt ustawień z wrangler.jsonc tak, jak robi to Wrangler.
// EN: Reading the settings from wrangler.jsonc the way Wrangler does it.
import { unstable_readConfig } from 'wrangler';
// PL: Schemat z kodu: te same polecenia, których używa db:reset.
// EN: The schema from the code: the same statements that db:reset uses.
import { generateSchemaSql, splitStatements } from './schemaSql.ts';

/** PL: Kolumna ze schematu. EN: A column from the schema. */
export interface SchemaColumn {
  /** PL: Nazwa kolumny bez backticków. EN: The column name without backticks. */
  name: string;
  /** PL: Definicja z nazwą, np. `id` text NOT NULL, gotowa do ADD COLUMN. EN: The definition with the name, e.g. `id` text NOT NULL, ready for ADD COLUMN. */
  definition: string;
}

/** PL: Tabela ze schematu z jej poleceniami. EN: A table from the schema with its statements. */
export interface SchemaTable {
  name: string;
  /** PL: Polecenie CREATE TABLE. EN: The CREATE TABLE statement. */
  createSql: string;
  /** PL: Polecenia CREATE INDEX tej tabeli. EN: The CREATE INDEX statements of this table. */
  indexSql: string[];
  columns: SchemaColumn[];
  /** PL: Nazwy kolumn z klauzul FOREIGN KEY na poziomie tabeli. EN: Names of the columns in table-level FOREIGN KEY clauses. */
  foreignKeyColumns: string[];
}

/** PL: Wiersz z zapytania o kolumny w bazie. EN: A row from the query about the database columns. */
export interface DbColumnRow {
  table_name: string;
  column_name: string;
}

// PL: Zapytanie o tabele i kolumny w bazie (sqlite_master i PRAGMA table_info). Tabel wewnętrznych (sqlite_*, _cf_*, d1_*) D1 nie pozwala czytać (błąd SQLITE_AUTH), więc są pomijane.
// EN: The query for the tables and columns in the database (sqlite_master and PRAGMA table_info). D1 does not allow reading its internal tables (sqlite_*, _cf_*, d1_*; error SQLITE_AUTH), so they are skipped.
const COLUMNS_QUERY = "SELECT m.name AS table_name, p.name AS column_name FROM sqlite_master AS m JOIN pragma_table_info(m.name) AS p WHERE m.type = 'table' AND m.name NOT LIKE 'sqlite_%' AND m.name NOT LIKE '_cf_%' AND m.name NOT LIKE 'd1_%' ORDER BY m.name, p.cid";

/**
 * PL: Wyciąga kolumny z CREATE TABLE. Drizzle zapisuje każdą kolumnę w osobnej linii, zaczynającej się od nazwy w backtickach.
 * EN: Takes the columns from CREATE TABLE. Drizzle writes every column on its own line, starting with the name in backticks.
 *
 * @param createSql - PL: polecenie CREATE TABLE. EN: the CREATE TABLE statement.
 * @returns PL: kolumny w kolejności ze schematu. EN: the columns in the schema order.
 */
export function parseColumns(createSql: string): SchemaColumn[] {
  const columns: SchemaColumn[] = [];
  for (const raw of createSql.split('\n')) {
    // PL: Usuń wcięcie i przecinek na końcu linii.
    // EN: Remove the indentation and the comma at the end of the line.
    const line = raw.trim().replace(/,$/, '');
    const match = /^`([^`]+)`/.exec(line);
    if (match?.[1]) columns.push({ name: match[1], definition: line });
  }
  return columns;
}

/**
 * PL: Znajduje kolumny użyte w kluczach obcych na poziomie tabeli (FOREIGN KEY (`kolumna`) ...).
 * EN: Finds the columns used in table-level foreign keys (FOREIGN KEY (`column`) ...).
 *
 * @param createSql - PL: polecenie CREATE TABLE. EN: the CREATE TABLE statement.
 * @returns PL: nazwy kolumn z kluczami obcymi. EN: the names of the columns with foreign keys.
 */
export function parseForeignKeyColumns(createSql: string): string[] {
  return [...createSql.matchAll(/FOREIGN KEY \(`([^`]+)`\)/g)].map((match) => String(match[1]));
}

/**
 * PL: Zamienia polecenia ze schematu na tabele: kolumny i indeksy każdej tabeli. Indeksy idą do tabeli, której dotyczą.
 * EN: Turns the schema statements into tables: the columns and indexes of each table. Indexes go to the table they belong to.
 *
 * @param statements - PL: polecenia z splitStatements. EN: the statements from splitStatements.
 * @returns PL: tabele w kolejności ze schematu. EN: the tables in the schema order.
 */
export function parseSchemaStatements(statements: string[]): SchemaTable[] {
  const tables = new Map<string, SchemaTable>();
  for (const sql of statements) {
    const created = /^CREATE TABLE `([^`]+)`/.exec(sql);
    if (created?.[1]) {
      tables.set(created[1], { name: created[1], createSql: sql, indexSql: [], columns: parseColumns(sql), foreignKeyColumns: parseForeignKeyColumns(sql) });
    }
  }
  for (const sql of statements) {
    const indexed = /^CREATE (?:UNIQUE )?INDEX `[^`]+` ON `([^`]+)`/.exec(sql);
    if (indexed?.[1]) tables.get(indexed[1])?.indexSql.push(sql);
  }
  return [...tables.values()];
}

/**
 * PL: Zamienia odpowiedź Wranglera (`--json`) na listę wierszy z pierwszego zapytania.
 * EN: Turns the Wrangler answer (`--json`) into the list of rows of the first query.
 *
 * @param stdout - PL: tekst JSON z wyjścia wranglera. EN: the JSON text from the Wrangler output.
 * @returns PL: wiersze tabel i kolumn; pusta lista, gdy baza nie ma tabel. EN: the table and column rows; an empty list when the database has no tables.
 */
export function parseQueryResult(stdout: string): DbColumnRow[] {
  const parsed = JSON.parse(stdout) as { results?: DbColumnRow[] }[];
  return parsed[0]?.results ?? [];
}

/**
 * PL: Grupuje wiersze z bazy: dla każdej tabeli zbiór jej kolumn.
 * EN: Groups the database rows: for each table, the set of its columns.
 *
 * @param rows - PL: wiersze z parseQueryResult. EN: the rows from parseQueryResult.
 * @returns PL: mapa nazwa tabeli → zbiór nazw kolumn. EN: a map from the table name to the set of column names.
 */
export function groupColumns(rows: DbColumnRow[]): Map<string, Set<string>> {
  const tables = new Map<string, Set<string>>();
  for (const row of rows) {
    const columns = tables.get(row.table_name) ?? new Set<string>();
    columns.add(row.column_name);
    tables.set(row.table_name, columns);
  }
  return tables;
}

/**
 * PL: Powody, dla których SQLite nie dopisze kolumny przez ALTER TABLE ... ADD COLUMN (pusta lista, gdy może).
 * EN: The reasons why SQLite will not add the column with ALTER TABLE ... ADD COLUMN (an empty list when it can).
 *
 * @param column - PL: kolumna do dopisania. EN: the column to add.
 * @returns PL: opisy przeszkód. EN: descriptions of the obstacles.
 */
export function columnBlockers(column: SchemaColumn): string[] {
  const definition = column.definition;
  const reasons: string[] = [];
  if (/\bPRIMARY KEY\b/i.test(definition)) reasons.push('PRIMARY KEY / klucz główny');
  if (/\bUNIQUE\b/i.test(definition)) reasons.push('UNIQUE / unikalność');
  if (/\bDEFAULT\s*\(|\bDEFAULT\s+CURRENT_/i.test(definition)) reasons.push('DEFAULT wyrażeniowy albo CURRENT_* / expression or CURRENT_* default');
  if (/\bNOT NULL\b/i.test(definition) && !/\bDEFAULT\b/i.test(definition)) reasons.push('NOT NULL bez DEFAULT / NOT NULL without DEFAULT');
  return reasons;
}

/**
 * PL: Polecenia dla jednej brakującej kolumny: komentarz, ostrzeżenia i ALTER TABLE. Gdy SQLite go nie przyjmie, ALTER TABLE jest zakomentowany, żeby plik dało się uruchomić bez błędu w połowie.
 * EN: The statements for one missing column: a comment, warnings and ALTER TABLE. When SQLite would reject it, the ALTER TABLE is commented out, so the file can be run without failing halfway.
 *
 * @param table - PL: tabela, do której brakuje kolumny. EN: the table that lacks the column.
 * @param column - PL: brakująca kolumna. EN: the missing column.
 * @returns PL: linie SQL i komentarzy. EN: lines of SQL and comments.
 */
function alterColumnSql(table: SchemaTable, column: SchemaColumn): string[] {
  const statement = `ALTER TABLE \`${table.name}\` ADD COLUMN ${column.definition};`;
  const lines = [`-- Brakująca kolumna / Missing column: ${table.name}.${column.name}`];
  if (table.foreignKeyColumns.includes(column.name)) {
    lines.push('-- UWAGA: klucz obcy z poziomu tabeli nie zostanie dopisany (ALTER TABLE tego nie umie). / WARNING: the table-level foreign key will not be added (ALTER TABLE cannot do it).');
  }
  const reasons = columnBlockers(column);
  if (reasons.length === 0) return [...lines, statement];
  lines.push(`-- UWAGA: SQLite nie dopisze tej kolumny (${reasons.join('; ')}). Polecenie jest zakomentowane, tabelę trzeba przebudować ręcznie. / WARNING: SQLite will not add this column (${reasons.join('; ')}). The statement is commented out, the table must be rebuilt by hand.`);
  return [...lines, `-- ${statement}`];
}

/**
 * PL: Polecenia dla brakujących tabel (CREATE TABLE z indeksami) i brakujących kolumn (ALTER TABLE). Tabele i kolumny, których nie ma w schemacie, są ignorowane.
 * EN: The statements for missing tables (CREATE TABLE with indexes) and missing columns (ALTER TABLE). Tables and columns that are not in the schema are ignored.
 *
 * @param tables - PL: tabele ze schematu. EN: the tables from the schema.
 * @param actual - PL: mapa nazwa tabeli → kolumny z bazy. EN: a map from the table name to the columns in the database.
 * @returns PL: linie SQL; pusta lista, gdy nie ma różnic. EN: lines of SQL; an empty list when there are no differences.
 */
export function buildDiffSql(tables: SchemaTable[], actual: Map<string, Set<string>>): string[] {
  const lines: string[] = [];
  for (const table of tables) {
    const existing = actual.get(table.name);
    if (!existing) {
      lines.push(`-- Brakująca tabela / Missing table: ${table.name}`, table.createSql, ...table.indexSql);
      continue;
    }
    for (const column of table.columns) {
      if (!existing.has(column.name)) lines.push(...alterColumnSql(table, column));
    }
  }
  return lines;
}

/**
 * PL: Składa wynik: nagłówek z nazwą bazy i treścią, a przy braku różnic komunikat „brak różnic”. Każda linia to komentarz albo SQL, więc cały wynik da się zapisać jako plik .sql.
 * EN: Builds the output: a header with the database name and the content, and the message "brak różnic" when there are no differences. Every line is a comment or SQL, so the whole output can be saved as a .sql file.
 *
 * @param lines - PL: linie z buildDiffSql. EN: the lines from buildDiffSql.
 * @param label - PL: nazwa bazy i tryb, np. teb-student, local. EN: the database name and the mode, e.g. teb-student, local.
 * @returns PL: gotowy tekst wyniku. EN: the ready output text.
 */
export function renderReport(lines: string[], label: string): string {
  const header = [
    `-- Porównanie schematu z bazą ${label} / Schema comparison with the database ${label}`,
    '-- Nic nie zostało wykonane w bazie / Nothing was run against the database',
  ];
  const body = lines.length > 0 ? lines : ['-- brak różnic: baza zgadza się ze schematem / no differences: the database matches the schema'];
  return [...header, '', ...body].join('\n');
}

/**
 * PL: Czyta opcje wiersza poleceń: domyślnie baza lokalna, `--remote` dla bazy w Cloudflare.
 * EN: Reads the command line options: the local database by default, `--remote` for the database in Cloudflare.
 *
 * @param argv - PL: opcje bez nazwy programu. EN: the options without the program name.
 * @returns PL: true dla bazy zdalnej. EN: true for the remote database.
 * @throws PL: błąd dla nieznanej opcji albo gdy podano oba tryby. EN: an error for an unknown option or when both modes are given.
 */
export function parseArgs(argv: string[]): boolean {
  const unknown = argv.find((arg) => arg !== '--local' && arg !== '--remote');
  if (unknown !== undefined) throw new Error(`Nieznana opcja „${unknown}”, użyj --local albo --remote. / Unknown option "${unknown}", use --local or --remote.`);
  if (argv.includes('--local') && argv.includes('--remote')) throw new Error('Podaj tylko --local albo --remote, nie oba naraz. / Give only --local or --remote, not both.');
  return argv.includes('--remote');
}

/**
 * PL: Nazwa bazy D1 z wrangler.jsonc (binding DB).
 * EN: The D1 database name from wrangler.jsonc (binding DB).
 *
 * @returns PL: nazwa bazy. EN: the database name.
 * @throws PL: błąd, gdy w wrangler.jsonc nie ma bazy z bindingiem DB. EN: an error when wrangler.jsonc has no database with the DB binding.
 */
function readDatabaseName(): string {
  const database = unstable_readConfig({ config: 'wrangler.jsonc' }).d1_databases.find((item: { binding?: string }) => item.binding === 'DB');
  if (!database?.database_name) throw new Error('W wrangler.jsonc brak bazy z bindingiem DB. / wrangler.jsonc has no database with the DB binding.');
  return database.database_name;
}

/**
 * PL: Pyta bazę o tabele i kolumny przez `wrangler d1 execute`. Nic nie zmienia w bazie.
 * EN: Asks the database for its tables and columns through `wrangler d1 execute`. It changes nothing in the database.
 *
 * @param databaseName - PL: nazwa bazy D1. EN: the D1 database name.
 * @param remote - PL: true dla bazy w Cloudflare, false dla lokalnej. EN: true for the database in Cloudflare, false for the local one.
 * @returns PL: wiersze tabel i kolumn. EN: the table and column rows.
 */
function queryDatabase(databaseName: string, remote: boolean): DbColumnRow[] {
  const args = ['wrangler', 'd1', 'execute', databaseName, remote ? '--remote' : '--local', '--json', '--command', COLUMNS_QUERY];
  // PL: Wejście zamknięte, bo wrangler nie może czekać na odpowiedź z klawiatury.
  // EN: Input closed, because Wrangler must not wait for an answer from the keyboard.
  return parseQueryResult(execFileSync('npx', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
}

/**
 * PL: Uruchamia porównanie i wypisuje wynik na standardowe wyjście.
 * EN: Runs the comparison and prints the result to the standard output.
 *
 * @param argv - PL: opcje wiersza poleceń. EN: the command line options.
 */
function main(argv: string[]): void {
  const remote = parseArgs(argv);
  const databaseName = readDatabaseName();
  const tables = parseSchemaStatements(splitStatements(generateSchemaSql()));
  const actual = groupColumns(queryDatabase(databaseName, remote));
  console.log(renderReport(buildDiffSql(tables, actual), `${databaseName} (${remote ? 'remote' : 'local'})`));
}

// PL: Uruchomienie z linii poleceń (node scripts/dbDiff.ts); import w testach daje tylko funkcje.
// EN: Running from the command line (node scripts/dbDiff.ts); an import in tests gives only the functions.
if (import.meta.filename === process.argv[1]) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
