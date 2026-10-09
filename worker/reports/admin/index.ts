/**
 * PL: Drzwi podtoru 4b (zgłoszenia w panelu: zmiana etapu) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts.
 * EN: The door of subtrack 4b (reports in the panel: stage change) on the server side. Exposes the router to be mounted in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/reports/admin/routes.ts::reportsAdminApp
 * @used_by worker/reports/index.ts::reportsAdminApp
 */

// PL: Router podtoru 4b.
// EN: The router of subtrack 4b.
export { reportsAdminApp } from './routes';
