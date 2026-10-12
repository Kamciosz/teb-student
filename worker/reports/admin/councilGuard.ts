/**
 * PL: Strażnik roli Samorządu dla routera 4b. Dziś zaślepka, która zawsze odmawia (403): w bazie nie ma jeszcze ról, a bezpieczniej nikogo nie wpuścić niż wpuścić każdego ucznia. Po scaleniu podtoru 8 (panel Samorządu: rama i role) ten plik znika, a w routes.ts w jednej linii `use(...)` stanie jego middleware.
 * EN: The Student Council role guard for the 4b router. For now a stand-in that always refuses (403): there are no roles in the database yet, and letting nobody in is safer than letting every student in. After subtrack 8 (Student Council panel: frame and roles) is merged, this file goes away, and its middleware takes its place in the single `use(...)` line in routes.ts.
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by worker/reports/admin/routes.ts::reportsAdminApp
 */

// PL: Typ middleware z Hono.
// EN: The middleware type from Hono.
import type { MiddlewareHandler } from 'hono';
// PL: Typ środowiska z uczniem z sesji.
// EN: The environment type with the student from the session.
import type { StudentEnv } from '../../auth';

/**
 * PL: Odrzuca każde zapytanie kodem 403. Stoi za `requireStudent`, więc bez sesji odpowiedź to nadal 401.
 * EN: Rejects every request with code 403. It stands behind `requireStudent`, so without a session the answer is still 401.
 *
 * @param context - PL: zapytanie. EN: the request.
 * @returns PL: odpowiedź 403 z kodem błędu. EN: a 403 response with an error code.
 */
export const denyCouncilGuard: MiddlewareHandler<StudentEnv> = async (context) => context.json({ error: 'forbidden' }, 403);
