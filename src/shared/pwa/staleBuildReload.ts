/**
 * PL: Przeładowanie strony po wdrożeniu. Są dwa powody. Pierwszy: fragment kodu się nie pobrał, bo już nie istnieje, więc strona przeładowuje się od razu. Drugi: service worker zmienił się z jednego istniejącego na inny, czyli nowa wersja przejęła stronę, więc strona przeładowuje się przy powrocie z tła albo przy zmianie ekranu. Pierwsza instalacja service workera nie jest nową wersją. Przeładowania dzieli co najmniej 60 sekund, żeby nie zapętlić.
 * EN: Reload after a deploy. There are two reasons. The first: a code fragment failed to load because it no longer exists, so the page reloads at once. The second: the service worker changed from one existing worker to another, so the new version took over the page, and the page reloads when the user returns from background or moves to another screen. The first service worker install is not a new version. Reloads are at least 60 seconds apart, so they cannot loop.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-31
 * @used_by src/shared/pwa/index.ts::installStaleBuildReload
 * @used_by src/shared/pwa/staleBuildReload.test.ts::installStaleBuildReload
 */

// PL: Klucz w sessionStorage. Przechowuje czas ostatniego przeładowania, zapisany przed przeładowaniem.
// EN: The sessionStorage key. It holds the time of the last reload, saved before the reload.
export const STALE_RELOAD_KEY = 'teb-stale-build-reload';

// PL: Najkrótszy odstęp między dwoma przeładowaniami w tej samej sesji karty, w milisekundach.
// EN: The shortest gap between two reloads in the same tab session, in milliseconds.
export const RELOAD_COOLDOWN_MS = 60_000;

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

// PL: Wszystko, czego moduł potrzebuje od przeglądarki. Dzięki temu test działa bez okna i bez zegara.
// EN: Everything the module needs from the browser. This way the test works without a window and without a clock.
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
  // PL: Zwraca kontroler service workera albo null. Zmiana obiektu na inny obiekt znaczy nową wersję.
  // EN: Returns the service worker controller or null. A change from one object to another means a new version.
  getController: () => unknown;
  // PL: Zwraca bieżący czas w milisekundach.
  // EN: Returns the current time in milliseconds.
  now: () => number;
  // PL: Pamięć sesji karty.
  // EN: The session memory of the tab.
  storage: StaleBuildStorage;
  // PL: Przeładowuje stronę.
  // EN: Reloads the page.
  reload: () => void;
}

/**
 * PL: Odczytuje czas ostatniego przeładowania z pamięci sesji. Brak wpisu albo wpis, którego nie da się odczytać jako liczbę, daje null.
 * EN: Reads the time of the last reload from the session memory. A missing entry, or an entry that cannot be read as a number, gives null.
 *
 * @param storage PL: pamięć sesji karty. EN: the session memory of the tab.
 * @returns PL: czas w milisekundach albo null. EN: the time in milliseconds, or null.
 */
function readLastReloadAt(storage: StaleBuildStorage): number | null {
  // PL: Odczytaj surowy wpis.
  // EN: Read the raw entry.
  const raw = storage.getItem(STALE_RELOAD_KEY);
  // PL: Brak wpisu znaczy, że w tej sesji nie było przeładowania.
  // EN: No entry means there was no reload in this session.
  if (raw === null) return null;
  // PL: Zamień tekst na liczbę.
  // EN: Turn the text into a number.
  const at = Number(raw);
  // PL: Wpis, którego nie da się odczytać, traktujemy jak brak.
  // EN: An entry that cannot be read is treated as missing.
  return Number.isFinite(at) ? at : null;
}

/**
 * PL: Sprawdza, czy wolno przeładować stronę teraz: od ostatniego przeładowania minęło co najmniej 60 sekund i zapis w pamięci sesji działa. Zapisuje czas tego przeładowania. Gdy pamięci nie da się odczytać ani zapisać, nie przeładowuje, bo nie da się zabezpieczyć przed pętlą.
 * EN: Checks whether the page may be reloaded now: at least 60 seconds have passed since the last reload and saving in session memory works. It saves the time of this reload. If the memory cannot be read or written, it does not reload, because it cannot protect against a loop.
 *
 * @param storage PL: pamięć sesji karty. EN: the session memory of the tab.
 * @param now PL: bieżący czas w milisekundach. EN: the current time in milliseconds.
 * @returns PL: true, gdy czas został zapisany i przeładowanie wolno wykonać. EN: true when the time was saved and the reload may run.
 */
