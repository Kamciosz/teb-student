/**
 * PL: Drzwi podtoru 1b (kody zaproszeń, login i hasło) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts.
 * EN: The door of subtrack 1b (invitation codes, login and password) on the server side. Exposes the router to be mounted in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/auth/invite/routes.ts::authInviteApp
 * @used_by worker/auth/index.ts::authInviteApp
 */

// PL: Router podtoru 1b.
// EN: The router of subtrack 1b.
export { authInviteApp } from './routes';
