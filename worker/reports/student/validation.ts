/**
 * PL: Sprawdza dane nowego zgłoszenia przysłane z telefonu. Serwer nie ufa telefonowi (docs/STANDARD_KODU.md, część 6): sprawdza typ, kod z listy i długość każdego pola, a nieznane pola odrzuca po cichu, więc telefon nie może podać na przykład cudzego numeru autora.
 * EN: Validates the data of a new report sent from the phone. The server does not trust the phone (docs/STANDARD_KODU.md, part 6): it checks the type, the code from the list and the length of every field, and silently drops unknown fields, so the phone cannot supply, for example, someone else's author id.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/db/schema/reports.ts::REPORT_CATEGORIES
 * @uses worker/db/schema/reports.ts::REPORT_PLACES
 * @used_by worker/reports/student/routes.ts::parseReportInput
 * @used_by worker/reports/student/validation.test.ts::parseReportInput
 */

// PL: Listy dozwolonych kodów i typy kodów.
// EN: The lists of allowed codes and the code types.
import { REPORT_CATEGORIES, REPORT_PLACES, type ReportCategory, type ReportPlace } from '../../db/schema/reports';

/** PL: Najwyżej tyle znaków ma opis. Wystarczą jedno lub dwa zdania (ekran 3.3). EN: The description has at most this many characters. One or two sentences are enough (screen 3.3). */
export const MAX_DESCRIPTION_LENGTH = 500;

/** PL: Najwyżej tyle znaków ma dokładne miejsce, na przykład „Sala 112”. EN: The exact place has at most this many characters, for example "Sala 112". */
export const MAX_PLACE_DETAIL_LENGTH = 60;

/**
 * PL: Poprawne dane nowego zgłoszenia, już po oczyszczeniu.
 * EN: Valid data of a new report, after cleaning.
 */
export type ReportInput = {
  /** PL: Czego dotyczy zgłoszenie. EN: What the report is about. */
  category: ReportCategory;
  /** PL: Gdzie jest problem. EN: Where the problem is. */
  place: ReportPlace;
  /** PL: Dokładne miejsce bez spacji na brzegach albo `null`, gdy uczeń niczego nie wpisał. EN: The exact place without edge spaces, or `null` when the student typed nothing. */
  placeDetail: string | null;
  /** PL: Opis bez spacji na brzegach, niepusty. EN: The description without edge spaces, not empty. */
  description: string;
  /** PL: Czy zgłoszenie jest anonimowe. Domyślnie tak. EN: Whether the report is anonymous. True by default. */
  isAnonymous: boolean;
};

/**
 * PL: Wynik sprawdzania: dane albo lista pól z błędem.
 * EN: The validation result: the data or the list of invalid fields.
 */
export type ParseResult = { ok: true; value: ReportInput } | { ok: false; fields: string[] };

/**
 * PL: Sprawdza, czy wartość jest jednym z dozwolonych kodów.
 * EN: Checks whether a value is one of the allowed codes.
 *
 * @param value - PL: wartość z telefonu. EN: the value from the phone.
 * @param allowed - PL: lista dozwolonych kodów. EN: the list of allowed codes.
 * @returns PL: prawda, gdy wartość jest na liście. EN: true when the value is on the list.
 */
function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  // PL: Kod musi być tekstem i leżeć na liście.
  // EN: The code must be a string and be on the list.
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

/**
 * PL: Oczyszcza tekst pola: obcina spacje na brzegach i sprawdza długość.
 * EN: Cleans a text field: trims edge spaces and checks the length.
 *
 * @param value - PL: wartość z telefonu. EN: the value from the phone.
 * @param maxLength - PL: największa dozwolona długość po obcięciu. EN: the largest allowed length after trimming.
 * @returns PL: tekst po obcięciu (może być pusty) albo `undefined`, gdy wartość nie jest tekstem albo jest za długa. EN: the trimmed text (may be empty), or `undefined` when the value is not a string or is too long.
 */
function cleanText(value: unknown, maxLength: number): string | undefined {
  // PL: Tylko tekst jest dozwolony.
  // EN: Only text is allowed.
  if (typeof value !== 'string') return undefined;
  // PL: Obetnij spacje na brzegach, bo długość liczymy bez nich.
  // EN: Trim the edge spaces, because we count the length without them.
  const text = value.trim();
  // PL: Za długi tekst jest błędem.
  // EN: A text that is too long is an error.
  return text.length > maxLength ? undefined : text;
}

/**
 * PL: Sprawdza kategorię i miejsce: muszą być kodami z list.
 * EN: Checks the category and the place: they must be codes from the lists.
 *
 * @param raw - PL: treść zapytania jako obiekt. EN: the request body as an object.
 * @returns PL: nazwy pól z błędem. EN: the names of the invalid fields.
 */
function invalidCodeFields(raw: Record<string, unknown>): string[] {
  // PL: Zbierz nazwy pól, których wartość nie leży na liście.
  // EN: Collect the names of the fields whose value is not on the list.
  const fields: string[] = [];
  if (!isOneOf(raw.category, REPORT_CATEGORIES)) fields.push('category');
  if (!isOneOf(raw.place, REPORT_PLACES)) fields.push('place');
  return fields;
}

/**
 * PL: Sprawdza treść zapytania z formularza zgłoszenia.
 * EN: Validates the body of the report form request.
 *
 * @param body - PL: treść zapytania po odczytaniu JSON, jeszcze niesprawdzona. EN: the request body after JSON parsing, not yet checked.
 * @returns PL: oczyszczone dane albo nazwy pól z błędem (`category`, `place`, `placeDetail`, `description`, `isAnonymous`). EN: the cleaned data or the names of the invalid fields.
 */
export function parseReportInput(body: unknown): ParseResult {
  // PL: Treść musi być obiektem, inaczej każde pole jest błędne.
  // EN: The body must be an object, otherwise every field is invalid.
  const raw = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const fields = invalidCodeFields(raw);

  // PL: Dokładne miejsce jest opcjonalne: brak albo `null` znaczy „nie podano”.
  // EN: The exact place is optional: a missing value or `null` means "not given".
  const placeDetail = raw.placeDetail == null ? '' : cleanText(raw.placeDetail, MAX_PLACE_DETAIL_LENGTH);
  if (placeDetail === undefined) fields.push('placeDetail');

  // PL: Opis jest wymagany, więc pusty opis też jest błędem.
  // EN: The description is required, so an empty description is an error too.
  const description = cleanText(raw.description, MAX_DESCRIPTION_LENGTH);
  if (!description) fields.push('description');

  // PL: Anonimowość jest opcjonalna i domyślnie włączona (docs/PLAN_APLIKACJI.md, część 3). Inny typ niż prawda lub fałsz jest błędem.
  // EN: Anonymity is optional and on by default (docs/PLAN_APLIKACJI.md, part 3). A type other than true or false is an error.
  const isAnonymous = raw.isAnonymous ?? true;
  if (typeof isAnonymous !== 'boolean') fields.push('isAnonymous');

  // PL: Przy jakimkolwiek błędzie oddaj tylko listę pól; inaczej zbuduj oczyszczone dane (typy sprawdzone wyżej).
  // EN: With any error, return only the list of fields; otherwise build the cleaned data (types checked above).
  if (fields.length > 0) return { ok: false, fields };
  return { ok: true, value: { category: raw.category as ReportCategory, place: raw.place as ReportPlace, placeDetail: placeDetail || null, description: description as string, isAnonymous: isAnonymous as boolean } };
}
