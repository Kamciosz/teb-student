/**
 * PL: Kolejność kafelków pulpitu (wzór: widżety iOS). Uczeń układa kafelki przyciskami „Wyżej” i „Niżej”, a wybór zostaje w pamięci telefonu. Zapis, który nie pasuje (uszkodzony, stary albo z nieznanym kafelkiem), nie psuje pulpitu: nieznane kafelki są pomijane, a brakujące dokładane na końcu w domyślnej kolejności.
 * EN: The order of the dashboard tiles (the iOS widgets pattern). The student arranges the tiles with the "Wyżej" and "Niżej" buttons, and the choice stays in the phone storage. A saved value that does not fit (broken, old, or with an unknown tile) does not break the dashboard: unknown tiles are skipped, and missing ones are added at the end in the default order.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 * @used_by src/features/dashboard/TileRows.tsx::TileRows
 * @used_by src/features/dashboard/tileOrder.test.ts::sortTiles
 */

/** PL: Kafelki pulpitu w domyślnej kolejności (jak na makiecie 2.1). EN: The dashboard tiles in the default order (as on mockup 2.1). */
export const TILE_IDS = ['important', 'survey', 'report', 'announcements'] as const;

/** PL: Identyfikator kafelka. EN: A tile identifier. */
export type TileId = (typeof TILE_IDS)[number];

/** PL: Nazwy kafelków na przyciskach i w opisach. EN: The tile names on the buttons and in the labels. */
export const TILE_NAMES: Record<TileId, string> = {
  important: 'Ważne',
  survey: 'Ankieta',
  report: 'Zgłoszenia',
  announcements: 'Ogłoszenia',
};

/** PL: Klucz w pamięci telefonu, pod którym leży zapisana kolejność. EN: The key in the phone storage under which the saved order lies. */
export const TILE_ORDER_STORAGE_KEY = 'teb-student-dashboard-tile-order';

/** PL: Pamięć, z której czytamy i do której zapisujemy kolejność: w aplikacji localStorage. EN: The storage the order is read from and saved to: localStorage in the app. */
export type TileOrderStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** PL: Kafelki, które mogą stać obok siebie w jednym rzędzie. EN: The tiles that can stand side by side in one row. */
const PAIRED: readonly TileId[] = ['survey', 'report'];

/** PL: Jeden rząd: pojedynczy kafelek albo para. EN: One row: a single tile or a pair. */
export type TileRow = [TileId] | [TileId, TileId];

/**
 * PL: Sprawdza, czy wartość to identyfikator znanego kafelka.
 * EN: Checks whether the value is the identifier of a known tile.
 *
 * @param value - PL: wartość z zapisu. EN: the value from the storage.
 * @returns PL: true dla znanego kafelka. EN: true for a known tile.
 */
export function isTileId(value: unknown): value is TileId {
  return typeof value === 'string' && (TILE_IDS as readonly string[]).includes(value);
}

/**
 * PL: Układa kafelki według zapisanej listy: nieznane i powtórzone pomija, a brakujące dokłada na końcu w domyślnej kolejności. Gdy zapis nie jest listą, zwraca domyślną kolejność.
 * EN: Arranges the tiles by the saved list: skips unknown and repeated ones, and adds the missing ones at the end in the default order. When the saved value is not a list, returns the default order.
 *
 * @param saved - PL: wartość z zapisu, po JSON.parse. EN: the saved value, after JSON.parse.
 * @returns PL: pełna lista kafelków bez powtórzeń. EN: the full list of tiles without repeats.
 */
export function sortTiles(saved: unknown): TileId[] {
  const picked: TileId[] = [];
  if (Array.isArray(saved)) {
    for (const value of saved) {
      if (isTileId(value) && !picked.includes(value)) picked.push(value);
    }
  }
  return [...picked, ...TILE_IDS.filter((id) => !picked.includes(id))];
}

