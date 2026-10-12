/**
 * PL: Sprawdzanie, kto może pisać wpisy. Wpisy tworzy tylko Samorząd i redakcja gazetki (docs/PLAN_APLIKACJI.md, część 3, „Bezpieczeństwo”), a uczeń nie może dodać wpisu. Role nie istnieją jeszcze w aplikacji (konto zna tylko numer i adres, a role nadaje panel, podtor 8), więc ten strażnik odpowiada 403 każdemu zalogowanemu. To celowo zamknięta furtka: otwiera się jedną zmianą w tym pliku, gdy podtor 8 da sposób sprawdzenia roli.
 * EN: The check of who may write entries. Only the Student Council and the newspaper team create entries (docs/PLAN_APLIKACJI.md, part 3, "Bezpieczeństwo"), and a student cannot add an entry. Roles do not exist in the app yet (an account knows only an id and an address, and the panel, subtrack 8, grants roles), so this guard answers 403 to every signed-in user. It is a deliberately closed door: it opens with one change in this file once subtrack 8 provides a way to check the role.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/auth/index.ts::requireStudent
 * @used_by worker/news/editor/routes.ts::requireNewsAuthor
 */

// PL: Łączy kilka middleware w jeden, wykonywany po kolei.
// EN: Combines several middleware into one, run in order.
import { every } from 'hono/combine';
import type { MiddlewareHandler } from 'hono';
// PL: Sesja ucznia z drzwi modułu auth.
// EN: The student session from the auth module door.
import { requireStudent, type StudentEnv } from '../../auth';

/**
 * PL: Odrzuca zalogowanego użytkownika, bo aplikacja nie ma jeszcze ról. Gdy podtor 8 doda role, tu będzie sprawdzenie roli Samorządu albo redakcji, a reszta dostanie 403.
 * EN: Rejects the signed-in user, because the app has no roles yet. When subtrack 8 adds roles, the check for the Student Council or newspaper role goes here, and everyone else gets 403.
 */
const denyUntilRolesExist: MiddlewareHandler<StudentEnv> = async (context) => context.json({ error: 'role_required' }, 403);

/**
 * PL: Strażnik zapisu wpisów: najpierw sesja (401 bez niej), potem rola (dziś zawsze 403).
 * EN: The entry write guard: first the session (401 without it), then the role (always 403 today).
 */
export const requireNewsAuthor: MiddlewareHandler<StudentEnv> = every(requireStudent, denyUntilRolesExist);
