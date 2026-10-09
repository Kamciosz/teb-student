/**
 * PL: Ekran podtoru 4a (zgłoszenie: formularz i „moje zgłoszenia”). Adres /reports/student otwiera formularz, a /reports/student/moje listę „Moje zgłoszenia”.
 * EN: The screen of subtrack 4a (report: form and "my reports"). The address /reports/student opens the form, and /reports/student/moje opens the "Moje zgłoszenia" list.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/ReportForm.tsx::ReportForm
 * @uses src/features/reports/student/MyReports.tsx::MyReports
 * @used_by src/features/reports/student/index.ts::ReportsStudentScreen
 */

// PL: Podtrasy w obrębie /reports/student/*.
// EN: The sub-routes inside /reports/student/*.
import { Route, Routes } from 'react-router';
// PL: Style tego ekranu.
// EN: The styles of this screen.
import './reportsStudent.css';
// PL: Ekrany podtoru. Dostawca zapytań stoi w korzeniu aplikacji.
// EN: The subtrack screens. The query provider stands at the app root.
import { MyReports } from './MyReports';
import { ReportForm } from './ReportForm';

/**
 * PL: Rysuje ekran podtoru 4a: formularz pod adresem głównym i listę pod „moje”.
 * EN: Draws the screen of subtrack 4a: the form at the root address and the list under "moje".
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ReportsStudentScreen() {
  // PL: Znacznik data-subtrack zostaje, bo po nim testy poznają ekran podtoru (jak w UnderConstruction).
  // EN: The data-subtrack marker stays, because tests use it to recognise the subtrack screen (as in UnderConstruction).
  return (
    <main className="rs-screen" data-subtrack="4a">
      <Routes>
        <Route index element={<ReportForm />} />
        <Route path="moje" element={<MyReports />} />
        <Route path="*" element={<ReportForm />} />
      </Routes>
    </main>
  );
}
