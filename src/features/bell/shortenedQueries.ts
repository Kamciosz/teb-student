/**
 * PL: Zapytania TanStack Query dla dni skróconych: lista dla ekranu dzwonka (uczeń i Samorząd) i zapis dnia dla Samorządu. Lista ma klucz z dniem, więc zostaje w pamięci podręcznej na dzień; po zapisie odświeżamy ją we wszystkich dniach.
 * EN: TanStack Query hooks for shortened days: the list for the bell screen (student and Council) and saving a day for the Council. The list has a key with the day, so it stays in the cache per day; after saving we refresh it for all days.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/shortenedApi.ts::fetchShortenedDays
 * @uses src/features/bell/shortenedApi.ts::setShortenedDay
 * @uses src/features/bell/bellState.ts::warsawDate
 * @used_by src/features/bell/BellScreen.tsx::BellScreen
 * @used_by src/features/bell/ShortenedDaySwitch.tsx::ShortenedDaySwitch
 */

// PL: Hooki zapytań i mutacji TanStack Query oraz dostęp do klienta zapytań.
// EN: The TanStack Query query and mutation hooks and access to the query client.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchShortenedDays, setShortenedDay, type ShortenedDaysResponse } from './shortenedApi';
import { warsawDate } from './bellState';

// PL: Klucz listy dni skróconych w pamięci podręcznej. Pierwszy element wspólny, żeby odświeżyć wszystkie dni naraz.
// EN: The key of the shortened days list in the cache. The first element is shared, so all days can be refreshed at once.
const SHORTENED_KEY = ['bell', 'shortened'] as const;

// PL: Ile czasu lista jest świeża, zanim przy następnym otwarciu ekranu zapyta serwer ponownie (10 minut).
// EN: How long the list is fresh before the screen asks the server again on the next open (10 minutes).
const FRESH_MS = 10 * 60_000;

// PL: Ile razy ponawiamy nieudane pobranie. Jak w zapytaniach wpisów: odmowa nie mija po ponowieniu, a licznik nie ma czekać.
// EN: How many times a failed fetch is retried. As in the news queries: a refusal does not go away on retry, and the countdown should not wait.
const RETRIES = 1;

// PL: Pusty zbiór dni: używany, gdy lista jeszcze się nie wczytała albo jest niedostępna. Zwykły plan jest wtedy bezpieczny.
// EN: The empty set of days: used when the list has not loaded yet or is unavailable. The regular plan is safe then.
const NO_DAYS: ReadonlySet<string> = new Set();

/**
 * PL: Zamienia odpowiedź serwera na zbiór dni, żeby sprawdzenie „czy dzień jest skrócony” było szybkie. Zbiór powstaje dopiero tu, bo w pamięci telefonu zapisujemy zwykłą listę.
 * EN: Turns the server answer into a set of days, so the check "is this day shortened" is quick. The set is built only here, because the phone's memory keeps the plain list.
 *
 * @param response - PL: odpowiedź z listą dni. EN: the answer with the list of days.
 * @returns PL: zbiór dni RRRR-MM-DD. EN: the set of days as YYYY-MM-DD.
 */
function toDaySet(response: ShortenedDaysResponse): ReadonlySet<string> {
  return new Set(response.dates);
}

/**
 * PL: Czyta listę dni skróconych dla ekranu dzwonka. Bez internetu zostaje ostatnio zapisana lista; bez niej zwraca pusty zbiór, więc licznik idzie zwykłym planem.
 * EN: Reads the list of shortened days for the bell screen. Without internet the last saved list stays; without it, it returns an empty set, so the countdown uses the regular plan.
 *
 * @returns PL: zbiór dni skróconych (pusty, gdy brak danych). EN: the set of shortened days (empty when there is no data).
 */
export function useShortenedDays(): ReadonlySet<string> {
  // PL: Klucz z dzisiejszym dniem w strefie szkoły: nowy dzień to nowe zapytanie, czyli świeża lista.
  // EN: The key with today's day in the school zone: a new day means a new query, so a fresh list.
  const day = warsawDate(new Date());
  const { data } = useQuery({
    queryKey: [...SHORTENED_KEY, day],
    queryFn: fetchShortenedDays,
    select: toDaySet,
    staleTime: FRESH_MS,
    retry: RETRIES,
  });
  // PL: Brak danych (błąd, offline bez zapisu, jeszcze się ładuje): zwykły plan.
  // EN: No data (an error, offline without a save, still loading): the regular plan.
  return data ?? NO_DAYS;
}

/**
 * PL: Zapisuje albo zdejmuje dzień skrócony. Wymaga internetu, więc mutacja nie czeka w kolejce, tylko od razu próbuje. Po zakończeniu (także po błędzie) odświeża listę, bo stan na serwerze mógł się zmienić.
 * EN: Saves or removes a shortened day. It needs internet, so the mutation does not wait in a queue but tries at once. When it ends (also after an error) it refreshes the list, because the state on the server may have changed.
 *
 * @returns PL: mutacja, której `mutate` przyjmuje dzień i flagę; błąd niesie kod HTTP. EN: a mutation whose `mutate` takes the day and the flag; the error carries the HTTP code.
 */
export function useSetShortenedDay() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ day, shortened }: { day: string; shortened: boolean }) => setShortenedDay(day, shortened),
    networkMode: 'always',
    onSettled: () => client.invalidateQueries({ queryKey: SHORTENED_KEY }),
  });
}
