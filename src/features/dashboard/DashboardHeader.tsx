/**
 * PL: Górny rząd pulpitu: data i powitanie po lewej, licznik do dzwonka po prawej (docs/projekt/EKRANY.md, ekran 2.1). Kafelek prowadzi do ekranu /bell. Licznik pokazuje minuty, gdy trwa lekcja albo przerwa z planu. Gdy stanu nie ma (null), zostaje kreska, a napis zależy od planu: gdy plan dnia ma lekcje, „Po lekcjach” (do uzgodnienia z zespołem), a bez planu „Brak planu dzwonków”. Imienia ucznia też jeszcze nie ma: moduł logowania go nie wystawia, więc powitanie jest bez imienia.
 * EN: The top row of the dashboard: the date and the greeting on the left, the bell countdown on the right (docs/projekt/EKRANY.md, screen 2.1). The tile leads to the /bell screen. The countdown shows minutes when a lesson or a break from the plan is on. When there is no state (null), a dash stays and the text depends on the plan: "Po lekcjach" (to be agreed with the team) when the day's plan has lessons, and "Brak planu dzwonków" without a plan. There is no student name yet either: the sign-in module does not expose it, so the greeting has no name.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/format.ts::formatToday
 * @uses src/features/dashboard/useBellState.ts::useBellState
 * @uses src/features/bell/index.ts::BellState
 * @uses src/features/bell/index.ts::hasBellPlan
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Link do ekranu licznika bez przeładowania strony.
// EN: A link to the countdown screen without reloading the page.
import { Link } from 'react-router';
// PL: Data nad powitaniem.
// EN: The date above the greeting.
import { formatToday } from './format';
// PL: Typ stanu licznika i sprawdzenie, czy plan dnia ma lekcje, z drzwi modułu bell.
// EN: The countdown state type and the check whether the day's plan has lessons, from the bell module door.
import { hasBellPlan, type BellState } from '../bell';
// PL: Stan licznika odświeżany, gdy karta jest widoczna.
// EN: The countdown state, refreshed while the tab is visible.
import { useBellState } from './useBellState';

/** PL: Własności górnego rzędu. EN: The properties of the top row. */
type DashboardHeaderProps = {
  editing: boolean;
  onToggleEdit: () => void;
};

/**
 * PL: Rysuje treść licznika: minuty i „do dzwonka” albo, bez stanu, kreskę i napis: „Po lekcjach” przy planie, „Brak planu dzwonków” bez planu.
 * EN: Draws the content of the countdown: the minutes and "do dzwonka", or, without a state, a dash and the text: "Po lekcjach" with a plan, "Brak planu dzwonków" without one.
 *
 * @param props - PL: stan licznika albo null. EN: the countdown state or null.
 * @returns PL: elementy licznika. EN: the countdown elements.
 */
export function BellReadout({ state }: { state: BellState | null }) {
  if (state === null) {
    return (
      <>
        <p className="dash-bell__num" aria-hidden="true">
          –
        </p>
        {/* PL: „Po lekcjach” do uzgodnienia z zespołem. EN: "Po lekcjach" to be agreed with the team. */}
        <p className="dash-label">{hasBellPlan() ? 'Po lekcjach' : 'Brak planu dzwonków'}</p>
      </>
    );
  }
  return (
    <>
      <p className="dash-bell__num">{state.minutesLeft}</p>
      <p className="dash-label dash-label--ink">min</p>
      <p className="dash-label">do dzwonka</p>
    </>
  );
}

/**
 * PL: Rysuje górny rząd pulpitu. Przycisk „Zmień układ” włącza tryb układania kafelków, a „Gotowe” go kończy (napisy do ustalenia z zespołem).
 * EN: Draws the top row of the dashboard. The "Zmień układ" button turns on the tile arranging mode, and "Gotowe" ends it (labels to be agreed with the team).
 *
 * @param props - PL: tryb edycji i przełącznik. EN: the edit mode and the toggle.
 * @returns PL: rząd z datą, powitaniem, przyciskiem układu i licznikiem do dzwonka. EN: a row with the date, the greeting, the layout button and the bell countdown.
 */
export function DashboardHeader({ editing, onToggleEdit }: DashboardHeaderProps) {
  const bell = useBellState();
  return (
    <header className="dash-header">
      <div>
        {/* PL: Dzisiejsza data z zegara telefonu w strefie szkoły. EN: Today's date from the phone clock in the school time zone. */}
        <p className="dash-small">{formatToday(new Date())}</p>
        <h1>Cześć</h1>
        <button type="button" className="dash-button dash-edit-toggle" onClick={onToggleEdit}>
          {editing ? 'Gotowe' : 'Zmień układ'}
        </button>
      </div>
      {/* PL: Licznik do dzwonka jako link do /bell. EN: The bell countdown as a link to /bell. */}
      <Link to="/bell" className="dash-bell" aria-label="Licznik do dzwonka">
        <BellReadout state={bell} />
      </Link>
    </header>
  );
}
