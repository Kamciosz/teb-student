/**
 * PL: Drzwi podtoru 9 (pulpit) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts.
 * EN: The door of subtrack 9 (dashboard) on the server side. Exposes the router to be mounted in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/dashboard/routes.ts::dashboardApp
 * @used_by worker/mounts.ts::API_MOUNTS
 */

// PL: Router podtoru 9.
// EN: The router of subtrack 9.
export { dashboardApp } from './routes';
