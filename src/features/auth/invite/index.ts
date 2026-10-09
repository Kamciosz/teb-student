/**
 * PL: Drzwi podtoru 1b (kody zaproszeń, login i hasło) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 1b (invitation codes, login and password) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/auth/invite/AuthInviteScreen.tsx::AuthInviteScreen
 * @used_by src/features/auth/index.ts::AuthInviteScreen
 */

// PL: Ekran podtoru 1b.
// EN: The screen of subtrack 1b.
export { AuthInviteScreen } from './AuthInviteScreen';
