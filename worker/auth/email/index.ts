/**
 * PL: Drzwi podtoru 1a (logowanie kodem z maila) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 1a (sign-in with an e-mail code) on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/auth/email/routes.ts::authEmailApp
 * @uses worker/auth/email/deleteStudentData.ts::deleteAuthStudentData
 * @used_by worker/auth/index.ts::authEmailApp
 */

// PL: Router podtoru 1a.
// EN: The router of subtrack 1a.
export { authEmailApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu auth. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the auth module. worker/shared/accountDeletion.ts collects it.
export { deleteAuthStudentData } from './deleteStudentData';
