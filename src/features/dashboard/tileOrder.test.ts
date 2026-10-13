/**
 * PL: Testy kolejności kafelków pulpitu: sortowanie z zapisem, uszkodzony zapis, nieznane i brakujące kafelki, granice przesunięć oraz pamięć, która rzuca błąd.
 * EN: Tests of the dashboard tile order: sorting with the saved value, a broken saved value, unknown and missing tiles, move boundaries, and a storage that throws.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/dashboard/tileOrder.ts::sortTiles
 * @uses src/features/dashboard/tileOrder.ts::loadTileOrder
 * @uses src/features/dashboard/tileOrder.ts::saveTileOrder
 * @uses src/features/dashboard/tileOrder.ts::moveTile
 * @uses src/features/dashboard/tileOrder.ts::groupRows
 */

// PL: Narzędzia testowe Vitesta.
// EN: The Vitest test tools.
import { describe, expect, it } from 'vitest';
// PL: Funkcje kolejności i klucz zapisu.
// EN: The order functions and the storage key.
import {
  TILE_ORDER_STORAGE_KEY,
  groupRows,
  loadTileOrder,
  moveTile,
  saveTileOrder,
  sortTiles,
  type TileId,
  type TileOrderStorage,
} from './tileOrder';

/** PL: Domyślna kolejność kafelków. EN: The default tile order. */
const DEFAULT: TileId[] = ['important', 'survey', 'report', 'announcements'];

/**
 * PL: Atrapa pamięci w pamięci procesu. Zapisuje wszystko pod kluczem, jak localStorage.
 * EN: A fake storage in process memory. It saves everything under the key, like localStorage.
 *
 * @param initial - PL: wartość już zapisana pod kluczem. EN: the value already saved under the key.
 * @returns PL: atrapa pamięci i jej zawartość. EN: the fake storage and its contents.
 */
function memory(initial?: string): TileOrderStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(TILE_ORDER_STORAGE_KEY, initial);
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

// PL: Testy sortowania i zapisu.
// EN: The sorting and saving tests.
describe('sortTiles', () => {
  // PL: Zapisana kolejność wygrywa z domyślną.
  // EN: The saved order wins over the default one.
  it('ustawia kafelki według zapisu / sets the tiles by the saved value', () => {
    expect(sortTiles(['announcements', 'important', 'report', 'survey'])).toEqual(['announcements', 'important', 'report', 'survey']);
  });

  // PL: Nieznany kafelek jest pomijany, a brakujące dokładane na końcu w domyślnej kolejności.
  // EN: An unknown tile is skipped, and the missing ones are added at the end in the default order.
  it('pomija nieznane i dokłada brakujące na końcu / skips unknown and adds missing ones at the end', () => {
    expect(sortTiles(['report', 'kosmos', 'important'])).toEqual(['report', 'important', 'survey', 'announcements']);
  });

  // PL: Powtórzony kafelek zostaje tylko raz, na pierwszej pozycji.
  // EN: A repeated tile stays only once, at its first position.
  it('nie powtarza kafelków / does not repeat tiles', () => {
    expect(sortTiles(['survey', 'survey', 'important', 'survey'])).toEqual(['survey', 'important', 'report', 'announcements']);
  });

  // PL: Zapis, który nie jest listą (liczba, tekst, obiekt, null), daje domyślną kolejność.
  // EN: A saved value that is not a list (a number, text, an object, null) gives the default order.
  it('zły typ zapisu daje domyślną kolejność / a wrong saved type gives the default order', () => {
    expect(sortTiles(42)).toEqual(DEFAULT);
    expect(sortTiles('important')).toEqual(DEFAULT);
    expect(sortTiles({ important: 1 })).toEqual(DEFAULT);
    expect(sortTiles(null)).toEqual(DEFAULT);
  });
});

