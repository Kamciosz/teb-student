/**
 * PL: Odświeża licznik do dzwonka co 30 sekund, ale tylko wtedy, gdy karta jest widoczna. Ukryta karta nie odświeża, a po powrocie od razu pokazuje aktualną minutę. Wzorzec jak w TanStack Query: zapytania w tle pauzują się, gdy karta jest ukryta (Page Visibility API).
 * EN: Refreshes the bell countdown every 30 seconds, but only while the tab is visible. A hidden tab does not refresh, and on return it shows the current minute at once. The pattern is the one TanStack Query uses: background queries pause while the tab is hidden (Page Visibility API).
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @used_by src/features/dashboard/useBellState.ts::useBellState
 */

// PL: Co ile milisekund odświeżać licznik. 30 sekund wystarcza, bo licznik pokazuje pełne minuty.
// EN: How often to refresh the countdown, in milliseconds. 30 seconds is enough, because the countdown shows whole minutes.
export const BELL_REFRESH_MS = 30_000;

/**
 * PL: Część strony, której potrzebuje odświeżanie: stan widoczności karty i zdarzenie jej zmiany. Pasuje do `document`.
 * EN: The part of the page the refresh needs: the visibility state of the tab and its change event. It fits `document`.
 */
export type VisibilityTarget = {
  /** PL: „visible” albo „hidden”. EN: "visible" or "hidden". */
  visibilityState: DocumentVisibilityState;
  /** PL: Dopisuje słuchacza zmiany widoczności. EN: Adds a listener for visibility changes. */
  addEventListener: (type: 'visibilitychange', listener: () => void) => void;
  /** PL: Usuwa słuchacza zmiany widoczności. EN: Removes the visibility change listener. */
  removeEventListener: (type: 'visibilitychange', listener: () => void) => void;
};

/**
 * PL: Dane wejściowe odświeżania: skąd brać stan, dokąd go oddać i którą stronę obserwować. Stan jest dowolny (T), bo pulpit odświeża cały odczyt, a nie tylko licznik.
 * EN: The inputs of the refresh: where to read the state, where to pass it, and which page to watch. The state is any type (T), because the dashboard refreshes the whole reading, not only the countdown.
 */
export type BellTickerOptions<T> = {
  /** PL: Czyta bieżący stan. EN: Reads the current state. */
  read: () => T;
  /** PL: Dostaje każdy odczytany stan. EN: Receives every state read. */
  onChange: (state: T) => void;
  /** PL: Strona, której widoczność decyduje o odświeżaniu. EN: The page whose visibility decides the refresh. */
  page: VisibilityTarget;
};

/**
 * PL: Uruchamia odświeżanie licznika i zwraca funkcję, która je zatrzymuje (czyści zegar i słuchacza). Gdy karta jest widoczna, czyta stan od razu i potem co 30 sekund. Gdy jest ukryta, nic nie czyta.
 * EN: Starts refreshing the countdown and returns a function that stops it (clears the timer and the listener). When the tab is visible it reads the state at once and then every 30 seconds. When it is hidden it reads nothing.
 *
 * @param options - PL: stan, odbiorca i strona. EN: the reader, the receiver and the page.
 * @returns PL: funkcja zatrzymująca odświeżanie. EN: a function that stops the refresh.
 */
export function startBellTicker<T>({ read, onChange, page }: BellTickerOptions<T>): () => void {
  // PL: Identyfikator zegara odświeżania. Brak wartości znaczy, że zegara nie ma (karta ukryta albo zatrzymane).
  // EN: The refresh timer ID. No value means there is no timer (the tab is hidden or it is stopped).
  let timer: ReturnType<typeof setInterval> | undefined;

  // PL: Jeden krok odświeżenia: odczytaj stan i oddaj go odbiorcy.
  // EN: One refresh step: read the state and pass it to the receiver.
  const refresh = () => onChange(read());

  // PL: Zatrzymaj zegar i zapomnij o nim. Wywołanie bez zegara nic nie robi.
  // EN: Stop the timer and forget it. Calling it without a timer does nothing.
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
  };

  // PL: Wystartuj tylko raz: gdy zegar już działa, drugi start nie dubluje odświeżania.
  // EN: Start only once: when the timer already runs, a second start does not double the refresh.
  const start = () => {
    if (timer !== undefined) return;
    // PL: Najpierw od razu odczytaj stan, bo mogła minąć długa przerwa, gdy karta była ukryta.
    // EN: First read the state at once, because a long time may have passed while the tab was hidden.
    refresh();
    timer = setInterval(refresh, BELL_REFRESH_MS);
  };

  // PL: Widoczna karta włącza odświeżanie, ukryta je wyłącza.
  // EN: A visible tab turns the refresh on, a hidden tab turns it off.
  const handleVisibilityChange = () => {
    if (page.visibilityState === 'visible') start();
    else stop();
  };

  // PL: Sprawdź stan od razu po uruchomieniu i słuchaj kolejnych zmian.
  // EN: Check the state right after starting and listen for later changes.
  handleVisibilityChange();
  page.addEventListener('visibilitychange', handleVisibilityChange);

  // PL: Funkcja zatrzymania: zegar i słuchacz znikają razem.
  // EN: The stop function: the timer and the listener go away together.
  return () => {
    stop();
    page.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
