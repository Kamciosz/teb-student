/**
 * PL: Drzwi podtoru 4a (zgłoszenie: formularz i „moje zgłoszenia”) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 4a (report: form and "my reports") on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/reports/student/routes.ts::reportsStudentApp
 * @uses worker/reports/student/deleteStudentData.ts::deleteReportsStudentData
 * @uses worker/reports/student/countReports.ts::countReports
 * @uses worker/reports/student/reportsRepository.ts::listReportsByAuthor
 * @used_by worker/reports/index.ts::reportsStudentApp
 * @used_by worker/reports/index.ts::countReports
 * @used_by worker/reports/index.ts::listReportsByAuthor
 */

// PL: Router podtoru 4a.
// EN: The router of subtrack 4a.
export { reportsStudentApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu reports. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the reports module. worker/shared/accountDeletion.ts collects it.
export { deleteReportsStudentData } from './deleteStudentData';

// PL: Liczba wszystkich zgłoszeń (także anonimowych) dla ekranu „Dane z pilotażu” w panelu Samorządu. Zbiera ją worker/reports/index.ts.
// EN: The number of all reports (anonymous ones too) for the "Pilot data" screen in the Student Council panel. worker/reports/index.ts collects it.
export { countReports } from './countReports';

// PL: Sprawdza, czy plik jest zdjęciem zgłoszenia. Zbiera go worker/reports/index.ts dla modułu media.
// EN: Checks whether a file is a report photo. worker/reports/index.ts collects it for the media module.
export { isReportPhoto } from './isReportPhoto';

// PL: Zgłoszenia jednego ucznia, od najnowszego (id, kategoria, miejsce, opis, etap, daty), bez numeru autora. Używa ich eksport danych RODO („Pobierz moje dane”) przez worker/reports/index.ts.
// EN: One student's reports, newest first (id, category, place, description, stage, dates), without the author id. The data export ("Download my data", GDPR) uses them through worker/reports/index.ts.
export { listReportsByAuthor, type MyReport } from './reportsRepository';
