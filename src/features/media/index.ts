/**
 * PL: Drzwi podtoru 2 (wysyłka zdjęć i filmów) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 2 (photo and video upload) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/media/MediaScreen.tsx::MediaScreen
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 2.
// EN: The screen of subtrack 2.
export { MediaScreen } from './MediaScreen';
