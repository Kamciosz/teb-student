/**
 * PL: Router Hono podtoru 3b (edytor wpisów): POST /entries sprawdza wpis od telefonu (typ, tytuł, stan, treść według schematu) i zapisuje go jako szkic albo opublikowany, z autorem z sesji (nie z ciała zapytania). GET i PUT /entries/:id czytają szkic do edycji i zapisują jego zmiany (opublikowany wpis nie wraca do edycji i nie przyjmuje zmian). Zapis i odczyt chroni strażnik (sesja i rola autora). Ten sam kod przyjmuje szkic i publikację, więc podtor 3c (lista w panelu, publikacja szkicu, usuwanie) dopisuje swoje adresy w swoim routerze. Router jest podpięty pod /api/news/editor w worker/mounts.ts.
 * EN: The Hono router of subtrack 3b (entry editor): POST /entries checks an entry from the phone (type, title, status, content against the schema) and saves it as a draft or published, with the author taken from the session (not from the request body). GET and PUT /entries/:id read a draft for editing and save its changes (a published entry does not come back for editing and takes no changes). A guard (session and author role) protects reading and writing. The same code accepts a draft and a publication, so subtrack 3c (the panel list, publishing a draft, deleting) adds its routes in its own router. The router is mounted under /api/news/editor in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/editor/validateEntry.ts::validateEntry
 * @uses worker/news/editor/author.ts::requireNewsAuthor
 * @uses worker/db/schema/news.ts::newsEntries
 * @uses worker/auth/email/session.ts::Student
 * @used_by worker/news/editor/index.ts::newsEditorApp
 * @used_by worker/news/editor/routes.test.ts::createNewsEditorApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono, type Context, type MiddlewareHandler } from 'hono';
// PL: Drizzle łączy się z D1.
// EN: Drizzle connects to D1.
import { and, eq, isNull, ne, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { StudentEnv } from '../../auth';
import { newsEntries, type NewsEntryRow } from '../../db/schema/news';
import { MAX_BODY_BYTES } from '../../../src/features/news/editor/document/limits';
import { requireNewsAuthor } from './author';
import { validateEntry, type CheckedEntry } from './validateEntry';

// PL: Kto wydaje wpis. Napis, nie konto. Rola redakcji gazetki dostanie własny napis, gdy role będą istnieć. Do ustalenia z Samorządem.
// EN: Who issues the entry. A label, not an account. The newspaper team role gets its own label once roles exist. To be agreed with the Student Council.
const ENTRY_SOURCE = 'Samorząd';

// PL: Zapas na tytuł, typ i stan ponad treść: ciało zapytania może być o tyle większe niż sama treść.
// EN: The room for the title, type and status above the content: the request body may be this much larger than the content alone.
const REQUEST_OVERHEAD_BYTES = 2_000;

/**
 * PL: Czyta ciało zapytania jako JSON. Za duże ciało i zły JSON dają gotową odpowiedź z błędem.
 * EN: Reads the request body as JSON. A too large body and bad JSON give a ready error response.
 *
 * @param context - PL: kontekst zapytania. EN: the request context.
 * @returns PL: odczytana wartość albo odpowiedź z błędem. EN: the value read or an error response.
 */
async function readJson(context: Context<StudentEnv>): Promise<{ value: unknown } | { error: Response }> {
  // PL: Za duże ciało odrzucamy, zanim zaczniemy je czytać jako JSON.
  // EN: We reject a too large body before reading it as JSON.
  const text = await context.req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES + REQUEST_OVERHEAD_BYTES) return { error: context.json({ error: 'too_large' }, 413) };
  try {
    return { value: JSON.parse(text) };
  } catch {
    return { error: context.json({ error: 'invalid_json' }, 400) };
  }
}

