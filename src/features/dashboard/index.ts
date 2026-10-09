/**
 * PL: Drzwi podtoru 9 (pulpit) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 9 (dashboard) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 9.
// EN: The screen of subtrack 9.
export { DashboardScreen } from './DashboardScreen';
