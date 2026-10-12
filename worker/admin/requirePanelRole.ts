/**
 * PL: Sprawdzanie roli w panelu po stronie serwera, dla innych podtorów. Middleware requirePanelRole('council') odrzuca zapytanie bez sesji kodem 401, a ucznia bez wystarczającej roli kodem 403. Z dobrą rolą udostępnia ucznia (c.get('student')) i jego najwyższą rolę (c.get('panelLevel')).
 * EN: The panel role check on the server side, for other subtracks. The requirePanelRole('council') middleware rejects a request without a session with code 401 and a student without a sufficient role with code 403. With a good role it exposes the student (c.get('student')) and their highest role (c.get('panelLevel')).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/auth/index.ts::requireStudent
 * @uses worker/admin/panelRoles.ts::getPanelLevel
 * @uses worker/admin/panelRoles.ts::isRoleEnough
 * @used_by worker/admin/index.ts::requirePanelRole
 * @used_by worker/admin/routes.ts::adminApp
 * @used_by worker/admin/requirePanelRole.test.ts::createRequirePanelRole
 */

// PL: Typ middleware Hono.
// EN: The Hono middleware type.
import type { Context, MiddlewareHandler } from 'hono';
// PL: Sprawdzanie sesji ucznia i typy ucznia z drzwi modułu auth.
// EN: The student session check and the student types from the auth module door.
import { requireStudent, type Student, type StudentEnv } from '../auth';
// PL: Typ roli.
// EN: The role type.
import type { PanelRole } from '../db/schema/admin';
// PL: Odczyt roli ucznia i porównanie z rolą minimalną.
// EN: Reading the student's role and comparing it with the minimum role.
import { getPanelLevel, isRoleEnough } from './panelRoles';

/**
 * PL: Typ środowiska Hono z uczniem i jego rolą w panelu. Zawiera też bindingi (context.env.DB). Użyj go tak: new Hono<PanelEnv>().use(requirePanelRole('council')).
 * EN: The Hono environment type with the student and their panel role. It includes the bindings too (context.env.DB). Use it like this: new Hono<PanelEnv>().use(requirePanelRole('council')).
 */
export type PanelEnv = {
  Bindings: StudentEnv['Bindings'];
  Variables: {
    /** PL: Zalogowany uczeń (id i email), ustawia go sprawdzanie sesji. EN: The signed-in student (id and email), set by the session check. */
    student: Student;
    /** PL: Najwyższa rola ucznia w panelu, zawsze co najmniej taka, jakiej żądał middleware. EN: The student's highest panel role, always at least the one the middleware asked for. */
    panelLevel: PanelRole;
  };
};

/**
 * PL: Buduje fabrykę middleware z podanym sprawdzaniem sesji. Osobna funkcja, żeby test mógł podać własne sprawdzanie sesji zamiast prawdziwego logowania.
 * EN: Builds the middleware factory with the given session check. A separate function so a test can pass its own session check instead of a real sign-in.
 *
 * @param requireSession - PL: middleware sprawdzający sesję i ustawiający c.get('student'). EN: the middleware that checks the session and sets c.get('student').
 * @returns PL: funkcja, która dla roli minimalnej buduje middleware Hono. EN: a function that builds the Hono middleware for a minimum role.
 */
export function createRequirePanelRole(requireSession: MiddlewareHandler<StudentEnv>) {
  return (minimum: PanelRole): MiddlewareHandler<PanelEnv> =>
    async (context, next) => {
      // PL: Odpowiedź odmowna ustawiona w środku sprawdzania sesji (403), bo stamtąd nie da się zwrócić jej wprost.
      // EN: The refusal response set inside the session check (403), because it cannot be returned directly from there.
      let denied: Response | undefined;
      // PL: Rzutowanie jest bezpieczne: PanelEnv ma te same bindingi i ucznia, a rolę dopisujemy dopiero po sprawdzeniu sesji.
      // EN: The cast is safe: PanelEnv has the same bindings and student, and we add the role only after the session check.
      // PL: Najpierw sprawdź sesję. Bez sesji requireSession zwraca 401 (albo 503, gdy logowanie nie jest ustawione) i nie wywołuje dalszej części.
      // EN: Check the session first. Without a session requireSession returns 401 (or 503 when sign-in is not configured) and does not call the rest.
      const rejected = await requireSession(context as unknown as Context<StudentEnv>, async () => {
        // PL: Wczytaj najwyższą rolę ucznia z bazy.
        // EN: Load the student's highest role from the database.
        const level = await getPanelLevel(context.env.DB, context.get('student').id);
        // PL: Za niska albo żadna rola: odpowiedz 403 i nie puszczaj dalej.
        // EN: A too low role or none: answer 403 and do not let the request through.
        if (level === null || !isRoleEnough(level, minimum)) {
          denied = context.json({ error: 'forbidden' }, 403);
          return;
        }
        // PL: Rola wystarcza: zapisz ją dla routera i puść zapytanie dalej.
        // EN: The role is enough: store it for the router and let the request through.
        context.set('panelLevel', level);
        await next();
      });
      // PL: Oddaj odmowę sesji (401 albo 503), a gdy jej nie było, odmowę roli (403). Przy sukcesie nic nie oddajemy, odpowiedź jest już w kontekście.
      // EN: Return the session refusal (401 or 503), or when there was none, the role refusal (403). On success we return nothing, the response is already in the context.
      return rejected ?? denied;
    };
}

/**
 * PL: Middleware dla routerów innych podtorów: wymaga zalogowanego ucznia z rolą co najmniej minimalną. Role: 'editor' (redakcja, tylko Wpisy), 'council' (Samorząd: Wpisy, Zgłoszenia, Ankiety, Kody zaproszeń), 'admin' (wszystko). Rola wyższa przechodzi tam, gdzie wystarcza niższa.
 * EN: Middleware for other subtracks' routers: requires a signed-in student with at least the minimum role. Roles: 'editor' (the newspaper team, Entries only), 'council' (the Council: Entries, Reports, Surveys, Invitation codes), 'admin' (everything). A higher role passes wherever a lower one is enough.
 */
export const requirePanelRole = createRequirePanelRole(requireStudent);
