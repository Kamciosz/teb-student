/**
 * PL: Drzwi podtoru 6 (licznik do dzwonka) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts.
 * EN: The door of subtrack 6 (bell countdown) on the server side. Exposes the router to be mounted in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/bell/routes.ts::bellApp
 * @used_by worker/mounts.ts::API_MOUNTS
 */

// PL: Router podtoru 6.
// EN: The router of subtrack 6.
export { bellApp } from './routes';
