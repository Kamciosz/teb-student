/**
 * PL: Ustawienia Vite: budowanie ekranów React (z React Compiler), wersja dla starszych telefonów, Worker Hono w serwerze deweloperskim i port ze zmiennej PORT.
 * EN: Vite settings: building React screens (with React Compiler), a build for older phones, the Hono Worker in the dev server and the port from the PORT variable.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses wrangler.jsonc::main
 * @uses index.html::root
 * @used_by package.json::scripts
 * @used_by playwright.config.ts::webServer
 */

// PL: Wtyczka Cloudflare uruchamia Worker razem z Vite i buduje go do wdrożenia.
// EN: The Cloudflare plugin runs the Worker together with Vite and builds it for deployment.
import { cloudflare } from '@cloudflare/vite-plugin';
// PL: Babel dla React Compiler. Compiler sam optymalizuje odświeżanie ekranów.
// EN: Babel for React Compiler. The compiler optimizes screen re-rendering by itself.
import babel from '@rolldown/plugin-babel';
// PL: Wtyczka React i gotowe ustawienie React Compiler.
// EN: The React plugin and the ready-made React Compiler preset.
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
// PL: Wtyczka robi drugą wersję plików dla starszych telefonów (iOS 15 i starszy Android).
// EN: The plugin makes a second set of files for older phones (iOS 15 and older Android).
import legacy from '@vitejs/plugin-legacy';
// PL: defineConfig podpowiada edytorowi, jakie ustawienia są dozwolone.
// EN: defineConfig tells the editor which settings are allowed.
import { defineConfig } from 'vite';

// PL: Port, gdy zmienna PORT nie jest ustawiona. To domyślny port Vite.
// EN: The port when the PORT variable is not set. This is the Vite default port.
const DEFAULT_PORT = 5173;

// PL: Port serwera deweloperskiego: PORT z komputera agenta albo domyślny. Każdy podtor ma swój (docs/PODZIAL_PRACY.md, część 3).
// EN: Dev server port: PORT from the agent's computer or the default. Each subtrack has its own (docs/PODZIAL_PRACY.md, part 3).
const port = Number(process.env.PORT ?? DEFAULT_PORT);

export default defineConfig({
  plugins: [
    // PL: Ekrany React.
    // EN: React screens.
    react(),
    // PL: React Compiler przez Babel.
    // EN: React Compiler through Babel.
    babel({ presets: [reactCompilerPreset()] }),
    // PL: Starsze telefony: iOS od wersji 15 oraz przeglądarki z listy „defaults”.
    // PL: modernTargets to ta sama lista, którą wtyczka ma domyślnie, ale bez wpisu „es2020”. Ten wpis razem z „es2026” z wtyczki Cloudflare
    // PL: zatrzymuje budowanie Workera błędem „'es2020' is already specified” (vite 8.3.4, plugin-legacy 8.2.3, @cloudflare/vite-plugin 1.63.1).
    // PL: Wtyczka wypisuje przy tym ostrzeżenie o nadpisaniu celów. To oczekiwane, bo cele są takie same.
    // EN: Older phones: iOS from version 15 and the browsers from the "defaults" list.
    // EN: modernTargets is the same list the plugin uses by default, but without the "es2020" entry. That entry together with "es2026" from the
    // EN: Cloudflare plugin stops the Worker build with the error "'es2020' is already specified" (vite 8.3.4, plugin-legacy 8.2.3, @cloudflare/vite-plugin 1.63.1).
    // EN: The plugin prints a warning about overriding the targets. This is expected, because the targets are the same.
    legacy({
      targets: ['defaults', 'iOS >= 15'],
      modernTargets: 'edge>=105, firefox>=106, chrome>=105, safari>=16.4, chromeAndroid>=105, iOS>=16.4',
    }),
    // PL: Worker z wrangler.jsonc działa pod tym samym adresem co aplikacja.
    // EN: The Worker from wrangler.jsonc runs under the same address as the app.
    cloudflare(),
  ],
  server: {
    // PL: Port serwera deweloperskiego.
    // EN: Dev server port.
    port,
    // PL: Gdy port jest zajęty, przerwij zamiast cicho wybrać inny. Inny port zderzyłby się z innym agentem.
    // EN: When the port is busy, stop instead of silently picking another one. Another port could collide with another agent.
    strictPort: true,
  },
  preview: {
    // PL: Ten sam port dla podglądu zbudowanej aplikacji.
    // EN: The same port for previewing the built app.
    port,
    // PL: Ta sama zasada: zajęty port przerywa uruchomienie.
    // EN: The same rule: a busy port stops the start.
    strictPort: true,
  },
});
