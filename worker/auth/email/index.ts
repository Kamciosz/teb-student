/**
 * PL: Drzwi podtoru 1a (logowanie kodem z maila) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts, funkcję kasującą dane ucznia oraz sprawdzanie sesji dla innych podtorów: requireStudent.
 * EN: The door of subtrack 1a (sign-in with an e-mail code) on the server side. Exposes the router to be mounted in worker/mounts.ts, the function that deletes student data and the session check for other subtracks: requireStudent.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/auth/email/routes.ts::authEmailApp
 * @uses worker/auth/email/deleteStudentData.ts::deleteAuthStudentData
 * @uses worker/auth/email/session.ts::requireStudent
 * @used_by worker/auth/index.ts::authEmailApp
 */

// PL: Router podtoru 1a.
// EN: The router of subtrack 1a.
export { authEmailApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu auth. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the auth module. worker/shared/accountDeletion.ts collects it.
export { deleteAuthStudentData } from './deleteStudentData';

// PL: Sprawdzanie sesji dla routerów innych podtorów. Użycie: const app = new Hono<StudentEnv>(); app.use(requireStudent); w funkcji zapytania: context.get('student').id. Bez sesji odpowiada 401.
// EN: The session check for other subtracks' routers. Usage: const app = new Hono<StudentEnv>(); app.use(requireStudent); in a request function: context.get('student').id. Without a session it answers 401.
export { requireStudent, type Student, type StudentEnv } from './session';
