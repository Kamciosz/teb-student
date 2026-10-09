/**
 * PL: Ustawienia Playwright. Uruchamia serwer deweloperski na porcie ze zmiennej PORT i otwiera w nim aplikację w przeglądarce. Test PWA (e2e/pwa.spec.ts) działa na zbudowanej aplikacji, bo service worker nie działa w serwerze deweloperskim.
 * EN: Playwright settings. Starts the dev server on the port from the PORT variable and opens the app in a browser. The PWA test (e2e/pwa.spec.ts) runs on the built app, because the service worker does not run in the dev server.
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

// PL: Port podglądu zbudowanej aplikacji: port deweloperski plus 1000, żeby nie zderzył się z portem innego podtoru.
// EN: Port of the built app preview: the dev port plus 1000, so it does not collide with another subtrack's port.
const previewPort = port + 1000;

// PL: Plik testu PWA. Ten test jest jedyny, który działa na podglądzie.
// EN: The PWA test file. This is the only test that runs against the preview.
const PWA_SPEC = 'pwa.spec.ts';

// PL: Ustawienia, które czyta polecenie test:e2e.
// EN: The settings read by the test:e2e command.
export default defineConfig({
  // PL: Katalog z testami całych ścieżek.
  // EN: Directory with the end-to-end tests.
  testDir: './e2e',
  // PL: Dwa zestawy testów: zwykłe na serwerze deweloperskim i test PWA na zbudowanej aplikacji.
  // EN: Two test sets: the regular ones on the dev server and the PWA test on the built app.
  projects: [
    // PL: Wszystkie testy oprócz testu PWA, na serwerze deweloperskim (adres z `use` niżej).
    // EN: All tests except the PWA test, on the dev server (the address from `use` below).
    { name: 'app', testIgnore: PWA_SPEC },
    // PL: Test PWA na zbudowanej aplikacji z polecenia preview.
    // EN: The PWA test on the built app from the preview command.
    { name: 'pwa', testMatch: PWA_SPEC, use: { baseURL: `http://localhost:${previewPort}` } },
  ],
  // PL: Ustawienia wspólne dla wszystkich testów.
  // EN: Settings shared by all tests.
  use: {
    // PL: Adres aplikacji, względem którego otwierają się strony w testach.
    // EN: The app address that pages in tests are opened relative to.
    baseURL: `http://localhost:${port}`,
  },
  // PL: Serwery, które Playwright uruchamia przed testami i zatrzymuje po nich.
  // EN: The servers Playwright starts before the tests and stops after them.
  webServer: [
    {
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
    {
      // PL: Zbuduj aplikację i uruchom jej podgląd. Samo budowanie jest potrzebne, bo service worker powstaje dopiero przy budowaniu.
      // EN: Build the app and start its preview. The build is needed, because the service worker is only created during the build.
      command: 'npm run build && npx vite preview',
      // PL: Playwright czeka, aż podgląd odpowie.
      // EN: Playwright waits until the preview answers.
      url: `http://localhost:${previewPort}`,
      // PL: Własny serwer także tutaj, z tego samego powodu.
      // EN: Our own server here too, for the same reason.
      reuseExistingServer: false,
      // PL: Budowanie trwa dłużej niż domyślne 60 sekund na wolnym komputerze, więc dajemy 3 minuty.
      // EN: The build can take longer than the default 60 seconds on a slow computer, so we allow 3 minutes.
      timeout: 180_000,
      // PL: Podgląd czyta port ze zmiennej PORT (vite.config.ts, sekcja preview).
      // EN: The preview reads the port from the PORT variable (vite.config.ts, the preview section).
      env: { PORT: String(previewPort) },
    },
  ],
});
