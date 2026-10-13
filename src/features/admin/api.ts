/**
 * PL: Rozmowa telefonu z serwerem panelu (/api/admin): rola ucznia w panelu, kody zaproszeń, role uczniów (Samorząd i redakcja) i plik z pilotażu. Funkcje rzucają błąd przy kodzie innym niż 2xx, a ekran zamienia go na komunikat dla ucznia. Wyjątek: szukanie zwraca null przy 404 (nie ma konta z takim adresem).
 * EN: The phone's talk with the panel server (/api/admin): the student's panel role, invitation codes, the students' roles (the Council and the editorial team) and the pilot data file. The functions throw an error on a code other than 2xx, and the screen turns it into a message for the student. The exception: searching returns null on 404 (there is no account with such an address).
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/admin/queries.ts::usePanelLevel
 * @used_by src/features/admin/queries.ts::useIssueInvite
 * @used_by src/features/admin/queries.ts::useInvites
 * @used_by src/features/admin/queries.ts::useRoleHolders
 * @used_by src/features/admin/queries.ts::useRoleSearch
 * @used_by src/features/admin/queries.ts::useRoleCard
 * @used_by src/features/admin/queries.ts::useSaveRoles
 * @used_by src/features/admin/queries.ts::usePilotDownload
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

/** PL: Kod, który nadal działa, z datą końca ważności. EN: A code that still works, with its expiry date. */
export type InviteCode = IssuedInvite;

/** PL: Uczeń na ekranach 6.3: pierwsze imię, zamaskowany adres i dwa przełączniki. EN: A student on the 6.3 screens: the first name, the masked address and the two switches. */
export type RoleCard = {
  /** PL: Numer konta. EN: The account id. */
  studentId: string;
  /** PL: Pierwsze imię (puste, gdy konto go nie ma). EN: The first name (empty when the account has none). */
  firstName: string;
  /** PL: Adres zamaskowany, np. „p***@teb.edu.pl”. EN: The masked address, for example "p***@teb.edu.pl". */
  maskedEmail: string;
  /** PL: Czy uczeń ma rolę Samorządu. EN: Whether the student has the Council role. */
  council: boolean;
  /** PL: Czy uczeń ma rolę redakcji gazetki. EN: Whether the student has the editorial role. */
  editor: boolean;
};

/** PL: Dwa przełączniki do zapisu: rola Samorządu i rola redakcji. EN: The two switches to save: the Council role and the editorial role. */
export type RoleChoice = { council: boolean; editor: boolean };

/**
 * PL: Sprawdza odpowiedź: przy kodzie innym niż 2xx rzuca błąd z kodem HTTP.
 * EN: Checks the answer: on a code other than 2xx it throws an error with the HTTP code.
 *
 * @param response - PL: odpowiedź serwera. EN: the server answer.
 * @returns PL: ta sama odpowiedź, gdy jest dobra. EN: the same answer when it is good.
 * @throws PL: błąd z kodem HTTP. EN: an error with the HTTP code.
 */
function ensureOk(response: Response): Response {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

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
  const response = ensureOk(await fetch(`${API_URL}/me`));
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
  const response = ensureOk(await fetch(`${API_URL}/invites`, { method: 'POST' }));
  return (await response.json()) as IssuedInvite;
}

/**
 * PL: Pobiera kody zaproszeń, które nadal działają (nieużyte i nieprzeterminowane), od najbliższego końca.
 * EN: Fetches the invitation codes that still work (unused and not expired), from the nearest expiry.
 *
 * @returns PL: lista kodów (pusta, gdy nie ma żadnego). EN: the list of codes (empty when there are none).
 * @throws PL: błąd z kodem HTTP albo błąd sieci. EN: an error with the HTTP code or a network error.
 */
export async function fetchInvites(): Promise<InviteCode[]> {
  // PL: Odczyt listy kodów. Serwer oddaje obiekt z polem codes.
  // EN: Reading the list of codes. The server returns an object with the codes field.
  const response = ensureOk(await fetch(`${API_URL}/invites`));
  return ((await response.json()) as { codes: InviteCode[] }).codes;
}

