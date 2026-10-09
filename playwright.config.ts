/**
 * PL: Ustawienia Playwright. Uruchamia serwer deweloperski na porcie ze zmiennej PORT i otwiera w nim aplikację w przeglądarce.
 * EN: Playwright settings. Starts the dev server on the port from the PORT variable and opens the app in a browser.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses vite.config.ts::defineConfig
 * @used_by package.json::scripts
 */

// PL: defineConfig podpowiada edytorowi, jakie ustawienia są dozwolone.
// EN: defineConfig tells the editor which settings are allowed.
import { defineConfig } from '@playwright/test';

// PL: Port, gdy zmienna PORT nie jest ustawiona. Taki sam jak w vite.config.ts.
// EN: The port when the PORT variable is not set. The same as in vite.config.ts.
const DEFAULT_PORT = 5173;

// PL: Port tego agenta (docs/PODZIAL_PRACY.md, część 3).
// EN: This agent's port (docs/PODZIAL_PRACY.md, part 3).
const port = Number(process.env.PORT ?? DEFAULT_PORT);

// PL: Ustawienia, które czyta polecenie test:e2e.
// EN: The settings read by the test:e2e command.
export default defineConfig({
  // PL: Katalog z testami całych ścieżek.
  // EN: Directory with the end-to-end tests.
  testDir: './e2e',
  // PL: Ustawienia wspólne dla wszystkich testów.
  // EN: Settings shared by all tests.
  use: {
    // PL: Adres aplikacji, względem którego otwierają się strony w testach.
    // EN: The app address that pages in tests are opened relative to.
    baseURL: `http://localhost:${port}`,
  },
  // PL: Serwer, który Playwright uruchamia przed testami i zatrzymuje po nich.
  // EN: The server Playwright starts before the tests and stops after them.
  webServer: {
    // PL: Polecenie, które uruchamia aplikację na czas testów.
    // EN: The command that starts the app for the tests.
    command: 'npm run dev',
    // PL: Playwright czeka, aż ten adres odpowie.
    // EN: Playwright waits until this address answers.
    url: `http://localhost:${port}`,
    // PL: Zawsze startuj własny serwer. Cudzy serwer na tym porcie dałby cudzy wynik.
    // EN: Always start our own server. A foreign server on this port would give a foreign result.
    reuseExistingServer: false,
    // PL: Przekaż port do serwera deweloperskiego.
    // EN: Pass the port to the dev server.
    env: { PORT: String(port) },
  },
});
