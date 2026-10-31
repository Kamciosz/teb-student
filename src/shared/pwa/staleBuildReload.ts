/**
 * PL: Przeładowanie strony po wdrożeniu. Gdy otwarta aplikacja ma stare pliki i nie może pobrać fragmentu kodu, który już nie istnieje, przeładowuje stronę raz w sesji karty. Robi to dopiero po tym, jak nowy service worker przejął stronę i użytkownik wrócił do aplikacji albo przeszedł na inny ekran. Nie przeładowuje w trakcie pisania.
 * EN: Reload after a deploy. When the open app has old files and cannot fetch a piece of code that no longer exists, it reloads the page once per tab session. It does so only after the new service worker has taken over the page and the user came back to the app or moved to another screen. It never reloads while the user is typing.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-31
 * @used_by src/shared/pwa/index.ts::installStaleBuildReload
 * @used_by src/shared/pwa/staleBuildReload.test.ts::installStaleBuildReload
 */

// PL: Klucz w sessionStorage. Jest zapisany przed przeładowaniem, więc drugi błąd w tej samej sesji karty nie przeładowuje strony ponownie.
// EN: The sessionStorage key. It is saved before the reload, so a second error in the same tab session does not reload the page again.
export const STALE_RELOAD_KEY = 'teb-stale-build-reload';

// PL: Minimalny kształt sessionStorage, żeby test mógł podać zwykłą mapę.
// EN: The minimal shape of sessionStorage, so a test can pass a plain map.
export interface StaleBuildStorage {
  // PL: Odczytuje wartość klucza albo null, gdy jej nie ma.
  // EN: Reads the value of the key, or null when it is missing.
  getItem(key: string): string | null;
  // PL: Zapisuje wartość klucza.
  // EN: Saves the value of the key.
  setItem(key: string, value: string): void;
}

// PL: Wszystko, czego moduł potrzebuje od przeglądarki. Dzięki temu test działa bez okna.
// EN: Everything the module needs from the browser. This way the test works without a window.
export interface StaleBuildEnv {
  // PL: Wywołuje handler, gdy fragment kodu się nie pobrał (zdarzenie vite:preloadError). Zwraca funkcję, która zdejmuje nasłuch.
  // EN: Calls the handler when a code fragment failed to load (the vite:preloadError event). Returns a function that removes the listener.
  onPreloadError: (handler: () => void) => () => void;
  // PL: Wywołuje handler, gdy karta wraca na pierwszy plan. Zwraca funkcję, która zdejmuje nasłuch.
  // EN: Calls the handler when the tab comes back to the foreground. Returns a function that removes the listener.
  onBecomeVisible: (handler: () => void) => () => void;
  // PL: Wywołuje handler z nowym adresem po zmianie ekranu. Zwraca funkcję, która zdejmuje nasłuch.
  // EN: Calls the handler with the new address after a screen change. Returns a function that removes the listener.
  onNavigate: (handler: (pathname: string) => void) => () => void;
  // PL: Zwraca bieżący adres strony.
  // EN: Returns the current page address.
  getPathname: () => string;
  // PL: Zwraca kontroler service workera albo null. Zmiana obiektu znaczy, że nowy SW przejął stronę.
  // EN: Returns the service worker controller or null. A change of the object means the new SW has taken over the page.
  getController: () => unknown;
  // PL: Prosi przeglądarkę o sprawdzenie, czy jest nowsza wersja service workera.
  // EN: Asks the browser to check whether a newer service worker version exists.
  checkForUpdate: () => void;
  // PL: Pamięć sesji karty.
  // EN: The session memory of the tab.
  storage: StaleBuildStorage;
  // PL: Przeładowuje stronę.
  // EN: Reloads the page.
  reload: () => void;
}

/**
 * PL: Sprawdza, czy wolno przeładować stronę teraz: sesja karty jeszcze jej nie przeładowała i zapis w pamięci sesji działa. Gdy pamięci nie da się odczytać ani zapisać, nie przeładowuje, bo nie da się zabezpieczyć przed pętlą.
 * EN: Checks whether the page may be reloaded now: the tab session has not reloaded it yet and saving in session memory works. If the memory cannot be read or written, it does not reload, because it cannot protect against a loop.
 *
 * @param storage PL: pamięć sesji karty. EN: the session memory of the tab.
 * @returns PL: true, gdy znacznik został zapisany i przeładowanie wolno wykonać. EN: true when the marker was saved and the reload may run.
 */
