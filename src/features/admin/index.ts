/**
 * PL: Drzwi podtoru 8 (panel Samorządu: rama, role, wydawanie kodów) po stronie telefonu. Wystawia ekran i ramę dla routera oraz wiersz wejścia do panelu dla profilu. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 8 (Student Council panel: frame, roles, issuing codes) on the phone side. Exposes the screen and the frame to the router and the panel entry row for the profile. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/AdminScreen.tsx::AdminScreen
 * @uses src/features/admin/AdminLayout.tsx::AdminLayout
 * @uses src/features/admin/queries.ts::usePanelEntry
 * @used_by src/app/routes.ts::APP_ROUTES
 * @used_by src/features/profile/…::usePanelEntry (wiersz „Panel Samorządu” w profilu, podtor 7 / the "Panel Samorządu" row in the profile, subtrack 7)
 */

// PL: Ekran podtoru 8.
// EN: The screen of subtrack 8.
export { AdminScreen } from './AdminScreen';
// PL: Rama panelu Samorządu z bramką roli. Router otacza nią ekrany panelu.
// EN: The Student Council panel frame with the role gate. The router wraps the panel screens in it.
export { AdminLayout } from './AdminLayout';

// PL: Wiersz wejścia do panelu dla profilu (ekran 6.1a). Użycie: const entry = usePanelEntry(); gdy entry nie jest null, pokaż link do /admin z tekstem entry.label i znacznikiem entry.badge. Uczeń bez roli dostaje null.
// EN: The panel entry row for the profile (screen 6.1a). Usage: const entry = usePanelEntry(); when entry is not null, show a link to /admin with the text entry.label and the badge entry.badge. A student without a role gets null.
export { usePanelEntry } from './queries';
export type { PanelEntry } from './panelView';
