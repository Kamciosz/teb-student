/**
 * PL: Drzwi modułu reports po stronie telefonu. Tylko zbiera index.ts jego podtorów (4a, 4b) i niczego nie zawiera. Router importuje tylko stąd.
 * EN: The door of the reports module on the phone side. It only collects the index.ts files of its subtracks (4a, 4b) and contains nothing itself. The router imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/reports/student/index.ts::ReportsStudentScreen
 * @uses src/features/reports/admin/index.ts::ReportsAdminScreen
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 4a (zgłoszenie: formularz i „moje zgłoszenia”).
// EN: The screen of subtrack 4a (report: form and "my reports").
export { ReportsStudentScreen } from './student';

// PL: Ekran podtoru 4b (zgłoszenia w panelu: zmiana etapu).
// EN: The screen of subtrack 4b (reports in the panel: stage change).
export { ReportsAdminScreen } from './admin';
