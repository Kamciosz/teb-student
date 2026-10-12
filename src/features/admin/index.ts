/**
 * PL: Drzwi podtoru 8 (panel Samorządu: rama, role, wydawanie kodów) po stronie telefonu. Wystawia ekran i ramę dla routera, bramkę roli dla ekranów panelu i wiersz wejścia do panelu dla profilu. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 8 (Student Council panel: frame, roles, issuing codes) on the phone side. Exposes the screen and the frame to the router, the role gate for the panel screens and the panel entry row for the profile. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/AdminScreen.tsx::AdminScreen
 * @uses src/features/admin/AdminLayout.tsx::AdminLayout
 * @uses src/features/admin/PanelGate.tsx::PanelGate
 * @uses src/features/admin/queries.ts::usePanelEntry
 * @used_by src/app/routes.ts::APP_ROUTES
 * @used_by src/features/<moduł>/…::PanelGate (ekrany podtorów 3c, 4b, 5b / screens of subtracks 3c, 4b, 5b)
 * @used_by src/features/profile/…::usePanelEntry (wiersz „Panel Samorządu” w profilu, podtor 7 / the "Panel Samorządu" row in the profile, subtrack 7)
 */

// PL: Ekran podtoru 8.
// EN: The screen of subtrack 8.
export { AdminScreen } from './AdminScreen';
// PL: Rama panelu Samorządu z menu. Router otacza nią ekrany panelu.
// EN: The Student Council panel frame with the menu. The router wraps the panel screens in it.
export { AdminLayout } from './AdminLayout';

// PL: Bramka roli dla ekranów panelu po stronie telefonu. Użycie na ekranie modułu w ramie panelu: <PanelGate minimum="council"><MojEkran /></PanelGate>. Role od najniższej: 'editor' (redakcja, Wpisy; to domyślne minimum), 'council' (Samorząd: Zgłoszenia, Ankiety, Kody zaproszeń), 'admin'. Uczeń bez wystarczającej roli widzi ekran „Tylko dla Samorządu”. To tylko wygoda: dane chroni serwer (requirePanelRole w worker/admin/index.ts).
// EN: The role gate for the panel screens on the phone side. Usage on a module screen in the panel frame: <PanelGate minimum="council"><MyScreen /></PanelGate>. Roles from the lowest: 'editor' (the newspaper team, Entries; this is the default minimum), 'council' (the Council: Reports, Surveys, Invitation codes), 'admin'. A student without a sufficient role sees the "Tylko dla Samorządu" screen. This is only a convenience: the server protects the data (requirePanelRole in worker/admin/index.ts).
export { PanelGate } from './PanelGate';
export type { PanelLevel } from './api';

// PL: Wiersz wejścia do panelu dla profilu (ekran 6.1a). Użycie: const entry = usePanelEntry(); gdy entry nie jest null, pokaż link do /admin z tekstem entry.label i znacznikiem entry.badge. Uczeń bez roli dostaje null.
// EN: The panel entry row for the profile (screen 6.1a). Usage: const entry = usePanelEntry(); when entry is not null, show a link to /admin with the text entry.label and the badge entry.badge. A student without a role gets null.
export { usePanelEntry } from './queries';
export type { PanelEntry } from './panelView';
