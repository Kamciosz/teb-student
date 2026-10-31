/**
 * PL: Zależności przeglądarki dla przeładowania po wdrożeniu: okno, dokument, service worker, sessionStorage i router. Tylko tu moduł dotyka przeglądarki.
 * EN: The browser dependencies for the reload after a deploy: the window, the document, the service worker, sessionStorage and the router. This is the only place where the module touches the browser.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-31
 * @uses src/shared/pwa/staleBuildReload.ts::StaleBuildEnv
 * @used_by src/shared/pwa/index.ts::createBrowserStaleBuildEnv
 */

// PL: Typ routera danych z React Router (ten sam, który zwraca createBrowserRouter). Potrzebujemy z niego adresu i nasłuchu zmian.
// EN: The data router type from React Router (the same one createBrowserRouter returns). We need its address and its change listener.
import type { DataRouter } from 'react-router';
// PL: Kształt zależności, który składamy tutaj.
// EN: The shape of the dependencies we assemble here.
import type { StaleBuildEnv } from './staleBuildReload';

/**
 * PL: Podłącza zdarzenie do celu i zwraca funkcję, która je odłącza.
 * EN: Attaches an event listener to the target and returns a function that detaches it.
 *
 * @param target PL: element, na którym słuchamy (okno albo dokument). EN: the element we listen on (the window or the document).
 * @param type PL: nazwa zdarzenia. EN: the event name.
 * @param handler PL: funkcja wywoływana przy zdarzeniu. EN: the function called on the event.
 * @returns PL: funkcja odłączająca nasłuch. EN: a function that detaches the listener.
 */
function listenTo(target: EventTarget, type: string, handler: () => void): () => void {
  // PL: Dodaj nasłuch zdarzenia.
  // EN: Add the event listener.
  target.addEventListener(type, handler);
  // PL: Zwróć funkcję, która go zdejmuje.
  // EN: Return a function that removes it.
  return () => {
    target.removeEventListener(type, handler);
  };
}

/**
 * PL: Składa zależności modułu z prawdziwej przeglądarki. Dostęp do sessionStorage odkładamy do chwili zapisu, żeby zablokowana pamięć rzuciła błąd w miejscu obsłużonym przez moduł.
 * EN: Assembles the module's dependencies from the real browser. The sessionStorage access is deferred until the write, so blocked memory throws in a place the module handles.
 *
 * @param router PL: router aplikacji, z którego bierzemy adres i zmiany ekranu. EN: the app router, which gives us the address and the screen changes.
 * @returns PL: zależności dla installStaleBuildReload. EN: the dependencies for installStaleBuildReload.
 */
export function createBrowserStaleBuildEnv(router: Pick<DataRouter, 'state' | 'subscribe'>): StaleBuildEnv {
  // PL: Zwróć zestaw funkcji, każda opakowuje jedno wywołanie przeglądarki.
  // EN: Return the set of functions, each wrapping one browser call.
  return {
    // PL: Zdarzenie, które wysyła Vite, gdy fragment kodu się nie pobrał.
    // EN: The event Vite sends when a code fragment failed to load.
    onPreloadError: (handler) => listenTo(window, 'vite:preloadError', handler),
    // PL: Powrót na pierwszy plan: reagujemy tylko na widoczną kartę.
    // EN: Coming back to the foreground: we react only to a visible tab.
    onBecomeVisible: (handler) =>
      listenTo(document, 'visibilitychange', () => {
        if (document.visibilityState === 'visible') handler();
      }),
    // PL: Zmiana ekranu w routerze: przekazujemy nowy adres.
    // EN: A screen change in the router: we pass the new address.
    onNavigate: (handler) => router.subscribe((state) => handler(state.location.pathname)),
    // PL: Bieżący adres z routera.
    // EN: The current address from the router.
    getPathname: () => router.state.location.pathname,
    // PL: Kontroler service workera; brak obsługi SW daje null.
    // EN: The service worker controller; no SW support gives null.
    getController: () => navigator.serviceWorker?.controller ?? null,
    // PL: Sprawdzenie nowej wersji SW. Błędy ignorujemy, bo to tylko podpowiedź dla przeglądarki.
    // EN: Checking for a new SW version. We ignore errors, because this is only a hint for the browser.
    checkForUpdate: () => {
      navigator.serviceWorker
        ?.getRegistration()
        .then((registration) => registration?.update())
        .catch(() => undefined);
    },
    // PL: Pamięć sesji. Dostęp jest w środku funkcji, żeby błąd został złapany przez moduł.
    // EN: The session memory. The access is inside the function, so the module catches the error.
    storage: {
      getItem: (key) => window.sessionStorage.getItem(key),
      setItem: (key, value) => window.sessionStorage.setItem(key, value),
    },
    // PL: Przeładowanie całej strony.
    // EN: Reload of the whole page.
    reload: () => window.location.reload(),
  };
}
