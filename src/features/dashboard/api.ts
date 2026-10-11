/**
 * PL: Pobieranie danych pulpitu z serwera (GET /api/dashboard).
 * EN: Fetching the dashboard data from the server (GET /api/dashboard).
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/types.ts::DashboardData
 * @used_by src/features/dashboard/queries.ts::useDashboard
 */

// PL: Typ odpowiedzi.
// EN: The answer type.
import type { DashboardData } from './types';

/** PL: Adres serwera pulpitu (worker/mounts.ts). EN: The address of the dashboard server (worker/mounts.ts). */
const API_URL = '/api/dashboard';

/**
 * PL: Pobiera dane wszystkich kafelków jednym zapytaniem.
 * EN: Fetches the data of all tiles with one request.
 *
 * @returns PL: dane pulpitu. EN: the dashboard data.
 * @throws PL: Error, gdy serwer odpowie błędem albo nie ma sieci (fetch rzuca wtedy sam). EN: an Error when the server answers with an error or there is no network (fetch itself throws then).
 */
export async function fetchDashboard(): Promise<DashboardData> {
  // PL: Zapytaj serwer. Ciasteczko sesji dołącza przeglądarka.
  // EN: Ask the server. The browser attaches the session cookie.
  const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });

  // PL: Odpowiedź z błędem to błąd, żeby ekran pokazał komunikat albo zapisane dane.
  // EN: An error answer is an error, so the screen shows the message or the saved data.
  if (!response.ok) throw new Error(`Dashboard API error ${response.status}`);
  return (await response.json()) as DashboardData;
}
