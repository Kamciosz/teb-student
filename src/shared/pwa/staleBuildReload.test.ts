/**
 * PL: Test przeładowania po wdrożeniu. Symuluje kartę przeglądarki: błąd pobrania fragmentu kodu, zmianę service workera (także pierwszą instalację), powrót z tła, zmianę ekranu, czas i sessionStorage. Sprawdza, że strona przeładowuje się we właściwych sytuacjach, najwyżej raz na minutę i bez pętli.
 * EN: Test of the reload after a deploy. Simulates a browser tab: a code loading error, a service worker change (including the first install), return from background, a screen change, time and sessionStorage. Checks that the page reloads in the right situations, at most once a minute, and without a loop.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-31
 * @uses src/shared/pwa/staleBuildReload.ts::installStaleBuildReload
 * @uses src/shared/pwa/staleBuildReload.ts::StaleBuildEnv
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Moduł, który testujemy, i typ jego zależności z przeglądarki.
// EN: The module under test and the type of its browser dependencies.
import { installStaleBuildReload, type StaleBuildEnv } from './staleBuildReload';

// PL: Stan jednej karty przeglądarki między wczytaniami strony. Przeładowanie tylko zlicza, a test wczytuje stronę od nowa sam.
// EN: The state of one browser tab across page loads. A reload only counts, and the test loads the page again on its own.
interface Tab {
  // PL: Ile razy strona została przeładowana.
  // EN: How many times the page was reloaded.
  reloads: number;
  // PL: Aktualny kontroler service workera (obiekt albo tekst w teście, null przy braku SW).
  // EN: The current service worker controller (an object or a string in the test, null when there is no SW).
  controller: string | null;
  // PL: Aktualny adres strony.
  // EN: The current page address.
  pathname: string;
  // PL: Aktualny czas karty w milisekundach. Test go przesuwa.
  // EN: The current time of the tab in milliseconds. The test moves it forward.
  now: number;
  // PL: Zawartość sessionStorage, która przetrwa przeładowanie.
  // EN: The sessionStorage content, which survives a reload.
  storageValues: Map<string, string>;
  // PL: Gdy true, sessionStorage rzuca błąd, jak w przeglądarce z zablokowaną pamięcią.
  // EN: When true, sessionStorage throws, as in a browser with blocked storage.
  isStorageBroken: boolean;
  // PL: Wczytuje stronę od nowa.
  // EN: Loads the page again.
  loadPage: () => Page;
}

// PL: Jedno wczytanie strony: funkcje, którymi test wywołuje zdarzenia.
// EN: One page load: the functions the test uses to fire events.
interface Page {
  // PL: Symuluje błąd pobrania fragmentu kodu.
  // EN: Simulates a code fragment loading error.
  firePreloadError: () => void;
  // PL: Symuluje powrót karty z tła.
  // EN: Simulates the tab returning from background.
  fireBecomeVisible: () => void;
  // PL: Symuluje zmianę ekranu na podany adres.
  // EN: Simulates a screen change to the given address.
  fireNavigate: (pathname: string) => void;
  // PL: Zatrzymuje nasłuch tej strony, jak przy wyjściu ze strony.
  // EN: Stops the listeners of this page, as when leaving the page.
  stop: () => void;
}

/**
 * PL: Dodaje handler do zbioru i zwraca funkcję, która go usuwa.
 * EN: Adds the handler to the set and returns a function that removes it.
 *
 * @param handlers PL: zbiór aktywnych handlerów. EN: the set of active handlers.
 * @param handler PL: handler do dodania. EN: the handler to add.
 * @returns PL: funkcja usuwająca handler. EN: a function that removes the handler.
 */
function listen<T>(handlers: Set<T>, handler: T): () => void {
  // PL: Zapisz handler, żeby test mógł go później wywołać.
  // EN: Save the handler, so the test can call it later.
  handlers.add(handler);
  // PL: Zwróć funkcję, która usuwa handler przy sprzątaniu.
  // EN: Return a function that removes the handler during cleanup.
  return () => {
    handlers.delete(handler);
  };
}

/**
 * PL: Wczytuje stronę w karcie: podłącza nasłuchy modułu i zwraca funkcje do wywoływania zdarzeń.
 * EN: Loads a page in the tab: attaches the module's listeners and returns functions that fire events.
 *
 * @param tab PL: karta, w której wczytujemy stronę. EN: the tab in which we load the page.
 * @returns PL: funkcje zdarzeń tej strony. EN: the event functions of this page.
 */
