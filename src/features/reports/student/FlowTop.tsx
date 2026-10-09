/**
 * PL: Górny pasek ekranów 4a: przycisk zamknięcia, tytuł i numer kroku, a pod nim trzy paski postępu (ekrany 3.1–3.3 w docs/projekt/EKRANY.md).
 * EN: The top bar of the 4a screens: the close button, the title and the step number, with three progress bars below (screens 3.1–3.3 in docs/projekt/EKRANY.md).
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/icons.tsx::Icon
 * @used_by src/features/reports/student/ReportForm.tsx::FlowTop
 * @used_by src/features/reports/student/MyReports.tsx::FlowTop
 */

// PL: Link do innego ekranu bez przeładowania strony.
// EN: A link to another screen without reloading the page.
import { Link } from 'react-router';
// PL: Ikony.
// EN: The icons.
import { Icon, type IconName } from './icons';

/** PL: Dane górnego paska. EN: The data of the top bar. */
export type FlowTopProps = {
  /** PL: Tytuł ekranu. EN: The screen title. */
  title: string;
  /** PL: Numer kroku od 1 do 3; bez niego nie ma numeru ani pasków. EN: The step number from 1 to 3; without it there is no number and no bars. */
  step?: 1 | 2 | 3;
  /** PL: Dokąd prowadzi przycisk po lewej. EN: Where the left button leads. */
  to: string;
  /** PL: Ikona i nazwa przycisku po lewej. EN: The icon and the name of the left button. */
  button: { icon: IconName; label: string };
};

/**
 * PL: Rysuje górny pasek i, gdy jest krok, paski postępu.
 * EN: Draws the top bar and, when there is a step, the progress bars.
 *
 * @param props - PL: tytuł, krok i przycisk po lewej. EN: the title, the step and the left button.
 * @returns PL: drzewo elementów paska. EN: the tree of bar elements.
 */
export function FlowTop({ title, step, to, button }: FlowTopProps) {
  // PL: Zwróć pasek; paski postępu są ozdobą, więc czytniki ekranu je pomijają.
  // EN: Return the bar; the progress bars are decoration, so screen readers skip them.
  return (
    <>
      <div className="rs-top">
        <Link className="rs-icon-btn" to={to} aria-label={button.label}>
          <Icon name={button.icon} />
        </Link>
        <b>{title}</b>
        {step ? <span className="rs-step">{step}/3</span> : null}
      </div>
      {step ? (
        <div className="rs-bars" aria-hidden="true">
          {[1, 2, 3].map((position) => (
            <span key={position} className={position <= step ? 'rs-on' : undefined} />
          ))}
        </div>
      ) : null}
    </>
  );
}
