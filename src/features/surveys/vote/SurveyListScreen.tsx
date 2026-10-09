/**
 * PL: Ekran 4.1 „Lista ankiet” (docs/projekt/EKRANY.md): trwające ankiety z liczbą dni do końca, wypełnione z oznaczeniem i zakończone. Pobiera listę z serwera i niczego nie zmienia.
 * EN: Screen 4.1 "Lista ankiet" (docs/projekt/EKRANY.md): running surveys with the days left, filled ones with a mark, and ended ones. Fetches the list from the server and changes nothing.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/surveyApi.ts::fetchSurveyList
 * @uses src/shared/index.ts::Dock
 * @used_by src/features/surveys/vote/SurveysVoteScreen.tsx::SurveysVoteScreen
 */

// PL: Link do ekranu ankiety bez przeładowania strony.
// EN: A link to the survey screen without reloading the page.
import { Link } from 'react-router';
// PL: Dolny pasek nawigacji. Wg EKRANY.md ma go tylko lista ankiet.
// EN: The bottom navigation bar. Per EKRANY.md only the survey list has it.
import { Dock } from '../../../shared';
import { CircleCheckIcon } from './icons';
import { daysWord, describeSurvey, formatShortDate } from './format';
import { fetchSurveyList } from './surveyApi';
import type { ActiveSurvey, EndedSurvey } from './types';
import { useRemoteData } from './useRemoteData';

/**
 * PL: Kafel ankiety jeszcze niewypełnionej: temat, tytuł, opis, przycisk „Wypełnij” i licznik dni.
 * EN: The tile of a survey not yet filled in: topic, title, description, the "Wypełnij" button and the day counter.
 *
 * @param props - PL: ankieta. EN: the survey.
 * @returns PL: kafel. EN: the tile.
 */
function OpenSurveyTile({ survey }: { survey: ActiveSurvey }) {
  return (
    <li className="vote-tile vote-tile--row">
      <div className="vote-tile__main">
        {survey.label === null ? null : <p className="vote-label">{survey.label}</p>}
        <h3 className="vote-tile__title">{survey.title}</h3>
        <p className="vote-small">{describeSurvey(survey.questionCount)}</p>
        <Link className="vote-button vote-button--outline" to={`/surveys/vote/${survey.id}`}>
          Wypełnij
        </Link>
      </div>
      <div className="vote-counter">
        <p className="vote-counter__num">{survey.daysLeft}</p>
        <p className="vote-label vote-label--ink">{daysWord(survey.daysLeft)}</p>
      </div>
    </li>
  );
}

/**
 * PL: Kafel ankiety już wypełnionej: znacznik „Wypełniona”, tytuł i podziękowanie.
 * EN: The tile of an already filled survey: the "Wypełniona" mark, the title and a thank-you.
 *
 * @param props - PL: ankieta. EN: the survey.
 * @returns PL: kafel. EN: the tile.
 */
function FilledSurveyTile({ survey }: { survey: ActiveSurvey }) {
  return (
    <li className="vote-tile">
      <p className="vote-filled">
        <CircleCheckIcon />
        <span className="vote-label vote-label--ink">Wypełniona</span>
      </p>
      <h3 className="vote-tile__title">{survey.title}</h3>
      <p className="vote-small">Dziękujemy za głos. Wyniki widzi Samorząd.</p>
    </li>
  );
}

/**
 * PL: Kafel ankiety zakończonej: tytuł i data zakończenia.
 * EN: The tile of an ended survey: the title and the end date.
 *
 * @param props - PL: ankieta. EN: the survey.
 * @returns PL: kafel. EN: the tile.
 */
function EndedSurveyTile({ survey }: { survey: EndedSurvey }) {
  return (
    <li className="vote-tile">
      <h3 className="vote-tile__title">{survey.title}</h3>
      <p className="vote-small">Zakończona {formatShortDate(survey.endsOn)}</p>
    </li>
  );
}

/**
 * PL: Sekcje listy: „Aktywne” (albo informacja, że ich nie ma) i „Zakończone”, gdy są.
 * EN: The list sections: "Aktywne" (or a note that there are none) and "Zakończone" when there are some.
 *
 * @param props - PL: ankiety trwające i zakończone. EN: the running and ended surveys.
 * @returns PL: sekcje. EN: the sections.
 */
function SurveySections({ active, ended }: { active: ActiveSurvey[]; ended: EndedSurvey[] }) {
  return (
    <>
      <h2 className="vote-label">Aktywne</h2>
      {active.length === 0 ? <p className="vote-small">Nie ma teraz aktywnych ankiet.</p> : null}
      <ul className="vote-list">
        {active.map((survey) => (survey.hasVoted ? <FilledSurveyTile key={survey.id} survey={survey} /> : <OpenSurveyTile key={survey.id} survey={survey} />))}
      </ul>
      {ended.length === 0 ? null : <h2 className="vote-label vote-label--spaced">Zakończone</h2>}
      <ul className="vote-list">
        {ended.map((survey) => (
          <EndedSurveyTile key={survey.id} survey={survey} />
        ))}
      </ul>
    </>
  );
}

/**
 * PL: Rysuje ekran listy ankiet. Pobiera dane przy wejściu. Gdy serwer nie odpowiada (na przykład brak internetu), pokazuje błąd i przycisk ponowienia.
 * EN: Draws the survey list screen. Fetches the data on entry. When the server does not answer (for example no internet), it shows an error and a retry button.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SurveyListScreen() {
  const { state, reload } = useRemoteData(fetchSurveyList);

  return (
    <>
      <main className="vote" data-subtrack="5a">
        <h1>Ankiety</h1>
        {state.status === 'loading' ? <p className="vote-small" role="status">Wczytuję ankiety…</p> : null}
        {state.status === 'error' ? (
          <div className="vote-message" role="alert">
            <p>Nie udało się pobrać ankiet. Sprawdź połączenie z internetem.</p>
            <button type="button" className="vote-button vote-button--outline" onClick={reload}>
              Spróbuj ponownie
            </button>
          </div>
        ) : null}
        {state.status === 'ready' ? <SurveySections active={state.data.active} ended={state.data.ended} /> : null}
      </main>
      <Dock />
    </>
  );
}
