/**
 * PL: Testy kolejności sekcji pulpitu: sortowanie z zapisem, uszkodzony zapis, nieznane i brakujące sekcje, granice przesunięć oraz pamięć, która rzuca błąd.
 * EN: Tests of the dashboard section order: sorting with the saved value, a broken saved value, unknown and missing sections, move boundaries, and a storage that throws.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/dashboard/tileOrder.ts::sortSections
 * @uses src/features/dashboard/tileOrder.ts::loadSectionOrder
 * @uses src/features/dashboard/tileOrder.ts::saveSectionOrder
 * @uses src/features/dashboard/tileOrder.ts::moveSection
 */

// PL: Narzędzia testowe Vitesta.
// EN: The Vitest test tools.
import { describe, expect, it } from 'vitest';
// PL: Funkcje kolejności i klucz zapisu.
// EN: The order functions and the storage key.
import {
  SECTION_ORDER_STORAGE_KEY,
  loadSectionOrder,
  moveSection,
  saveSectionOrder,
  sortSections,
  type SectionId,
  type SectionOrderStorage,
} from './tileOrder';

/** PL: Domyślna kolejność sekcji. EN: The default section order. */
const DEFAULT: SectionId[] = ['zrobienia', 'informacje'];

/**
 * PL: Atrapa pamięci w pamięci procesu. Zapisuje wszystko pod kluczem, jak localStorage.
 * EN: A fake storage in process memory. It saves everything under the key, like localStorage.
 *
 * @param initial - PL: wartość już zapisana pod kluczem. EN: the value already saved under the key.
 * @returns PL: atrapa pamięci i jej zawartość. EN: the fake storage and its contents.
 */
function memory(initial?: string): SectionOrderStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(SECTION_ORDER_STORAGE_KEY, initial);
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe('sortSections', () => {
  it('zachowuje zapisaną kolejność', () => {
    expect(sortSections(['informacje', 'zrobienia'])).toEqual(['informacje', 'zrobienia']);
  });

  it('pomija nieznane i powtórzone sekcje', () => {
    expect(sortSections(['informacje', 'ankieta', 'informacje', 42])).toEqual(['informacje', 'zrobienia']);
  });

  it('dokłada brakujące sekcje na końcu w domyślnej kolejności', () => {
    expect(sortSections(['informacje'])).toEqual(['informacje', 'zrobienia']);
  });

  it('gdy zapis nie jest listą, zwraca domyślną kolejność', () => {
    expect(sortSections('zrobienia')).toEqual(DEFAULT);
    expect(sortSections(null)).toEqual(DEFAULT);
  });
});

describe('loadSectionOrder i saveSectionOrder', () => {
  it('bez zapisu zwraca domyślną kolejność', () => {
    expect(loadSectionOrder(memory())).toEqual(DEFAULT);
  });

  it('zapis wraca przy odczycie', () => {
    const storage = memory();
    saveSectionOrder(['informacje', 'zrobienia'], storage);
    expect(loadSectionOrder(storage)).toEqual(['informacje', 'zrobienia']);
  });

  it('uszkodzony JSON nie psuje pulpitu', () => {
    expect(loadSectionOrder(memory('{nie-json'))).toEqual(DEFAULT);
  });

  it('pamięć, która rzuca błąd, nie przerywa odczytu ani zapisu', () => {
    const broken: SectionOrderStorage = {
      getItem: () => {
        throw new Error('zablokowane');
      },
      setItem: () => {
        throw new Error('pełna pamięć');
      },
    };
    expect(loadSectionOrder(broken)).toEqual(DEFAULT);
    expect(() => saveSectionOrder(DEFAULT, broken)).not.toThrow();
  });
});

describe('moveSection', () => {
  it('przesuwa sekcję w górę i w dół', () => {
    expect(moveSection(DEFAULT, 'informacje', -1)).toEqual(['informacje', 'zrobienia']);
    expect(moveSection(DEFAULT, 'zrobienia', 1)).toEqual(['informacje', 'zrobienia']);
  });

  it('na krawędzi nic nie robi i zwraca nową tablicę', () => {
    const moved = moveSection(DEFAULT, 'zrobienia', -1);
    expect(moved).toEqual(DEFAULT);
    expect(moved).not.toBe(DEFAULT);
  });
});
