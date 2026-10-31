/**
 * PL: Generuje SQL do pierwszego wdrożenia bez wdrażania czegokolwiek. Bez argumentów zapisuje schemat bazy do dist-sql/schema.sql. Z `--first-admin <login>` zapisuje dwa pliki SQL pierwszego administratora (wpis kodu zaproszenia przed rejestracją i nadanie roli admin po rejestracji), a kod wypisuje tylko na ekran. Nic nie łączy się z Cloudflare ani z bazą zdalną. Uruchamia go package.json: `npm run db:prod-sql`.
 * EN: Generates the SQL for the first deploy without deploying anything. With no arguments it writes the database schema to dist-sql/schema.sql. With `--first-admin <login>` it writes two SQL files of the first administrator (the invitation code row before registration and the admin role grant after registration), and prints the code to the screen only. It connects to neither Cloudflare nor a remote database. package.json runs it: `npm run db:prod-sql`.
 *
 * @author Szymon
 * @since 2026-10-31
 * @uses scripts/schemaSql.ts::generateSchemaSql
 * @uses worker/auth/invite/firstAdminSql.ts::buildFirstAdminSql
 * @used_by package.json::scripts
 */

// PL: Zapis plików i składanie ścieżek.
// EN: Writing files and building paths.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
// PL: Wczytywanie plików TypeScript z kodu serwera tak, jak robi to Vite (importy bez rozszerzenia).
// EN: Loading TypeScript files of the server code the way Vite does (imports without an extension).
import { runnerImport } from 'vite';
// PL: SQL schematu z tego samego źródła co db:reset i testy.
// EN: The schema SQL from the same source as db:reset and the tests.
import { generateSchemaSql } from './schemaSql.ts';
// PL: Typy składania SQL pierwszego administratora (tylko typy, bez kodu).
// EN: The types of building the first administrator's SQL (types only, no code).
import type * as FirstAdmin from '../worker/auth/invite/firstAdminSql.ts';

/** PL: Katalog wyjściowy na pliki SQL. Jest w .gitignore. EN: The output directory for SQL files. It is in .gitignore. */
const OUT_DIR = 'dist-sql';

/**
 * PL: Zapisuje plik w dist-sql/. Prawa 0600, bo plik z kodem zaproszenia nie ma być czytelny dla innych kont.
 * EN: Writes a file into dist-sql/. Mode 0600, because a file with an invitation code must not be readable by other accounts.
 *
 * @param name - PL: nazwa pliku. EN: the file name.
 * @param content - PL: tekst SQL. EN: the SQL text.
 * @returns PL: pełna ścieżka zapisanego pliku. EN: the full path of the written file.
 */
function writeOut(name: string, content: string): string {
  const dir = resolve(process.cwd(), OUT_DIR);
  mkdirSync(dir, { recursive: true });
  const path = resolve(dir, name);
  writeFileSync(path, content, { mode: 0o600 });
  return path;
}

/**
 * PL: Zapisuje schemat bazy do dist-sql/schema.sql. Plik wykonuje się poleceniem `wrangler d1 execute`.
 * EN: Writes the database schema to dist-sql/schema.sql. The file runs with the `wrangler d1 execute` command.
 *
 * @returns PL: obietnica, która kończy się po zapisie. EN: a promise that settles after the write.
 */
async function schema(): Promise<void> {
  // PL: Pobierz SQL ze schematu. Pusty wynik oznacza schemat bez tabel, więc nie ma czego wdrażać.
  // EN: Get the SQL from the schema. An empty result means a schema with no tables, so there is nothing to deploy.
  const sql = generateSchemaSql();
  if (sql.trim() === '') throw new Error('Schemat jest pusty, nie ma tabel do zapisania. / The schema is empty, there are no tables to write.');
  const path = writeOut('schema.sql', `${sql}\n`);
  console.log(`Zapisano schemat: ${path} / Schema written: ${path}`);
}

/**
 * PL: Zapisuje SQL pierwszego administratora i wypisuje kod zaproszenia na ekran. Kolejność: najpierw plik z kodem (przed rejestracją), po rejestracji plik z nadaniem roli.
 * EN: Writes the first administrator's SQL and prints the invitation code on the screen. The order: first the code file (before registration), after registration the role grant file.
 *
 * @param login - PL: login pierwszego administratora. EN: the login of the first administrator.
 * @returns PL: obietnica, która kończy się po zapisie. EN: a promise that settles after the write.
 * @throws PL: błąd, gdy login nie spełnia reguł. EN: an error when the login breaks the rules.
 */
async function firstAdmin(login: string): Promise<void> {
  // PL: Wczytaj moduł składania tak jak Vite, bo jego importy nie mają rozszerzeń.
  // EN: Load the building module the way Vite does, because its imports have no extensions.
  const { module } = await runnerImport<typeof FirstAdmin>(resolve(process.cwd(), 'worker/auth/invite/firstAdminSql.ts'), { configFile: false });
  const { code, inviteSql, grantSql } = module.buildFirstAdminSql(login);

  const invitePath = writeOut('first-admin-invite.sql', `${inviteSql}\n`);
  const grantPath = writeOut('first-admin-grant.sql', `${grantSql}\n`);

  // PL: Kod idzie tylko na ekran, nie do pliku z logami ani do repozytorium.
  // EN: The code goes only to the screen, not to a log file or the repository.
  console.log(`Kod zaproszenia (ważny 14 dni, jednorazowy): ${code}`);
  console.log(`Kod zaproszenia (valid 14 days, one-time): ${code}`);
  console.log(`1. Przed rejestracją wykonaj: ${invitePath} / Before registration run: ${invitePath}`);
  console.log(`2. Zarejestruj konto tym kodem w aplikacji. / Register the account with this code in the app.`);
  console.log(`3. Po rejestracji wykonaj: ${grantPath} / After registration run: ${grantPath}`);
}

// PL: Polecenie z linii poleceń: bez argumentów schemat, z `--first-admin <login>` pierwszy administrator.
// EN: The command from the command line: no arguments for the schema, `--first-admin <login>` for the first administrator.
const [flag, login] = process.argv.slice(2);
if (flag === undefined) await schema();
else if (flag === '--first-admin' && login !== undefined) await firstAdmin(login);
else throw new Error('Użycie: npm run db:prod-sql [-- --first-admin <login>]. / Usage: npm run db:prod-sql [-- --first-admin <login>].');
