/**
 * PL: Górny rząd pulpitu: data i powitanie po lewej, licznik do dzwonka po prawej (docs/projekt/EKRANY.md, ekran 2.1). Kafelek prowadzi do ekranu /bell. Drzwi podtoru 6 wystawiają licznik, ale nie plan dzwonków, więc pulpit nie wie, czy plan jest pusty. Dlatego pokazuje pusty stan. Imienia ucznia też jeszcze nie ma: moduł logowania go nie wystawia, więc powitanie jest bez imienia.
 * EN: The top row of the dashboard: the date and the greeting on the left, the bell countdown on the right (docs/projekt/EKRANY.md, screen 2.1). The tile leads to the /bell screen. The subtrack 6 door exposes the countdown but not the bell plan, so the dashboard cannot tell whether the plan is empty. That is why it shows the empty state. There is no student name yet either: the sign-in module does not expose it, so the greeting has no name.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/format.ts::formatToday
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Link do ekranu licznika bez przeładowania strony.
// EN: A link to the countdown screen without reloading the page.
import { Link } from 'react-router';
// PL: Data nad powitaniem.
// EN: The date above the greeting.
import { formatToday } from './format';

/** PL: Własności górnego rzędu. EN: The properties of the top row. */
type DashboardHeaderProps = {
  editing: boolean;
  onToggleEdit: () => void;
};

/**
 * PL: Rysuje górny rząd pulpitu. Przycisk „Zmień układ” włącza tryb układania kafelków, a „Gotowe” go kończy (napisy do ustalenia z zespołem).
 * EN: Draws the top row of the dashboard. The "Zmień układ" button turns on the tile arranging mode, and "Gotowe" ends it (labels to be agreed with the team).
 *
 * @param props - PL: tryb edycji i przełącznik. EN: the edit mode and the toggle.
 * @returns PL: rząd z datą, powitaniem, przyciskiem układu i pustym licznikiem do dzwonka. EN: a row with the date, the greeting, the layout button and the empty bell countdown.
 */
export function DashboardHeader({ editing, onToggleEdit }: DashboardHeaderProps) {
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
      {/* PL: Licznik do dzwonka jako link do /bell: kreska zamiast minut i napis, że planu jeszcze nie ma (napis do ustalenia z zespołem). EN: The bell countdown as a link to /bell: a dash instead of minutes and a label that there is no schedule yet (the label is to be agreed with the team). */}
      <Link to="/bell" className="dash-bell" aria-label="Licznik do dzwonka">
        <p className="dash-bell__num" aria-hidden="true">
          –
        </p>
        <p className="dash-label">Brak planu dzwonków</p>
      </Link>
    </header>
  );
}
