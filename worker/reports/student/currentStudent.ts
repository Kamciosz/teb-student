/**
 * PL: TYMCZASOWY numer ucznia, który wysyła zgłoszenia i je czyta. Logowanie (podtor 1a) jeszcze nie istnieje, więc cały moduł 4a bierze numer ucznia z tego jednego miejsca. To nie jest logowanie: każdy, kto otworzy aplikację, jest tym samym uczniem. Gdy podtor 1a wystawi numer zalogowanego ucznia, podmieniamy tylko ten plik.
 * EN: TEMPORARY id of the student who sends and reads reports. Sign-in (subtrack 1a) does not exist yet, so the whole 4a module takes the student id from this one place. This is not sign-in: everyone who opens the app is the same student. When subtrack 1a exposes the signed-in student's id, only this file is replaced.
 *
 * @author Szymon
 * @since 2026-10-09
 * @invariant PL: Numer ucznia nigdy nie pochodzi z treści zapytania ani z nagłówków, bo telefon mógłby wtedy podać cudzy. EN: The student id never comes from the request body or headers, because the phone could then supply someone else's.
 * @used_by worker/reports/student/routes.ts::getCurrentStudentId
 * @used_by worker/db/seed/reports.ts::TEMPORARY_STUDENT_ID
 */

// TODO(Szymon, #40): PL: Podmień na numer z sesji, gdy podtor 1a go wystawi. EN: Replace with the id from the session once subtrack 1a exposes it.

/**
 * PL: Wymyślony numer ucznia używany do czasu logowania. Nie jest prawdziwym kontem.
 * EN: The invented student id used until sign-in exists. It is not a real account.
 */
export const TEMPORARY_STUDENT_ID = 'tymczasowy-uczen';

/**
 * PL: Zwraca numer ucznia, który wysyła zgłoszenie albo czyta swoje zgłoszenia.
 * EN: Returns the id of the student who sends a report or reads their own reports.
 *
 * @returns PL: numer ucznia (na razie stały). EN: the student id (constant for now).
 */
export function getCurrentStudentId(): string {
  // PL: Do czasu logowania wszyscy są jednym, wymyślonym uczniem.
  // EN: Until sign-in exists, everyone is one invented student.
  return TEMPORARY_STUDENT_ID;
}
