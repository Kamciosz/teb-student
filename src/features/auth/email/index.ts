/**
 * PL: Drzwi podtoru 1a (logowanie kodem z maila) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 1a (sign-in with an e-mail code) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/auth/email/AuthEmailScreen.tsx::AuthEmailScreen
 * @used_by src/features/auth/index.ts::AuthEmailScreen
 */

// PL: Ekran podtoru 1a.
// EN: The screen of subtrack 1a.
export { AuthEmailScreen } from './AuthEmailScreen';
