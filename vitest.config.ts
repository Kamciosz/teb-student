/**
 * PL: Ustawienia Vitest. Testy Workera działają w środowisku Cloudflare (workerd), tak jak na serwerze.
 * EN: Vitest settings. Worker tests run in the Cloudflare environment (workerd), as on the server.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses wrangler.jsonc::main
 * @used_by package.json::scripts
 */

// PL: Wtyczka uruchamia testy w środowisku Cloudflare.
// EN: The plugin runs tests in the Cloudflare environment.
import { cloudflareTest } from '@cloudflare/vitest-plugin';
// PL: defineConfig podpowiada edytorowi, jakie ustawienia są dozwolone.
// EN: defineConfig tells the editor which settings are allowed.
import { defineConfig } from 'vitest/config';

// PL: Ustawienia, które czyta polecenie test.
// EN: The settings read by the test command.
export default defineConfig({
  // PL: Test Workera czyta jego ustawienia z wrangler.jsonc.
  // EN: The Worker test reads its settings from wrangler.jsonc.
  plugins: [cloudflareTest({ wrangler: { configPath: './wrangler.jsonc' } })],
  test: {
    // PL: Tylko pliki testów jednostkowych. Testy Playwright są w e2e/ i mają własne polecenie.
    // EN: Only unit test files. Playwright tests live in e2e/ and have their own command.
    include: ['worker/**/*.test.ts', 'src/**/*.test.{ts,tsx}'],
  },
});
