/**
 * PL: Zapytania telefonu do serwera aktualności: lista wpisów i jeden wpis. Błąd HTTP zamienia na wyjątek z kodem, żeby ekran odróżnił „brak wpisu” (404) od awarii.
 * EN: The phone's requests to the news server: the entry list and one entry. An HTTP error becomes an exception with a code, so the screen can tell "no entry" (404) from a failure.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/types.ts::NewsEntrySummary
 * @used_by src/features/news/feed/hooks.ts::fetchEntries
 */

// PL: Typy odpowiedzi.
// EN: The answer types.
import type { NewsEntryDetail, NewsEntrySummary } from './types';

// PL: Adres serwera aktualności (worker/mounts.ts).
// EN: The address of the news server (worker/mounts.ts).
const API_BASE = '/api/news/feed';

/**
 * PL: Błąd odpowiedzi serwera z kodem HTTP.
 * EN: A server answer error with an HTTP code.
 */
export class NewsApiError extends Error {
  /** PL: Kod HTTP odpowiedzi. EN: The HTTP code of the answer. */
  readonly status: number;

  /**
   * PL: Tworzy błąd.
   * EN: Creates the error.
   *
   * @param status - PL: kod HTTP. EN: the HTTP code.
   */
  constructor(status: number) {
    super(`News API error ${status}`);
    this.name = 'NewsApiError';
    this.status = status;
  }
}

/**
 * PL: Pobiera JSON z adresu i rzuca NewsApiError, gdy kod nie jest 2xx.
 * EN: Fetches JSON from an address and throws NewsApiError when the code is not 2xx.
 *
 * @param path - PL: ścieżka pod adresem serwera aktualności (pusta dla listy, bo adres z ukośnikiem na końcu daje 404). EN: the path under the news server address (empty for the list, because an address with a trailing slash gives 404).
 * @returns PL: odpowiedź jako obiekt JSON. EN: the answer as a JSON object.
 */
async function getJson(path: string): Promise<unknown> {
  const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new NewsApiError(response.status);
  return response.json();
}

/**
 * PL: Pobiera listę opublikowanych wpisów.
 * EN: Fetches the list of published entries.
 *
 * @returns PL: wpisy od najnowszego. EN: the entries, newest first.
 */
export async function fetchEntries(): Promise<NewsEntrySummary[]> {
  const data = (await getJson('')) as { entries: NewsEntrySummary[] };
  return data.entries;
}

/**
 * PL: Pobiera jeden opublikowany wpis.
 * EN: Fetches one published entry.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @returns PL: wpis z treścią. EN: the entry with the content.
 */
export async function fetchEntry(id: string): Promise<NewsEntryDetail> {
  const data = (await getJson(`/${encodeURIComponent(id)}`)) as { entry: NewsEntryDetail };
  return data.entry;
}
