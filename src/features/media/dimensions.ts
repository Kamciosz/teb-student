/**
 * PL: Liczenie wymiarów po zmniejszeniu: dłuższy bok dostaje najwyżej zadany rozmiar, a proporcje zostają. Nigdy nie powiększamy, więc mały obraz zostaje taki, jaki jest.
 * EN: Computing the dimensions after shrinking: the longer side gets at most the given size, and the proportions stay. We never enlarge, so a small image stays as it is.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/media/mediaUrls.ts::mediaUrls
 * @used_by src/features/media/imagePipeline.ts::preparePhoto
 * @used_by src/features/media/dimensions.test.ts::fitWithin
 */

/** PL: Wymiary w pikselach. EN: Dimensions in pixels. */
export type Size = { width: number; height: number };

/**
 * PL: Zmniejsza wymiary tak, by dłuższy bok nie przekroczył maxSide. Obraz mniejszy niż limit zostaje bez zmian.
 * EN: Shrinks the dimensions so the longer side does not exceed maxSide. An image smaller than the limit stays unchanged.
 *
 * @param size - PL: wymiary oryginału. EN: the dimensions of the original.
 * @param maxSide - PL: najwięcej pikseli dłuższego boku. EN: the most pixels of the longer side.
 * @returns PL: nowe wymiary (co najmniej 1 piksel). EN: the new dimensions (at least 1 pixel).
 */
export function fitWithin(size: Size, maxSide: number): Size {
  const longest = Math.max(size.width, size.height);
  // PL: Mieści się w limicie, więc nic nie zmieniamy.
  // EN: It fits the limit, so we change nothing.
  if (longest <= maxSide) return { width: size.width, height: size.height };
  const scale = maxSide / longest;
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}
