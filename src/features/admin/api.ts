/**
 * PL: Rozmowa telefonu z serwerem panelu (/api/admin): rola ucznia w panelu i wydanie kodu zaproszenia. Funkcje rzucają błąd przy kodzie innym niż 2xx, a ekran zamienia go na komunikat dla ucznia.
 * EN: The phone's talk with the panel server (/api/admin): the student's panel role and issuing an invitation code. The functions throw an error on a code other than 2xx, and the screen turns it into a message for the student.
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/admin/queries.ts::usePanelLevel
 * @used_by src/features/admin/queries.ts::useIssueInvite
 */

/** PL: Adres serwera panelu. EN: The panel server address. */
const API_URL = '/api/admin';

/** PL: Rola ucznia w panelu: redakcja, Samorząd albo administrator. EN: A student's panel role: the editorial team, the Council or the administrator. */
export type PanelLevel = 'editor' | 'council' | 'admin';

/** PL: Nowy kod zaproszenia z serwera. EN: A new invitation code from the server. */
export type IssuedInvite = {
  /** PL: Kod w postaci „TEB-XXXX-XX”. EN: The code in the form "TEB-XXXX-XX". */
  code: string;
  /** PL: Do kiedy kod jest ważny (data ISO). EN: Until when the code is valid (an ISO date). */
  expiresAt: string;
};

/**
 * PL: Pobiera najwyższą rolę ucznia w panelu.
 * EN: Fetches the student's highest panel role.
 *
 * @returns PL: rola albo null, gdy uczeń nie ma żadnej. EN: the role or null when the student has none.
 * @throws PL: błąd z kodem HTTP, gdy serwer nie odpowie 2xx, albo błąd sieci. EN: an error with the HTTP code when the server does not answer 2xx, or a network error.
 */
export async function fetchPanelLevel(): Promise<PanelLevel | null> {
  // PL: Zapytaj serwer o rolę ucznia z sesji.
  // EN: Ask the server for the role of the student from the session.
  const response = await fetch(`${API_URL}/me`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  // PL: Odpowiedź ma jedno pole: rolę albo null.
  // EN: The answer has one field: the role or null.
  return ((await response.json()) as { level: PanelLevel | null }).level;
}

/**
 * PL: Prosi serwer o nowy kod zaproszenia ważny 14 dni.
 * EN: Asks the server for a new invitation code valid for 14 days.
 *
 * @returns PL: kod i data końca ważności. EN: the code and the expiry date.
 * @throws PL: błąd z kodem HTTP (403, gdy rola jest za niska) albo błąd sieci. EN: an error with the HTTP code (403 when the role is too low) or a network error.
 */
export async function issueInvite(): Promise<IssuedInvite> {
  // PL: Wydanie kodu to zmiana w bazie, więc POST.
  // EN: Issuing a code changes the database, so POST.
  const response = await fetch(`${API_URL}/invites`, { method: 'POST' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as IssuedInvite;
}
