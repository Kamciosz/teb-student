/**
 * PL: Korzeń aplikacji w telefonie. Tworzy router z listy ekranów i oddaje mu sterowanie: adres w przeglądarce wybiera ekran podtoru.
 * EN: The root of the app on the phone. Creates the router from the screen list and hands control to it: the browser address picks the subtrack screen.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/app/routes.ts::APP_ROUTES
 * @uses src/shared/index.ts::AppQueryProvider
 * @uses src/shared/index.ts::OfflineBanner
 * @uses src/shared/pwa/index.ts::installStaleBuildReload
 * @uses src/shared/pwa/index.ts::createBrowserStaleBuildEnv
 * @used_by src/main.tsx::createRoot
 */

// PL: useEffect podłącza przeładowanie po wdrożeniu, gdy strona już działa w przeglądarce.
// EN: useEffect attaches the reload after a deploy once the page runs in the browser.
import { useEffect } from 'react';
// PL: createBrowserRouter czyta adres z przeglądarki. RouterProvider z react-router/dom rysuje wybrany ekran.
// EN: createBrowserRouter reads the address from the browser. RouterProvider from react-router/dom draws the chosen screen.
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
// PL: Lista ekranów wszystkich podtorów.
// EN: The screen list of all subtracks.
import { APP_ROUTES } from './app/routes';
// PL: Dostawca zapytań z zapisem w telefonie i pasek braku internetu, wspólne dla wszystkich ekranów.
// EN: The query provider with saving on the phone and the no-internet bar, shared by all screens.
import { AppQueryProvider, OfflineBanner } from './shared';
// PL: Przeładowanie po wdrożeniu: błąd pobrania fragmentu kodu albo nowa wersja service workera przeładowują stronę, najwyżej raz na minutę.
// EN: Reload after a deploy: a code fragment loading error or a new service worker version reloads the page, at most once a minute.
import { createBrowserStaleBuildEnv, installStaleBuildReload } from './shared/pwa';

// PL: Router jest jeden na całą aplikację. Tworzymy go raz, przy wczytaniu pliku, bo App jest rysowany tylko w przeglądarce.
// EN: There is one router for the whole app. We create it once, when the file loads, because App is drawn only in the browser.
const router = createBrowserRouter(APP_ROUTES);

/**
 * PL: Rysuje aplikację: dostawcę zapytań, pasek braku internetu i router z ekranem pasującym do adresu. Sam nie pobiera danych.
 * EN: Draws the app: the query provider, the no-internet bar and the router with the screen that matches the address. It fetches no data itself.
 *
 * @returns PL: drzewo elementów aplikacji. EN: the tree of app elements.
 */
export function App() {
  // PL: Podłącz przeładowanie po wdrożeniu do routera. Przy odmontowaniu odłącza nasłuchy.
  // EN: Attach the reload after a deploy to the router. On unmount it detaches the listeners.
  useEffect(() => installStaleBuildReload(createBrowserStaleBuildEnv(router)), []);
  // PL: Dostawca zapytań obejmuje wszystko. Pasek braku internetu stoi nad ekranem, a router oddaje sterowanie ekranom.
  // EN: The query provider wraps everything. The no-internet bar stands above the screen, and the router hands control to the screens.
  return (
    <AppQueryProvider>
      <OfflineBanner />
      <RouterProvider router={router} />
    </AppQueryProvider>
  );
}
