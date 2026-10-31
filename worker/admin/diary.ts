/**
 * PL: Dziennik zmian w panelu (podtor 8, część 1: kto i kiedy wydał kod, nadał albo odebrał rolę, pobrał plik z pilotażu). Zapisuje wpis, czyta stronę wpisów od najnowszych (po 50) i daje warunek do kasowania wpisów ucznia przy usunięciu konta. Wpis nie ma treści ani adresu e-mail.
 * EN: The change diary of the panel (subtrack 8, part 1: who issued a code, granted or revoked a role, downloaded the pilot file, and when). It records an entry, reads a page of entries from the newest (50 per page), and gives the condition for deleting a student's entries when the account is deleted. An entry has no content and no e-mail address.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/admin.ts::diaryEntries
 * @uses worker/db/schema/admin.ts::DiaryAction
 * @used_by worker/admin/routes.ts::invitesApp
 * @used_by worker/admin/roleRoutes.ts::rolesApp
 * @used_by worker/admin/pilotRoutes.ts::pilotApp
 * @used_by worker/admin/diaryRoutes.ts::diaryApp
 * @used_by worker/admin/deleteStudentData.ts::deleteAdminStudentData
 * @used_by worker/admin/diary.test.ts::listDiaryEntries
 */

// PL: Warunki i sortowanie zapytań (OR, malejąco).
// EN: Query conditions and ordering (OR, descending).
import { desc, eq, or, sql, type AnyColumn } from 'drizzle-orm';
// PL: Klient bazy D1 dla Drizzle.
// EN: The D1 client for Drizzle.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela dziennika i typ akcji.
// EN: The diary table and the action type.
import { diaryEntries, type DiaryAction } from '../db/schema/admin';

/**
 * PL: Ile wpisów na jednej stronie dziennika.
 * EN: How many entries are on one page of the diary.
 */
export const PAGE_SIZE = 50;

/**
 * PL: Wpis, który trafia do dziennika: kto (numer konta), co (akcja) i czego dotyczy (numer ucznia albo pusty dla kodu i pliku).
 * EN: The entry that goes into the diary: who (the account id), what (the action) and what it concerns (the student id, or empty for a code and a file).
 */
export type DiaryEntryInput = { actorId: string; action: DiaryAction; targetId: string | null };

/**
 * PL: Wiersz dziennika z bazy: numer wpisu, numer konta, akcja i chwila w milisekundach.
 * EN: A diary row from the database: the entry id, the account id, the action and the moment in milliseconds.
 */
export type DiaryRow = { id: number; actorId: string; action: DiaryAction; at: number };

/**
 * PL: Kolumny wiersza dziennika do `insert … select`, gotowe do batcha. Wpis powstaje tylko wtedy, gdy zapytanie, z którego te kolumny są brane, coś zwróci, czyli gdy zmiana naprawdę zaszła. Kolejność kluczy zgadza się z kolumnami tabeli (id, actor_id, action, target_id, at).
 * EN: The columns of a diary row for `insert … select`, ready for a batch. The entry is made only when the query these columns come from returns something, that is when the change really happened. The key order matches the table columns (id, actor_id, action, target_id, at).
 *
 * @param entry - PL: kto, co i czego dotyczy; numer ucznia, zgłoszenia lub wpisu albo kolumna z zapytania. EN: who, what and what it concerns; the id of the student, report or entry, or a column of the query.
 * @returns PL: pola wyboru dla `orm.select(...)`. EN: the select fields for `orm.select(...)`.
 */
export function diaryEntryColumns(entry: { actorId: string; action: DiaryAction; targetId: AnyColumn | string | null }) {
  return {
    // PL: Numer wpisu nadaje baza (null w kolumnie autoincrement).
    // EN: The database assigns the entry id (null in the autoincrement column).
    id: sql<number | null>`null`.as('id'),
    actorId: sql<string>`${entry.actorId}`.as('actor_id'),
    action: sql<DiaryAction>`${entry.action}`.as('action'),
    targetId: sql<string | null>`${entry.targetId}`.as('target_id'),
    at: sql<number>`${Date.now()}`.as('at'),
  };
}

/**
 * PL: Zapisuje jeden wpis w dzienniku z bieżącą chwilą.
 * EN: Records one entry in the diary with the current moment.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param entry - PL: kto, co i czego dotyczy. EN: who, what and what it concerns.
 */
export async function recordDiaryEntry(db: D1Database, entry: DiaryEntryInput): Promise<void> {
  // PL: Wstaw wiersz z chwilą zapisu.
  // EN: Insert the row with the moment of the save.
  await drizzle(db).insert(diaryEntries).values({ ...entry, at: Date.now() });
}

/**
 * PL: Czyta jedną stronę dziennika, od najnowszych (po czasie, a przy równym czasie po numerze wpisu). Pobiera o jeden wpis więcej, żeby wiedzieć, czy jest następna strona.
 * EN: Reads one page of the diary, from the newest (by time, and by entry id when the time is equal). It takes one entry more, to know whether there is a next page.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param page - PL: numer strony od 1. EN: the page number from 1.
 * @returns PL: wpisy strony i czy jest następna. EN: the entries of the page and whether there is a next one.
 */
export async function listDiaryEntries(db: D1Database, page: number): Promise<{ entries: DiaryRow[]; hasNext: boolean }> {
  // PL: Pobierz PAGE_SIZE + 1 wierszy od właściwego miejsca.
  // EN: Take PAGE_SIZE + 1 rows from the right place.
  const rows = await drizzle(db)
    .select({ id: diaryEntries.id, actorId: diaryEntries.actorId, action: diaryEntries.action, at: diaryEntries.at })
    .from(diaryEntries)
    .orderBy(desc(diaryEntries.at), desc(diaryEntries.id))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);
  // PL: Ostatni wiersz był tylko do sprawdzenia, więc go odrzucamy.
  // EN: The last row was only for the check, so we drop it.
  return { entries: rows.slice(0, PAGE_SIZE), hasNext: rows.length > PAGE_SIZE };
}

/**
 * PL: Warunek na wpisy, w których uczeń jest sprawcą albo którego dotyczą. Używa go kasowanie konta.
 * EN: The condition for the entries where the student is the actor or the one they concern. The account deletion uses it.
 *
 * @param userId - PL: numer ucznia. EN: the student id.
 * @returns PL: warunek do WHERE. EN: the condition for WHERE.
 */
export function diaryEntriesOfStudent(userId: string) {
  return or(eq(diaryEntries.actorId, userId), eq(diaryEntries.targetId, userId));
}
