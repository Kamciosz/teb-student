/**
 * PL: Drzwi modułu auth po stronie serwera. Tylko zbiera index.ts jego podtorów (1a, 1b) i niczego nie zawiera. Worker importuje tylko stąd.
 * EN: The door of the auth module on the server side. It only collects the index.ts files of its subtracks (1a, 1b) and contains nothing itself. The Worker imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/auth/email/index.ts::authEmailApp
 * @uses worker/auth/invite/index.ts::authInviteApp
 * @uses worker/auth/invite/index.ts::issueInviteCode
 * @uses worker/auth/invite/index.ts::listInviteCodes
 * @uses worker/auth/email/index.ts::deleteAuthStudentData
 * @uses worker/auth/email/index.ts::requireStudent
 * @uses worker/auth/email/index.ts::findStudentByEmail
 * @uses worker/auth/email/index.ts::listStudentsByIds
 * @uses worker/auth/email/index.ts::countStudents
 * @uses worker/auth/email/index.ts::getAccountCreatedAt
 * @used_by worker/mounts.ts::API_MOUNTS
 * @used_by worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS
 * @used_by worker/admin/…::issueInviteCode (panel Samorządu, podtor 8 / Student Council panel, subtrack 8)
 * @used_by worker/profile/exportData.ts::getAccountCreatedAt (eksport danych RODO, podtor 7 / GDPR export, subtrack 7; pole missing)
 * @used_by worker/admin/…::findStudentByEmail, listStudentsByIds, countStudents (panel Samorządu, podtor 8 / Student Council panel, subtrack 8)
 * @used_by worker/<moduł>/…::requireStudent (routery innych podtorów / routers of other subtracks)
 */

// PL: Router podtoru 1a (logowanie kodem z maila) i funkcja kasująca dane ucznia.
// EN: The router of subtrack 1a (sign-in with an e-mail code) and the function that deletes student data.
export { authEmailApp, deleteAuthStudentData } from './email';

// PL: Sprawdzanie sesji dla routerów innych modułów. Użycie: new Hono<StudentEnv>().use(requireStudent); ucznia (id i email) daje context.get('student'). Bez sesji odpowiada 401.
// EN: The session check for the routers of other modules. Usage: new Hono<StudentEnv>().use(requireStudent); the student (id and email) comes from context.get('student'). Without a session it answers 401.
export { requireStudent, type Student, type StudentEnv } from './email';

// PL: Wyszukiwanie uczniów dla panelu Samorządu (podtor 8): findStudentByEmail(env.DB, adres) → { id, name, email } | null, listStudentsByIds(env.DB, numery) → { id, name, email }[], countStudents(env.DB) → liczba kont. Zwracają tylko numer, imię i adres.
// EN: The student lookup for the Student Council panel (subtrack 8): findStudentByEmail(env.DB, address) → { id, name, email } | null, listStudentsByIds(env.DB, ids) → { id, name, email }[], countStudents(env.DB) → the number of accounts. They return only the id, the name and the address.
export { countStudents, findStudentByEmail, listStudentsByIds, type StudentSummary } from './email';

// PL: Data założenia konta ucznia dla eksportu danych RODO „Pobierz moje dane” (podtor 7): getAccountCreatedAt(env.DB, numer) → milisekundy od 1970 | null, gdy konta nie ma. Zwraca tylko chwilę utworzenia konta.
// EN: The date the student's account was created for the GDPR data export "Download my data" (subtrack 7): getAccountCreatedAt(env.DB, id) → milliseconds since 1970 | null when there is no account. It returns only the moment the account was created.
export { getAccountCreatedAt } from './email';

// PL: Router podtoru 1b (kody zaproszeń, login i hasło), funkcja tworząca kod zaproszenia dla panelu Samorządu (issueInviteCode(env.DB) → { code, expiresAt }) i lista kodów, które jeszcze działają (listInviteCodes(env.DB) → { code, expiresAt }[], od najkrócej ważnego). Panel Samorządu (podtor 8) pokazuje listę na ekranie „Kody zaproszeń”.
// EN: The router of subtrack 1b (invitation codes, login and password), the function that creates an invitation code for the Student Council panel (issueInviteCode(env.DB) → { code, expiresAt }) and the list of codes that still work (listInviteCodes(env.DB) → { code, expiresAt }[], from the one valid for the shortest time). The Student Council panel (subtrack 8) shows the list on the "Invitation codes" screen.
export { authInviteApp, issueInviteCode, listInviteCodes } from './invite';