/**
 * PL: Chwila publikacji wpisu: zaplanowana godzina, a bez niej teraz. Szkic chwili publikacji nie ma.
 * EN: The publication moment of an entry: the scheduled time, or now without it. A draft has no publication moment.
 *
 * @param entry - PL: wpis po sprawdzeniu. EN: the checked entry.
 * @returns PL: chwila publikacji albo null dla szkicu. EN: the publication moment, or null for a draft.
 */
function publishedAtFor(entry: CheckedEntry): Date | null {
  if (entry.status !== 'published') return null;
  return entry.publishAt ?? new Date();
}

/**
 * PL: Zapisuje sprawdzony wpis w bazie. Publikacja dostaje chwilę publikacji, szkic jej nie ma. Autor to konto z sesji, przekazane przez wywołującego.
 * EN: Saves a checked entry in the database. A publication gets a publication moment, a draft has none. The author is the account from the session, passed in by the caller.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param entry - PL: wpis po sprawdzeniu. EN: the checked entry.
 * @param authorUserId - PL: numer konta autora z sesji. EN: the id of the author's account from the session.
 * @returns PL: numer nowego wpisu. EN: the id of the new entry.
 * @throws PL: błąd bazy, gdy zapis się nie uda. EN: a database error when the save fails.
 */
async function insertEntry(db: D1Database, entry: CheckedEntry, authorUserId: string): Promise<string> {
  const id = crypto.randomUUID();
  await drizzle(db).insert(newsEntries).values({ id, ...entry, source: ENTRY_SOURCE, authorUserId, publishedAt: publishedAtFor(entry) });
  return id;
}

/**
 * PL: Czyta wpis o podanym numerze, a gdy go nie ma, zwraca null.
 * EN: Reads the entry with the given id, and returns null when there is none.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer wpisu. EN: the entry id.
 * @returns PL: wiersz wpisu albo null. EN: the entry row or null.
 */
async function findEntry(db: D1Database, id: string): Promise<NewsEntryRow | null> {
  const [row] = await drizzle(db).select().from(newsEntries).where(eq(newsEntries.id, id)).limit(1);
  return row ?? null;
}

/**
 * PL: Zmienia szkic na sprawdzony wpis. Warunek „wciąż szkic” idzie w tym samym zapytaniu co zmiana, więc opublikowanego wpisu nie da się nadpisać, nawet gdy dwa zapisy biegną naraz. Zwraca false, gdy nic nie zmieniono (brak wpisu albo wpis już opublikowany).
 * EN: Changes a draft into a checked entry. The "still a draft" condition is in the same query as the change, so a published entry cannot be overwritten, even when two saves run at once. Returns false when nothing changed (no entry, or the entry is already published).
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer szkicu. EN: the draft id.
 * @param entry - PL: wpis po sprawdzeniu. EN: the checked entry.
 * @returns PL: prawda, gdy szkic się zmienił. EN: true when the draft changed.
 * @throws PL: błąd bazy, gdy zapis się nie uda. EN: a database error when the save fails.
 */
async function updateDraft(db: D1Database, id: string, entry: CheckedEntry): Promise<boolean> {
  const changed = await drizzle(db)
    .update(newsEntries)
    .set({ ...entry, publishedAt: publishedAtFor(entry) })
    .where(and(eq(newsEntries.id, id), eq(newsEntries.status, 'draft')))
    .returning({ id: newsEntries.id });
  return changed.length > 0;
}

