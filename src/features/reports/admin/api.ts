/**
 * PL: Rozmowa ekranów 4b z serwerem: lista zgłoszeń, jedno zgłoszenie z historią i zmiana etapu. Adres to /api/reports/admin (docs/ARCHITECTURE.md). Serwer nie wysyła numeru autora, więc tu go nie ma. Przy zgłoszeniu nieanonimowym wysyła tylko imię i klasę autora.
 * EN: The talk of the 4b screens with the server: the report list, one report with its history and the stage change. The address is /api/reports/admin (docs/ARCHITECTURE.md). The server does not send the author id, so it is not here. For a signed report it sends only the author's name and class.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/reports/admin/routes.ts::createReportsAdminApp
 * @used_by src/features/reports/admin/queries.ts::useAdminReports
 * @used_by src/features/reports/admin/queries.ts::useAdminReport
 * @used_by src/features/reports/admin/queries.ts::useChangeStage
 */

/** PL: Adres routera serwera. EN: The server router address. */
const API_URL = '/api/reports/admin';

/** PL: Zgłoszenie w panelu (bez autora). EN: A report in the panel (without the author). */
export type AdminReport = {
  id: string;
  isAnonymous: boolean;
  category: string;
  place: string;
  placeDetail: string | null;
  description: string;
  stage: string;
  createdAt: number;
  updatedAt: number;
};

/** PL: Jeden wiersz historii etapów. EN: One row of the stage history. */
export type StageChange = { stage: string; changedAt: number };

/** PL: Imię i klasa autora zgłoszenia nieanonimowego. EN: The name and class of the author of a signed report. */
export type AdminStudent = { name: string; className: string };

/** PL: Zgłoszenie z historią etapów, od najnowszego, i autor (tylko przy zgłoszeniu nieanonimowym). EN: A report with its stage history, newest first, and the author (only for a signed report). */
export type AdminReportDetail = { report: AdminReport; history: StageChange[]; student: AdminStudent | null };

/**
 * PL: Odczytuje JSON odpowiedzi albo rzuca błąd z kodem odpowiedzi.
 * EN: Reads the response JSON or throws an error with the response code.
 *
 * @param response - PL: odpowiedź serwera. EN: the server response.
 * @returns PL: treść JSON. EN: the JSON body.
 * @throws PL: błąd z kodem odpowiedzi, gdy odpowiedź nie jest udana. EN: an error with the response code when the response is not successful.
 */
async function readJson<T>(response: Response): Promise<T> {
  // PL: Błąd odpowiedzi (na przykład 403 bez roli) trafia do zapytania jako błąd.
  // EN: A response error (for example 403 without a role) reaches the query as an error.
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
}

/**
 * PL: Pobiera wszystkie zgłoszenia, od najnowszego.
 * EN: Fetches all reports, newest first.
 *
 * @returns PL: lista zgłoszeń. EN: the list of reports.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi (403 bez roli Samorządu). EN: a network error, or an error with the response code (403 without the Student Council role).
 */
export async function fetchAdminReports(): Promise<AdminReport[]> {
  // PL: Odczytaj listę z pola `reports`.
  // EN: Read the list from the `reports` field.
  return (await readJson<{ reports: AdminReport[] }>(await fetch(API_URL))).reports;
}

/**
 * PL: Pobiera jedno zgłoszenie z historią etapów.
 * EN: Fetches one report with its stage history.
 *
 * @param id - PL: numer zgłoszenia. EN: the report id.
 * @returns PL: zgłoszenie i historia. EN: the report and the history.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi. EN: a network error, or an error with the response code.
 */
export async function fetchAdminReport(id: string): Promise<AdminReportDetail> {
  // PL: Numer idzie do adresu po zakodowaniu, żeby nie zmienił ścieżki.
  // EN: The id goes into the address encoded, so it cannot change the path.
  return readJson<AdminReportDetail>(await fetch(`${API_URL}/${encodeURIComponent(id)}`));
}

/**
 * PL: Zmienia etap zgłoszenia.
 * EN: Changes a report's stage.
 *
 * @param change - PL: numer zgłoszenia i nowy etap. EN: the report id and the new stage.
 * @returns PL: zgłoszenie z nową historią. EN: the report with its new history.
 * @throws PL: błąd sieci albo błąd z kodem odpowiedzi. EN: a network error, or an error with the response code.
 */
export async function changeReportStage(change: { id: string; stage: string }): Promise<AdminReportDetail> {
  // PL: Wyślij tylko etap; kto zmienia, serwer bierze z sesji.
  // EN: Send only the stage; the server takes who changes it from the session.
  const init = { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ stage: change.stage }) };
  return readJson<AdminReportDetail>(await fetch(`${API_URL}/${encodeURIComponent(change.id)}`, init));
}
