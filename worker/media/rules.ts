/**
 * PL: Reguły przyjmowania plików po stronie serwera: jakie typy są dozwolone, jaki rodzaj i limit wielkości ma każdy typ oraz jak czytamy wymiary z adresu zapytania. Telefon sprawdza to samo wcześniej, ale serwer sprawdza jeszcze raz, bo telefonowi nie ufamy.
 * EN: The rules for accepting files on the server side: which types are allowed, what kind and size limit each type has, and how we read the dimensions from the request address. The phone checks the same earlier, but the server checks again, because we do not trust the phone.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/media.ts::MediaKind
 * @used_by worker/media/routes.ts::mediaApp
 * @used_by worker/media/upload.ts::storeMedia
 */

// PL: Rodzaj pliku z tabeli mediów.
// EN: The file kind from the media table.
import type { MediaKind } from '../db/schema/media';

/** PL: Jeden megabajt w bajtach. EN: One megabyte in bytes. */
const MEGABYTE = 1024 * 1024;

/** PL: Najwięcej bajtów zdjęcia. Telefon zmniejsza zdjęcie do JPEG, a gdy nie umie, zdjęcia nie wysyła. EN: The most bytes of a photo. The phone shrinks a photo to JPEG, and when it cannot, it does not send the photo. */
export const MAX_PHOTO_BYTES = 20 * MEGABYTE;

/** PL: Najwięcej bajtów filmu (bez przekodowania na telefonie). EN: The most bytes of a video (no transcoding on the phone). */
export const MAX_VIDEO_BYTES = 50 * MEGABYTE;

/** PL: Najdłuższy bok wymiaru, jaki przyjmujemy (zabezpieczenie przed liczbami z kosmosu). EN: The largest accepted side length (protection against absurd numbers). */
export const MAX_SIDE_PIXELS = 10_000;

/**
 * PL: Typy plików, które przyjmujemy, z rodzajem każdego z nich. Zdjęcia: JPEG (zwykle z telefonu po zmniejszeniu) i PNG. Filmy: MP4 i MOV z iPhone'a. HEIC i HEIF są celowo pominięte: ich oryginał niesie EXIF z lokalizacją, więc dostają 415.
 * EN: The file types we accept, with the kind of each. Photos: JPEG (usually from the phone after shrinking) and PNG. Videos: MP4 and MOV from an iPhone. HEIC and HEIF are left out on purpose: their original carries EXIF with the location, so they get 415.
 */
const KIND_BY_MIME: Readonly<Record<string, MediaKind>> = {
  'image/jpeg': 'photo',
  'image/png': 'photo',
  'video/mp4': 'video',
  'video/quicktime': 'video',
};

/**
 * PL: Rodzaj pliku po typie zawartości, a gdy typ nieznany, null.
 * EN: The file kind from the content type, or null when the type is unknown.
 *
 * @param mime - PL: typ zawartości z nagłówka zapytania (bez parametrów, np. bez „; charset”). EN: the content type from the request header (without parameters, for example without "; charset").
 * @returns PL: rodzaj pliku albo null. EN: the file kind or null.
 */
export function kindOfMime(mime: string): MediaKind | null {
  // PL: Typy zapisujemy małymi literami, więc szukamy po małych literach.
  // EN: Types are written in lower case, so we look them up in lower case.
  return KIND_BY_MIME[mime.toLowerCase()] ?? null;
}

/**
 * PL: Najwięcej bajtów dla danego rodzaju pliku.
 * EN: The most bytes for a given file kind.
 *
 * @param kind - PL: rodzaj pliku. EN: the file kind.
 * @returns PL: limit w bajtach. EN: the limit in bytes.
 */
export function maxBytesOf(kind: MediaKind): number {
  // PL: Film ma większy limit, zdjęcie mniejszy.
  // EN: A video has the larger limit, a photo the smaller one.
  return kind === 'video' ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES;
}

/**
 * PL: Wynik odczytu wymiarów z adresu: liczby albo brak obu (gdy telefon ich nie podał).
 * EN: The result of reading the dimensions from the address: numbers, or neither (when the phone did not give them).
 */
export type DimensionsResult = { ok: true; width: number | null; height: number | null } | { ok: false };

/**
 * PL: Czyta szerokość i wysokość z adresu zapytania (?width=&height=). Brak obu jest dozwolony (film wysłany bez przeróbek nie ma wymiarów). Jedno bez drugiego albo zły zapis to błąd.
 * EN: Reads the width and the height from the request address (?width=&height=). Having neither is allowed (a video sent unchanged has no dimensions). Only one of them, or a bad value, is an error.
 *
 * @param width - PL: wartość parametru width albo undefined. EN: the value of the width parameter, or undefined.
 * @param height - PL: wartość parametru height albo undefined. EN: the value of the height parameter, or undefined.
 * @returns PL: wymiary albo błąd. EN: the dimensions or an error.
 */
export function parseDimensions(width: string | undefined, height: string | undefined): DimensionsResult {
  // PL: Brak obu wymiarów jest w porządku.
  // EN: Having neither dimension is fine.
  if (width === undefined && height === undefined) return { ok: true, width: null, height: null };
  // PL: Gdy podano tylko jeden wymiar, zapytanie jest źle złożone.
  // EN: When only one dimension is given, the request is malformed.
  if (width === undefined || height === undefined) return { ok: false };
  const w = parseSide(width);
  const h = parseSide(height);
  return w === null || h === null ? { ok: false } : { ok: true, width: w, height: h };
}

/**
 * PL: Zamienia tekst na liczbę pikseli. Tylko same cyfry, od 1 do MAX_SIDE_PIXELS.
 * EN: Turns text into a number of pixels. Digits only, from 1 to MAX_SIDE_PIXELS.
 *
 * @param text - PL: wartość z adresu. EN: the value from the address.
 * @returns PL: liczba albo null, gdy wartość jest zła. EN: the number, or null when the value is bad.
 */
function parseSide(text: string): number | null {
  // PL: Sprawdź, że są same cyfry, zanim zamienimy na liczbę.
  // EN: Check that there are only digits before turning it into a number.
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value >= 1 && value <= MAX_SIDE_PIXELS ? value : null;
}
