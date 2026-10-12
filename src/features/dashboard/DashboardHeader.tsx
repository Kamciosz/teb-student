/**
 * PL: Górny rząd pulpitu: data i powitanie po lewej, licznik do dzwonka po prawej (docs/projekt/EKRANY.md, ekran 2.1). Licznik robi podtor 6, a jego moduł jeszcze niczego nie wystawia, więc licznik pokazuje pusty stan. Imienia ucznia też jeszcze nie ma: moduł logowania go nie wystawia, więc powitanie jest bez imienia.
 * EN: The top row of the dashboard: the date and the greeting on the left, the bell countdown on the right (docs/projekt/EKRANY.md, screen 2.1). Subtrack 6 builds the countdown and its module exposes nothing yet, so the countdown shows the empty state. There is no student name yet either: the sign-in module does not expose it, so the greeting has no name.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/format.ts::formatToday
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Data nad powitaniem.
// EN: The date above the greeting.
import { formatToday } from './format';

/**
 * PL: Rysuje górny rząd pulpitu.
 * EN: Draws the top row of the dashboard.
 *
 * @returns PL: rząd z datą, powitaniem i pustym licznikiem do dzwonka. EN: a row with the date, the greeting and the empty bell countdown.
 */
export function DashboardHeader() {
  return (
    <header className="dash-header">
      <div>
        {/* PL: Dzisiejsza data z zegara telefonu w strefie szkoły. EN: Today's date from the phone clock in the school time zone. */}
        <p className="dash-small">{formatToday(new Date())}</p>
        <h1>Cześć</h1>
      </div>
      {/* PL: Pusty licznik do dzwonka: kreska zamiast minut i napis, że planu jeszcze nie ma (napis do ustalenia z zespołem). EN: The empty bell countdown: a dash instead of minutes and a label that there is no schedule yet (the label is to be agreed with the team). */}
      <div className="dash-bell" aria-label="Licznik do dzwonka">
        <p className="dash-bell__num" aria-hidden="true">
          –
        </p>
        <p className="dash-label">Brak planu dzwonków</p>
      </div>
    </header>
  );
}
