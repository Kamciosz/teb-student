/**
 * PL: Ekran 4.1 „Lista ankiet” (docs/projekt/EKRANY.md): trwające ankiety z liczbą dni do końca, wypełnione z oznaczeniem i zakończone. Pobiera listę z serwera (zapisaną też w telefonie) i niczego nie zmienia.
 * EN: Screen 4.1 "Lista ankiet" (docs/projekt/EKRANY.md): running surveys with the days left, filled ones with a mark, and ended ones. Fetches the list from the server (also saved on the phone) and changes nothing.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/surveyQueries.ts::useSurveyList
 * @uses src/shared/index.ts::Dock
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/shared/index.ts::Button
 * @used_by src/features/surveys/vote/SurveysVoteScreen.tsx::SurveysVoteScreen
 */

// PL: Klocki wspólnego wyglądu: nagłówek ekranu, grupy i wiersze listy, przycisk i dolny pasek.
// EN: The shared look pieces: the screen header, the list groups and rows, the button and the bottom bar.
import { Button, Dock, ListGroup, ListRow, ScreenHeader } from '../../../shared';
import { daysWord, describeSurvey, formatClosesAt, formatShortDate } from './format';
import { useSurveyList } from './surveyQueries';
import type { ActiveSurvey, EndedSurvey } from './types';

/**
 * PL: Wiersz ankiety jeszcze niewypełnionej: tytuł, liczba pytań i termin, po prawej dni do końca. Dzisiejszy termin jest wyróżniony. Cały wiersz otwiera ankietę.
 * EN: The row of a survey not yet filled in: the title, the number of questions and the deadline, on the right the days left. Today's deadline is highlighted. The whole row opens the survey.
 *
 * @param props - PL: ankieta. EN: the survey.
 * @returns PL: wiersz listy. EN: the list row.
 */
function OpenSurveyRow({ survey }: { survey: ActiveSurvey }) {
  // PL: Dziś oznacza ostatni dzień, więc zamiast „za 0 dni” piszemy „Dziś”.
  // EN: Today means the last day, so instead of "za 0 dni" we write "Dziś".
  const isToday = survey.daysLeft === 0;

  return (
    <ListRow
      to={`/surveys/vote/${survey.id}`}
      title={survey.title}
      subtitle={
        <>
          {survey.label === null ? null : <span className="vote-row-line">{survey.label}</span>}
          <span className="vote-row-line">{describeSurvey(survey.questionCount)}</span>
          {survey.closesAt === null ? null : <span className="vote-row-line">{formatClosesAt(survey.closesAt)}</span>}
        </>
      }
      value={isToday ? 'Dziś' : `za ${survey.daysLeft} ${daysWord(survey.daysLeft)}`}
      className={isToday ? 'vote-row--today' : undefined}
    />
  );
}

/**
 * PL: Wiersz ankiety już wypełnionej: tytuł, podziękowanie i znacznik „Wypełniona” po prawej. Nie otwiera ekranu.
 * EN: The row of an already filled survey: the title, a thank-you and the "Wypełniona" mark on the right. It does not open a screen.
 *
 * @param props - PL: ankieta. EN: the survey.
 * @returns PL: wiersz listy. EN: the list row.
 */
function FilledSurveyRow({ survey }: { survey: ActiveSurvey }) {
  return <ListRow className="vote-row--filled" title={survey.title} subtitle="Dziękujemy za głos. Wyniki widzi Samorząd." value="Wypełniona" />;
}

/**
 * PL: Wiersz ankiety zamkniętej: tytuł i stan „Ankieta zamknięta” z dniem zamknięcia.
 * EN: The row of a closed survey: the title and the state "Ankieta zamknięta" with the closing day.
 *
 * @param props - PL: ankieta. EN: the survey.
 * @returns PL: wiersz listy. EN: the list row.
 */
function EndedSurveyRow({ survey }: { survey: EndedSurvey }) {
  return <ListRow title={survey.title} subtitle={`Ankieta zamknięta · ${formatShortDate(survey.endedOn)}`} />;
}

/**
 * PL: Grupy listy: „Aktywne” (albo informacja, że ich nie ma) i „Zakończone”, gdy są.
 * EN: The list groups: "Aktywne" (or a note that there are none) and "Zakończone" when there are some.
 *
 * @param props - PL: ankiety trwające i zakończone. EN: the running and ended surveys.
 * @returns PL: grupy listy. EN: the list groups.
 */
function SurveySections({ active, ended }: { active: ActiveSurvey[]; ended: EndedSurvey[] }) {
  // PL: Najbliższy termin na górze. Kopia tablicy, bo lista z pamięci podręcznej nie może zmienić się w miejscu.
  // EN: The nearest deadline on top. A copy of the array, because the cached list must not change in place.
  const byDeadline = [...active].sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <>
      <ListGroup header="Aktywne" footer={byDeadline.length === 0 ? 'Nie ma teraz aktywnych ankiet.' : undefined}>
        {byDeadline.map((survey) => (survey.hasVoted ? <FilledSurveyRow key={survey.id} survey={survey} /> : <OpenSurveyRow key={survey.id} survey={survey} />))}
      </ListGroup>
      {ended.length === 0 ? null : (
        <ListGroup header="Zakończone">
          {ended.map((survey) => (
            <EndedSurveyRow key={survey.id} survey={survey} />
          ))}
        </ListGroup>
      )}
    </>
  );
}

/**
 * PL: Rysuje ekran listy ankiet. Pokazuje ostatnią zapisaną listę od razu i odświeża ją z serwera. Bez zapisanej listy i bez internetu pokazuje komunikat o braku internetu albo błąd z przyciskiem ponowienia.
 * EN: Draws the survey list screen. Shows the last saved list at once and refreshes it from the server. Without a saved list and without internet it shows a no-internet message, or an error with a retry button.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SurveyListScreen() {
  const query = useSurveyList();

  return (
    <>
      <main className="vote" data-subtrack="5a">
        <ScreenHeader title="Ankiety" />
        {query.data !== undefined ? <SurveySections active={query.data.active} ended={query.data.ended} /> : null}
        {query.data === undefined && query.isError ? (
          <div className="vote-message" role="alert">
            <p>Nie udało się pobrać ankiet. Sprawdź połączenie z internetem.</p>
            <Button variant="plain" onClick={() => void query.refetch()}>
              Spróbuj ponownie
            </Button>
          </div>
        ) : null}
        {query.data === undefined && !query.isError && query.fetchStatus === 'paused' ? <p className="vote-small" role="status">Brak internetu. Ankiety pojawią się, gdy wróci połączenie.</p> : null}
        {query.data === undefined && !query.isError && query.fetchStatus !== 'paused' ? <p className="vote-small" role="status">Wczytuję ankiety…</p> : null}
      </main>
      <Dock />
    </>
  );
}
