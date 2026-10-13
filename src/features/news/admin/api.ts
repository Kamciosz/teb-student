/**
 * PL: Rozmowa ekranu „Wpisy” z serwerem: lista wpisów ze szkicami, publikacja szkicu i usunięcie wpisu. Adres to /api/news/admin (worker/mounts.ts). Kod odpowiedzi 409 przy publikacji (wpis już opublikowany) i 404 przy usuwaniu (wpisu już nie ma) kończą się tym stanem, którego chciał Samorząd, więc nie są błędem.
 * EN: The talk of the "Wpisy" screen with the server: the list of entries with drafts, publishing a draft and deleting an entry. The address is /api/news/admin (worker/mounts.ts). Response code 409 when publishing (the entry is already published) and 404 when deleting (the entry is already gone) end in the state the Student Council wanted, so they are not errors.
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
 * PL: Publikuje szkic. 409 (już opublikowany) nie jest błędem.
 * EN: Publishes a draft. 409 (already published) is not an error.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi. EN: a network error, or an error with the response code.
 */
export async function publishEntry(id: string): Promise<void> {
  // PL: Sukces i „już opublikowany” dają ten sam stan wpisu.
  // EN: Success and "already published" give the same entry state.
  const response = await fetch(`${entryUrl(id)}/publish`, { method: 'POST' });
  if (!response.ok && response.status !== 409) throw new Error(`HTTP ${response.status}`);
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