/**
 * PL: Zatwierdza wpis w korekcie i publikuje go z tą samą chwilą publikacji co zwykła publikacja: zaplanowaną godziną z wpisu albo teraz. Warunki są w tym samym zapytaniu co zmiana: wpis musi czekać w korekcie, a zatwierdzający nie może być jego autorem (pusty autor = każdy redaktor). Zwraca false, gdy nic nie zmieniono.
 * EN: Approves an entry in review and publishes it with the same publication moment as a normal publication: the scheduled time of the entry, or now. The conditions are in the same query as the change: the entry must wait in review, and the approver cannot be its author (an empty author = any editor). Returns false when nothing changed.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer wpisu. EN: the entry id.
 * @param approver - PL: numer zatwierdzającego redaktora. EN: the id of the approving editor.
 * @param publishAt - PL: zaplanowana godzina wpisu albo null, gdy od razu. EN: the scheduled time of the entry, or null when immediate.
 * @returns PL: prawda, gdy wpis został opublikowany. EN: true when the entry was published.
 * @throws PL: błąd bazy, gdy zapis się nie uda. EN: a database error when the save fails.
 */
async function approveEntry(db: D1Database, id: string, approver: string, publishAt: Date | null): Promise<boolean> {
  const changed = await drizzle(db)
    .update(newsEntries)
    .set({ status: 'published', publishedAt: publishAt ?? new Date() })
    .where(
      and(
        eq(newsEntries.id, id),
        eq(newsEntries.status, 'in_review'),
        or(isNull(newsEntries.authorUserId), ne(newsEntries.authorUserId, approver)),
      ),
    )
    .returning({ id: newsEntries.id });
  return changed.length > 0;
}

/**
 * PL: Buduje router podtoru 3b z podanym strażnikiem zapisu. Strażnik jest parametrem, żeby test mógł podać własnego, bez prawdziwego logowania.
 * EN: Builds the subtrack 3b router with the given write guard. The guard is a parameter, so a test can pass its own, without a real sign-in.
 *
 * @param guard - PL: middleware, który wpuszcza tylko autorów wpisów. EN: middleware that lets in only entry authors.
 * @returns PL: router Hono. EN: the Hono router.
 */
