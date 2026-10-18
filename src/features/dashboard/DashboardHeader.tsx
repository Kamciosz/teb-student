/**
 * PL: Nagłówek pulpitu w stylu aplikacji systemowej: duży tytuł „Dzisiaj”, a nad nim mały tekst z powitaniem i datą. Po prawej przycisk „Edytuj”, który włącza układanie sekcji, a w trakcie układania zmienia się w „Gotowe”.
 * EN: The dashboard header in the system app style: the large title "Dzisiaj", with a small text above it with the greeting and the date. On the right the "Edytuj" button, which turns on arranging the sections, and while arranging it changes to "Gotowe".
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/shared/index.ts::Button
 * @uses src/features/dashboard/format.ts::formatToday
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Wspólny nagłówek ekranu i przycisk tekstowy.
// EN: The shared screen header and the text button.
import { Button, ScreenHeader } from '../../shared';
// PL: Data nad tytułem.
// EN: The date above the title.
import { formatToday } from './format';

/** PL: Własności nagłówka pulpitu. EN: The properties of the dashboard header. */
export type DashboardHeaderProps = {
  /** PL: Czy trwa układanie sekcji. EN: Whether the sections are being arranged. */
  editing: boolean;
  /** PL: Przełącznik trybu układania. EN: The arranging mode toggle. */
  onToggleEdit: () => void;
};

/**
 * PL: Rysuje nagłówek pulpitu z przyciskiem „Edytuj” albo „Gotowe”.
 * EN: Draws the dashboard header with the "Edytuj" or "Gotowe" button.
 *
 * @param props - PL: tryb układania i przełącznik. EN: the arranging mode and the toggle.
 * @returns PL: nagłówek ekranu. EN: the screen header.
 */
export function DashboardHeader({ editing, onToggleEdit }: DashboardHeaderProps) {
  return (
    <ScreenHeader
      title="Dzisiaj"
      // PL: Dzisiejsza data z zegara telefonu w strefie szkoły. EN: Today's date from the phone clock in the school time zone.
      eyebrow={`Cześć · ${formatToday(new Date())}`}
      action={
        <Button variant="plain" onClick={onToggleEdit}>
          {editing ? 'Gotowe' : 'Edytuj'}
        </Button>
      }
    />
  );
}
