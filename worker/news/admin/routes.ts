/**
 * PL: Router Hono podtoru 3c (wpisy w panelu: publikacja, usuwanie). Trzy adresy pod /api/news/admin: GET / oddaje wszystkie wpisy ze szkicami, POST /:id/publish publikuje szkic, DELETE /:id usuwa wpis. Cały router stoi za strażnikiem autora z podtoru 3b (sesja i rola), także odczyt, bo lista zawiera szkice. Tworzenie wpisu to adres podtoru 3b. Router jest podpięty w worker/mounts.ts.
 * EN: The Hono router of subtrack 3c (entries in the panel: publishing, deleting). Three routes under /api/news/admin: GET / returns all entries with drafts, POST /:id/publish publishes a draft, DELETE /:id deletes an entry. The whole router stands behind the author guard from subtrack 3b (session and role), reading too, because the list contains drafts. Creating an entry is a route of subtrack 3b. The router is mounted in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/admin/queries.ts::listPanelEntries
 * @uses worker/news/admin/queries.ts::publishDraft
 * @uses worker/news/admin/queries.ts::deleteEntry
 * @uses worker/news/editor/index.ts::requireNewsAuthor
 * @uses worker/admin/index.ts::recordDiaryEntry
 * @used_by worker/news/admin/index.ts::newsAdminApp
 * @used_by worker/news/admin/routes.test.ts::createNewsAdminApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono, type Context, type MiddlewareHandler } from 'hono';
import type { StudentEnv } from '../../auth';
// PL: Strażnik autora wpisów z drzwi podtoru 3b.
// EN: The entry author guard from the door of subtrack 3b.
import { requireNewsAuthor } from '../editor';
// PL: Zapis w dzienniku zmian przez drzwi podtoru 8.
// EN: Writing to the change diary through the door of subtrack 8.
import { recordDiaryEntry } from '../../admin';
import { deleteEntry, listPanelEntries, publishDraft } from './queries';

/**
 * PL: Wykonuje zapytanie do bazy. Błąd bazy nie wycieka do telefonu: odpowiadamy samym kodem 500.
 * EN: Runs a database query. A database error does not leak to the phone: we answer with the 500 code only.
 *
 * @param context - PL: kontekst zapytania. EN: the request context.
 * @param run - PL: funkcja, która odpowiada na zapytanie. EN: the function that answers the request.
 * @returns PL: odpowiedź funkcji albo 500. EN: the function's response or 500.
 */
async function withDatabase(context: Context<StudentEnv>, run: () => Promise<Response>): Promise<Response> {
  // PL: Złap błąd bazy i oddaj sam kod.
  // EN: Catch the database error and return the code only.
  try {
    return await run();
  } catch {
    return context.json({ error: 'database_error' }, 500);
  }
}

/**
 * PL: Buduje router podtoru 3c z podanym strażnikiem. Strażnik jest parametrem, żeby test mógł podać własnego, bez ról, których jeszcze nie ma.
 * EN: Builds the subtrack 3c router with the given guard. The guard is a parameter, so a test can pass its own, without the roles that do not exist yet.
 *
 * @param guard - PL: middleware, który wpuszcza tylko autorów wpisów. EN: middleware that lets in only entry authors.
 * @returns PL: router Hono. EN: the Hono router.
 */
export function createNewsAdminApp(guard: MiddlewareHandler<StudentEnv>) {
  // PL: Strażnik stoi przed każdym adresem. Redakcja ma dostęp tylko do wpisów, bo innych adresów ten router nie ma.
  // EN: The guard stands before every route. The newspaper team reaches only entries, because this router has no other routes.
  const app = new Hono<StudentEnv>().use(guard);

  // PL: Lista wszystkich wpisów ze szkicami, bez treści.
  // EN: The list of all entries with drafts, without the content.
  app.get('/', (context) => withDatabase(context, async () => context.json({ entries: await listPanelEntries(context.env.DB) })));

  // PL: Publikacja szkicu: 200 po publikacji, 409 gdy wpis już jest opublikowany, 404 gdy go nie ma. Po udanej publikacji jeden wpis w dzienniku (bez treści, tylko id wpisu).
  // EN: Publishing a draft: 200 after publishing, 409 when the entry is already published, 404 when it does not exist. After a successful publish, one diary entry (no content, only the entry id).
  app.post('/:id/publish', (context) =>
    withDatabase(context, async () => {
      const id = context.req.param('id');
      const result = await publishDraft(context.env.DB, id);
      if (result === 'not_found') return context.json({ error: 'not_found' }, 404);
      if (result === 'already_published') return context.json({ error: 'already_published' }, 409);
      await recordDiaryEntry(context.env.DB, { actorId: context.get('student').id, action: 'news_published', targetId: id });
      return context.json({ id });
    }),
  );

  // PL: Usunięcie wpisu: 200 albo 404, gdy go nie ma. Po udanym usunięciu jeden wpis w dzienniku (bez treści, tylko id wpisu).
  // EN: Deleting an entry: 200 or 404 when it does not exist. After a successful delete, one diary entry (no content, only the entry id).
  app.delete('/:id', (context) =>
    withDatabase(context, async () => {
      const id = context.req.param('id');
      if (!(await deleteEntry(context.env.DB, id))) return context.json({ error: 'not_found' }, 404);
      await recordDiaryEntry(context.env.DB, { actorId: context.get('student').id, action: 'news_deleted', targetId: id });
      return context.json({ id });
    }),
  );

  return app;
}

/**
 * PL: Router podtoru 3c z prawdziwym strażnikiem autora. Gdy podtor 8 doda role, zmienia się tylko worker/news/editor/author.ts, a ten router działa dalej.
 * EN: The subtrack 3c router with the real author guard. When subtrack 8 adds roles, only worker/news/editor/author.ts changes, and this router keeps working.
 */
export const newsAdminApp = createNewsAdminApp(requireNewsAuthor);
