/**
 * PL: Przełącznik „Lekcje skrócone dziś” na ekranie dzwonka, widoczny tylko dla Samorządu. Włącza albo wyłącza skrócony plan na dzisiejszy dzień. Odmowa serwera (403) i inny błąd zapisu pokazują komunikat pod przełącznikiem.
 * EN: The "Lekcje skrócone dziś" (shortened lessons today) switch on the bell screen, shown only to the Student Council. It turns the shortened plan on or off for today. A refusal from the server (403) and any other save error show a message under the switch.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/shortenedQueries.ts::useShortenedDays
 * @uses src/features/bell/shortenedQueries.ts::useSetShortenedDay
 * @uses src/features/bell/shortenedApi.ts::BellHttpError
 * @uses src/features/bell/bellState.ts::warsawDate
 * @used_by src/features/bell/BellScreen.tsx::BellScreen
 */

// PL: Połączenie z zapytaniem o dni skrócone i z zapisem dnia.
// EN: The link to the shortened days query and to saving a day.
import { useSetShortenedDay, useShortenedDays } from './shortenedQueries';
// PL: Błąd z kodem HTTP z serwera i dzień w strefie szkoły.
// EN: The HTTP-code error from the server and the day in the school zone.
import { BellHttpError } from './shortenedApi';
import { warsawDate } from './bellState';

// PL: Napis przy przełączniku. TO_AGREE: tekstu nie ma w EKRANY.md, uzgodnić z Samorządem.
// EN: The label next to the switch. TO_AGREE: the text is not in EKRANY.md, to be agreed with the Student Council.
const LABEL = 'Lekcje skrócone dziś';
// PL: Komunikat, gdy serwer odmówi (403, brak roli Samorządu). TO_AGREE: uzgodnić brzmienie.
// EN: The message when the server refuses (403, no Student Council role). TO_AGREE: the wording to be agreed.
const REFUSED_TEXT = 'Tylko Samorząd może zmienić dzień skrócony.';
// PL: Komunikat przy każdym innym błędzie zapisu. TO_AGREE: uzgodnić brzmienie.
// EN: The message for any other save error. TO_AGREE: the wording to be agreed.
const FAILED_TEXT = 'Nie udało się zapisać. Sprawdź połączenie i spróbuj ponownie.';

/**
 * PL: Zamienia błąd zapisu na komunikat dla Samorządu. Odmowa 403 ma własny tekst, reszta ogólny.
 * EN: Turns a save error into a message for the Council. A 403 refusal has its own text, the rest a general one.
 *
 * @param error - PL: błąd z mutacji (może być dowolny). EN: the error from the mutation (may be anything).
 * @returns PL: komunikat do pokazania. EN: the message to show.
 */
export function errorTextFor(error: unknown): string {
  // PL: Tylko błąd z kodem 403 znaczy brak roli; inne kody i błąd sieci to zwykła porażka zapisu.
  // EN: Only an error with code 403 means no role; other codes and a network error are a plain save failure.
  return error instanceof BellHttpError && error.status === 403 ? REFUSED_TEXT : FAILED_TEXT;
}

/**
 * PL: Props przełącznika bez danych z serwera: stan i funkcje od rodzica. Dzięki temu da się go narysować w teście bez sieci.
 * EN: Props of the switch without server data: the state and the functions come from the parent. This way it can be drawn in a test without a network.
 */
export type ShortenedDayToggleProps = {
  /** PL: Czy dzisiaj jest dzień skrócony. EN: Whether today is a shortened day. */
  checked: boolean;
  /** PL: Czy trwa zapis; wtedy przełącznik jest zablokowany. EN: Whether saving is in progress; then the switch is disabled. */
  busy: boolean;
  /** PL: Komunikat błędu albo null. EN: The error message or null. */
  error: string | null;
  /** PL: Wywoływane z nowym stanem po kliknięciu. EN: Called with the new state after a click. */
  onToggle: (shortened: boolean) => void;
};

/**
 * PL: Rysuje przełącznik z etykietą i ewentualnym komunikatem błędu. Nie wie nic o sieci.
 * EN: Draws the switch with its label and a possible error message. It knows nothing about the network.
 *
 * @param props - PL: stan, zajętość, błąd i funkcja zmiany. EN: the state, busy flag, error and the change function.
 * @returns PL: element przełącznika. EN: the switch element.
 */
export function ShortenedDayToggle({ checked, busy, error, onToggle }: ShortenedDayToggleProps) {
  return (
    <div className="bell-shortened">
      {/* PL: Etykieta opakowuje przełącznik, więc czytnik podaje jej nazwę. EN: The label wraps the switch, so a screen reader reads its name. */}
      <label className="bell-shortened__row">
        <span>{LABEL}</span>
        {/* PL: Zwykłe pole wyboru z rolą przełącznika. Podczas zapisu zablokowane, żeby nie wysłać dwóch zmian naraz. EN: A plain checkbox with the switch role. Disabled while saving, so two changes are not sent at once. */}
        <input type="checkbox" role="switch" checked={checked} disabled={busy} onChange={(event) => onToggle(event.currentTarget.checked)} />
      </label>
      {/* PL: Komunikat błędu z rolą alert, żeby czytnik od razu go ogłosił. EN: The error message with the alert role, so a screen reader announces it at once. */}
      {error ? <p role="alert" className="bell-shortened__error">{error}</p> : null}
    </div>
  );
}

/**
 * PL: Przełącznik podłączony do serwera: pokazuje, czy dzisiaj jest skrócony plan, i zapisuje zmianę.
 * EN: The switch connected to the server: shows whether today has the shortened plan, and saves the change.
 *
 * @returns PL: przełącznik z danymi. EN: the switch with the data.
 */
export function ShortenedDaySwitch() {
  // PL: Dzisiejszy dzień w strefie szkoły; to na niego działa przełącznik.
  // EN: Today's day in the school zone; the switch works on it.
  const day = warsawDate(new Date());
  const shortenedDays = useShortenedDays();
  const mutation = useSetShortenedDay();
  return (
    <ShortenedDayToggle
      checked={shortenedDays.has(day)}
      busy={mutation.isPending}
      error={mutation.isError ? errorTextFor(mutation.error) : null}
      onToggle={(shortened) => mutation.mutate({ day, shortened })}
    />
  );
}
