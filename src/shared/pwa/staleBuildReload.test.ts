/**
 * PL: Test przeładowania po wdrożeniu. Symuluje kartę przeglądarki: błąd pobrania fragmentu kodu, przejęcie strony przez nowy service worker, powrót z tła, zmianę ekranu i sessionStorage. Sprawdza, że strona przeładowuje się raz, bez pętli i nie w trakcie pisania.
 * EN: Test of the reload after a deploy. Simulates a browser tab: a code loading error, the page taken over by the new service worker, return from background, a screen change and sessionStorage. Checks that the page reloads once, without a loop and not while typing.
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
  // PL: Aktualny kontroler service workera (obiekt albo tekst w teście).
  // EN: The current service worker controller (an object or a string in the test).
  controller: unknown;
  // PL: Aktualny adres strony.
  // EN: The current page address.
  pathname: string;
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

  // PL: Zależności modułu: zamiast przeglądarki dajemy zwykłe funkcje i pamięć z karty.
  // EN: The module's dependencies: plain functions and the tab's memory instead of the browser.
  const env: StaleBuildEnv = {
    onPreloadError: (handler) => listen(preloadHandlers, handler),
    onBecomeVisible: (handler) => listen(visibleHandlers, handler),
    onNavigate: (handler) => listen(navigateHandlers, handler),
    getPathname: () => tab.pathname,
    getController: () => tab.controller,
    checkForUpdate: () => undefined,
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
 * PL: Tworzy kartę z pustą pamięcią sesji i jednym service workerem.
 * EN: Creates a tab with empty session memory and one service worker.
 *
 * @returns PL: karta testowa. EN: the test tab.
 */
function createTab(): Tab {
  // PL: Kartę trzymamy jako obiekt, żeby test mógł zmieniać jej stan (kontroler, adres, pamięć).
  // EN: We keep the tab as an object, so the test can change its state (controller, address, memory).
  const tab: Tab = {
    reloads: 0,
    controller: 'sw-stary',
    pathname: '/',
    storageValues: new Map(),
    isStorageBroken: false,
    loadPage: () => loadPage(tab),
  };
  return tab;
}

describe('przeładowanie po wdrożeniu', () => {
  it('przeładowuje raz, gdy nowy SW przejął stronę i użytkownik wrócił z tła', () => {
    // PL: Karta z jednym błędem pobrania, po którym nowy SW przejmuje stronę.
    // EN: A tab with one loading error, after which the new SW takes over the page.
    const tab = createTab();
    const page = tab.loadPage();
    page.firePreloadError();
    tab.controller = 'sw-nowy';
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(1);
  });

  it('nie przeładowuje w trakcie pisania: sam błąd i przejęcie strony to za mało', () => {
    // PL: Brak powrotu z tła i brak zmiany ekranu, czyli użytkownik nadal pisze.
    // EN: No return from background and no screen change, so the user is still typing.
    const tab = createTab();
    const page = tab.loadPage();
    page.firePreloadError();
    tab.controller = 'sw-nowy';
    expect(tab.reloads).toBe(0);
  });

  it('czeka, aż nowy SW przejmie stronę, zanim przeładuje', () => {
    // PL: Powrót z tła przed przejęciem strony nie przeładowuje.
    // EN: Returning from background before the takeover does not reload.
    const tab = createTab();
    const page = tab.loadPage();
    page.firePreloadError();
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(0);
    // PL: Po przejęciu kolejny powrót już przeładowuje.
    // EN: After the takeover, the next return does reload.
    tab.controller = 'sw-nowy';
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(1);
  });

  it('zmiana ekranu po przejęciu strony też przeładowuje', () => {
    // PL: Zmiana adresu na inny ekran uruchamia przeładowanie.
    // EN: A change of address to another screen triggers the reload.
    const tab = createTab();
    const page = tab.loadPage();
    page.firePreloadError();
    tab.controller = 'sw-nowy';
    page.fireNavigate('/aktualnosci');
    expect(tab.reloads).toBe(1);
  });

  it('wiele błędów i powrotów na jednej stronie daje jedno przeładowanie', () => {
    // PL: Trzy błędy i kilka powrotów z tła na tej samej stronie.
    // EN: Three errors and several returns from background on the same page.
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

  it('drugi błąd po przeładowaniu w tej samej sesji nie daje pętli', () => {
    // PL: Pierwsze wczytanie przeładowuje stronę raz.
    // EN: The first load reloads the page once.
    const tab = createTab();
    const first = tab.loadPage();
    first.firePreloadError();
    tab.controller = 'sw-nowy';
    first.fireBecomeVisible();
    expect(tab.reloads).toBe(1);
    first.stop();

    // PL: Po przeładowaniu znów pojawia się błąd i kolejna zmiana SW. Pamięć sesji pamięta pierwsze przeładowanie, więc nie przeładowujemy drugi raz.
    // EN: After the reload, an error and another SW change appear again. The session memory remembers the first reload, so we do not reload a second time.
    const second = tab.loadPage();
    second.firePreloadError();
    tab.controller = 'sw-trzeci';
    second.fireBecomeVisible();
    second.fireNavigate('/inny-ekran');
    expect(tab.reloads).toBe(1);
  });

  it('bez dostępu do sessionStorage nie przeładowuje, żeby nie zapętlić', () => {
    // PL: Pamięć sesji nie działa, więc nie da się zapisać znacznika. Wolimy nie przeładować.
    // EN: Session memory does not work, so the marker cannot be saved. We prefer not to reload.
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
    page.firePreloadError();
    tab.controller = 'sw-nowy';
    page.stop();
    page.fireBecomeVisible();
    expect(tab.reloads).toBe(0);
  });
});