export function claimOneReload(storage: StaleBuildStorage, now: number): boolean {
  // PL: Próbujemy odczytać i zapisać czas. Błąd dostępu do pamięci traktujemy jak brak zgody.
  // EN: We try to read and write the time. A memory access error counts as no permission.
  try {
    // PL: Czas poprzedniego przeładowania w tej sesji karty.
    // EN: The time of the previous reload in this tab session.
    const last = readLastReloadAt(storage);
    // PL: Za wcześnie na kolejne przeładowanie: to chroni przed pętlą.
    // EN: Too soon for another reload: this protects against a loop.
    if (last !== null && now - last < RELOAD_COOLDOWN_MS) return false;
    // PL: Zapisz czas przed przeładowaniem, żeby kolejny błąd w ciągu minuty nie przeładował strony.
    // EN: Save the time before the reload, so a further error within a minute does not reload the page.
    storage.setItem(STALE_RELOAD_KEY, String(now));
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
  // PL: Ostatnio widziany kontroler service workera. Porównujemy z nim, żeby wykryć zmianę.
  // EN: The last seen service worker controller. We compare with it to detect a change.
  let lastController = env.getController();
  // PL: Czy kontroler zmienił się z istniejącego na inny i strona czeka na przeładowanie przy powrocie albo zmianie ekranu.
  // EN: Whether the controller changed from an existing one to another, and the page waits for a reload on return or screen change.
  let isNewVersion = false;
  // PL: Ostatni znany adres, żeby wykryć zmianę ekranu.
  // EN: The last known address, to detect a screen change.
  let lastPathname = env.getPathname();

  // PL: Przeładuj, jeśli minęła minuta od ostatniego przeładowania i pamięć działa.
  // EN: Reload if a minute has passed since the last reload and the memory works.
  const reloadIfAllowed = (): void => {
    // PL: Zgody nie ma, więc zostajemy na stronie.
    // EN: There is no permission, so we stay on the page.
    if (!claimOneReload(env.storage, env.now())) return;
    // PL: Wszystkie warunki spełnione: przeładuj.
    // EN: All conditions are met: reload.
    env.reload();
  };

  // PL: Sprawdź, czy kontroler się zmienił. Zmiana z null na service worker to pierwsza instalacja, więc nie liczy się jako nowa wersja.
  // EN: Check whether the controller changed. A change from null to a service worker is the first install, so it does not count as a new version.
  const noteController = (): void => {
    // PL: Odczytaj bieżący kontroler.
    // EN: Read the current controller.
    const current = env.getController();
    // PL: Bez zmiany nie ma nic do zapamiętania.
    // EN: With no change there is nothing to remember.
    if (current === lastController) return;
    // PL: Zmiana z jednego istniejącego SW na inny to nowa wersja.
    // EN: A change from one existing SW to another is a new version.
    if (lastController !== null && current !== null) isNewVersion = true;
    // PL: Zapamiętaj nowy kontroler.
    // EN: Remember the new controller.
    lastController = current;
  };

  // PL: Przy powrocie z tła albo zmianie ekranu przeładuj, jeśli czeka nowa wersja.
  // EN: On return from background or on a screen change, reload if a new version is waiting.
  const reloadForNewVersion = (): void => {
    noteController();
    if (isNewVersion) reloadIfAllowed();
  };

  // PL: Błąd pobrania fragmentu kodu: przeładuj od razu, raz. Ekran docelowy się nie otworzył, więc nie ma czego tracić.
  // EN: A code fragment loading error: reload at once, once. The target screen did not open, so there is nothing to lose.
  const onPreloadError = (): void => {
    reloadIfAllowed();
  };

  // PL: Powrót z tła to dobry moment na przeładowanie nowej wersji.
  // EN: Returning from background is a good moment to reload a new version.
  const onBecomeVisible = (): void => {
    reloadForNewVersion();
  };

  // PL: Zmiana ekranu to dobry moment na przeładowanie nowej wersji. Ten sam adres nie liczy się jako zmiana.
  // EN: A screen change is a good moment to reload a new version. The same address does not count as a change.
  const onNavigate = (pathname: string): void => {
    if (pathname === lastPathname) return;
    lastPathname = pathname;
    reloadForNewVersion();
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
