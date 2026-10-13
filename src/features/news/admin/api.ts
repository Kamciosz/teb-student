/**
 * PL: Rozmowa ekranu „Wpisy” z serwerem: lista wpisów ze szkicami, publikacja szkicu i usunięcie wpisu. Adres to /api/news/admin (worker/mounts.ts). Kod odpowiedzi 409 przy publikacji (wpis już opublikowany albo w korekcie) i 404 przy usuwaniu (wpisu już nie ma) kończą się stanem, który widać na liście po odświeżeniu, więc nie są błędem.
 * EN: The talk of the "Wpisy" screen with the server: the list of entries with drafts, publishing a draft and deleting an entry. The address is /api/news/admin (worker/mounts.ts). Response code 409 when publishing (the entry is already published or in review) and 404 when deleting (the entry is already gone) end in a state the list shows after the refresh, so they are not errors.
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
};

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
 * PL: Publikuje szkic. 409 (już opublikowany albo w korekcie) nie jest błędem: lista odświeżona po zapisie pokaże stan z serwera. Panel nie publikuje wpisu w korekcie.
 * EN: Publishes a draft. 409 (already published or in review) is not an error: the list refreshed after the save shows the server state. The panel does not publish an entry in review.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi. EN: a network error, or an error with the response code.
 */
export async function publishEntry(id: string): Promise<void> {
  // PL: Sukces i „już opublikowany” albo „w korekcie” nie są błędem; stan wpisu pokaże lista po odświeżeniu.
  // EN: Success, "already published" and "in review" are not an error; the list after the refresh shows the entry state.
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
