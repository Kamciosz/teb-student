/**
 * PL: Router Hono podtoru 3a (aktualności: lista i wpis): GET / zwraca listę opublikowanych wpisów, GET /:id jeden opublikowany wpis. Nie ma adresów zapisu, więc uczeń nie może dodać ani zmienić wpisu. Szkic wygląda jak nieistniejący wpis (404). Router jest podpięty pod /api/news/feed w worker/mounts.ts.
 * EN: The Hono router of subtrack 3a (news: list and entry): GET / returns the list of published entries, GET /:id one published entry. It has no write routes, so a student cannot add or change an entry. A draft looks like a non-existent entry (404). The router is mounted under /api/news/feed in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/news/feed/queries.ts::listPublishedEntries
 * @uses worker/news/feed/queries.ts::findPublishedEntry
 * @uses worker/news/feed/excerpt.ts::excerptFromBody
 * @used_by worker/news/feed/index.ts::newsFeedApp
 * @used_by worker/news/feed/routes.test.ts::newsFeedApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono, type Context } from 'hono';
// PL: Drizzle łączy się z D1.
// EN: Drizzle connects to D1.
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
// PL: Typ środowiska Workera z bazą DB.
// EN: The Worker environment type with the DB database.
import type { Env } from '../../shared';
// PL: Typ wiersza wpisu.
// EN: The entry row type.
import type { NewsEntryRow } from '../../db/schema';
// PL: Krótki opis wpisu z jego treści.
// EN: The short entry description made from its content.
import { excerptFromBody } from './excerpt';
// PL: Zapytania do bazy.
// EN: The database queries.
import { findPublishedEntry, listPublishedEntries } from './queries';

/**
 * PL: Wpis na liście: bez treści, z krótkim opisem.
 * EN: An entry on the list: without the content, with a short description.
 */
export type NewsEntrySummary = {
  /** PL: Numer wpisu. EN: The entry id. */
  id: string;
  /** PL: Typ wpisu: important, news, event albo sport. EN: The entry type: important, news, event or sport. */
  type: NewsEntryRow['type'];
  /** PL: Kto wydaje wpis, na przykład „Samorząd”. EN: Who issues the entry, for example "Samorząd". */
  source: string;
  /** PL: Chwila publikacji jako tekst ISO 8601. EN: The publication moment as an ISO 8601 string. */
  publishedAt: string;
  /** PL: Tytuł wpisu. EN: The entry title. */
  title: string;
  /** PL: Krótki opis z początku treści. EN: A short description from the start of the content. */
  excerpt: string;
};

/**
 * PL: Pojedynczy wpis: to samo co na liście i do tego treść (dokument Tiptap) oraz link pod wpisem.
 * EN: A single entry: the same as on the list plus the content (a Tiptap document) and the link under the entry.
 */
export type NewsEntryDetail = NewsEntrySummary & {
  /** PL: Treść jako dokument JSON Tiptap. Telefon rysuje go własnymi komponentami. EN: The content as a Tiptap JSON document. The phone draws it with its own components. */
  body: unknown;
  /** PL: Adres linku pod wpisem albo null. EN: The address of the link under the entry, or null. */
  linkUrl: string | null;
  /** PL: Napis na przycisku z linkiem albo null. EN: The label on the link button, or null. */
  linkLabel: string | null;
};

/**
 * PL: Zamienia wiersz bazy na wpis z listy.
 * EN: Turns a database row into a list entry.
 *
 * @param row - PL: wiersz widoczny dla ucznia, więc z chwilą publikacji. EN: a row visible to a student, so with a publication moment.
 * @returns PL: wpis listy. EN: the list entry.
 */
function toSummary(row: NewsEntryRow): NewsEntrySummary {
  return {
    id: row.id,
    type: row.type,
    source: row.source,
    // PL: Zapytanie bierze tylko wiersze z chwilą publikacji, więc wartość istnieje.
    // EN: The query takes only rows with a publication moment, so the value exists.
    publishedAt: (row.publishedAt as Date).toISOString(),
    title: row.title,
    excerpt: excerptFromBody(row.body),
  };
}

/**
 * PL: Zamienia wiersz bazy na pojedynczy wpis.
 * EN: Turns a database row into a single entry.
 *
 * @param row - PL: wiersz widoczny dla ucznia. EN: a row visible to a student.
 * @returns PL: wpis z treścią i linkiem. EN: the entry with the content and the link.
 */
function toDetail(row: NewsEntryRow): NewsEntryDetail {
  return { ...toSummary(row), body: row.body, linkUrl: row.linkUrl, linkLabel: row.linkLabel };
}

/**
 * PL: Wykonuje zapytanie z bazą albo odpowiada błędem. Błąd bazy to 500 z samym kodem w JSON, bez szczegółów.
 * EN: Runs a query with the database or answers with an error. A database error is 500 with just a code in JSON, without details.
 *
 * @param context - PL: kontekst zapytania Hono z bazą w context.env.DB. EN: the Hono request context with the database in context.env.DB.
 * @param run - PL: funkcja, która dostaje bazę i zwraca odpowiedź. EN: a function that receives the database and returns the response.
 * @returns PL: odpowiedź HTTP. EN: the HTTP response.
 */
async function withDatabase(
  context: Context<{ Bindings: Env }>,
  run: (db: DrizzleD1Database) => Promise<Response>,
): Promise<Response> {
  // PL: Błąd bazy nie wycieka do telefonu: odpowiadamy samym kodem.
  // EN: A database error does not leak to the phone: we answer with the code only.
  try {
    return await run(drizzle(context.env.DB));
  } catch {
    return context.json({ error: 'database_error' }, 500);
  }
}

/**
 * PL: Router podtoru 3a. Tylko odczyt, tylko opublikowane wpisy. Baza jest w context.env.DB.
 * EN: The router of subtrack 3a. Read-only, published entries only. The database is in context.env.DB.
 */
export const newsFeedApp = new Hono<{ Bindings: Env }>();

// PL: Lista opublikowanych wpisów od najnowszego.
// EN: The list of published entries, newest first.
newsFeedApp.get('/', (context) =>
  withDatabase(context, async (db) => context.json({ entries: (await listPublishedEntries(db)).map(toSummary) })),
);

// PL: Jeden opublikowany wpis. Szkic i nieznany numer to to samo: 404.
// EN: One published entry. A draft and an unknown id are the same: 404.
newsFeedApp.get('/:id', (context) =>
  withDatabase(context, async (db) => {
    const row = await findPublishedEntry(db, context.req.param('id'));
    return row ? context.json({ entry: toDetail(row) }) : context.json({ error: 'not_found' }, 404);
  }),
);
