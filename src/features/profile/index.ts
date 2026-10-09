/**
 * PL: Drzwi podtoru 7 (profil i ustawienia) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 7 (profile and settings) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/profile/ProfileScreen.tsx::ProfileScreen
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 7.
// EN: The screen of subtrack 7.
export { ProfileScreen } from './ProfileScreen';
