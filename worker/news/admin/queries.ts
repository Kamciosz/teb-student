/**
 * PL: Zapytania do bazy podtoru 3c (wpisy w panelu): lista wszystkich wpisów ze szkicami, publikacja szkicu, przypięcie i odpięcie wpisu oraz usunięcie wpisu. To jedyne miejsce, które w panelu zmienia stan wpisu. Treści wpisu nie czytamy i nie zapisujemy: tworzy ją edytor (podtor 3b).
 * EN: The database queries of subtrack 3c (entries in the panel): the list of all entries with drafts, publishing a draft, pinning and unpinning an entry, and deleting an entry. This is the only place in the panel that changes an entry's state. We neither read nor write the entry content: the editor (subtrack 3b) creates it.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/db/schema/news.ts::newsEntries
 * @uses worker/db/schema/admin.ts::diaryEntries
 * @uses worker/db/schema/admin.ts::DiaryAction
 * @used_by worker/news/admin/routes.ts::createNewsAdminApp
 */

// PL: Funkcje składania warunków i sortowania w Drizzle, a także surowy fragment SQL do podzapytania.
// EN: The Drizzle functions for building conditions and sorting, and a raw SQL fragment for a subquery.
import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
// PL: Drizzle łączy się z D1.
// EN: Drizzle connects to D1.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela wpisów i typy ze schematu podtoru 3a.
// EN: The entries table and the types from the 3a schema.
import { newsEntries, type NewsEntryStatus, type NewsEntryType } from '../../db/schema/news';
// PL: Tabela dziennika i typ akcji. Wpis publikacji idzie w tym samym batchu co zmiana wpisu, więc zapis przez drzwi (funkcja z zapytaniem gotowym do batcha) nie wystarcza.
// EN: The diary table and the action type. The publication entry goes into the same batch as the entry change, so the door (a function that runs its own query) is not enough.
import { diaryEntries, type DiaryAction } from '../../db/schema/admin';

/**
 * PL: Najwięcej wpisów na liście panelu. Panel nie ma stronicowania, więc lista ma sufit.
 * EN: The most entries on the panel list. The panel has no paging, so the list has a ceiling.
 */
export const PANEL_LIST_LIMIT = 100;

/**
 * PL: Najwięcej wpisów przypiętych naraz. Czwarte przypięcie dostaje błąd „pin_limit”.
 * EN: The most entries pinned at once. A fourth pin gets the "pin_limit" error.
 */
export const PIN_LIMIT = 3;

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
  /** PL: Chwila przypięcia jako tekst ISO 8601 albo null, gdy wpis nie jest przypięty. EN: The pinning moment as an ISO 8601 string, or null when the entry is not pinned. */
  pinnedAt: string | null;
  /** PL: Chwila, od której uczeń widzi wpis, jako tekst ISO 8601 albo null, gdy nie ma zaplanowania. EN: The moment from which the student sees the entry, as an ISO 8601 string, or null when it is not scheduled. */
  publishAt: string | null;
};

/**
 * PL: Wynik publikacji szkicu: opublikowany, już opublikowany wcześniej, w korekcie (publikuje go zatwierdzenie z podtoru 3b) albo brak takiego wpisu.
 * EN: The result of publishing a draft: published, already published before, in review (the approval of subtrack 3b publishes it), or no such entry.
 */
export type PublishResult = 'published' | 'already_published' | 'in_review' | 'not_found';

/**
 * PL: Wynik przypięcia: przypięty (także wcześniej przypięty), brak wpisu, szkic albo komplet przypiętych.
 * EN: The result of pinning: pinned (also pinned before), no entry, a draft, or a full set of pinned entries.
 */
export type PinResult = 'pinned' | 'not_found' | 'not_published' | 'pin_limit';

/**
 * PL: Wynik odpięcia: odpięty (także wcześniej nieprzypięty) albo brak wpisu.
 * EN: The result of unpinning: unpinned (also unpinned before), or no entry.
 */
export type UnpinResult = 'unpinned' | 'not_found';

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
    .select({
      id: newsEntries.id,
      type: newsEntries.type,
      status: newsEntries.status,
      title: newsEntries.title,
      source: newsEntries.source,
      publishedAt: newsEntries.publishedAt,
      pinnedAt: newsEntries.pinnedAt,
      publishAt: newsEntries.publishAt,
    })
    .from(newsEntries)
    .orderBy(asc(newsEntries.status), desc(newsEntries.publishedAt))
    .limit(PANEL_LIST_LIMIT);
  // PL: Chwile zamień na tekst ISO, żeby JSON miał jeden format.
  // EN: Turn the moments into ISO strings, so the JSON has one format.
  return rows.map((row) => ({
    ...row,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    pinnedAt: row.pinnedAt ? row.pinnedAt.toISOString() : null,
    publishAt: row.publishAt ? row.publishAt.toISOString() : null,
  }));
}

