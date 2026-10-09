/**
 * PL: Jedyny QueryClient aplikacji i ustawienia zapisu danych w telefonie: klucz w localStorage, czas ważności zapisu i wersja formatu danych (buster). Wszystkie ekrany podtorów używają tego samego klienta (przez useQuery), więc nie tworzą własnych.
 * EN: The app's only QueryClient and the settings for saving data on the phone: the localStorage key, the lifetime of the saved data and the data format version (buster). All subtrack screens use the same client (through useQuery), so they create none of their own.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by src/shared/query/persistence.ts::createQueryPersister
 * @used_by src/shared/query/AppQueryProvider.tsx::AppQueryProvider
 * @used_by src/shared/query/clearQueryData.ts::clearQueryData
 */

// PL: QueryClient trzyma pamięć podręczną zapytań w pamięci telefonu.
// EN: QueryClient keeps the query cache in the phone's memory.
import { QueryClient } from '@tanstack/react-query';

/**
 * PL: Jak długo zapisane dane są ważne: 24 godziny. Plan aplikacji nie podaje czasu, więc to wartość robocza (pytanie w pull requeście). Po tym czasie zapis jest odrzucany przy starcie.
 * EN: How long the saved data stays valid: 24 hours. The app plan gives no time, so this is a working value (a question in the pull request). After this time the saved data is dropped at start.
 */
export const QUERY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * PL: Wersja formatu zapisanych danych (buster). Zwiększ ją, gdy zmieni się kształt odpowiedzi z serwera: telefon odrzuci wtedy stary zapis zamiast pokazać błędne dane. Repozytorium nie ma numeru wersji aplikacji, więc to osobny numer (pytanie w pull requeście).
 * EN: The version of the saved data format (buster). Raise it when the shape of a server response changes: the phone then drops the old saved data instead of showing wrong data. The repository has no app version number, so this is a separate number (a question in the pull request).
 */
export const QUERY_CACHE_BUSTER = '1';

/**
 * PL: Klucz w localStorage, pod którym leżą zapisane dane zapytań.
 * EN: The localStorage key under which the saved query data lives.
 */
export const QUERY_STORAGE_KEY = 'teb-student-query-cache';

/**
 * PL: Jedyny klient zapytań. gcTime nie może być krótszy niż czas zapisu, bo TanStack Query wyrzuciłby dane z pamięci, zanim zapis by wygasł.
 * EN: The only query client. gcTime must not be shorter than the saved-data lifetime, because TanStack Query would drop the data from memory before the saved copy expires.
 */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: QUERY_MAX_AGE_MS } },
});
