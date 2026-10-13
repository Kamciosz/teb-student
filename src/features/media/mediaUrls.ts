/**
 * PL: Adresy zdjęcia w dwóch rozmiarach: miniatura (dłuższy bok ok. 400 px) i pełny (ok. 1290 px). Do czasu Cloudflare Images oba adresy wskazują ten sam plik z /api/media/<id>. Gdy Images będzie, zmienimy tylko tę funkcję, a ekrany nic nie zauważą.
 * EN: The photo addresses in two sizes: a thumbnail (longer side about 400 px) and a full one (about 1290 px). Until Cloudflare Images exists, both addresses point to the same file at /api/media/<id>. When Images exists, only this function changes, and the screens will not notice.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/media/dimensions.ts::fitWithin
 * @used_by src/features/media/mediaUrls.test.ts::mediaUrls
 */

// PL: Zmniejszanie wymiarów do zadanego dłuższego boku.
// EN: Shrinking the dimensions to a given longer side.
import { fitWithin } from './dimensions';

/** PL: Dłuższy bok miniatury w pikselach. EN: The longer side of the thumbnail in pixels. */
export const THUMB_SIDE = 400;

/** PL: Dłuższy bok pełnego zdjęcia w pikselach. EN: The longer side of the full photo in pixels. */
export const FULL_SIDE = 1290;

/** PL: Jeden rozmiar zdjęcia: adres i wymiary (null, gdy nie są znane). EN: One size of a photo: the address and the dimensions (null when not known). */
export type MediaVariant = { url: string; width: number | null; height: number | null };

/** PL: Oba rozmiary zdjęcia. EN: Both sizes of a photo. */
export type MediaUrls = { thumb: MediaVariant; full: MediaVariant };

/**
 * PL: Zwraca adresy miniatury i pełnego zdjęcia z wymiarami. Wymiary nie rosną ponad oryginał.
 * EN: Returns the addresses of the thumbnail and the full photo with their dimensions. The dimensions never grow beyond the original.
 *
 * @param media - PL: numer pliku i jego wymiary (albo null). EN: the file id and its dimensions (or null).
 * @returns PL: miniatura i pełne zdjęcie. EN: the thumbnail and the full photo.
 */
export function mediaUrls(media: { id: string; width: number | null; height: number | null }): MediaUrls {
  // PL: Do czasu Cloudflare Images oba rozmiary to ten sam plik z Workera.
  // EN: Until Cloudflare Images exists, both sizes are the same file from the Worker.
  const url = `/api/media/${encodeURIComponent(media.id)}`;
  return { thumb: variant(url, media, THUMB_SIDE), full: variant(url, media, FULL_SIDE) };
}

/**
 * PL: Składa jeden rozmiar: adres i wymiary po zmniejszeniu, a bez znanych wymiarów same null.
 * EN: Builds one size: the address and the dimensions after shrinking, and only nulls when the dimensions are not known.
 *
 * @param url - PL: adres pliku. EN: the file address.
 * @param media - PL: wymiary oryginału. EN: the dimensions of the original.
 * @param side - PL: dłuższy bok tego rozmiaru. EN: the longer side of this size.
 * @returns PL: rozmiar gotowy do użycia. EN: the size ready to use.
 */
function variant(url: string, media: { width: number | null; height: number | null }, side: number): MediaVariant {
  if (media.width === null || media.height === null) return { url, width: null, height: null };
  return { url, ...fitWithin({ width: media.width, height: media.height }, side) };
}
