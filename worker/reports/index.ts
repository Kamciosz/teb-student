/**
 * PL: Drzwi modułu reports po stronie serwera. Tylko zbiera index.ts jego podtorów (4a, 4b) i niczego nie zawiera. Worker importuje tylko stąd.
 * EN: The door of the reports module on the server side. It only collects the index.ts files of its subtracks (4a, 4b) and contains nothing itself. The Worker imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/reports/student/index.ts::reportsStudentApp
 * @uses worker/reports/admin/index.ts::reportsAdminApp
 * @uses worker/reports/student/index.ts::deleteReportsStudentData
 * @used_by worker/mounts.ts::API_MOUNTS
 * @used_by worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS
 */

// PL: Router podtoru 4a (zgłoszenie: formularz i „moje zgłoszenia”) i funkcja kasująca dane ucznia.
// EN: The router of subtrack 4a (report: form and "my reports") and the function that deletes student data.
export { reportsStudentApp, deleteReportsStudentData } from './student';

// PL: Router podtoru 4b (zgłoszenia w panelu: zmiana etapu).
// EN: The router of subtrack 4b (reports in the panel: stage change).
export { reportsAdminApp } from './admin';
