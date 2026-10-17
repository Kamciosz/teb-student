/**
 * PL: Kafel „Ankieta”: ankieta do wypełnienia z liczbą dni do końca i przyciskiem „Wypełnij”, który prowadzi do tej ankiety. Bez ankiety kafel mówi, że nic nie ma (docs/projekt/EKRANY.md, ekran 2.1).
 * EN: The "Ankieta" tile: a survey to fill in with the number of days left and the "Wypełnij" button that leads to that survey. Without a survey the tile says there is nothing (docs/projekt/EKRANY.md, screen 2.1).
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/format.ts::daysLeftLabel
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Link do ekranu ankiety bez przeładowania strony.
// EN: A link to the survey screen without reloading the page.
import { Link } from 'react-router';
// PL: Podpis pod liczbą dni.
// EN: The caption under the day count.
import { daysLeftLabel } from './format';
// PL: Typ danych kafla.
// EN: The tile data type.
import type { DashboardSurvey } from './types';

/**
 * PL: Dane kafla „Ankieta”.
 * EN: The data of the "Ankieta" tile.
 */
export type SurveyTileProps = {
  /** PL: Ankieta do wypełnienia albo null, gdy żadnej nie ma. EN: The survey to fill in, or null when there is none. */
  survey: DashboardSurvey | null;
};

/**
 * PL: Rysuje kafel „Ankieta” z ankietą albo z pustym stanem.
 * EN: Draws the "Ankieta" tile with a survey or with the empty state.
 *
 * @param props - PL: ankieta do pokazania. EN: the survey to show.
 * @returns PL: kafel z przyciskiem „Wypełnij” albo kafel z napisem o braku ankiet. EN: a tile with the "Wypełnij" button, or a tile with a label about no surveys.
 */
export function SurveyTile({ survey }: SurveyTileProps) {
  // PL: Bez ankiety do wypełnienia kafel mówi to wprost.
  // EN: Without a survey to fill in, the tile says so plainly.
  if (survey === null) {
    return (
      <section className="dash-tile" aria-label="Ankieta">
        <p className="dash-label">Ankieta</p>
        <p className="dash-empty">Nie ma ankiet do wypełnienia.</p>
      </section>
    );
  }

  // PL: Liczba dni do końca, podpis, tytuł ankiety i przycisk, który prowadzi do ankiety.
  // EN: The day count, the caption, the survey title and the button that leads to the survey.
  return (
    <section className="dash-tile dash-tile--split" aria-label="Ankieta">
      <div>
        <p className="dash-label">Ankieta</p>
        <p className="dash-num">{survey.daysLeft}</p>
        <p className="dash-label dash-label--ink">{daysLeftLabel(survey.daysLeft)}</p>
      </div>
      <div className="dash-bottom">
        <p className="dash-small">{survey.title}</p>
        <Link className="dash-button" to={`/surveys/vote/${encodeURIComponent(survey.id)}`}>
          Wypełnij
        </Link>
      </div>
    </section>
  );
}
