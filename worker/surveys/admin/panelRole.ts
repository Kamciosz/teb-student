/**
 * PL: TYMCZASOWE sprawdzanie roli w panelu dla podtoru 5b. Podtor 8 (panel Samorządu: rama, role) jeszcze nie wystawia middleware ze sprawdzaniem roli, a w bazie nie ma żadnych ról. Dlatego ta wersja przepuszcza tylko zalogowanego ucznia dalej do odmowy: bez sesji 401, z sesją bez roli 403. Nikt nie dostaje dostępu, więc jest bezpieczna.
 *     Po scaleniu podtoru 8 jego middleware zastępuje `requirePanelRole` w jednej linii: `createSurveysAdminApp(requirePanelRole)` w worker/surveys/admin/routes.ts. Ten plik wtedy znika.
 * EN: A TEMPORARY role check for the panel in subtrack 5b. Subtrack 8 (Student Council panel: frame, roles) does not expose a role-checking middleware yet, and the database has no roles. So this version lets a signed-in student through only to a refusal: no session gives 401, a session without a role gives 403. Nobody gets access, so it is safe.
 *     After subtrack 8 merges, its middleware replaces `requirePanelRole` in one line: `createSurveysAdminApp(requirePanelRole)` in worker/surveys/admin/routes.ts. This file then goes away.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/auth/index.ts::requireStudent
 * @used_by worker/surveys/admin/routes.ts::surveysAdminApp
 */

// PL: Typ middleware z Hono.
// EN: The middleware type from Hono.
import type { MiddlewareHandler } from 'hono';
// PL: Sprawdzanie sesji ucznia z drzwi modułu auth.
// EN: The student session check from the auth module door.
import { requireStudent, type StudentEnv } from '../../auth';

/**
 * PL: Przepuszcza tylko osobę z rolą Samorządu. Dziś ról nie ma, więc zalogowany uczeń zawsze dostaje 403, a bez sesji 401.
 * EN: Lets only a person with the Student Council role through. There are no roles today, so a signed-in student always gets 403, and without a session 401.
 *
 * @param context - PL: zapytanie. EN: the request.
 * @returns PL: odpowiedź 401 albo 403. EN: a 401 or 403 response.
 */
export const requirePanelRole: MiddlewareHandler<StudentEnv> = async (context) => {
  // PL: Najpierw sesja: bez niej 401, tak jak w całej aplikacji. Funkcja „dalej” jest pusta, bo sprawdzenie roli i tak odmawia.
  // EN: The session first: without it 401, like everywhere in the app. The "next" function is empty, because the role check refuses anyway.
  const noSession = await requireStudent(context, async () => undefined);
  if (noSession !== undefined) return noSession;

  // PL: Sesja jest, ale roli nie ma skąd wziąć: odmów.
  // EN: There is a session, but there is no place to take a role from: refuse.
  return context.json({ error: 'forbidden' }, 403);
};
