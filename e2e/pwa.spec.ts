/**
 * PL: Test PWA na zbudowanej aplikacji: manifest ma poprawne pola, ikony istnieją, service worker się rejestruje i zapisuje pliki aplikacji, a adresy /api/ nie są zapisywane.
 * EN: PWA test on the built app: the manifest has the right fields, the icons exist, the service worker registers and stores the app files, and /api/ addresses are not stored.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses vite.config.ts::VitePWA
 * @uses index.html::link
 * @used_by playwright.config.ts::projects
 */

// PL: Typy przeglądarki (navigator.serviceWorker, caches) dla kodu w page.evaluate. tsconfig.node.json ich nie ma, a ten plik jest jedynym, który ich używa.
// EN: Browser types (navigator.serviceWorker, caches) for the code inside page.evaluate. tsconfig.node.json does not have them, and this is the only file that uses them.
/// <reference lib="dom" />

// PL: Funkcje testowe Playwright.
// EN: Playwright test functions.
import { expect, test } from '@playwright/test';

// PL: Kolor tła --bg palety CE (src/shared/styles/tokens.css). Manifest ma go w theme_color i background_color.
// EN: The --bg background color of the CE palette (src/shared/styles/tokens.css). The manifest has it in theme_color and background_color.
const CE_BG = '#26282d';

// PL: Pola manifestu, które sprawdzamy: zawartość to zapis z docs/projekt/EKRANY.md i palety CE.
// EN: The manifest fields we check: the content comes from docs/projekt/EKRANY.md and the CE palette.
test('manifest ma poprawne pola i ikony / the manifest has the right fields and icons', async ({ page, request }) => {
  // PL: Otwórz stronę główną, żeby sprawdzić wskazanie manifestu w <head>.
  // EN: Open the home page to check the manifest link in <head>.
  await page.goto('/');

  // PL: Strona wskazuje manifest, więc przeglądarka zaproponuje instalację.
  // EN: The page points to the manifest, so the browser can offer the installation.
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');

  // PL: Pobierz manifest i zamień go na obiekt.
  // EN: Download the manifest and turn it into an object.
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();

  // PL: Nazwa, język i tryb wyświetlania.
  // EN: Name, language and display mode.
  expect(manifest.name).toBe('TEB Student');
  expect(manifest.short_name).toBe('TEB Student');
  expect(manifest.lang).toBe('pl');
  expect(manifest.display).toBe('standalone');

  // PL: Kolory z palety CE Grafit.
  // EN: Colors from the CE Graphite palette.
  expect(manifest.theme_color).toBe(CE_BG);
  expect(manifest.background_color).toBe(CE_BG);

  // PL: Ikony 192 i 512 oraz ikona maskable.
  // EN: The 192 and 512 icons and the maskable icon.
  const icons: { src: string; sizes: string; purpose?: string }[] = manifest.icons;
  expect(icons.some((icon) => icon.sizes === '192x192' && icon.purpose === 'any')).toBe(true);
  expect(icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'any')).toBe(true);
  expect(icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable')).toBe(true);

  // PL: Każdy plik ikony z manifestu i ikona dla iPhone'a musi istnieć.
  // EN: Every icon file from the manifest and the iPhone icon must exist.
  for (const src of [...icons.map((icon) => icon.src), '/apple-touch-icon.png']) {
    const icon = await request.get(src);
    expect(icon.ok(), src).toBe(true);
    expect(icon.headers()['content-type'], src).toContain('image/png');
  }
});

// PL: Meta tagi dla iPhone'a muszą być w index.html.
// EN: The iPhone meta tags must be in index.html.
test('index.html ma meta tagi dla iPhone’a / index.html has the iPhone meta tags', async ({ page }) => {
  // PL: Otwórz stronę główną.
  // EN: Open the home page.
  await page.goto('/');

  // PL: Aplikacja dodana do ekranu głównego, pasek stanu i ikona.
  // EN: The app added to the home screen, the status bar and the icon.
  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes');
  await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content', 'black');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', CE_BG);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
});

// PL: Service worker rejestruje się sam i zapisuje pliki aplikacji, ale nie zapisuje /api/.
// EN: The service worker registers by itself and stores the app files, but does not store /api/.
test('service worker się rejestruje i zapisuje aplikację bez /api/ / the service worker registers and stores the app without /api/', async ({ page }) => {
  // PL: Otwórz stronę główną. Rejestrację robi skrypt wstawiony do index.html przez wtyczkę.
  // EN: Open the home page. The script that the plugin put into index.html does the registration.
  await page.goto('/');

  // PL: Poczekaj, aż service worker będzie aktywny, i odczytaj jego adres skryptu.
  // EN: Wait until the service worker is active and read its script address.
  const scriptUrl = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.scriptURL ?? null;
  });
  expect(scriptUrl).toMatch(/\/sw\.js$/);

  // PL: Zapytanie z aplikacji do /api/ musi dojść do serwera i nie może dostać index.html.
  // EN: A request from the app to /api/ must reach the server and must not get index.html.
  const apiBody = await page.evaluate(async () => (await fetch('/api/health')).json());
  expect(apiBody).toEqual({ status: 'ok' });

  // PL: Otwarcie adresu /api/ w karcie też idzie do serwera, bo service worker nie podstawia tam index.html.
  // EN: Opening an /api/ address in the tab also goes to the server, because the service worker does not serve index.html there.
  await page.goto('/api/health');
  await expect(page.locator('body')).toContainText('"status":"ok"');

  // PL: Odczytaj adresy zapisane w pamięci podręcznej telefonu.
  // EN: Read the addresses stored in the phone's cache.
  const cachedPaths = await page.evaluate(async () => {
    const names = await caches.keys();
    const paths: string[] = [];
    for (const name of names) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) paths.push(new URL(request.url).pathname);
    }
    return paths;
  });

  // PL: Zapisany jest index.html i co najmniej jeden plik skryptu z assets/.
  // EN: index.html and at least one script file from assets/ are stored.
  expect(cachedPaths.some((path) => path.endsWith('/') || path.endsWith('index.html'))).toBe(true);
  expect(cachedPaths.some((path) => path.startsWith('/assets/') && path.endsWith('.js'))).toBe(true);
  // PL: Nic z /api/ nie trafia do pamięci podręcznej.
  // EN: Nothing from /api/ goes to the cache.
  expect(cachedPaths.filter((path) => path.startsWith('/api/'))).toEqual([]);
});
