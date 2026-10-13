/**
 * PL: Test funkcji deleteNewsStudentData na prawdziwym D1 z testów. Sprawdza, że przy kasowaniu danych ucznia jego wpisy tracą autora, cudze zostają, a same wpisy zostają. Sprawdza też, że gdy konto zostanie usunięte, wpis zostaje bez autora (kolumna author_user_id ma onDelete: 'set null').
 * EN: Test of the deleteNewsStudentData function on the real D1 from the tests. Checks that when a student's data is deleted, the student's entries lose the author, other people's entries keep theirs, and the entries stay. Also checks that when the account is deleted, the entry stays without an author (the author_user_id column has onDelete: 'set null').
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/news/feed/deleteStudentData.ts::deleteNewsStudentData
 * @uses worker/db/schema/news.ts::newsEntries
 * @uses worker/db/schema/auth.ts::user
 * @used_by vitest.config.ts::include
 */

// PL: Baza D1 z testów.
// EN: The D1 database from the tests.
import { env } from 'cloudflare:workers';
// PL: Drizzle zamienia D1 w bazę, tak jak robi to serwer.
// EN: Drizzle turns D1 into a database, the way the server does.
import { drizzle } from 'drizzle-orm/d1';
// PL: Warunek równości dla zapytań.
// EN: The equality condition for queries.
import { eq } from 'drizzle-orm';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Tabele kont i wpisów.
// EN: The accounts and entries tables.
import { newsEntries, user } from '../../db/schema';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { deleteNewsStudentData } from './deleteStudentData';

// PL: Baza testowa.
// EN: The test database.
const db = drizzle(env.DB);

// PL: Dwa wymyślone konta autorów: pierwszy to uczeń, którego dane kasujemy, drugi to ktoś inny.
// EN: Two invented author accounts: the first is the student whose data we delete, the second is someone else.
const STUDENT = 'test-autor-1';
const OTHER = 'test-autor-2';

// PL: Przed każdym testem są dwa konta i trzy wpisy: uczniowski, cudzy i bez autora.
// EN: Before every test there are two accounts and three entries: the student's, someone else's and one without an author.
beforeEach(async () => {
  await db.insert(user).values([
    { id: STUDENT, name: 'Adam Wymyślony', email: 'adam.wymyslony@example.com', emailVerified: true },
    { id: OTHER, name: 'Beata Zmyślona', email: 'beata.zmyslona@example.com', emailVerified: true },
  ]).onConflictDoNothing();
  await db.delete(newsEntries);
  await db.insert(newsEntries).values([
    { id: 'moj', type: 'news', status: 'published', title: 'Mój', body: { type: 'doc', content: [] }, source: 'Samorząd', publishedAt: new Date(Date.UTC(2026, 9, 9, 10)), authorUserId: STUDENT },
    { id: 'cudzy', type: 'news', status: 'published', title: 'Cudzy', body: { type: 'doc', content: [] }, source: 'Samorząd', publishedAt: new Date(Date.UTC(2026, 9, 9, 11)), authorUserId: OTHER },
    { id: 'bez', type: 'news', status: 'published', title: 'Bez autora', body: { type: 'doc', content: [] }, source: 'Samorząd', publishedAt: new Date(Date.UTC(2026, 9, 9, 12)) },
  ]);
});

// PL: Grupa testów kasowania danych ucznia z modułu news.
// EN: A group of tests for deleting the student's data from the news module.
describe('deleteNewsStudentData', () => {
  // PL: Wpisy ucznia tracą autora, cudzy wpis zostaje z autorem, a wszystkie wpisy istnieją.
  // EN: The student's entries lose the author, someone else's entry keeps its author, and all entries exist.
  it('zdejmuje autorstwo z wpisów ucznia, a cudze zostają / removes the authorship from the student\'s entries and keeps other people\'s', async () => {
    const result = await deleteNewsStudentData({ userId: STUDENT, db: env.DB });

    // PL: Funkcja niczego nie zwraca.
    // EN: The function returns nothing.
    expect(result).toBeUndefined();
    expect(await db.select({ id: newsEntries.id, authorUserId: newsEntries.authorUserId }).from(newsEntries).orderBy(newsEntries.id)).toEqual([
      { id: 'bez', authorUserId: null },
      { id: 'cudzy', authorUserId: OTHER },
      { id: 'moj', authorUserId: null },
    ]);
  });

  // PL: Gdy konto zostaje usunięte, wpis zostaje, a jego autor jest pusty (ustawia to baza).
  // EN: When the account is deleted, the entry stays and its author is empty (the database sets it).
  it('po usunięciu konta wpis zostaje bez autora / after the account is deleted the entry stays without an author', async () => {
    await db.delete(user).where(eq(user.id, OTHER));

    const [entry] = await db.select().from(newsEntries).where(eq(newsEntries.id, 'cudzy'));

    expect(entry?.authorUserId).toBeNull();
    expect(entry?.title).toBe('Cudzy');
  });
});