function loadPage(tab: Tab): Page {
  // PL: Nasłuchy tej strony. Każde wczytanie ma własne, bo po przeładowaniu stare znikają.
  // EN: The listeners of this page. Each load has its own, because the old ones disappear after a reload.
  const preloadHandlers = new Set<() => void>();
  const visibleHandlers = new Set<() => void>();
  const navigateHandlers = new Set<(pathname: string) => void>();

  // PL: Zależności modułu: zamiast przeglądarki dajemy zwykłe funkcje, zegar i pamięć z karty.
  // EN: The module's dependencies: plain functions, a clock and the tab's memory instead of the browser.
  const env: StaleBuildEnv = {
    onPreloadError: (handler) => listen(preloadHandlers, handler),
    onBecomeVisible: (handler) => listen(visibleHandlers, handler),
    onNavigate: (handler) => listen(navigateHandlers, handler),
    getPathname: () => tab.pathname,
    getController: () => tab.controller,
    now: () => tab.now,
    storage: {
      // PL: Odczyt z pamięci karty; przy zablokowanej pamięci rzuca błąd.
      // EN: Read from the tab's memory; with blocked memory it throws an error.
      getItem: (key) => {
        if (tab.isStorageBroken) throw new Error('sessionStorage zablokowany');
        return tab.storageValues.get(key) ?? null;
      },
      // PL: Zapis do pamięci karty; przy zablokowanej pamięci rzuca błąd.
      // EN: Write to the tab's memory; with blocked memory it throws an error.
      setItem: (key, value) => {
        if (tab.isStorageBroken) throw new Error('sessionStorage zablokowany');
        tab.storageValues.set(key, value);
      },
    },
    // PL: Przeładowanie w teście tylko liczymy.
    // EN: In the test, a reload only counts.
    reload: () => {
      tab.reloads += 1;
    },
  };

  // PL: Podłącz moduł do tej strony.
  // EN: Attach the module to this page.
  const stop = installStaleBuildReload(env);

  // PL: Zwróć funkcje zdarzeń. Każda uruchamia zarejestrowane handlery tej strony.
  // EN: Return the event functions. Each runs the handlers registered for this page.
  return {
    firePreloadError: () => preloadHandlers.forEach((handler) => handler()),
    fireBecomeVisible: () => visibleHandlers.forEach((handler) => handler()),
    fireNavigate: (pathname) => {
      tab.pathname = pathname;
      navigateHandlers.forEach((handler) => handler(pathname));
    },
    stop,
  };
}

/**
 * PL: Tworzy kartę z pustą pamięcią sesji, zegarem na zero i jednym service workerem.
 * EN: Creates a tab with empty session memory, a clock at zero and one service worker.
 *
 * @returns PL: karta testowa. EN: the test tab.
 */
function createTab(): Tab {
  // PL: Kartę trzymamy jako obiekt, żeby test mógł zmieniać jej stan (kontroler, adres, czas, pamięć).
  // EN: We keep the tab as an object, so the test can change its state (controller, address, time, memory).
  const tab: Tab = {
    reloads: 0,
    controller: 'sw-stary',
    pathname: '/',
    now: 0,
    storageValues: new Map(),
    isStorageBroken: false,
    loadPage: () => loadPage(tab),
  };
  return tab;
}

