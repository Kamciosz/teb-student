/**
 * PL: Zapytania do bazy podtoru 3c (wpisy w panelu): lista wszystkich wpisów ze szkicami, publikacja szkicu i usunięcie wpisu. To jedyne miejsce, które w panelu zmienia stan wpisu. Treści wpisu nie czytamy i nie zapisujemy: tworzy ją edytor (podtor 3b).
 * EN: The database queries of subtrack 3c (entries in the panel): the list of all entries with drafts, publishing a draft and deleting an entry. This is the only place in the panel that changes an entry's state. We neither read nor write the entry content: the editor (subtrack 3b) creates it.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/db/schema/news.ts::newsEntries
 * @used_by worker/news/admin/routes.ts::createNewsAdminApp
 */

// PL: Funkcje składania warunków i sortowania w Drizzle.
// EN: The Drizzle functions for building conditions and sorting.
import { and, asc, desc, eq } from 'drizzle-orm';
// PL: Drizzle łączy się z D1.
// EN: Drizzle connects to D1.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela wpisów i typy ze schematu podtoru 3a.
// EN: The entries table and the types from the 3a schema.
import { newsEntries, type NewsEntryStatus, type NewsEntryType } from '../../db/schema/news';

/**
 * PL: Najwięcej wpisów na liście panelu. Panel nie ma stronicowania, więc lista ma sufit.
 * EN: The most entries on the panel list. The panel has no paging, so the list has a ceiling.
 */
export const PANEL_LIST_LIMIT = 100;

/**
 * PL: Wpis na liście panelu: bez treści, bo lista jej nie pokazuje.
 * EN: An entry on the panel list: without the content, because the list does not show it.
 */
export type PanelEntry = {
  /** PL: Numer wpisu. EN: The entry id. */
  id: string;
  /** PL: Typ wpisu. EN: The entry type. */
  type: NewsEntryType;
  /** PL: Szkic czy opublikowany. EN: A draft or published. */
  status: NewsEntryStatus;
  /** PL: Tytuł. EN: The title. */
  title: string;
  /** PL: Kto wydaje wpis. EN: Who issues the entry. */
  source: string;
  /** PL: Chwila publikacji jako tekst ISO 8601 albo null dla szkicu. EN: The publication moment as an ISO 8601 string, or null for a draft. */
  publishedAt: string | null;
};

/**
 * PL: Wynik publikacji szkicu: opublikowany, już opublikowany wcześniej, w korekcie (publikuje go zatwierdzenie z podtoru 3b) albo brak takiego wpisu.
 * EN: The result of publishing a draft: published, already published before, in review (the approval of subtrack 3b publishes it), or no such entry.
 */
export type PublishResult = 'published' | 'already_published' | 'in_review' | 'not_found';

/**
 * PL: Pobiera wpisy z panelu: najpierw szkice, potem opublikowane od najnowszego. W tabeli nie ma chwili utworzenia, więc kolejność szkiców między sobą nie jest ustalona.
 * EN: Fetches the entries for the panel: drafts first, then published ones, newest first. The table has no creation moment, so the order of drafts among themselves is not fixed.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @returns PL: do PANEL_LIST_LIMIT wpisów bez treści. EN: up to PANEL_LIST_LIMIT entries without the content.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function listPanelEntries(db: D1Database): Promise<PanelEntry[]> {
  // PL: Wybierz kolumny bez treści. Stan „draft” sortuje się przed „published”, więc szkice idą pierwsze.
  // EN: Select the columns without the content. The "draft" status sorts before "published", so drafts come first.
  const rows = await drizzle(db)
    .select({ id: newsEntries.id, type: newsEntries.type, status: newsEntries.status, title: newsEntries.title, source: newsEntries.source, publishedAt: newsEntries.publishedAt })
    .from(newsEntries)
    .orderBy(asc(newsEntries.status), desc(newsEntries.publishedAt))
    .limit(PANEL_LIST_LIMIT);
  // PL: Chwilę zamień na tekst ISO, żeby JSON miał jeden format.
  // EN: Turn the moment into an ISO string, so the JSON has one format.
  return rows.map((row) => ({ ...row, publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null }));
}

/**
 * PL: Publikuje szkic jednym zapytaniem warunkowym. Wpis już opublikowany zostaje nietknięty, więc ponowne dotknięcie „Opublikuj” nie przesuwa go na liście ucznia.
 * EN: Publishes a draft with one conditional query. An already published entry is left untouched, so tapping "Opublikuj" again does not move it on the student's list.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer wpisu z adresu. EN: the entry id from the address.
 * @returns PL: co się stało z wpisem. EN: what happened to the entry.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function publishDraft(db: D1Database, id: string): Promise<PublishResult> {
  const orm = drizzle(db);
  // PL: Zmień tylko wiersz, który nadal jest szkicem. Numer idzie jako parametr zapytania.
  // EN: Change only a row that is still a draft. The id goes as a query parameter.
  const changed = await orm
    .update(newsEntries)
    .set({ status: 'published', publishedAt: new Date() })
    .where(and(eq(newsEntries.id, id), eq(newsEntries.status, 'draft')))
    .returning({ id: newsEntries.id });
  if (changed.length > 0) return 'published';
  // PL: Nic się nie zmieniło: wpis jest w korekcie, już opublikowany albo nie istnieje. Panel nie publikuje wpisu w korekcie.
  // EN: Nothing changed: the entry is in review, already published, or does not exist. The panel does not publish an entry in review.
  const found = await orm.select({ status: newsEntries.status }).from(newsEntries).where(eq(newsEntries.id, id)).limit(1);
  if (found.length === 0) return 'not_found';
  return found[0].status === 'in_review' ? 'in_review' : 'already_published';
}

/**
 * PL: Usuwa wpis, szkic albo opublikowany. Usunięcie jest nieodwracalne.
 * EN: Deletes an entry, a draft or a published one. The deletion cannot be undone.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer wpisu z adresu. EN: the entry id from the address.
 * @returns PL: prawda, gdy wpis istniał. EN: true when the entry existed.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function deleteEntry(db: D1Database, id: string): Promise<boolean> {
  // PL: Skasuj wiersz o tym numerze i sprawdź, czy coś zniknęło.
  // EN: Delete the row with this id and check whether anything went away.
  const removed = await drizzle(db).delete(newsEntries).where(eq(newsEntries.id, id)).returning({ id: newsEntries.id });
  return removed.length > 0;
}
