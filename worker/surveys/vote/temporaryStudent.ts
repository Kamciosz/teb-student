/**
 * PL: TYMCZASOWE miejsce, skąd serwer bierze numer ucznia. Podtor 1a (logowanie) jeszcze nie istnieje, więc nie ma sesji. Ten plik NIE jest logowaniem:
 *     numer ucznia przychodzi w nagłówku, który telefon sam wymyśla, więc każdy może go podmienić i zagłosować wiele razy. Nadaje się do pracy nad ekranami, a nie do pilotażu.
 *     Jedyne miejsce w podtorze 5a, które zna numer ucznia. Gdy zgłoszenie #42 wystawi numer z sesji, ten plik znika, a getStudentId woła funkcję z worker/auth/index.ts.
 * EN: A TEMPORARY place where the server takes the student id from. Subtrack 1a (sign-in) does not exist yet, so there is no session. This file is NOT a sign-in:
 *     the student id arrives in a header that the phone makes up itself, so anyone can swap it and vote many times. It is fit for work on the screens, not for the pilot.
 *     The only place in subtrack 5a that knows the student id. When issue #42 exposes the id from the session, this file goes away and getStudentId calls the function from worker/auth/index.ts.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by worker/surveys/vote/routes.ts::surveysVoteApp
 * @used_by src/features/surveys/vote/temporaryStudentId.ts::TEMPORARY_STUDENT_HEADER
 */

// TODO(Jakub, #42): zastąp numerem ucznia z sesji, gdy podtor 1a wystawi go w worker/auth/index.ts.

// PL: Typ kontekstu zapytania Hono, z którego czytamy nagłówek.
// EN: The Hono request context type the header is read from.
import type { Context } from 'hono';

/**
 * PL: Nazwa nagłówka z tymczasowym numerem ucznia. Ta sama nazwa jest w src/features/surveys/vote/temporaryStudentId.ts.
 * EN: The name of the header with the temporary student id. The same name is in src/features/surveys/vote/temporaryStudentId.ts.
 */
export const TEMPORARY_STUDENT_HEADER = 'X-Temporary-Student-Id';

// PL: Dozwolony kształt numeru: litery, cyfry i myślnik, od 16 do 64 znaków. Odrzuca puste i dziwne wartości, zanim trafią do bazy.
// EN: The allowed shape of the id: letters, digits and a hyphen, 16 to 64 characters. Rejects empty and odd values before they reach the database.
const TEMPORARY_ID_PATTERN = /^[A-Za-z0-9-]{16,64}$/;

/**
 * PL: Czyta numer ucznia z zapytania. Nic nie zmienia poza odpowiedzią.
 * EN: Reads the student id from the request. Changes nothing except the response.
 *
 * @param context - PL: zapytanie Hono. EN: the Hono request.
 * @returns PL: numer ucznia albo null, gdy nagłówka nie ma lub ma zły kształt (wtedy serwer odpowie 401). EN: the student id, or null when the header is missing or malformed (then the server answers 401).
 */
export function getStudentId(context: Context): string | null {
  // PL: Odczytaj nagłówek. Brak nagłówka to brak ucznia.
  // EN: Read the header. No header means no student.
  const value = context.req.header(TEMPORARY_STUDENT_HEADER);
  if (value === undefined) return null;

  // PL: Przepuść tylko numer o dozwolonym kształcie.
  // EN: Let through only an id of the allowed shape.
  return TEMPORARY_ID_PATTERN.test(value) ? value : null;
}
