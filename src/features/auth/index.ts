/**
 * PL: Drzwi modułu auth po stronie telefonu. Tylko zbiera index.ts jego podtorów (1a, 1b) i niczego nie zawiera. Router importuje tylko stąd.
 * EN: The door of the auth module on the phone side. It only collects the index.ts files of its subtracks (1a, 1b) and contains nothing itself. The router imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/auth/email/index.ts::AuthEmailScreen
 * @uses src/features/auth/email/index.ts::useAuthSession
 * @uses src/features/auth/email/index.ts::signOutStudent
 * @uses src/features/auth/invite/index.ts::AuthInviteScreen
 * @used_by src/app/routes.ts::APP_ROUTES
 * @used_by src/features/<moduł>/…::useAuthSession (ekrany innych podtorów / screens of other subtracks)
 */

// PL: Ekran podtoru 1a (logowanie kodem z maila).
// EN: The screen of subtrack 1a (sign-in with an e-mail code).
export { AuthEmailScreen } from './email';

// PL: Hook sesji ucznia dla ekranów innych modułów. Gdy status to 'signed-in', uczeń (id i email) jest w session.student. Stany: loading, signed-out, signed-in, error (brak sieci: nie wiadomo, czy jest sesja).
// EN: The student session hook for the screens of other modules. When the status is 'signed-in', the student (id and email) is in session.student. States: loading, signed-out, signed-in, error (no network: it is not known whether there is a session).
export { useAuthSession, type AuthSessionState, type StudentSession } from './email';

// PL: Wylogowanie: kasuje sesję na serwerze i czyści dane zapisane w telefonie. Po sukcesie wywołujący przenosi ucznia na /auth/email.
// EN: Sign-out: deletes the session on the server and clears the data saved on the phone. After success the caller takes the student to /auth/email.
export { signOutStudent } from './email';

// PL: Ekran podtoru 1b (kody zaproszeń, login i hasło).
// EN: The screen of subtrack 1b (invitation codes, login and password).
export { AuthInviteScreen } from './invite';
