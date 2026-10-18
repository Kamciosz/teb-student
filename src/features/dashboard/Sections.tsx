/**
 * PL: Sekcje pulpitu w zapisanej kolejności. W trybie „Edytuj” pod każdą sekcją są przyciski „Wyżej” i „Niżej”, a na krawędziach są wyłączone. Sekcja „Do zrobienia” pojawia się tylko wtedy, gdy jest w niej ankieta albo zgłoszenie, więc w sprawdzaniu krawędzi liczymy tylko widoczne sekcje.
 * EN: The dashboard sections in the saved order. In the "Edytuj" mode there are "Wyżej" and "Niżej" buttons under each section, and they are disabled at the edges. The "Do zrobienia" section appears only when it has a survey or a report, so the edge check counts only the visible sections.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/shared/index.ts::Button
 * @uses src/features/dashboard/TodoSection.tsx::TodoSection
 * @uses src/features/dashboard/InfoSection.tsx::InfoSection
 * @uses src/features/dashboard/tileOrder.ts::SectionId
 * @uses src/features/dashboard/tileOrder.ts::SECTION_NAMES
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Przycisk tekstowy do „Wyżej” i „Niżej”.
// EN: The text button for "Wyżej" and "Niżej".
import { Button } from '../../shared';
// PL: Obie sekcje i ich nazwy.
// EN: Both sections and their names.
import { InfoSection } from './InfoSection';
import { TodoSection } from './TodoSection';
import { SECTION_NAMES, type SectionId } from './tileOrder';
// PL: Dane pulpitu.
// EN: The dashboard data.
import type { DashboardData } from './types';

/** PL: Własności listy sekcji. EN: The properties of the sections list. */
export type SectionsProps = {
  /** PL: Kolejność sekcji. EN: The order of the sections. */
  order: readonly SectionId[];
  /** PL: Dane pulpitu albo undefined, gdy jeszcze ich nie ma. EN: The dashboard data, or undefined when there is none yet. */
  data: DashboardData | undefined;
  /** PL: Czy trwa układanie sekcji. EN: Whether the sections are being arranged. */
  editing: boolean;
  /** PL: Przesunięcie sekcji o jedno miejsce. EN: Moves a section by one place. */
  onMove: (id: SectionId, step: -1 | 1) => void;
};

/**
 * PL: Rysuje sekcje w zapisanej kolejności, z przyciskami przesuwania w trybie edycji.
 * EN: Draws the sections in the saved order, with the move buttons in the edit mode.
 *
 * @param props - PL: kolejność, dane, tryb i przesuwanie. EN: the order, the data, the mode and moving.
 * @returns PL: lista sekcji. EN: the list of sections.
 */
export function Sections({ order, data, editing, onMove }: SectionsProps) {
  // PL: Sekcja „Do zrobienia” jest widoczna tylko z ankietą albo zgłoszeniem.
  // EN: The "Do zrobienia" section is visible only with a survey or a report.
  const survey = data?.survey ?? null;
  const report = data?.report ?? null;
  const visible = order.filter((id) => id !== 'zrobienia' || survey !== null || report !== null);

  return (
    <>
      {visible.map((id, index) => (
        <div key={id} className="dash-section">
          {id === 'zrobienia' ? <TodoSection survey={survey} report={report} /> : <InfoSection rows={data?.announcements ?? []} />}
          {editing ? (
            <div className="dash-move">
              <Button
                variant="plain"
                className="dash-move__btn"
                aria-label={`Wyżej: ${SECTION_NAMES[id]}`}
                disabled={index === 0}
                onClick={() => onMove(id, -1)}
              >
                Wyżej
              </Button>
              <Button
                variant="plain"
                className="dash-move__btn"
                aria-label={`Niżej: ${SECTION_NAMES[id]}`}
                disabled={index === visible.length - 1}
                onClick={() => onMove(id, 1)}
              >
                Niżej
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </>
  );
}
