/**
 * PL: Router dziennika zmian (podtor 8, ekran „Dziennik zmian”): GET /diary?page=N daje stronę wpisów, od najnowszych, po 50. Każdy wpis ma akcję, chwilę i imię i nazwisko osoby, która ją wykonała (null, gdy konto zniknęło). Tylko Samorząd i administrator.
 * EN: The router of the change diary (subtrack 8, the "Dziennik zmian" screen): GET /diary?page=N gives a page of entries, from the newest, 50 per page. Each entry has the action, the moment and the name of the person who did it (null when the account is gone). Council and administrator only.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/auth/index.ts::listStudentsByIds
 * @uses worker/admin/diary.ts::listDiaryEntries
 * @uses worker/admin/requirePanelRole.ts::requirePanelRole
 * @used_by worker/admin/routes.ts::adminApp
 * @used_by worker/admin/diary.test.ts::diaryApp
 */

// PL: Hono to router serwera.
// EN: Hono is the server router.
import { Hono } from 'hono';
// PL: Odczyt imion kont z drzwi modułu auth.
// EN: Reading the account names from the auth module door.
import { listStudentsByIds } from '../auth';
// PL: Odczyt strony dziennika.
// EN: Reading a page of the diary.
import { listDiaryEntries } from './diary';
// PL: Sprawdzanie roli w panelu i typ środowiska z rolą.
// EN: The panel role check and the environment type with the role.
import { requirePanelRole, type PanelEnv } from './requirePanelRole';

/**
 * PL: Router dziennika: od Samorządu w górę. Numer strony z zapytania, od 1; brak albo zły numer to 400.
 * EN: The diary router: from the Council up. The page number comes from the query, from 1; a missing or bad number gives 400.
 */
export const diaryApp = new Hono<PanelEnv>()
  .use(requirePanelRole('council'))
  // PL: Strona wpisów z imionami osób, które je zrobiły.
  // EN: A page of entries with the names of the people who made them.
  .get('/', async (context) => {
    // PL: Odczytaj numer strony; bez zapytania to pierwsza strona.
    // EN: Read the page number; without a query it is the first page.
    const page = Number(context.req.query('page') ?? '1');
    if (!Number.isInteger(page) || page < 1) return context.json({ error: 'bad_request' }, 400);
    const { entries, hasNext } = await listDiaryEntries(context.env.DB, page);
    // PL: Imiona zbieramy jednym zapytaniem; pusta lista nie idzie do bazy.
    // EN: We collect the names in one query; an empty list does not go to the database.
    const ids = [...new Set(entries.map((entry) => entry.actorId))];
    const students = ids.length === 0 ? [] : await listStudentsByIds(context.env.DB, ids);
    const names = new Map(students.map((student) => [student.id, student.name.trim()]));
    return context.json({
      entries: entries.map((entry) => ({
        id: entry.id,
        action: entry.action,
        at: new Date(entry.at).toISOString(),
        actorName: names.get(entry.actorId) || null,
      })),
      hasNext,
    });
  });
