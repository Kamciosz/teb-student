/**
 * PL: Testy reguł przyjmowania plików po stronie serwera: typy i rodzaje, limity bajtów oraz odczyt wymiarów z adresu. Czysta logika, bez bazy.
 * EN: Tests of the server-side file acceptance rules: types and kinds, byte limits and reading the dimensions from the address. Pure logic, no database.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/media/rules.ts::kindOfMime
 * @uses worker/media/rules.ts::maxBytesOf
 * @uses worker/media/rules.ts::parseDimensions
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Reguły, które sprawdzamy.
// EN: The rules under test.
import { kindOfMime, maxBytesOf, MAX_PHOTO_BYTES, MAX_VIDEO_BYTES, parseDimensions } from './rules';

// PL: Grupa testów rodzaju pliku po typie.
// EN: A group of tests for the file kind from the type.
describe('kindOfMime', () => {
  // PL: Znane typy dostają rodzaj, nieznane nie dostają nic.
  // EN: Known types get a kind, unknown ones get nothing.
  it('rozpoznaje zdjęcia i filmy, a resztę odrzuca / recognises photos and videos, and rejects the rest', () => {
    expect(kindOfMime('image/jpeg')).toBe('photo');
    expect(kindOfMime('video/quicktime')).toBe('video');
    // PL: HEIC i HEIF nie są przyjmowane, bo telefon ich nie zmniejsza, a oryginał niesie EXIF z lokalizacją.
    // EN: HEIC and HEIF are not accepted, because the phone does not shrink them, and the original carries EXIF with the location.
    expect(kindOfMime('IMAGE/HEIC')).toBeNull();
    expect(kindOfMime('image/heif')).toBeNull();
    expect(kindOfMime('application/pdf')).toBeNull();
  });
});

// PL: Grupa testów limitów bajtów.
// EN: A group of tests for the byte limits.
describe('maxBytesOf', () => {
  // PL: Film ma 50 MB, zdjęcie 20 MB.
  // EN: A video has 50 MB, a photo 20 MB.
  it('film do 50 MB, zdjęcie do 20 MB / a video up to 50 MB, a photo up to 20 MB', () => {
    expect(maxBytesOf('video')).toBe(MAX_VIDEO_BYTES);
    expect(maxBytesOf('photo')).toBe(MAX_PHOTO_BYTES);
    expect(MAX_VIDEO_BYTES).toBe(50 * 1024 * 1024);
  });
});

// PL: Grupa testów odczytu wymiarów z adresu.
// EN: A group of tests for reading the dimensions from the address.
describe('parseDimensions', () => {
  // PL: Brak obu wymiarów i poprawna para są dobre.
  // EN: Having neither dimension and a valid pair are fine.
  it('przyjmuje brak wymiarów i poprawną parę / accepts no dimensions and a valid pair', () => {
    expect(parseDimensions(undefined, undefined)).toEqual({ ok: true, width: null, height: null });
    expect(parseDimensions('800', '600')).toEqual({ ok: true, width: 800, height: 600 });
  });

  // PL: Jeden wymiar, zero, litery, ujemne i za duże wartości są błędem.
  // EN: One dimension, zero, letters, negative and too large values are errors.
  it('odrzuca jeden wymiar i złe wartości / rejects one dimension and bad values', () => {
    expect(parseDimensions('800', undefined)).toEqual({ ok: false });
    expect(parseDimensions('0', '600')).toEqual({ ok: false });
    expect(parseDimensions('-5', '600')).toEqual({ ok: false });
    expect(parseDimensions('abc', '600')).toEqual({ ok: false });
    expect(parseDimensions('20000', '600')).toEqual({ ok: false });
  });
});
