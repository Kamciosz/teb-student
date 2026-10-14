/**
 * PL: Drzwi modułu reports po stronie serwera. Tylko zbiera index.ts jego podtorów (4a, 4b) i niczego nie zawiera. Worker importuje tylko stąd.
 * EN: The door of the reports module on the server side. It only collects the index.ts files of its subtracks (4a, 4b) and contains nothing itself. The Worker imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/reports/student/index.ts::reportsStudentApp
 * @uses worker/reports/admin/index.ts::reportsAdminApp
 * @uses worker/reports/student/index.ts::deleteReportsStudentData
 * @uses worker/reports/student/index.ts::countReports
 * @uses worker/reports/student/index.ts::isReportPhoto
 * @uses worker/reports/student/index.ts::listReportsByAuthor
 * @uses worker/reports/student/index.ts::MyReport
 * @used_by worker/mounts.ts::API_MOUNTS
 * @used_by worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS
 * @used_by worker/profile/exportData.ts::listReportsByAuthor (eksport danych RODO, podtor 7 / GDPR export, subtrack 7; pole missing)
 * @used_by worker/admin/…::countReports (panel Samorządu, podtor 8 / Student Council panel, subtrack 8)
 */

// PL: Router podtoru 4a (zgłoszenie: formularz i „moje zgłoszenia”), funkcja kasująca dane ucznia i liczba wszystkich zgłoszeń (countReports(env.DB) → number) dla ekranu „Dane z pilotażu” w panelu Samorządu.
// EN: The router of subtrack 4a (report: form and "my reports"), the function that deletes student data and the number of all reports (countReports(env.DB) → number) for the "Pilot data" screen in the Student Council panel.
export { reportsStudentApp, deleteReportsStudentData, countReports } from './student';

// PL: Zgłoszenia jednego ucznia (id, kategoria, miejsce, opis, etap, daty) dla eksportu danych RODO „Pobierz moje dane” (podtor 7). Zwraca tylko zgłoszenia podanego numeru autora, bez numeru autora w wyniku.
// EN: One student's reports (id, category, place, description, stage, dates) for the GDPR data export "Download my data" (subtrack 7). It returns only the reports of the given author id, without the author id in the result.
export { listReportsByAuthor, type MyReport } from './student';

// PL: Sprawdzenie, czy plik jest zdjęciem zgłoszenia, dla modułu media (zdjęcie widzi tylko autor i administracja).
// EN: The check whether a file is a report photo, for the media module (only the author and the administration see it).
export { isReportPhoto } from './student';

// PL: Router podtoru 4b (zgłoszenia w panelu: zmiana etapu).
// EN: The router of subtrack 4b (reports in the panel: stage change).
export { reportsAdminApp } from './admin';
