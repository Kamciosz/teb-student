/**
 * PL: Ustawienia Vitest. Testy Workera działają w środowisku Cloudflare (workerd), tak jak na serwerze.
 * EN: Vitest settings. Worker tests run in the Cloudflare environment (workerd), as on the server.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses wrangler.jsonc::main
 * @uses scripts/schemaSql.ts::generateSchemaSql
 * @uses worker/shared/testSetup.ts::*
 * @used_by package.json::scripts
 */

// PL: Wtyczka uruchamia testy w środowisku Cloudflare.
// EN: The plugin runs tests in the Cloudflare environment.
import { cloudflareTest } from '@cloudflare/vitest-plugin';
// PL: SQL schematu bazy, ten sam, który zakłada bazę lokalną (npm run db:reset).
// EN: The database schema SQL, the same one that creates the local database (npm run db:reset).
import { generateSchemaSql, splitStatements } from './scripts/schemaSql.ts';
// PL: defineConfig podpowiada edytorowi, jakie ustawienia są dozwolone.
// EN: defineConfig tells the editor which settings are allowed.
import { defineConfig } from 'vitest/config';

// PL: Ustawienia, które czyta polecenie test.
// EN: The settings read by the test command.
export default defineConfig({
  // PL: Test Workera czyta jego ustawienia z wrangler.jsonc, w tym bazę D1 (binding DB).
  // EN: The Worker test reads its settings from wrangler.jsonc, including the D1 database (the DB binding).
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      // PL: Polecenia SQL schematu jadą do środowiska testowego jako binding, bo kod w workerd nie czyta plików. Plik worker/shared/testSetup.ts zakłada z nich tabele przed każdym plikiem testów.
      // EN: The schema SQL statements travel to the test environment as a binding, because code in workerd cannot read files. The worker/shared/testSetup.ts file creates the tables from them before every test file.
      miniflare: { bindings: { TEST_SCHEMA_STATEMENTS: JSON.stringify(splitStatements(generateSchemaSql())) } },
    }),
  ],
  test: {
    // PL: Przed każdym plikiem testów załóż tabele ze schematu w bazie testowej.
    // EN: Before every test file, create the schema tables in the test database.
    setupFiles: ['./worker/shared/testSetup.ts'],
    // PL: Tylko pliki testów jednostkowych. Testy Playwright są w e2e/ i mają własne polecenie.
    // EN: Only unit test files. Playwright tests live in e2e/ and have their own command.
    include: ['worker/**/*.test.ts', 'src/**/*.test.{ts,tsx}'],
  },
});
