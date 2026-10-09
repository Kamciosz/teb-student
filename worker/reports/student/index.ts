/**
 * PL: Drzwi podtoru 4a (zgłoszenie: formularz i „moje zgłoszenia”) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 4a (report: form and "my reports") on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/reports/student/routes.ts::reportsStudentApp
 * @uses worker/reports/student/deleteStudentData.ts::deleteReportsStudentData
 * @used_by worker/reports/index.ts::reportsStudentApp
 */

// PL: Router podtoru 4a.
// EN: The router of subtrack 4a.
export { reportsStudentApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu reports. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the reports module. worker/shared/accountDeletion.ts collects it.
export { deleteReportsStudentData } from './deleteStudentData';
