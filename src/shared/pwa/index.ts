/**
 * PL: Drzwi modułu przeładowania po wdrożeniu. Inne części aplikacji importują stąd, a nie z plików w środku.
 * EN: The door of the reload-after-deploy module. Other parts of the app import from here, not from files inside.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-31
 * @uses src/shared/pwa/staleBuildReload.ts::installStaleBuildReload
 * @uses src/shared/pwa/browserEnv.ts::createBrowserStaleBuildEnv
 * @used_by src/App.tsx::App
 */

// PL: Podłączenie przeładowania do strony.
// EN: Attaching the reload to the page.
export { installStaleBuildReload } from './staleBuildReload';
// PL: Zależności z prawdziwej przeglądarki.
// EN: The dependencies from the real browser.
export { createBrowserStaleBuildEnv } from './browserEnv';
