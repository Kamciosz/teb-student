/**
 * PL: Router Hono podtoru 6 (licznik do dzwonka), podpięty pod /api/bell w worker/mounts.ts. Trzy adresy dni skróconych: lista dni od dziś (dla zalogowanego ucznia), włączenie dnia i wyłączenie dnia (tylko Samorząd).
 *     Kody odpowiedzi: 401 brak sesji, 403 brak roli Samorządu, 400 zła data. Zapis i kasowanie sprawdza serwer, telefon nie decyduje o dostępie.
 * EN: The Hono router of subtrack 6 (bell countdown), mounted under /api/bell in worker/mounts.ts. Three routes for shortened days: the list of days from today (for a signed-in student), turning a day on and turning it off (Student Council only).
 *     Response codes: 401 no session, 403 no Student Council role, 400 bad date. The server checks writing and deleting, the phone does not decide access.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses worker/admin/index.ts::requirePanelRole
 * @uses worker/auth/index.ts::requireStudent
 * @uses worker/db/schema/bell.ts::shortenedDays
 * @uses worker/bell/shortenedDay.ts::parseShortenedDay
 * @uses worker/bell/shortenedDay.ts::warsawDay
 * @used_by worker/bell/index.ts::bellApp
 * @used_by worker/bell/routes.test.ts::bellApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';
// PL: Klient bazy D1 dla Drizzle i operatory zapytań (równość, większe lub równe, sortowanie).
// EN: The D1 client for Drizzle and the query operators (equality, greater or equal, sorting).
import { drizzle } from 'drizzle-orm/d1';
import { asc, eq, gte } from 'drizzle-orm';
// PL: Sprawdzanie roli w panelu i sesji ucznia z drzwi modułów admin i auth.
// EN: The panel role check and the student session check from the admin and auth module doors.
import { requirePanelRole, type PanelEnv } from '../admin';
import { requireStudent } from '../auth';
// PL: Tabela dni skróconych z własnego schematu.
// EN: The shortened days table from its own schema.
import { shortenedDays } from '../db/schema/bell';
import { parseShortenedDay, warsawDay } from './shortenedDay';

/**
 * PL: Router podtoru 6. Każdy adres ma własne sprawdzanie: odczyt wymaga zalogowanego ucznia, zapis i kasowanie roli Samorządu.
 * EN: The router of subtrack 6. Each route has its own check: reading needs a signed-in student, writing and deleting need the Student Council role.
 */
export const bellApp = new Hono<PanelEnv>()

  // PL: GET /shortened – dni skrócone od dziś (czas polski) w górę, rosnąco. Widzi je każdy zalogowany uczeń.
  // EN: GET /shortened – shortened days from today (Polish time) onward, ascending. Every signed-in student sees them.
  .get('/shortened', requireStudent, async (context) => {
    const rows = await drizzle(context.env.DB)
      .select({ date: shortenedDays.date })
      .from(shortenedDays)
      .where(gte(shortenedDays.date, warsawDay(new Date())))
      .orderBy(asc(shortenedDays.date));
    return context.json({ dates: rows.map((row) => row.date) });
  })

  // PL: POST /shortened/:date – włączenie dnia skróconego. Ponowne włączenie tego samego dnia nic nie zmienia, zostaje pierwszy zapis.
  // EN: POST /shortened/:date – turning a shortened day on. Turning the same day on again changes nothing, the first record stays.
  .post('/shortened/:date', requirePanelRole('council'), async (context) => {
    const date = parseShortenedDay(context.req.param('date'));
    if (date === null) return context.json({ error: 'invalid_date' }, 400);
    await drizzle(context.env.DB)
      .insert(shortenedDays)
      .values({ date, setBy: context.get('student').id, setAt: new Date() })
      .onConflictDoNothing();
    return context.json({ date, shortened: true }, 201);
  })

  // PL: DELETE /shortened/:date – wyłączenie dnia skróconego (kasuje wiersz). Wyłączenie dnia, który nie jest skrócony, też jest w porządku.
  // EN: DELETE /shortened/:date – turning a shortened day off (deletes the row). Turning off a day that is not shortened is fine too.
  .delete('/shortened/:date', requirePanelRole('council'), async (context) => {
    const date = parseShortenedDay(context.req.param('date'));
    if (date === null) return context.json({ error: 'invalid_date' }, 400);
    await drizzle(context.env.DB).delete(shortenedDays).where(eq(shortenedDays.date, date));
    return context.json({ date, shortened: false });
  });
