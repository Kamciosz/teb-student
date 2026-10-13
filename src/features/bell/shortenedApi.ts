/**
 * PL: Rozmowa telefonu z serwerem dni skróconych (/api/bell/shortened): odczyt listy dni dla każdego ucznia i zapis dnia dla Samorządu. Błąd z kodem odpowiedzi niesie ten kod, żeby ekran mógł osobno pokazać odmowę (403).
 * EN: The phone's talk with the server of shortened days (/api/bell/shortened): reading the list of days for every student and saving a day for the Student Council. An error carries the response code, so the screen can show a refusal (403) on its own.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses worker/bell/routes.ts::bellApp
 * @used_by src/features/bell/shortenedQueries.ts::useShortenedDays
 * @used_by src/features/bell/shortenedQueries.ts::useSetShortenedDay
 */

/** PL: Adres routera dni skróconych na serwerze. EN: The address of the shortened days router on the server. */
const API_URL = '/api/bell/shortened';

/** PL: Odpowiedź serwera na listę: dni skrócone od dziś, rosnąco, w formacie RRRR-MM-DD. EN: The server answer for the list: shortened days from today, ascending, as YYYY-MM-DD. */
export type ShortenedDaysResponse = { dates: string[] };

/**
 * PL: Błąd odpowiedzi serwera z kodem HTTP (na przykład 403, gdy rola jest za niska).
 * EN: An error of the server answer with the HTTP code (for example 403 when the role is too low).
 */
export class BellHttpError extends Error {
  /** PL: Kod odpowiedzi HTTP. EN: The HTTP response code. */
  readonly status: number;

  /**
   * PL: Tworzy błąd z kodem odpowiedzi.
   * EN: Creates an error with the response code.
   *
   * @param status - PL: kod HTTP. EN: the HTTP code.
   */
  constructor(status: number) {
    super(`HTTP ${status}`);
    this.name = 'BellHttpError';
    this.status = status;
  }
}

/**
 * PL: Pobiera listę dni skróconych od dziś.
 * EN: Fetches the list of shortened days from today.
 *
 * @returns PL: odpowiedź z listą dni. EN: the answer with the list of days.
 * @throws PL: BellHttpError przy kodzie innym niż 2xx albo błąd sieci. EN: BellHttpError for a code other than 2xx, or a network error.
 */
export async function fetchShortenedDays(): Promise<ShortenedDaysResponse> {
  // PL: Odczyt listy idzie zwykłym GET; uczeń ma do niego dostęp.
  // EN: Reading the list is a plain GET; a student may read it.
  const response = await fetch(API_URL);
  if (!response.ok) throw new BellHttpError(response.status);
  return (await response.json()) as ShortenedDaysResponse;
}

/**
 * PL: Zapisuje albo zdejmuje dzień skrócony. Dzień idzie w adresie w formacie RRRR-MM-DD.
 * EN: Saves or removes a shortened day. The day goes in the address in the YYYY-MM-DD format.
 *
 * @param day - PL: dzień RRRR-MM-DD, czas polski. EN: the day as YYYY-MM-DD, Polish time.
 * @param shortened - PL: true = dzień skrócony, false = zwykły plan. EN: true = shortened day, false = regular plan.
 * @throws PL: BellHttpError przy kodzie innym niż 2xx (403 bez roli Samorządu) albo błąd sieci. EN: BellHttpError for a code other than 2xx (403 without the Council role), or a network error.
 */
export async function setShortenedDay(day: string, shortened: boolean): Promise<void> {
  // PL: Włączenie to POST, wyłączenie to DELETE na tym samym adresie dnia.
  // EN: Turning on is a POST, turning off is a DELETE on the same day address.
  const response = await fetch(`${API_URL}/${encodeURIComponent(day)}`, { method: shortened ? 'POST' : 'DELETE' });
  if (!response.ok) throw new BellHttpError(response.status);
}
