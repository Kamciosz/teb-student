/**
 * PL: Ekran „Wysłane” po zgłoszeniu (ekran 3.4): potwierdzenie i dwa przyciski, powrót na pulpit oraz „Moje zgłoszenia”.
 * EN: The "Wysłane" (sent) screen after a report (screen 3.4): the confirmation and two buttons, back to the dashboard and "Moje zgłoszenia".
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/icons.tsx::Icon
 * @used_by src/features/reports/student/ReportForm.tsx::ReportSent
 */

// PL: Linki do innych ekranów bez przeładowania.
// EN: Links to other screens without reloading.
import { Link } from 'react-router';
// PL: Ikony.
// EN: The icons.
import { Icon } from './icons';

/**
 * PL: Rysuje potwierdzenie. „Moje zgłoszenia” to przycisk dodatkowy (nie ma go w makiecie 3.4), bo uczeń musi mieć jak zobaczyć etap, a pulpit (podtor 9) jeszcze go nie pokazuje.
 * EN: Draws the confirmation. "Moje zgłoszenia" is an extra button (it is not in the 3.4 mockup), because the student needs a way to see the stage, and the dashboard (subtrack 9) does not show it yet.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ReportSent() {
  // PL: Nagłówek dostaje fokus, żeby czytnik ekranu odczytał potwierdzenie.
  // EN: The heading gets focus, so a screen reader reads the confirmation.
  return (
    <>
      <div className="rs-done">
        <div className="rs-big-check">
          <Icon name="check" />
        </div>
        <h1 ref={(element) => element?.focus()} tabIndex={-1}>Wysłane</h1>
        <p>Zgłoszenie trafiło do Samorządu Uczniowskiego. Status zobaczysz na pulpicie.</p>
      </div>
      <div className="rs-cta">
        <Link className="rs-btn rs-btn-soft" to="/reports/student/moje">Moje zgłoszenia</Link>
        <Link className="rs-btn rs-btn-accent" to="/">
          Wróć na pulpit
          <Icon name="arrow-right" />
        </Link>
      </div>
    </>
  );
}
