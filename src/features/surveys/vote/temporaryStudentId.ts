/**
 * PL: TYMCZASOWY numer ucznia po stronie telefonu. Podtor 1a (logowanie) jeszcze nie istnieje, więc telefon sam wymyśla numer, zapisuje go w localStorage i wysyła w nagłówku. To NIE jest logowanie: numer można podmienić, więc nadaje się do pracy nad ekranami, a nie do pilotażu.
 *     Jedyne miejsce w telefonie, które zna numer ucznia. Gdy zgłoszenie #42 da sesję, ten plik znika.
 * EN: A TEMPORARY student id on the phone side. Subtrack 1a (sign-in) does not exist yet, so the phone makes up an id, stores it in localStorage and sends it in a header. This is NOT a sign-in: the id can be swapped, so it is fit for work on the screens, not for the pilot.
 *     The only place on the phone that knows the student id. When issue #42 provides a session, this file goes away.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/temporaryStudent.ts::TEMPORARY_STUDENT_HEADER
 * @used_by src/features/surveys/vote/surveyApi.ts::requestHeaders
 */

// TODO(Jakub, #42): usuń ten plik, gdy telefon ma sesję z podtoru 1a.

// PL: Nazwa nagłówka. Ta sama nazwa jest w worker/surveys/vote/temporaryStudent.ts.
// EN: The header name. The same name is in worker/surveys/vote/temporaryStudent.ts.
export const TEMPORARY_STUDENT_HEADER = 'X-Temporary-Student-Id';

// PL: Klucz w localStorage, pod którym leży numer.
// EN: The localStorage key the id is stored under.
const STORAGE_KEY = 'teb-temporary-student-id';

// PL: Długość numeru w bajtach. 16 bajtów to 32 znaki szesnastkowe, mieści się w limicie serwera (16–64).
// EN: The id length in bytes. 16 bytes are 32 hex characters, within the server limit (16–64).
const ID_BYTES = 16;

// PL: Numer na wypadek, gdy localStorage jest zablokowany (tryb prywatny). Żyje do odświeżenia strony.
// EN: An id for when localStorage is blocked (private mode). It lives until the page is reloaded.
let memoryId: string | null = null;

/**
 * PL: Losuje nowy numer. Używa crypto.getRandomValues, bo randomUUID nie ma na starszych telefonach.
 * EN: Draws a new id. Uses crypto.getRandomValues, because randomUUID is missing on older phones.
 *
 * @returns PL: 32 znaki szesnastkowe. EN: 32 hex characters.
 */
function makeId(): string {
  // PL: Wylosuj bajty i zamień każdy na dwa znaki szesnastkowe.
  // EN: Draw the bytes and turn each into two hex characters.
  const bytes = crypto.getRandomValues(new Uint8Array(ID_BYTES));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * PL: Zwraca numer ucznia. Czyta go z localStorage, a gdy go tam nie ma, losuje i zapisuje. Gdy localStorage nie działa, trzyma numer w pamięci.
 * EN: Returns the student id. Reads it from localStorage, and when it is missing, draws and stores one. When localStorage does not work, it keeps the id in memory.
 *
 * @returns PL: numer ucznia. EN: the student id.
 */
export function getTemporaryStudentId(): string {
  // PL: Spróbuj odczytać zapisany numer.
  // EN: Try to read the stored id.
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored;
    const fresh = makeId();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // PL: localStorage jest zablokowany, więc numer żyje tylko w pamięci.
    // EN: localStorage is blocked, so the id lives in memory only.
    memoryId ??= makeId();
    return memoryId;
  }
}