/**
 * PL: Pobiera osoby z rolą Samorządu albo redakcji (adresy zamaskowane, bez administratorów).
 * EN: Fetches the people with the Council or editorial role (addresses masked, no administrators).
 *
 * @returns PL: lista kart uczniów. EN: the list of student cards.
 * @throws PL: błąd z kodem HTTP albo błąd sieci. EN: an error with the HTTP code or a network error.
 */
export async function fetchRoleHolders(): Promise<RoleCard[]> {
  // PL: Odczyt listy osób z rolą.
  // EN: Reading the list of people with a role.
  const response = ensureOk(await fetch(`${API_URL}/roles`));
  return ((await response.json()) as { holders: RoleCard[] }).holders;
}

/**
 * PL: Szuka ucznia po szkolnym adresie. Adres idzie w zapytaniu zakodowany, żeby znaki takie jak „+” nie zmieniły go po drodze.
 * EN: Searches for a student by the school address. The address goes in the query encoded, so characters such as "+" do not change on the way.
 *
 * @param email - PL: szkolny adres wpisany przez administratora. EN: the school address typed by the administrator.
 * @returns PL: karta ucznia albo null, gdy nie ma konta z takim adresem. EN: the student card or null when there is no account with such an address.
 * @throws PL: błąd z kodem HTTP (inny niż 404) albo błąd sieci. EN: an error with the HTTP code (other than 404) or a network error.
 */
export async function searchRole(email: string): Promise<RoleCard | null> {
  // PL: Zapytanie z adresem w parametrze; brak konta daje 404, który nie jest błędem.
  // EN: The query with the address in the parameter; no account gives 404, which is not an error.
  const response = await fetch(`${API_URL}/roles/search?email=${encodeURIComponent(email)}`);
  if (response.status === 404) return null;
  return (await ensureOk(response).json()) as RoleCard;
}

/**
 * PL: Pobiera kartę jednego ucznia po numerze konta.
 * EN: Fetches the card of one student by the account id.
 *
 * @param studentId - PL: numer konta ucznia. EN: the student's account id.
 * @returns PL: karta ucznia. EN: the student card.
 * @throws PL: błąd z kodem HTTP (404, gdy nie ma ucznia) albo błąd sieci. EN: an error with the HTTP code (404 when there is no student) or a network error.
 */
export async function fetchRoleCard(studentId: string): Promise<RoleCard> {
  // PL: Numer konta idzie w ścieżce zakodowany.
  // EN: The account id goes in the path encoded.
  const response = ensureOk(await fetch(`${API_URL}/roles/${encodeURIComponent(studentId)}`));
  return (await response.json()) as RoleCard;
}

/**
 * PL: Zapisuje oba przełączniki ucznia (PUT jest idempotentny, więc powtórka nic nie psuje).
 * EN: Saves both switches of a student (PUT is idempotent, so a repeat changes nothing).
 *
 * @param studentId - PL: numer konta ucznia. EN: the student's account id.
 * @param choice - PL: stan obu przełączników. EN: the state of both switches.
 * @returns PL: karta ucznia po zapisie. EN: the student card after the save.
 * @throws PL: błąd z kodem HTTP albo błąd sieci. EN: an error with the HTTP code or a network error.
 */
export async function saveRoles(studentId: string, choice: RoleChoice): Promise<RoleCard> {
  // PL: Zapis to zmiana w bazie, więc PUT z ciałem w JSON.
  // EN: The save changes the database, so PUT with the body in JSON.
  const response = ensureOk(
    await fetch(`${API_URL}/roles/${encodeURIComponent(studentId)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(choice),
    }),
  );
  return (await response.json()) as RoleCard;
}

/**
 * PL: Pobiera plik CSV z trzema liczbami z pilotażu.
 * EN: Fetches the CSV file with the three pilot numbers.
 *
 * @returns PL: plik jako blob. EN: the file as a blob.
 * @throws PL: błąd z kodem HTTP albo błąd sieci. EN: an error with the HTTP code or a network error.
 */
export async function downloadPilot(): Promise<Blob> {
  // PL: Odczyt pliku jako blob, żeby ekran mógł go zapisać.
  // EN: Reading the file as a blob, so the screen can save it.
  return ensureOk(await fetch(`${API_URL}/pilot`)).blob();
}
