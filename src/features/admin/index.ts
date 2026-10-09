/**
 * PL: Drzwi podtoru 8 (panel Samorządu: rama, role, wydawanie kodów) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 8 (Student Council panel: frame, roles, issuing codes) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/AdminScreen.tsx::AdminScreen
 * @uses src/features/admin/AdminLayout.tsx::AdminLayout
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 8.
// EN: The screen of subtrack 8.
export { AdminScreen } from './AdminScreen';
// PL: Rama panelu Samorządu z menu. Router otacza nią ekrany panelu.
// EN: The Student Council panel frame with the menu. The router wraps the panel screens in it.
export { AdminLayout } from './AdminLayout';