/**
 * PL: Publikuje szkic w jednym batchu D1 (jedna transakcja): odczyt stanu, wpis w dzienniku i zmiana stanu. Wpis w dzienniku powstaje tylko przy publikacji szkicu, a oba zapisy są warunkowe na tym samym stanie. Gdy któryś krok się nie uda, cofa się cały batch, więc nie ma publikacji bez wpisu ani wpisu bez publikacji. Wpis już opublikowany zostaje nietknięty, więc ponowne dotknięcie „Opublikuj” nie przesuwa go na liście ucznia i nie dopisuje drugiego wpisu.
 * EN: Publishes a draft in one D1 batch (one transaction): read the state, the diary entry and the state change. The diary entry is written only when a draft is published, and both writes are conditional on the same state. When one step fails, the whole batch is rolled back, so there is no publication without an entry and no entry without a publication. An already published entry is left untouched, so tapping "Opublikuj" again does not move it on the student's list and does not add a second entry.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer wpisu z adresu. EN: the entry id from the address.
 * @param actorId - PL: numer redaktora, który publikuje (wykonawca w dzienniku). EN: the id of the editor who publishes (the actor in the diary).
 * @returns PL: co się stało z wpisem. EN: what happened to the entry.
 * @throws PL: błąd bazy, wtedy cały batch jest cofnięty. EN: a database error, then the whole batch is rolled back.
 */
export async function publishDraft(db: D1Database, id: string, actorId: string): Promise<PublishResult> {
  const orm = drizzle(db);
  const now = new Date();
  // PL: Trzy kroki w jednej transakcji. Najpierw odczyt stanu, potem wpis w dzienniku tylko dla szkicu, na końcu zmiana tylko szkicu. Wszystkie warunki widzą ten sam stan.
  // EN: Three steps in one transaction. First read the state, then the diary entry only for a draft, last the change only of a draft. All the conditions see the same state.
  const [found, , changed] = await orm.batch([
    orm.select({ status: newsEntries.status }).from(newsEntries).where(eq(newsEntries.id, id)).limit(1),
    orm.insert(diaryEntries).select(
      orm
        .select({
          id: sql<number | null>`null`.as('id'),
          actorId: sql<string>`${actorId}`.as('actor_id'),
          action: sql<DiaryAction>`'news_published'`.as('action'),
          targetId: newsEntries.id,
          at: sql<number>`${Date.now()}`.as('at'),
        })
        .from(newsEntries)
        .where(and(eq(newsEntries.id, id), eq(newsEntries.status, 'draft'))),
    ),
    orm
      .update(newsEntries)
      .set({ status: 'published', publishedAt: now })
      .where(and(eq(newsEntries.id, id), eq(newsEntries.status, 'draft')))
      .returning({ id: newsEntries.id }),
  ]);
  if (changed.length > 0) return 'published';
  // PL: Nic się nie zmieniło: wpis jest w korekcie, już opublikowany albo nie istnieje. Panel nie publikuje wpisu w korekcie. Stan bierzemy z odczytu z tej samej transakcji.
  // EN: Nothing changed: the entry is in review, already published, or does not exist. The panel does not publish an entry in review. The state comes from the read in the same transaction.
  if (found.length === 0) return 'not_found';
  return found[0].status === 'in_review' ? 'in_review' : 'already_published';
}

