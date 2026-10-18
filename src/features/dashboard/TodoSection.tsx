/**
 * PL: Sekcja „Do zrobienia” na pulpicie: jedna grupa wierszy z ankietą do wypełnienia i zgłoszeniem ucznia. Ankieta jest pierwsza, bo ma termin. Gdy nie ma ani ankiety, ani zgłoszenia, sekcji nie ma wcale.
 * EN: The "Do zrobienia" (To do) section on the dashboard: one group of rows with a survey to fill in and the student's report. The survey comes first, because it has a deadline. When there is neither a survey nor a report, the section is not shown at all.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/features/dashboard/format.ts::surveyDeadlineText
 * @uses src/features/dashboard/types.ts::DashboardSurvey
 * @uses src/features/dashboard/types.ts::DashboardReport
 * @used_by src/features/dashboard/Sections.tsx::Sections
 */

// PL: Grupa wierszy w stylu iOS i wiersz z tytułem, podpisem i wartością.
// EN: The iOS-style group of rows and the row with a title, a caption and a value.
import { ListGroup, ListRow } from '../../shared';
// PL: Termin ankiety jako tekst.
// EN: The survey deadline as a text.
import { surveyDeadlineText } from './format';
// PL: Typy ankiety i zgłoszenia.
// EN: The survey and report types.
import type { DashboardReport, DashboardSurvey } from './types';

// PL: Nazwy etapów zgłoszenia, od 1 do 3, jak w module zgłoszeń.
// EN: The report stage names, from 1 to 3, as in the reports module.
const STAGE_NAMES: Record<number, string> = {
  1: 'Przyjęte',
  2: 'W trakcie',
  3: 'Załatwione',
};

/** PL: Własności sekcji „Do zrobienia”. EN: The properties of the "Do zrobienia" section. */
export type TodoSectionProps = {
  /** PL: Ankieta do wypełnienia albo null. EN: A survey to fill in, or null. */
  survey: DashboardSurvey | null;
  /** PL: Zgłoszenie ucznia albo null. EN: The student's report, or null. */
  report: DashboardReport | null;
};

/**
 * PL: Rysuje sekcję „Do zrobienia” z wierszami ankiety i zgłoszenia. Bez obu pozycji nic nie rysuje.
 * EN: Draws the "Do zrobienia" section with the survey and report rows. Without both items it draws nothing.
 *
 * @param props - PL: ankieta i zgłoszenie, każde albo null. EN: the survey and the report, each or null.
 * @returns PL: grupa wierszy albo null. EN: the group of rows or null.
 */
export function TodoSection({ survey, report }: TodoSectionProps) {
  if (survey === null && report === null) return null;
  return (
    <ListGroup header="Do zrobienia">
      {survey === null ? null : (
        <ListRow
          title={survey.title}
          subtitle="Ankieta"
          // PL: W dniu zamknięcia termin podświetlamy akcentem, żeby uczeń go nie przegapił.
          // EN: On the closing day the deadline gets the accent, so the student does not miss it.
          value={survey.daysLeft <= 0 ? <span className="dash-accent">dziś</span> : surveyDeadlineText(survey.daysLeft)}
          to={`/surveys/vote/${encodeURIComponent(survey.id)}`}
        />
      )}
      {report === null ? null : (
        <ListRow title={report.description} subtitle="Zgłoszenie" value={STAGE_NAMES[report.stage] ?? ''} to="/reports/student/moje" />
      )}
    </ListGroup>
  );
}
