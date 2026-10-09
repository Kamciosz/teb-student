/**
 * PL: Drzwi podtoru 4a (zgłoszenie: formularz i „moje zgłoszenia”) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 4a (report: form and "my reports") on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/reports/student/ReportsStudentScreen.tsx::ReportsStudentScreen
 * @used_by src/features/reports/index.ts::ReportsStudentScreen
 */

// PL: Ekran podtoru 4a.
// EN: The screen of subtrack 4a.
export { ReportsStudentScreen } from './ReportsStudentScreen';
