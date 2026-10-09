/**
 * PL: Drzwi podtoru 3c (wpisy w panelu: publikacja, usuwanie) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 3c (entries in the panel: publishing, deleting) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/news/admin/NewsAdminScreen.tsx::NewsAdminScreen
 * @used_by src/features/news/index.ts::NewsAdminScreen
 */

// PL: Ekran podtoru 3c.
// EN: The screen of subtrack 3c.
export { NewsAdminScreen } from './NewsAdminScreen';
