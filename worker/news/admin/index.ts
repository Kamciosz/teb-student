/**
 * PL: Drzwi podtoru 3c (wpisy w panelu: publikacja, usuwanie) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts.
 * EN: The door of subtrack 3c (entries in the panel: publishing, deleting) on the server side. Exposes the router to be mounted in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/news/admin/routes.ts::newsAdminApp
 * @used_by worker/news/index.ts::newsAdminApp
 */

// PL: Router podtoru 3c.
// EN: The router of subtrack 3c.
export { newsAdminApp } from './routes';