/**
 * PL: Przypina opublikowany wpis: ustawia chwilę przypięcia na teraz, o ile na liście nie ma już PIN_LIMIT przypiętych. Warunek liczenia jest w tym samym zapytaniu co zmiana, więc dwa równoległe przypięcia nie przekroczą limitu. Wpis już przypięty zostaje bez zmian (ta sama chwila), więc ponowne przypięcie przy komplecie nie daje błędu.
 * EN: Pins a published entry: sets the pinning moment to now, provided the list has fewer than PIN_LIMIT pinned entries. The count condition is in the same query as the change, so two parallel pins cannot exceed the limit. An entry already pinned is left as it is (the same moment), so pinning again with a full set gives no error.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer wpisu z adresu. EN: the entry id from the address.
 * @returns PL: co się stało z wpisem. EN: what happened to the entry.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function pinEntry(db: D1Database, id: string): Promise<PinResult> {
  const orm = drizzle(db);
  // PL: Zmień wiersz tylko, gdy jest opublikowany, nie jest przypięty i przypiętych jest mniej niż limit. Liczymy w podzapytaniu tej samej instrukcji.
  // EN: Change the row only when it is published, not pinned, and there are fewer pinned entries than the limit. We count in a subquery of the same statement.
  const changed = await orm
    .update(newsEntries)
    .set({ pinnedAt: new Date() })
    .where(
      and(
        eq(newsEntries.id, id),
        eq(newsEntries.status, 'published'),
        isNull(newsEntries.pinnedAt),
        sql`(select count(*) from ${newsEntries} where ${newsEntries.pinnedAt} is not null) < ${PIN_LIMIT}`,
      ),
    )
    .returning({ id: newsEntries.id });
  if (changed.length > 0) return 'pinned';
  // PL: Nic się nie zmieniło. Odczytaj wpis, żeby podać przyczynę: brak, szkic, już przypięty albo limit.
  // EN: Nothing changed. Read the entry to give the reason: missing, a draft, already pinned, or the limit.
  const [row] = await orm.select({ status: newsEntries.status, pinnedAt: newsEntries.pinnedAt }).from(newsEntries).where(eq(newsEntries.id, id)).limit(1);
  if (!row) return 'not_found';
  if (row.status === 'draft') return 'not_published';
  return row.pinnedAt !== null ? 'pinned' : 'pin_limit';
}

/**
 * PL: Odpina wpis: czyści chwilę przypięcia. Wpis nieprzypięty też dostaje odpowiedź „odpięty”, więc powtórne odpięcie nie jest błędem.
 * EN: Unpins an entry: clears the pinning moment. An entry that is not pinned also gets the "unpinned" answer, so unpinning twice is not an error.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer wpisu z adresu. EN: the entry id from the address.
 * @returns PL: co się stało z wpisem. EN: what happened to the entry.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function unpinEntry(db: D1Database, id: string): Promise<UnpinResult> {
  // PL: Wyczyść przypięcie wiersza o tym numerze i sprawdź, czy wiersz istnieje.
  // EN: Clear the pinning of the row with this id and check whether the row exists.
  const changed = await drizzle(db).update(newsEntries).set({ pinnedAt: null }).where(eq(newsEntries.id, id)).returning({ id: newsEntries.id });
  return changed.length > 0 ? 'unpinned' : 'not_found';
}

/**
 * PL: Usuwa wpis, szkic albo opublikowany, i zapisuje to w dzienniku w jednym batchu D1. Wpis w dzienniku powstaje tylko wtedy, gdy wpis istnieje, a zapis idzie przed usunięciem, więc widzi wiersz przed skasowaniem. Gdy któryś krok się nie uda, cofa się cały batch: nie ma usunięcia bez wpisu ani wpisu bez usunięcia. Usunięcie jest nieodwracalne.
 * EN: Deletes an entry, a draft or a published one, and records it in the diary in one D1 batch. The diary entry is written only when the entry exists, and the write goes before the deletion, so it sees the row before it is removed. When one step fails, the whole batch is rolled back: no deletion without an entry and no entry without a deletion. The deletion cannot be undone.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer wpisu z adresu. EN: the entry id from the address.
 * @param actorId - PL: numer redaktora, który usuwa (wykonawca w dzienniku). EN: the id of the editor who deletes (the actor in the diary).
 * @returns PL: prawda, gdy wpis istniał. EN: true when the entry existed.
 * @throws PL: błąd bazy, wtedy cały batch jest cofnięty. EN: a database error, then the whole batch is rolled back.
 */
export async function deleteEntry(db: D1Database, id: string, actorId: string): Promise<boolean> {
  const orm = drizzle(db);
  // PL: Najpierw wpis w dzienniku (tylko gdy wpis jest), potem usunięcie. Oba kroki widzą ten sam stan.
  // EN: First the diary entry (only when the entry exists), then the deletion. Both steps see the same state.
  const [, removed] = await orm.batch([
    orm.insert(diaryEntries).select(
      orm
        .select({
          id: sql<number | null>`null`.as('id'),
          actorId: sql<string>`${actorId}`.as('actor_id'),
          action: sql<DiaryAction>`'news_deleted'`.as('action'),
          targetId: newsEntries.id,
          at: sql<number>`${Date.now()}`.as('at'),
        })
        .from(newsEntries)
        .where(eq(newsEntries.id, id)),
    ),
    orm.delete(newsEntries).where(eq(newsEntries.id, id)).returning({ id: newsEntries.id }),
  ]);
  return removed.length > 0;
}
