/**
 * PL: Drzwi modułu auth po stronie telefonu. Tylko zbiera index.ts jego podtorów (1a, 1b) i niczego nie zawiera. Router importuje tylko stąd.
 * EN: The door of the auth module on the phone side. It only collects the index.ts files of its subtracks (1a, 1b) and contains nothing itself. The router imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/auth/email/index.ts::AuthEmailScreen
 * @uses src/features/auth/invite/index.ts::AuthInviteScreen
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 1a (logowanie kodem z maila).
// EN: The screen of subtrack 1a (sign-in with an e-mail code).
export { AuthEmailScreen } from './email';

// PL: Ekran podtoru 1b (kody zaproszeń, login i hasło).
// EN: The screen of subtrack 1b (invitation codes, login and password).
export { AuthInviteScreen } from './invite';
