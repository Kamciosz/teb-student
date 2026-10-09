/**
 * PL: Ustawienia Vite: budowanie ekranów React (z React Compiler), wersja dla starszych telefonów, aplikacja PWA (manifest i service worker), Worker Hono w serwerze deweloperskim i port ze zmiennej PORT.
 * EN: Vite settings: building React screens (with React Compiler), a build for older phones, the PWA app (manifest and service worker), the Hono Worker in the dev server and the port from the PORT variable.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses wrangler.jsonc::main
 * @uses index.html::root
 * @uses public/pwa-192.png::icon
 * @uses public/pwa-512.png::icon
 * @uses public/pwa-maskable-512.png::icon
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
// PL: Wtyczka PWA robi manifest aplikacji i service worker, który zapisuje pliki aplikacji w telefonie.
// EN: The PWA plugin makes the app manifest and the service worker that stores the app files in the phone.
import { VitePWA } from 'vite-plugin-pwa';
// PL: defineConfig podpowiada edytorowi, jakie ustawienia są dozwolone.
// EN: defineConfig tells the editor which settings are allowed.
import { defineConfig } from 'vite';

// PL: Port, gdy zmienna PORT nie jest ustawiona. To domyślny port Vite.
// EN: The port when the PORT variable is not set. This is the Vite default port.
const DEFAULT_PORT = 5173;

// PL: Port serwera deweloperskiego: PORT z komputera agenta albo domyślny. Każdy podtor ma swój (docs/PODZIAL_PRACY.md, część 3).
// EN: Dev server port: PORT from the agent's computer or the default. Each subtrack has its own (docs/PODZIAL_PRACY.md, part 3).
const port = Number(process.env.PORT ?? DEFAULT_PORT);

// PL: Ustawienia Vite, które czytają polecenia dev, build i preview.
// EN: The Vite settings read by the dev, build and preview commands.
export default defineConfig({
  // PL: Wtyczki w kolejności działania.
  // EN: Plugins in the order they run.
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
    // PL: Aplikacja na ekran główny i działanie bez internetu (docs/PLAN_APLIKACJI.md, „Działanie bez internetu i aktualizacje”).
    // EN: The app on the home screen and working without internet (docs/PLAN_APLIKACJI.md, "Działanie bez internetu i aktualizacje").
    VitePWA({
      // PL: Nowa wersja pobiera się w tle i włącza sama. Pasek „Jest nowa wersja” czeka na decyzję zespołu, bo nie ma go w docs/projekt/EKRANY.md.
      // EN: The new version downloads in the background and turns on by itself. The "Jest nowa wersja" bar waits for a team decision, because it is not in docs/projekt/EKRANY.md.
      registerType: 'autoUpdate',
      // PL: Wtyczka sama dokłada do index.html skrypt, który rejestruje service worker, więc src/main.tsx zostaje bez zmian.
      // EN: The plugin adds the script that registers the service worker to index.html by itself, so src/main.tsx stays unchanged.
      injectRegister: 'auto',
      // PL: Manifest aplikacji. Nazwa i opis są z docs/projekt/EKRANY.md (ekran 1.1), kolory z palety CE Grafit w src/shared/styles/tokens.css.
      // EN: The app manifest. The name and description come from docs/projekt/EKRANY.md (screen 1.1), the colors from the CE Graphite palette in src/shared/styles/tokens.css.
      manifest: {
        // PL: Pełna nazwa aplikacji.
        // EN: The full app name.
        name: 'TEB Student',
        // PL: Nazwa pod ikoną na ekranie głównym. Taka sama, bo w planie i na ekranach jest tylko jedna nazwa.
        // EN: The name under the icon on the home screen. The same, because the plan and the screens have only one name.
        short_name: 'TEB Student',
        // PL: Opis aplikacji: zdanie z ekranu logowania.
        // EN: The app description: the sentence from the login screen.
        description: 'Aktualności, zgłoszenia i ankiety szkoły w jednym miejscu.',
        // PL: Język aplikacji.
        // EN: The app language.
        lang: 'pl',
        // PL: Aplikacja otwiera się bez paska adresu, jak zwykła aplikacja.
        // EN: The app opens without the address bar, like a regular app.
        display: 'standalone',
        // PL: Adres, który otwiera się z ikony, i zakres adresów należących do aplikacji.
        // EN: The address opened from the icon and the range of addresses that belong to the app.
        start_url: '/',
        scope: '/',
        // PL: Kolor paska systemowego: tło --bg z palety CE (#26282d).
        // EN: The system bar color: the --bg background of the CE palette (#26282d).
        theme_color: '#26282d',
        // PL: Kolor ekranu startowego: też tło --bg z palety CE.
        // EN: The splash screen color: also the --bg background of the CE palette.
        background_color: '#26282d',
        // PL: Ikony: znak marki (kwadrat w kolorze akcentu z literą „T”). Ikona „maskable” ma tło do samej krawędzi, bo Android przycina ją do własnego kształtu.
        // EN: Icons: the brand mark (an accent-colored square with the letter "T"). The "maskable" icon has the background up to the edge, because Android crops it to its own shape.
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // PL: Service worker robi Workbox (generateSW). Plik sw.js powstaje przy budowaniu.
      // EN: Workbox makes the service worker (generateSW). The sw.js file is created during the build.
      workbox: {
        // PL: Zapisz w telefonie wszystkie pliki aplikacji, także wersję dla starszych telefonów (iOS 15 jej potrzebuje do działania bez internetu), czcionki i ikony.
        // EN: Store all app files in the phone, including the build for older phones (iOS 15 needs it to work offline), fonts and icons.
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        // PL: Adres bez pliku (na przykład /zgloszenia) otwiera index.html, bo ekrany wybiera React Router w telefonie.
        // EN: An address with no file (for example /zgloszenia) opens index.html, because React Router picks the screens in the phone.
        navigateFallback: 'index.html',
        // PL: Adresy /api/ nigdy nie dostają index.html i nie są zapisywane: dane serwera zapisuje później TanStack Query.
        // EN: /api/ addresses never get index.html and are never stored: TanStack Query stores server data later.
        navigateFallbackDenylist: [/^\/api\//],
        // PL: Usuń z telefonu pliki z poprzednich wersji aplikacji.
        // EN: Remove the files of earlier app versions from the phone.
        cleanupOutdatedCaches: true,
      },
    }),
    // PL: Worker z wrangler.jsonc działa pod tym samym adresem co aplikacja.
    // EN: The Worker from wrangler.jsonc runs under the same address as the app.
    cloudflare(),
  ],
  // PL: Serwer deweloperski (polecenie dev).
  // EN: The dev server (the dev command).
  server: {
    // PL: Port serwera deweloperskiego.
    // EN: Dev server port.
    port,
    // PL: Gdy port jest zajęty, przerwij zamiast cicho wybrać inny. Inny port zderzyłby się z innym agentem.
    // EN: When the port is busy, stop instead of silently picking another one. Another port could collide with another agent.
    strictPort: true,
  },
  // PL: Podgląd zbudowanej aplikacji.
  // EN: Preview of the built app.
  preview: {
    // PL: Ten sam port dla podglądu zbudowanej aplikacji.
    // EN: The same port for previewing the built app.
    port,
    // PL: Ta sama zasada: zajęty port przerywa uruchomienie.
    // EN: The same rule: a busy port stops the start.
    strictPort: true,
  },
});
