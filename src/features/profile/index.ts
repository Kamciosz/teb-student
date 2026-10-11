/**
 * PL: Drzwi podtoru 7 (profil i ustawienia) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd. Przy wczytaniu ustawia zapisany wygląd (paleta i akcent szkoły), bo router wczytuje ten plik przy starcie aplikacji, więc wygląd działa na każdym ekranie po ponownym uruchomieniu.
 * EN: The door of subtrack 7 (profile and settings) on the phone side. Exposes the screen to the router. Other modules import only from here. On load it sets the saved look (the palette and the school accent), because the router loads this file at app start, so the look works on every screen after a restart.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/profile/ProfileScreen.tsx::ProfileScreen
 * @uses src/features/profile/look.ts::applyStoredLook
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Wygląd zapisany w telefonie.
// EN: The look saved on the phone.
import { applyStoredLook } from './look';

// PL: Ekran podtoru 7.
// EN: The screen of subtrack 7.
export { ProfileScreen } from './ProfileScreen';

// PL: Ustaw zapisany wygląd od razu przy wczytaniu modułu, jeszcze przed pierwszym narysowaniem ekranu.
// EN: Set the saved look right when the module loads, before the first screen is drawn.
applyStoredLook();
