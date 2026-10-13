/**
 * PL: Sprawdzanie danych profilu z telefonu. Serwer nie ufa telefonowi: sprawdza typ, długość i dozwolone wartości szkoły, palety oraz rozmiaru tekstu.
 * EN: Checking the profile data from the phone. The server does not trust the phone: it checks the type, the length and the allowed values of the school and the palette.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses worker/db/schema/profile.ts::PROFILE_SCHOOLS
 * @uses worker/db/schema/profile.ts::PROFILE_PALETTES
 * @uses worker/db/schema/profile.ts::PROFILE_TEXT_SIZES
 * @used_by worker/profile/routes.ts::profileApp
 * @used_by worker/profile/validation.test.ts::parseProfileInput
 */

// PL: Dozwolone szkoły i palety oraz ich typy.
// EN: The allowed schools and palettes and their types.
import { PROFILE_PALETTES, PROFILE_SCHOOLS, PROFILE_TEXT_SIZES, type ProfilePalette, type ProfileSchool, type ProfileTextSize } from '../db/schema/profile';

/** PL: Najwięcej znaków w imieniu. EN: The most characters in the name. */
export const MAX_NAME_LENGTH = 40;

/** PL: Najwięcej znaków w nazwie klasy (na przykład „3TA”). EN: The most characters in the class name (for example "3TA"). */
export const MAX_CLASS_LENGTH = 10;

/**
 * PL: Profil ucznia: to samo, co telefon wysyła i co serwer oddaje.
 * EN: A student's profile: the same thing the phone sends and the server returns.
 */
export type ProfileInput = {
  /** PL: Imię, po przycięciu spacji, najwyżej MAX_NAME_LENGTH znaków (może być puste). EN: The name, trimmed, at most MAX_NAME_LENGTH characters (may be empty). */
  name: string;
  /** PL: Klasa, po przycięciu spacji, najwyżej MAX_CLASS_LENGTH znaków (może być pusta). EN: The class, trimmed, at most MAX_CLASS_LENGTH characters (may be empty). */
  className: string;
  /** PL: Szkoła: L albo T. EN: The school: L or T. */
  school: ProfileSchool;
  /** PL: Paleta: CA do CH. EN: The palette: CA to CH. */
  palette: ProfilePalette;
  /** PL: Rozmiar tekstu: normalny albo duzy. EN: The text size: normalny or duzy. */
  textSize: ProfileTextSize;
};

/**
 * PL: Wynik sprawdzania: poprawny profil albo nazwy złych pól (telefon pokaże błąd przy właściwym polu).
 * EN: The check result: a valid profile or the names of the bad fields (the phone shows the error at the right field).
 */
export type ParsedProfile = { ok: true; value: ProfileInput } | { ok: false; fields: string[] };

/**
 * PL: Czy wartość jest tekstem, który po przycięciu spacji mieści się w limicie.
 * EN: Whether the value is a text that fits the limit after trimming.
 *
 * @param value - PL: wartość z telefonu. EN: the value from the phone.
 * @param maxLength - PL: najwięcej znaków. EN: the most characters.
 * @returns PL: przycięty tekst albo undefined, gdy wartość jest zła. EN: the trimmed text, or undefined when the value is bad.
 */
function parseText(value: unknown, maxLength: number): string | undefined {
  // PL: Tylko tekst wchodzi dalej.
  // EN: Only a text goes on.
  if (typeof value !== 'string') return undefined;
  // PL: Przytnij spacje i sprawdź długość.
  // EN: Trim the spaces and check the length.
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed : undefined;
}

/**
 * PL: Sprawdza treść zapytania i zamienia ją na profil.
 * EN: Checks the request body and turns it into a profile.
 *
 * @param body - PL: treść z telefonu, nieznanego kształtu. EN: the body from the phone, of an unknown shape.
 * @returns PL: poprawny profil albo lista złych pól. EN: a valid profile or the list of bad fields.
 */
export function parseProfileInput(body: unknown): ParsedProfile {
  // PL: Treść musi być obiektem, inaczej zły jest każde pole.
  // EN: The body must be an object, otherwise every field is bad.
  const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};

  // PL: Sprawdź każde pole osobno.
  // EN: Check every field separately.
  const name = parseText(record.name, MAX_NAME_LENGTH);
  const className = parseText(record.className, MAX_CLASS_LENGTH);
  const school = PROFILE_SCHOOLS.find((code) => code === record.school);
  const palette = PROFILE_PALETTES.find((code) => code === record.palette);
  const textSize = PROFILE_TEXT_SIZES.find((size) => size === record.textSize);

  // PL: Zbierz nazwy pól, które się nie zgadzają.
  // EN: Collect the names of the fields that do not match.
  const fields: string[] = [];
  if (name === undefined) fields.push('name');
  if (className === undefined) fields.push('className');
  if (school === undefined) fields.push('school');
  if (palette === undefined) fields.push('palette');
  if (textSize === undefined) fields.push('textSize');
  if (name === undefined || className === undefined || school === undefined || palette === undefined || textSize === undefined) return { ok: false, fields };

  // PL: Wszystko się zgadza.
  // EN: Everything matches.
  return { ok: true, value: { name, className, school, palette, textSize } };
}
