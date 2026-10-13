/**
 * PL: Sprawdzanie, kto może pisać wpisy. Wpisy tworzy tylko Samorząd i redakcja gazetki (docs/PLAN_APLIKACJI.md, część 3, „Bezpieczeństwo”), a uczeń nie może dodać wpisu. Rolę sprawdza middleware podtoru 8: zapisać wpis może redakcja (`editor`) i role wyższe (Samorząd, administrator), uczeń bez roli dostaje 403, a bez sesji 401.
 * EN: The check of who may write entries. Only the Student Council and the newspaper team create entries (docs/PLAN_APLIKACJI.md, part 3, "Bezpieczeństwo"), and a student cannot add an entry. The role is checked by the middleware of subtrack 8: the editorial team (`editor`) and higher roles (the Council, the administrator) may save an entry, a student without a role gets 403, and without a session 401.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/admin/index.ts::requirePanelRole
 * @used_by worker/news/editor/routes.ts::requireNewsAuthor
 */

// PL: Typ middleware Hono i typ środowiska z uczniem (sesja).
// EN: The Hono middleware type and the environment type with the student (session).
import type { MiddlewareHandler } from 'hono';
import type { StudentEnv } from '../../auth';
// PL: Sprawdzanie roli w panelu, przez drzwi modułu admin (worker/admin/index.ts).
// EN: The panel role check, through the door of the admin module (worker/admin/index.ts).
import { requirePanelRole } from '../../admin';

/**
 * PL: Strażnik zapisu wpisów: sesja (401 bez niej) i rola co najmniej redakcji (403 bez niej). Nazwa i miejsce zostają, bo używa go też router podtoru 3c.
 * Zawężenie typu jest celowe: requirePanelRole zwraca środowisko z `panelLevel`, a routery wpisów go nie czytają, więc bezpiecznie oddajemy im typ z samym uczniem (bez tego TypeScript odrzuca przekazanie do createNewsAdminApp/createNewsEditorApp).
 * EN: The entry write guard: a session (401 without it) and at least the editorial role (403 without it). The name and place stay, because the subtrack 3c router uses it too.
 * The type narrowing is deliberate: requirePanelRole returns an environment with `panelLevel`, and the entry routers do not read it, so we hand them the type with only the student (without it TypeScript rejects passing it to createNewsAdminApp/createNewsEditorApp).
 */
export const requireNewsAuthor = requirePanelRole('editor') as unknown as MiddlewareHandler<StudentEnv>;
