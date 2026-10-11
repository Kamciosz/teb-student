/**
 * PL: Zapytanie o dane pulpitu z pamięcią podręczną. Wspólny dostawca zapytań (src/shared/query) zapisuje wynik w telefonie, więc bez internetu pulpit pokazuje ostatnio pobrane dane.
 * EN: The dashboard data query with a cache. The shared query provider (src/shared/query) saves the result on the phone, so without internet the dashboard shows the last fetched data.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/api.ts::fetchDashboard
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Zapytanie z pamięcią podręczną.
// EN: A query with a cache.
import { useQuery } from '@tanstack/react-query';
// PL: Funkcja pobierania.
// EN: The fetching function.
import { fetchDashboard } from './api';

/** PL: Jedno ponowienie przy błędzie, żeby uczeń nie czekał kilku sekund na komunikat. EN: One retry on an error, so the student does not wait several seconds for the message. */
const RETRIES = 1;

/**
 * PL: Hook z danymi pulpitu. Klucz zaczyna się od „dashboard”, więc nie koliduje z kluczami innych modułów.
 * EN: The hook with the dashboard data. The key starts with "dashboard", so it does not clash with the keys of other modules.
 *
 * @returns PL: wynik zapytania (dane, stan ładowania i błąd). EN: the query result (data, loading state and error).
 */
export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard, retry: RETRIES });
}
