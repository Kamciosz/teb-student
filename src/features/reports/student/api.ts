/**
 * PL: Rozmowa ekranów 4a z serwerem: wysłanie zgłoszenia, pobranie „Moich zgłoszeń”, lista podobnych zgłoszeń i dołączenie „Mnie też”. Adres to /api/reports/student (docs/ARCHITECTURE.md).
 * EN: The talk of the 4a screens with the server: sending a report, fetching "Moje zgłoszenia", the list of similar reports and joining "Me too". The address is /api/reports/student (docs/ARCHITECTURE.md).
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/reports/student/routes.ts::reportsStudentApp
 * @used_by src/features/reports/student/queries.ts::useSendReport
 * @used_by src/features/reports/student/queries.ts::useMyReports
 * @used_by src/features/reports/student/queries.ts::useSimilarReports
 * @used_by src/features/reports/student/queries.ts::useJoinReport
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

/** PL: Otwarte zgłoszenie podobne do nowego, bez numeru autora i bez listy osób, które dołączyły. EN: An open report similar to the new one, without the author id and without the list of people who joined. */
export type SimilarReport = {
  id: string;
  category: string;
  place: string;
  placeDetail: string | null;
  description: string;
  stage: string;
  createdAt: number;
  joinCount: number;
  joinedByMe: boolean;
};

/**
 * PL: Pobiera otwarte zgłoszenia tej samej kategorii i miejsca, do wyboru „Mnie też”.
 * EN: Fetches open reports of the same category and place, to choose "Me too".
 *
 * @param category - PL: kod kategorii z formularza. EN: the category code from the form.
 * @param place - PL: kod miejsca z formularza. EN: the place code from the form.
 * @returns PL: lista podobnych zgłoszeń (najwyżej pięć). EN: the list of similar reports (at most five).
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi. EN: a network error, or an error with the response code.
 */
export async function fetchSimilarReports(category: string, place: string): Promise<SimilarReport[]> {
  // PL: Kody idą w adresie; URLSearchParams zakoduje je poprawnie.
  // EN: The codes go in the address; URLSearchParams encodes them correctly.
  const query = new URLSearchParams({ category, place });
  const response = await fetch(`${API_URL}/similar?${query.toString()}`);
  // PL: Kod inny niż 2xx to błąd.
  // EN: A code other than 2xx is an error.
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return ((await response.json()) as { reports: SimilarReport[] }).reports;
}

/**
 * PL: Dołącza ucznia do cudzego, otwartego zgłoszenia („Mnie też”).
 * EN: Joins the student to someone else's open report ("Me too").
 *
 * @param reportId - PL: numer zgłoszenia. EN: the report id.
 * @returns PL: aktualna liczba dołączeń. EN: the current number of joins.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi (404, 409). EN: a network error, or an error with the response code (404, 409).
 */
export async function joinReport(reportId: string): Promise<number> {
  // PL: Wysyłamy samo POST na adres zgłoszenia; numer ucznia bierze serwer z sesji.
  // EN: We send only a POST to the report address; the server takes the student id from the session.
  const response = await fetch(`${API_URL}/${encodeURIComponent(reportId)}/join`, { method: 'POST' });
  // PL: Kod inny niż 2xx to błąd, który ekran pokaże uczniowi.
  // EN: A code other than 2xx is an error the screen shows to the student.
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return ((await response.json()) as { joinCount: number }).joinCount;
}
