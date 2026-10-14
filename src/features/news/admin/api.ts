/**
 * PL: Rozmowa ekranu „Wpisy” z serwerem: lista wpisów ze szkicami, publikacja szkicu i usunięcie wpisu. Adres to /api/news/admin (worker/mounts.ts). Kod odpowiedzi 409 przy publikacji wpisu już opublikowanego i 404 przy usuwaniu (wpisu już nie ma) kończą się stanem, który widać na liście po odświeżeniu, więc nie są błędem. Wpis w korekcie (409 z `in_review`) daje osobny błąd `EntryInReviewError`, który panel pokazuje własnym komunikatem.
 * EN: The talk of the "Wpisy" screen with the server: the list of entries with drafts, publishing a draft and deleting an entry. The address is /api/news/admin (worker/mounts.ts). Response code 409 when publishing an entry already published and 404 when deleting (the entry is already gone) end in a state the list shows after the refresh, so they are not errors. An entry in review (409 with `in_review`) gives a separate `EntryInReviewError`, which the panel shows with its own message.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/admin/routes.ts::createNewsAdminApp
 * @used_by src/features/news/admin/queries.ts::usePanelEntries
 * @used_by src/features/news/admin/queries.ts::usePublishEntry
 * @used_by src/features/news/admin/queries.ts::useDeleteEntry
 */

/** PL: Adres routera serwera. EN: The server router address. */
const API_URL = '/api/news/admin';

/** PL: Wpis na liście panelu, bez treści (worker/news/admin/queries.ts::PanelEntry). Stan „in_review” to wpis w korekcie. EN: An entry on the panel list, without the content (worker/news/admin/queries.ts::PanelEntry). The "in_review" state is an entry in review. */
export type PanelEntry = {
  id: string;
  type: string;
  status: 'draft' | 'in_review' | 'published';
  title: string;
  source: string;
  publishedAt: string | null;
  pinnedAt: string | null;
  publishAt: string | null;
};

/**
 * PL: Błąd „pin_limit”: przypięte jest już najwięcej wpisów. Ekran pokazuje wtedy osobny, czytelny komunikat.
 * EN: The "pin_limit" error: the most entries are already pinned. The screen then shows a separate, readable message.
 */
export class PinLimitError extends Error {}

/**
 * PL: Buduje adres jednego wpisu. Numer idzie zakodowany, żeby nie zmienił ścieżki.
 * EN: Builds the address of one entry. The id goes encoded, so it cannot change the path.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @returns PL: adres wpisu. EN: the entry address.
 */
function entryUrl(id: string): string {
  return `${API_URL}/${encodeURIComponent(id)}`;
}

/**
 * PL: Pobiera wszystkie wpisy ze szkicami.
 * EN: Fetches all entries with drafts.
 *
 * @returns PL: lista wpisów, szkice pierwsze. EN: the list of entries, drafts first.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi (403 bez roli). EN: a network error, or an error with the response code (403 without a role).
 */
export async function fetchPanelEntries(): Promise<PanelEntry[]> {
  // PL: Odmowa serwera (na przykład 403) trafia do zapytania jako błąd.
  // EN: A server refusal (for example 403) reaches the query as an error.
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return ((await response.json()) as { entries: PanelEntry[] }).entries;
}

/**
 * PL: Błąd publikacji wpisu, który jest w korekcie. Serwer zwraca 409 z `error: 'in_review'`, a panel pokazuje wtedy osobny komunikat.
 * EN: A publishing error for an entry in review. The server returns 409 with `error: 'in_review'`, and the panel then shows a separate message.
 */
export class EntryInReviewError extends Error {
  constructor() {
    super('in_review');
    this.name = 'EntryInReviewError';
  }
}

/**
 * PL: Czyta kod błędu z ciała odpowiedzi 409. Brak ciała albo zły JSON oznacza brak kodu.
 * EN: Reads the error code from a 409 response body. No body or bad JSON means no code.
 *
 * @param response - PL: odpowiedź serwera. EN: the server response.
 * @returns PL: kod błędu albo null. EN: the error code, or null.
 */
async function readErrorCode(response: Response): Promise<string | null> {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === 'string' ? body.error : null;
}

/**
 * PL: Publikuje szkic. 409 dla wpisu już opublikowanego nie jest błędem: lista odświeżona po zapisie pokaże stan z serwera. 409 z `in_review` to wpis w korekcie i rzuca `EntryInReviewError`. Panel nie publikuje wpisu w korekcie.
 * EN: Publishes a draft. 409 for an entry already published is not an error: the list refreshed after the save shows the server state. 409 with `in_review` is an entry in review and throws `EntryInReviewError`. The panel does not publish an entry in review.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @throws PL: `EntryInReviewError` dla wpisu w korekcie, błąd sieci albo błąd z kodem odpowiedzi. EN: `EntryInReviewError` for an entry in review, a network error, or an error with the response code.
 */
export async function publishEntry(id: string): Promise<void> {
  // PL: Sukces i „już opublikowany” nie są błędem; wpis w korekcie to osobny błąd z własnym komunikatem.
  // EN: Success and "already published" are not an error; an entry in review is a separate error with its own message.
  const response = await fetch(`${entryUrl(id)}/publish`, { method: 'POST' });
  if (response.ok) return;
  if (response.status !== 409) throw new Error(`HTTP ${response.status}`);
  if ((await readErrorCode(response)) === 'in_review') throw new EntryInReviewError();
}

/**
 * PL: Usuwa wpis. 404 (już go nie ma) nie jest błędem.
 * EN: Deletes an entry. 404 (it is already gone) is not an error.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi. EN: a network error, or an error with the response code.
 */
export async function deleteEntry(id: string): Promise<void> {
  // PL: Sukces i „już nie ma” dają ten sam stan wpisu.
  // EN: Success and "already gone" give the same entry state.
  const response = await fetch(entryUrl(id), { method: 'DELETE' });
  if (!response.ok && response.status !== 404) throw new Error(`HTTP ${response.status}`);
}

/**
 * PL: Przypina wpis. Odpowiedź 409 „pin_limit” rzuca PinLimitError, żeby ekran pokazał osobny komunikat.
 * EN: Pins an entry. The 409 "pin_limit" response throws PinLimitError, so the screen shows a separate message.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @throws PL: PinLimitError, gdy przypięte jest już najwięcej wpisów, inaczej błąd sieci albo kod odpowiedzi. EN: PinLimitError when the most entries are already pinned, otherwise a network error or the response code.
 */
export async function pinEntry(id: string): Promise<void> {
  // PL: Przypięcie już przypiętego wpisu daje 200, więc sam sukces wystarcza.
  // EN: Pinning an already pinned entry gives 200, so a plain success is enough.
  const response = await fetch(`${entryUrl(id)}/pin`, { method: 'POST' });
  if (response.ok) return;
  if (response.status === 409 && ((await response.json()) as { error?: string }).error === 'pin_limit') throw new PinLimitError();
  throw new Error(`HTTP ${response.status}`);
}

/**
 * PL: Odpina wpis. Wpis, który nie był przypięty, też dostaje 200, więc powtórne odpięcie nie jest błędem.
 * EN: Unpins an entry. An entry that was not pinned also gets 200, so unpinning twice is not an error.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi. EN: a network error, or an error with the response code.
 */
export async function unpinEntry(id: string): Promise<void> {
  const response = await fetch(`${entryUrl(id)}/unpin`, { method: 'POST' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
