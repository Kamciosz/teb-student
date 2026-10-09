/**
 * PL: Drzwi podtoru 8 (panel Samorządu: rama, role, wydawanie kodów) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 8 (Student Council panel: frame, roles, issuing codes) on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/admin/routes.ts::adminApp
 * @uses worker/admin/deleteStudentData.ts::deleteAdminStudentData
 * @used_by worker/mounts.ts::API_MOUNTS
 */

// PL: Router podtoru 8.
// EN: The router of subtrack 8.
export { adminApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu admin. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the admin module. worker/shared/accountDeletion.ts collects it.
export { deleteAdminStudentData } from './deleteStudentData';
