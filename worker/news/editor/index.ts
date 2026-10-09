/**
 * PL: Drzwi podtoru 3b (edytor wpisów) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts.
 * EN: The door of subtrack 3b (entry editor) on the server side. Exposes the router to be mounted in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/news/editor/routes.ts::newsEditorApp
 * @used_by worker/news/index.ts::newsEditorApp
 */

// PL: Router podtoru 3b.
// EN: The router of subtrack 3b.
export { newsEditorApp } from './routes';
