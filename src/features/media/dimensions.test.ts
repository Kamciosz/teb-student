/**
 * PL: Testy liczenia wymiarów po zmniejszeniu: dłuższy bok dostaje limit, proporcje zostają, a mały obraz się nie powiększa.
 * EN: Tests of computing the dimensions after shrinking: the longer side gets the limit, the proportions stay, and a small image is not enlarged.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/dimensions.ts::fitWithin
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { fitWithin } from './dimensions';

// PL: Grupa testów zmniejszania do limitu.
// EN: A group of tests for shrinking to the limit.
describe('fitWithin', () => {
  // PL: Pejzaż większy niż limit dostaje dłuższy bok równy limitowi.
  // EN: A landscape larger than the limit gets a longer side equal to the limit.
  it('zmniejsza dłuższy bok do limitu / shrinks the longer side to the limit', () => {
    expect(fitWithin({ width: 3200, height: 1600 }, 1600)).toEqual({ width: 1600, height: 800 });
  });

  // PL: Portret zachowuje proporcje.
  // EN: A portrait keeps its proportions.
  it('zachowuje proporcje portretu / keeps the proportions of a portrait', () => {
    expect(fitWithin({ width: 600, height: 4000 }, 1290)).toEqual({ width: 194, height: 1290 });
  });

  // PL: Obraz mniejszy niż limit zostaje bez zmian, bez powiększania.
  // EN: An image smaller than the limit stays unchanged, without enlarging.
  it('nie powiększa mniejszego obrazu / does not enlarge a smaller image', () => {
    expect(fitWithin({ width: 800, height: 600 }, 1600)).toEqual({ width: 800, height: 600 });
  });

  // PL: Skrajnie wąski obraz nigdy nie dostaje zera pikseli.
  // EN: An extremely narrow image never gets zero pixels.
  it('nie schodzi poniżej jednego piksela / never goes below one pixel', () => {
    expect(fitWithin({ width: 1, height: 10000 }, 100)).toEqual({ width: 1, height: 100 });
  });
});
