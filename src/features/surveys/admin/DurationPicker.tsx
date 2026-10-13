/**
 * PL: „Czas trwania” na ekranie 6.5b: pasek wyboru „3 dni”, „7 dni”, „14 dni” (zwykłe przyciski opcji, więc działa z klawiatury i czytnikiem ekranu) i podpis z ostatnim dniem ankiety. Ostatni dzień liczy się od dnia publikacji w czasie polskim, a zapisuje go serwer.
 * EN: The "Czas trwania" (duration) on screen 6.5b: the choice bar "3 dni", "7 dni", "14 dni" (plain radio buttons, so it works from the keyboard and a screen reader) and the caption with the last day of the survey. The last day counts from the publication day in Polish time, and the server writes it.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/format.ts::lastDayLabel
 * @used_by src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 */

import { DURATION_CHOICES } from './draft';
import { lastDayLabel } from './format';

/**
 * PL: Rysuje pasek wyboru czasu trwania i podpis z ostatnim dniem.
 * EN: Draws the duration choice bar and the caption with the last day.
 *
 * @param props - PL: wybrany czas trwania i funkcja jego zmiany. EN: the chosen duration and the function that changes it.
 * @returns PL: pole z paskiem wyboru. EN: the field with the choice bar.
 */
export function DurationPicker({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  return (
    <fieldset className="sa-duration">
      <legend className="sa-label">Czas trwania</legend>
      <div className="sa-segment">
        {DURATION_CHOICES.map((days) => (
          <label key={days} className="sa-segment__choice">
            {/* PL: Prawdziwy przycisk opcji jest ukryty wizualnie, a rysujemy napis obok niego. EN: The real radio button is visually hidden, and we draw the label next to it. */}
            <input type="radio" name="duration" value={days} checked={value === days} onChange={() => onChange(days)} />
            <span className="sa-segment__text">{`${days} dni`}</span>
          </label>
        ))}
      </div>
      <p className="sa-small">{`Ostatni dzień: ${lastDayLabel(new Date(), value)}. Po publikacji pytań nie zmienisz.`}</p>
    </fieldset>
  );
}
