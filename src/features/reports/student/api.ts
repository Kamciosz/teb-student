/**
 * PL: Rozmowa ekranów 4a z serwerem: wysłanie zgłoszenia i pobranie „Moich zgłoszeń”. Adres to /api/reports/student (docs/ARCHITECTURE.md).
 * EN: The talk of the 4a screens with the server: sending a report and fetching "Moje zgłoszenia". The address is /api/reports/student (docs/ARCHITECTURE.md).
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/reports/student/routes.ts::reportsStudentApp
 * @used_by src/features/reports/student/queries.ts::useSendReport
 * @used_by src/features/reports/student/queries.ts::useMyReports
 */

/** PL: Adres routera serwera. EN: The server router address. */
const API_URL = '/api/reports/student';

/** PL: Dane nowego zgłoszenia z formularza. EN: The data of a new report from the form. */
export type NewReport = {
  category: string;
  place: string;
  placeDetail: string;
  description: string;
  isAnonymous: boolean;
};

/** PL: Zgłoszenie ucznia z serwera (bez numeru autora). EN: A student's report from the server (without the author id). */
export type MyReport = {
  id: string;
  category: string;
  place: string;
  placeDetail: string | null;
  description: string;
  stage: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * PL: Wysyła nowe zgłoszenie.
 * EN: Sends a new report.
 *
 * @param report - PL: dane z formularza. EN: the data from the form.
 * @returns PL: numer zapisanego zgłoszenia. EN: the id of the saved report.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi, gdy serwer odmówi. EN: a network error, or an error with the response code when the server refuses.
 */
export async function sendReport(report: NewReport): Promise<string> {
  // PL: Wyślij JSON metodą POST.
  // EN: Send JSON with the POST method.
  const response = await fetch(API_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(report) });
  // PL: Kod inny niż 2xx to błąd, który ekran pokaże uczniowi.
  // EN: A code other than 2xx is an error the screen shows to the student.
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return ((await response.json()) as { id: string }).id;
}

/**
 * PL: Pobiera zgłoszenia zalogowanego ucznia, od najnowszego.
 * EN: Fetches the signed-in student's reports, newest first.
 *
 * @returns PL: lista zgłoszeń. EN: the list of reports.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi. EN: a network error, or an error with the response code.
 */
export async function fetchMyReports(): Promise<MyReport[]> {
  // PL: Pobierz listę metodą GET.
  // EN: Fetch the list with the GET method.
  const response = await fetch(API_URL);
  // PL: Kod inny niż 2xx to błąd.
  // EN: A code other than 2xx is an error.
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return ((await response.json()) as { reports: MyReport[] }).reports;
}