export function claimOneReload(storage: StaleBuildStorage): boolean {
  // PL: Próbujemy odczytać i zapisać znacznik. Błąd dostępu do pamięci traktujemy jak brak zgody.
  // EN: We try to read and write the marker. A memory access error counts as no permission.
  try {
    // PL: Znacznik już jest, więc ta sesja karty przeładowała już stronę.
    // EN: The marker is already there, so this tab session has already reloaded the page.
    if (storage.getItem(STALE_RELOAD_KEY) !== null) return false;
    // PL: Zapisz znacznik przed przeładowaniem, żeby kolejny błąd nie wywołał pętli.
    // EN: Save the marker before the reload, so a further error does not cause a loop.
    storage.setItem(STALE_RELOAD_KEY, '1');
    return true;
  } catch {
    // PL: Pamięć nie działa, więc nie przeładowujemy.
    // EN: The memory does not work, so we do not reload.
    return false;
  }
}

/**
 * PL: Podłącza przeładowanie po wdrożeniu do strony. Zwraca funkcję, która odłącza wszystkie nasłuchy, gdy strona znika.
 * EN: Attaches the reload after a deploy to the page. Returns a function that detaches all listeners when the page goes away.
 *
 * @param env PL: zależności z przeglądarki (w aplikacji z createBrowserStaleBuildEnv, w teście z atrapami). EN: the browser dependencies (in the app from createBrowserStaleBuildEnv, in the test from fakes).
 * @returns PL: funkcja sprzątająca. EN: the cleanup function.
 */
export function installStaleBuildReload(env: StaleBuildEnv): () => void {
  // PL: Kontroler z chwili wczytania strony. Jego zmiana znaczy, że nowy service worker przejął stronę.
  // EN: The controller at the moment the page loaded. Its change means the new service worker has taken over the page.
  const controllerAtLoad = env.getController();
  // PL: Czy jakiś fragment kodu się nie pobrał i strona czeka na przeładowanie.
  // EN: Whether a code fragment failed to load and the page waits for a reload.
  let isReloadPending = false;
  // PL: Ostatni znany adres, żeby wykryć zmianę ekranu.
  // EN: The last known address, to detect a screen change.
  let lastPathname = env.getPathname();

  // PL: Przeładuj tylko wtedy, gdy coś czeka, nowy SW już kontroluje stronę i sesja jeszcze nie przeładowała strony.
  // EN: Reload only when something is waiting, the new SW already controls the page and the session has not reloaded the page yet.
  const tryReload = (): void => {
    // PL: Nic się nie pobrało, więc nie ma czego naprawiać.
    // EN: Nothing failed to load, so there is nothing to fix.
    if (!isReloadPending) return;
    // PL: Nowy SW jeszcze nie przejął strony, więc przeładowanie dałoby stare pliki.
    // EN: The new SW has not taken over the page yet, so a reload would bring back the old files.
    if (env.getController() === controllerAtLoad) return;
    // PL: Sesja już raz przeładowała stronę albo pamięć nie działa.
    // EN: The session has already reloaded the page once, or the memory does not work.
    if (!claimOneReload(env.storage)) return;
    // PL: Wszystkie warunki spełnione: przeładuj.
    // EN: All conditions are met: reload.
    env.reload();
  };

  // PL: Błąd pobrania: zapamiętaj, że trzeba przeładować, i poproś przeglądarkę o nowszy service worker. Nie przeładowujemy od razu, bo użytkownik może właśnie pisać.
  // EN: A loading error: remember that a reload is needed, and ask the browser for a newer service worker. We do not reload at once, because the user may be typing right now.
  const onPreloadError = (): void => {
    isReloadPending = true;
    env.checkForUpdate();
  };

  // PL: Powrót z tła to dobry moment na przeładowanie.
  // EN: Returning from background is a good moment for a reload.
  const onBecomeVisible = (): void => {
    tryReload();
  };

  // PL: Zmiana ekranu to dobry moment na przeładowanie. Ten sam adres nie liczy się jako zmiana.
  // EN: A screen change is a good moment for a reload. The same address does not count as a change.
  const onNavigate = (pathname: string): void => {
    if (pathname === lastPathname) return;
    lastPathname = pathname;
    tryReload();
  };

  // PL: Podłącz trzy nasłuchy.
  // EN: Attach the three listeners.
  const detachers = [
    env.onPreloadError(onPreloadError),
    env.onBecomeVisible(onBecomeVisible),
    env.onNavigate(onNavigate),
  ];

  // PL: Zwróć funkcję, która zdejmuje wszystkie nasłuchy.
  // EN: Return a function that removes all listeners.
  return () => {
    for (const detach of detachers) detach();
  };
}
