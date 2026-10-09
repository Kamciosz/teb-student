/**
 * PL: Drzwi podtoru 5b (ankiety w panelu: tworzenie i wyniki) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts.
 * EN: The door of subtrack 5b (surveys in the panel: creating and results) on the server side. Exposes the router to be mounted in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/surveys/admin/routes.ts::surveysAdminApp
 * @used_by worker/surveys/index.ts::surveysAdminApp
 */

// PL: Router podtoru 5b.
// EN: The router of subtrack 5b.
export { surveysAdminApp } from './routes';
