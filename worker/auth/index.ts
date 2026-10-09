/**
 * PL: Drzwi modułu auth po stronie serwera. Tylko zbiera index.ts jego podtorów (1a, 1b) i niczego nie zawiera. Worker importuje tylko stąd.
 * EN: The door of the auth module on the server side. It only collects the index.ts files of its subtracks (1a, 1b) and contains nothing itself. The Worker imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/auth/email/index.ts::authEmailApp
 * @uses worker/auth/invite/index.ts::authInviteApp
 * @uses worker/auth/email/index.ts::deleteAuthStudentData
 * @used_by worker/mounts.ts::API_MOUNTS
 * @used_by worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS
 */

// PL: Router podtoru 1a (logowanie kodem z maila) i funkcja kasująca dane ucznia.
// EN: The router of subtrack 1a (sign-in with an e-mail code) and the function that deletes student data.
export { authEmailApp, deleteAuthStudentData } from './email';

// PL: Router podtoru 1b (kody zaproszeń, login i hasło).
// EN: The router of subtrack 1b (invitation codes, login and password).
export { authInviteApp } from './invite';