/**
 * PL: Zwraca localStorage, albo undefined poza przeglądarką lub gdy przeglądarka go blokuje (samo odczytanie potrafi rzucić błąd).
 * EN: Returns localStorage, or undefined outside a browser or when the browser blocks it (merely reading it can throw).
 *
 * @returns PL: pamięć albo undefined. EN: the storage or undefined.
 */
function browserStorage(): TileOrderStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * PL: Odczytuje zapisaną kolejność. Gdy zapis jest uszkodzony albo pamięć rzuca błąd, zwraca domyślną kolejność i nie przerywa pulpitu.
 * EN: Reads the saved order. When the saved value is broken or the storage throws, returns the default order and does not stop the dashboard.
 *
 * @param storage - PL: pamięć do odczytu, domyślnie localStorage. EN: the storage to read from, localStorage by default.
 * @returns PL: kolejność kafelków. EN: the order of the tiles.
 */
export function loadTileOrder(storage: TileOrderStorage | undefined = browserStorage()): TileId[] {
  try {
    const raw = storage?.getItem(TILE_ORDER_STORAGE_KEY) ?? null;
    return sortTiles(raw === null ? null : JSON.parse(raw));
  } catch {
    return sortTiles(null);
  }
}

/**
 * PL: Zapisuje kolejność w pamięci telefonu. Gdy zapis się nie udaje (pełna pamięć, zablokowany localStorage), kolejność działa do odświeżenia, a pulpit się nie psuje.
 * EN: Saves the order in the phone storage. When the save fails (full storage, blocked localStorage), the order works until a refresh, and the dashboard does not break.
 *
 * @param order - PL: kolejność do zapisania. EN: the order to save.
 * @param storage - PL: pamięć do zapisu, domyślnie localStorage. EN: the storage to save to, localStorage by default.
 */
export function saveTileOrder(order: readonly TileId[], storage: TileOrderStorage | undefined = browserStorage()): void {
  try {
    storage?.setItem(TILE_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    // PL: Nic nie robimy: kolejność zostaje w pamięci ekranu do odświeżenia.
    // EN: We do nothing: the order stays in the screen memory until a refresh.
  }
}

/**
 * PL: Przesuwa kafelek o jedno miejsce w górę (-1) albo w dół (1). Na krawędzi nic nie robi.
 * EN: Moves a tile one place up (-1) or down (1). On the edge it does nothing.
 *
 * @param order - PL: bieżąca kolejność. EN: the current order.
 * @param id - PL: kafelek do przesunięcia. EN: the tile to move.
 * @param step - PL: -1 w górę, 1 w dół. EN: -1 up, 1 down.
 * @returns PL: nowa kolejność (nowa tablica). EN: the new order (a new array).
 */
export function moveTile(order: readonly TileId[], id: TileId, step: -1 | 1): TileId[] {
  const from = order.indexOf(id);
  const to = from + step;
  const next = [...order];
  if (from === -1 || to < 0 || to >= next.length) return next;
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/**
 * PL: Dzieli kolejność na rzędy. Ankieta i zgłoszenie idą obok siebie tylko wtedy, gdy stoją jedno przy drugim; inaczej każdy kafelek ma cały rząd.
 * EN: Splits the order into rows. The survey and the report go side by side only when they stand next to each other; otherwise each tile has a whole row.
 *
 * @param order - PL: kolejność kafelków. EN: the order of the tiles.
 * @returns PL: lista rzędów w kolejności ekranu. EN: the list of rows in screen order.
 */
export function groupRows(order: readonly TileId[]): TileRow[] {
  const rows: TileRow[] = [];
  let i = 0;
  while (i < order.length) {
    const id = order[i];
    const next = order[i + 1];
    if (PAIRED.includes(id) && next !== undefined && PAIRED.includes(next)) {
      rows.push([id, next]);
      i += 2;
    } else {
      rows.push([id]);
      i += 1;
    }
  }
  return rows;
}