describe('przeładowanie po wdrożeniu', () => {
  it('błąd pobrania fragmentu kodu przeładowuje stronę od razu, raz', () => {
    // PL: Ekran się nie otworzył, bo fragment kodu zniknął po wdrożeniu. Strona przeładowuje się od razu.
    // EN: The screen did not open, because the code fragment disappeared after the deploy. The page reloads at once.
    const tab = createTab();
    const page = tab.loadPage();
    page.firePreloadError();
    expect(tab.reloads).toBe(1);
  });

  it('błąd pobrania przeładowuje też bez service workera', () => {
    // PL: Brak kontrolera (null) nie blokuje przeładowania po błędzie pobrania.
    // EN: No controller (null) does not block the reload after a loading error.
    const tab = createTab();
    tab.controller = null;
    const page = tab.loadPage();
    page.firePreloadError();
    expect(tab.reloads).toBe(1);
  });

  it('zmiana SW z istniejącego na inny przeładowuje przy powrocie z tła', () => {
    // PL: Nowa wersja przejęła stronę, a użytkownik wrócił do karty.
    // EN: The new version took over the page, and the user came back to the tab.
    const tab = createTab();
    const page = tab.loadPage();
    tab.controller = 'sw-nowy';
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(1);
  });

  it('zmiana SW z istniejącego na inny przeładowuje przy zmianie ekranu', () => {
    // PL: Nowa wersja przejęła stronę, a użytkownik przeszedł na inny ekran.
    // EN: The new version took over the page, and the user moved to another screen.
    const tab = createTab();
    const page = tab.loadPage();
    tab.controller = 'sw-nowy';
    page.fireNavigate('/aktualnosci');
    expect(tab.reloads).toBe(1);
  });

  it('zmiana SW bez powrotu z tła i bez zmiany ekranu nie przeładowuje', () => {
    // PL: Nowy SW przejął stronę, ale użytkownik nic nie robi z kartą, więc nie przeładowujemy.
    // EN: The new SW took over the page, but the user does nothing with the tab, so we do not reload.
    const tab = createTab();
    tab.loadPage();
    tab.controller = 'sw-nowy';
    expect(tab.reloads).toBe(0);
  });

  it('pierwsza instalacja SW (null -> SW) nie przeładowuje, ale kolejna wersja już tak', () => {
    // PL: Strona bez SW dostaje SW przy pierwszej instalacji (clientsClaim). To nie jest nowa wersja.
    // EN: A page without an SW gets one on the first install (clientsClaim). That is not a new version.
    const tab = createTab();
    tab.controller = null;
    const page = tab.loadPage();
    tab.controller = 'sw-pierwszy';
    page.fireBecomeVisible();
    page.fireNavigate('/aktualnosci');
    expect(tab.reloads).toBe(0);
    // PL: Dopiero zmiana z tego SW na kolejny jest nową wersją.
    // EN: Only a change from this SW to another one is a new version.
    tab.controller = 'sw-drugi';
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(1);
  });

  it('wiele błędów i powrotów na jednej stronie daje jedno przeładowanie', () => {
    // PL: Trzy błędy w tym samym czasie i kilka powrotów z tła.
    // EN: Three errors at the same time and several returns from background.
    const tab = createTab();
    const page = tab.loadPage();
    page.firePreloadError();
    page.firePreloadError();
    page.firePreloadError();
    tab.controller = 'sw-nowy';
    page.fireBecomeVisible();
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(1);
  });

  it('dwa błędy w ciągu 60 s dają jedno przeładowanie', () => {
    // PL: Pierwszy błąd przeładowuje stronę. Drugi po 30 sekundach na nowej stronie nie przeładowuje ponownie.
    // EN: The first error reloads the page. The second one, 30 seconds later on the new page, does not reload it again.
    const tab = createTab();
    tab.loadPage().firePreloadError();
    expect(tab.reloads).toBe(1);
    tab.now = 30_000;
    tab.loadPage().firePreloadError();
    expect(tab.reloads).toBe(1);
  });

  it('błąd po 61 s od przeładowania daje drugie przeładowanie', () => {
    // PL: Pierwszy błąd przeładowuje stronę. Po 61 sekundach kolejny błąd znów przeładowuje.
    // EN: The first error reloads the page. After 61 seconds, another error reloads it again.
    const tab = createTab();
    tab.loadPage().firePreloadError();
    expect(tab.reloads).toBe(1);
    tab.now = 61_000;
    tab.loadPage().firePreloadError();
    expect(tab.reloads).toBe(2);
  });

  it('zmiana SW w ciągu 60 s od przeładowania czeka, aż minie minuta', () => {
    // PL: Po przeładowaniu zmiana SW i powrót z tła w 10. sekundzie nie przeładowują. Ten sam powrót po 61 sekundach już przeładowuje.
    // EN: After a reload, a SW change and a return from background at second 10 do not reload. The same return after 61 seconds does.
    const tab = createTab();
    tab.loadPage().firePreloadError();
    expect(tab.reloads).toBe(1);
    tab.now = 10_000;
    const page = tab.loadPage();
    tab.controller = 'sw-nowy';
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(1);
    tab.now = 61_000;
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(2);
  });

  it('bez dostępu do sessionStorage nie przeładowuje, żeby nie zapętlić', () => {
    // PL: Pamięć sesji nie działa, więc nie da się zapisać czasu. Wolimy nie przeładować, ani po błędzie, ani po zmianie SW.
    // EN: Session memory does not work, so the time cannot be saved. We prefer not to reload, either after an error or after a SW change.
    const tab = createTab();
    tab.isStorageBroken = true;
    const page = tab.loadPage();
    page.firePreloadError();
    tab.controller = 'sw-nowy';
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(0);
  });

  it('po zatrzymaniu nasłuchu strony nic nie przeładowuje', () => {
    // PL: Strona zostaje zamknięta przed zdarzeniami, więc nie ma przeładowania.
    // EN: The page is closed before the events, so there is no reload.
    const tab = createTab();
    const page = tab.loadPage();
    page.stop();
    page.firePreloadError();
    tab.controller = 'sw-nowy';
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(0);
  });
});
