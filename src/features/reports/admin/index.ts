/**
 * PL: Drzwi podtoru 4b (zgłoszenia w panelu: zmiana etapu) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 4b (reports in the panel: stage change) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/reports/admin/ReportsAdminScreen.tsx::ReportsAdminScreen
 * @used_by src/features/reports/index.ts::ReportsAdminScreen
 */

// PL: Ekran podtoru 4b.
// EN: The screen of subtrack 4b.
export { ReportsAdminScreen } from './ReportsAdminScreen';
