/**
 * PL: Drzwi podtoru 6 (licznik do dzwonka) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 6 (bell countdown) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/bell/BellScreen.tsx::BellScreen
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 6.
// EN: The screen of subtrack 6.
export { BellScreen } from './BellScreen';