// PL: Testy odczytu z pamięci, także uszkodzonej.
// EN: The tests of reading from the storage, including a broken one.
describe('loadTileOrder', () => {
  // PL: Poprawny zapis wraca jako kolejność.
  // EN: A valid saved value comes back as the order.
  it('odczytuje zapisaną kolejność / reads the saved order', () => {
    const storage = memory(JSON.stringify(['report', 'important', 'announcements', 'survey']));
    expect(loadTileOrder(storage)).toEqual(['report', 'important', 'announcements', 'survey']);
  });

  // PL: Uszkodzony JSON nie przerywa pulpitu: wraca domyślna kolejność.
  // EN: Broken JSON does not stop the dashboard: the default order comes back.
  it('uszkodzony zapis daje domyślną kolejność / a broken saved value gives the default order', () => {
    expect(loadTileOrder(memory('{nie-json'))).toEqual(DEFAULT);
  });

  // PL: Brak zapisu (pierwsze wejście) daje domyślną kolejność.
  // EN: No saved value (the first visit) gives the default order.
  it('brak zapisu daje domyślną kolejność / no saved value gives the default order', () => {
    expect(loadTileOrder(memory())).toEqual(DEFAULT);
  });

  // PL: Pamięć, która rzuca błąd przy odczycie (zablokowany localStorage), nie psuje pulpitu.
  // EN: A storage that throws on read (a blocked localStorage) does not break the dashboard.
  it('pamięć, która rzuca błąd, daje domyślną kolejność / a storage that throws gives the default order', () => {
    const broken: TileOrderStorage = {
      getItem: () => {
        throw new Error('zablokowane');
      },
      setItem: () => {},
    };
    expect(loadTileOrder(broken)).toEqual(DEFAULT);
  });
});

// PL: Testy zapisu, także przy pełnej pamięci.
// EN: The saving tests, including a full storage.
describe('saveTileOrder', () => {
  // PL: Zapisana kolejność wraca po odczytaniu (przeżywa „odświeżenie”).
  // EN: The saved order comes back when read (it survives a "refresh").
  it('zapis wraca po odczycie / the saved order comes back when read', () => {
    const storage = memory();
    saveTileOrder(['announcements', 'report', 'survey', 'important'], storage);
    expect(loadTileOrder(storage)).toEqual(['announcements', 'report', 'survey', 'important']);
  });

  // PL: Pełna pamięć albo zablokowany zapis nie rzuca błędu do ekranu.
  // EN: A full storage or a blocked save does not throw an error to the screen.
  it('błąd zapisu nie przerywa / a save error does not stop anything', () => {
    const full: TileOrderStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(() => saveTileOrder(DEFAULT, full)).not.toThrow();
  });
});

// PL: Testy przesunięć kafelków.
// EN: The tile move tests.
describe('moveTile', () => {
  // PL: Przesunięcie w górę i w dół zamienia kafelek z sąsiadem.
  // EN: Moving up and down swaps the tile with its neighbour.
  it('zamienia z sąsiadem / swaps with the neighbour', () => {
    expect(moveTile(DEFAULT, 'survey', -1)).toEqual(['survey', 'important', 'report', 'announcements']);
    expect(moveTile(DEFAULT, 'survey', 1)).toEqual(['important', 'report', 'survey', 'announcements']);
  });

  // PL: Na krawędzi nic się nie zmienia, a funkcja nie oddaje tej samej tablicy.
  // EN: On the edge nothing changes, and the function does not return the same array.
  it('na krawędzi nic nie robi / does nothing on the edge', () => {
    expect(moveTile(DEFAULT, 'important', -1)).toEqual(DEFAULT);
    expect(moveTile(DEFAULT, 'announcements', 1)).toEqual(DEFAULT);
    expect(moveTile(DEFAULT, 'important', -1)).not.toBe(DEFAULT);
  });

  // PL: Nie zmienia oryginalnej tablicy.
  // EN: It does not change the original array.
  it('nie zmienia wejściowej tablicy / does not change the input array', () => {
    const before = [...DEFAULT];
    moveTile(DEFAULT, 'report', -1);
    expect(DEFAULT).toEqual(before);
  });
});

// PL: Testy rzędów: para Ankieta i Zgłoszenia.
// EN: The row tests: the Survey and Report pair.
describe('groupRows', () => {
  // PL: Ankieta i zgłoszenie obok siebie tworzą jeden rząd.
  // EN: The survey and the report next to each other make one row.
  it('łączy ankietę i zgłoszenia, gdy stoją obok siebie / pairs the survey and the report when they stand next to each other', () => {
    expect(groupRows(DEFAULT)).toEqual([['important'], ['survey', 'report'], ['announcements']]);
  });

  // PL: Gdy zgłoszenie stoi daleko od ankiety, każdy kafelek ma cały rząd.
  // EN: When the report stands far from the survey, each tile has a whole row.
  it('rozdziela, gdy nie sąsiadują / splits them when they are not neighbours', () => {
    expect(groupRows(['survey', 'important', 'report', 'announcements'])).toEqual([
      ['survey'],
      ['important'],
      ['report'],
      ['announcements'],
    ]);
  });
});
