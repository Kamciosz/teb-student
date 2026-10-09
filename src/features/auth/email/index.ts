/**
 * PL: Drzwi podtoru 1a (logowanie kodem z maila) po stronie telefonu. Wystawia ekran dla routera oraz to, czego potrzebują inne podtory: hook sesji ucznia i wylogowanie. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 1a (sign-in with an e-mail code) on the phone side. Exposes the screen to the router and what other subtracks need: the student session hook and sign-out. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/auth/email/AuthEmailScreen.tsx::AuthEmailScreen
 * @uses src/features/auth/email/useAuthSession.ts::useAuthSession
 * @uses src/features/auth/email/authApi.ts::signOutStudent
 * @used_by src/features/auth/index.ts::AuthEmailScreen
 */

// PL: Ekran podtoru 1a.
// EN: The screen of subtrack 1a.
export { AuthEmailScreen } from './AuthEmailScreen';

// PL: Hook sesji. Użycie: const session = useAuthSession(); gdy session.status === 'signed-in', uczeń jest w session.student (id i email). Stany: loading, signed-out, signed-in, error (brak sieci: nie wiadomo, czy jest sesja).
// EN: The session hook. Usage: const session = useAuthSession(); when session.status === 'signed-in', the student is in session.student (id and email). States: loading, signed-out, signed-in, error (no network: it is not known whether there is a session).
export { useAuthSession, type AuthSessionState, type StudentSession } from './useAuthSession';

// PL: Wylogowanie: kasuje sesję na serwerze i czyści dane zapisane w telefonie (clearQueryData). Zwraca { ok } albo { ok: false, message } z komunikatem po polsku. Po { ok } wywołujący przenosi ucznia na /auth/email.
// EN: Sign-out: deletes the session on the server and clears the data saved on the phone (clearQueryData). Returns { ok } or { ok: false, message } with a message in Polish. After { ok } the caller takes the student to /auth/email.
export { signOutStudent, type AuthResult } from './authApi';