export function createNewsEditorApp(guard: MiddlewareHandler<StudentEnv>) {
  const app = new Hono<StudentEnv>();

  // PL: Zapis wpisu. Najpierw strażnik, potem sprawdzenie, dopiero potem baza.
  // EN: Saving an entry. First the guard, then the check, only then the database.
  app.post('/entries', guard, async (context) => {
    const input = await readJson(context);
    if ('error' in input) return input.error;
    // PL: Wpis, którego schemat nie przyjmie, nie trafia do bazy.
    // EN: An entry the schema does not accept never reaches the database.
    const result = validateEntry(input.value);
    if (!result.ok) return context.json({ error: 'invalid_entry', reason: result.reason }, 422);
    // PL: Autor to konto zalogowane w sesji (ustawia je strażnik). Pole author z ciała zapytania jest ignorowane, bo validateEntry go nie przepisuje.
    // EN: The author is the account signed in the session (the guard sets it). An author field in the request body is ignored, because validateEntry does not copy it.
    const { id: authorUserId } = context.get('student');
    try {
      return context.json({ id: await insertEntry(context.env.DB, result.entry, authorUserId) }, 201);
    } catch {
      // PL: Błąd bazy nie wycieka do telefonu: odpowiadamy samym kodem.
      // EN: A database error does not leak to the phone: we answer with the code only.
      return context.json({ error: 'database_error' }, 500);
    }
  });

  // PL: Odczyt wpisu do edycji. Szkic wraca z danymi do kreatora. Wpis w korekcie wraca tylko do podglądu, z flagą canApprove (czy ten redaktor może go zatwierdzić). Opublikowany wpis nie wraca (409), brak wpisu daje 404.
  // EN: Reading an entry for editing. A draft comes back with its data for the wizard. An entry in review comes back for preview only, with the canApprove flag (whether this editor may approve it). A published entry does not come back (409), a missing entry gives 404.
  app.get('/entries/:id', guard, async (context) => {
    try {
      const entry = await findEntry(context.env.DB, context.req.param('id'));
      if (!entry) return context.json({ error: 'not_found' }, 404);
      if (entry.status === 'published') return context.json({ error: 'already_published' }, 409);
      const data = { id: entry.id, type: entry.type, title: entry.title, status: entry.status, body: entry.body };
      if (entry.status === 'in_review') return context.json({ ...data, canApprove: entry.authorUserId !== context.get('student').id });
      return context.json(data);
    } catch {
      return context.json({ error: 'database_error' }, 500);
    }
  });

  // PL: Zapis zmian w szkicu, także wysłanie do korekty i publikacja szkicu. Ten sam wpis, bez nowego numeru. Wpis w korekcie i opublikowany nie przyjmują zmian (409, z powodem). Autor się nie zmienia: aktualizacja nie zawiera pola autora, więc zostaje ten, kto zapisał wpis jako pierwszy.
  // EN: Saving changes to a draft, also sending it to review and publishing a draft. The same entry, without a new id. An entry in review and a published entry take no changes (409, with the reason). The author does not change: the update has no author field, so the one who first saved the entry stays.
  app.put('/entries/:id', guard, async (context) => {
    const id = context.req.param('id');
    const input = await readJson(context);
    if ('error' in input) return input.error;
    const result = validateEntry(input.value);
    if (!result.ok) return context.json({ error: 'invalid_entry', reason: result.reason }, 422);
    try {
      if (await updateDraft(context.env.DB, id, result.entry)) return context.json({ id }, 200);
      // PL: Nic nie zmieniono: sprawdzamy, czy wpisu nie ma (404), czy czeka w korekcie (409 in_review), czy jest już opublikowany (409).
      // EN: Nothing changed: we check whether the entry is missing (404), waits in review (409 in_review), or is already published (409).
      const entry = await findEntry(context.env.DB, id);
      if (!entry) return context.json({ error: 'not_found' }, 404);
      if (entry.status === 'in_review') return context.json({ error: 'in_review' }, 409);
      return context.json({ error: 'already_published' }, 409);
    } catch {
      return context.json({ error: 'database_error' }, 500);
    }
  });

  // PL: Zatwierdzenie wpisu w korekcie i jego publikacja. Autor nie zatwierdzi swojego wpisu (403). Wpis, który nie czeka w korekcie, daje 409.
  // EN: Approving an entry in review and publishing it. The author cannot approve their own entry (403). An entry that does not wait in review gives 409.
  app.post('/entries/:id/approve', guard, async (context) => {
    const id = context.req.param('id');
    const approver = context.get('student').id;
    try {
      // PL: Chwila publikacji jak przy zwykłej publikacji: zaplanowana godzina z wpisu, a bez niej teraz. Wpis w korekcie nie zmienia godziny, więc odczyt przed zatwierdzeniem nic nie gubi.
      // EN: The publication moment as for a normal publication: the scheduled time of the entry, or now without it. An entry in review does not change its time, so reading it before approval loses nothing.
      const entry = await findEntry(context.env.DB, id);
      if (!entry) return context.json({ error: 'not_found' }, 404);
      if (await approveEntry(context.env.DB, id, approver, entry.publishAt)) return context.json({ id }, 200);
      // PL: Nic nie zmieniono: sprawdzamy ponownie, czy wpis nadal istnieje (404), nie czeka w korekcie (409), a zostaje tylko autor (403).
      // EN: Nothing changed: we check again whether the entry still exists (404), does not wait in review (409), or only the author is left (403).
      const current = await findEntry(context.env.DB, id);
      if (!current) return context.json({ error: 'not_found' }, 404);
      if (current.status !== 'in_review') return context.json({ error: 'not_in_review' }, 409);
      return context.json({ error: 'own_entry' }, 403);
    } catch {
      return context.json({ error: 'database_error' }, 500);
    }
  });

  return app;
}

/**
 * PL: Router podtoru 3b z prawdziwym strażnikiem (sesja i rola autora).
 * EN: The subtrack 3b router with the real guard (session and author role).
 */
export const newsEditorApp = createNewsEditorApp(requireNewsAuthor);
