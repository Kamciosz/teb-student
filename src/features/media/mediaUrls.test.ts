/**
 * PL: Testy adresów zdjęcia: miniatura i pełne zdjęcie wskazują ten sam plik, a wymiary są po zmniejszeniu i nie rosną.
 * EN: Tests of the photo addresses: the thumbnail and the full photo point to the same file, and the dimensions are after shrinking and never grow.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/mediaUrls.ts::mediaUrls
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { mediaUrls } from './mediaUrls';

// PL: Grupa testów adresów i wymiarów.
// EN: A group of tests for the addresses and dimensions.
describe('mediaUrls', () => {
  // PL: Miniatura ma dłuższy bok 400 px, pełne zdjęcie 1290 px, oba z tym samym adresem.
  // EN: The thumbnail has a longer side of 400 px, the full photo 1290 px, both with the same address.
  it('daje miniaturę 400 px i pełne zdjęcie 1290 px pod tym samym adresem / gives a 400 px thumbnail and a 1290 px full photo under the same address', () => {
    expect(mediaUrls({ id: 'abc', width: 3200, height: 1600 })).toEqual({
      thumb: { url: '/api/media/abc', width: 400, height: 200 },
      full: { url: '/api/media/abc', width: 1290, height: 645 },
    });
  });

  // PL: Mały obraz nie jest powiększany do rozmiaru pełnego zdjęcia.
  // EN: A small image is not enlarged to the size of the full photo.
  it('nie powiększa małego zdjęcia / does not enlarge a small photo', () => {
    const urls = mediaUrls({ id: 'mały', width: 800, height: 600 });
    expect(urls.thumb).toEqual({ url: '/api/media/ma%C5%82y', width: 400, height: 300 });
    expect(urls.full).toEqual({ url: '/api/media/ma%C5%82y', width: 800, height: 600 });
  });

  // PL: Bez znanych wymiarów adresy działają, a wymiary są puste.
  // EN: Without known dimensions the addresses work, and the dimensions are empty.
  it('bez wymiarów zostawia puste pola / leaves the fields empty without dimensions', () => {
    const urls = mediaUrls({ id: 'x', width: null, height: null });
    expect(urls.thumb).toEqual({ url: '/api/media/x', width: null, height: null });
    expect(urls.full).toEqual({ url: '/api/media/x', width: null, height: null });
  });
});
