/**
 * PL: Ekran 6.5a „Ankiety: lista” (docs/projekt/EKRANY.md): ankiety trwające i zakończone z liczbą odpowiedzi, a pod nimi przycisk „Nowa ankieta”. Lista pochodzi z serwera (zapisanego też w telefonie, więc jest widoczna bez internetu), a przycisk bez internetu jest nieaktywny. Pasek „Brak internetu” jest wspólny dla aplikacji i nie należy do tego ekranu.
 * EN: Screen 6.5a "Ankiety: lista" (docs/projekt/EKRANY.md): running and ended surveys with the response count and the "Nowa ankieta" button under them. The list comes from the server (also saved on the phone, so it is visible without internet), and the button is inactive without internet. The "Brak internetu" bar is shared by the app and does not belong to this screen.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/surveyQueries.ts::usePanelSurveys
 * @uses src/shared/ui/ListGroup.tsx::ListGroup
 * @uses src/shared/ui/ListRow.tsx::ListRow
 * @uses src/shared/ui/Button.tsx::Button
 * @used_by src/features/surveys/admin/SurveysAdminScreen.tsx::SurveysAdminScreen
 */

import { Link } from 'react-router';
// PL: Grupa z nagłówkiem i wiersze w stylu listy systemowej.
// EN: The group with a header and the rows in the style of a system list.
import { ListGroup } from '../../../shared/ui/ListGroup';
import { ListRow } from '../../../shared/ui/ListRow';
import { Button } from '../../../shared/ui/Button';
import { PlusIcon, WifiOffIcon } from './icons';
import { describeQuestions, describeResponses, formatClosesAt, formatShortDate, MIN_RESPONSES } from './format';
import { ErrorMessage, PanelNote, ScreenTop } from './PanelParts';
import { useIsOnline, usePanelSurveys } from './surveyQueries';
import type { PanelSurvey } from './types';

/**
 * PL: Wiersz jednej ankiety: tytuł, liczba pytań z terminem i, dla trwającej, stan odpowiedzi. Ankieta z terminem zamknięcia pokazuje jego godzinę, a zamknięta przez termin, „Zamknięta”. Prowadzi do wyników.
 * EN: The row of one survey: the title, the question count with the deadline and, for a running one, the response state. A survey with a closing time shows its hour, and one closed by its time shows "Zamknięta". Leads to the results.
 *
 * @param props - PL: ankieta i czy już się skończyła. EN: the survey and whether it has ended.
 * @returns PL: wiersz listy. EN: the list row.
 */
function SurveyRow({ survey, isEnded }: { survey: PanelSurvey; isEnded: boolean }) {
  // PL: Trwająca: „3 pytania · do 15.10” albo „3 pytania · do 15.10, 12:00”. Zakończona: „Zakończona 30.09 · 21 odpowiedzi”. Zamknięta przed czasem: „Zamknięta · 21 odpowiedzi”.
  // EN: Running: "3 pytania · do 15.10" or "3 pytania · do 15.10, 12:00". Ended: "Zakończona 30.09 · 21 odpowiedzi". Closed before its time: "Zamknięta · 21 odpowiedzi".
  const caption = (() => {
    if (isEnded && survey.closesAt !== null) return `Zamknięta · ${describeResponses(survey.responseCount)}`;
    if (isEnded) return `Zakończona ${formatShortDate(survey.endsOn)} · ${describeResponses(survey.responseCount)}`;
    const deadline = survey.closesAt === null ? formatShortDate(survey.endsOn) : formatClosesAt(survey.closesAt);
    return `${describeQuestions(survey.questionCount)} · do ${deadline}`;
  })();
  const isHidden = survey.responseCount < MIN_RESPONSES;
  // PL: Trwająca ankieta mówi pod opisem, czy wyniki są już widoczne; liczba odpowiedzi stoi po prawej, gdy są widoczne.
  // EN: A running survey says under the caption whether the results are visible yet; the response count stands on the right when they are.
  const subtitle = isEnded ? (
    caption
  ) : (
    <>
      <span className="sa-row-line">{caption}</span>
      {isHidden ? <span className="sa-row-line">{`Wyniki zobaczysz od ${MIN_RESPONSES} odpowiedzi. Teraz: ${survey.responseCount}.`}</span> : null}
    </>
  );
  const value = isEnded || isHidden ? undefined : describeResponses(survey.responseCount);

  return (
    <li>
      <ListRow to={`/surveys/admin/${encodeURIComponent(survey.id)}`} title={survey.title} subtitle={subtitle} value={value} />
    </li>
  );
}

/**
 * PL: Sekcja listy: nagłówek („Aktywne” albo „Zakończone”) i wiersze w jednej grupie. Pusta sekcja nic nie rysuje.
 * EN: A list section: the header ("Aktywne" or "Zakończone") and the rows in one group. An empty section draws nothing.
 *
 * @param props - PL: etykieta, ankiety i czy są zakończone. EN: the label, the surveys and whether they are ended.
 * @returns PL: sekcja albo nic. EN: the section or nothing.
 */
function SurveySection({ label, surveys, isEnded }: { label: string; surveys: PanelSurvey[]; isEnded: boolean }) {
  if (surveys.length === 0) return null;
  return (
    <ListGroup header={label} className="sa-section">
      <ul className="sa-list" aria-label={label}>
        {surveys.map((survey) => (
          <SurveyRow key={survey.id} survey={survey} isEnded={isEnded} />
        ))}
      </ul>
    </ListGroup>
  );
}

/**
 * PL: Rysuje przycisk „Nowa ankieta”: link, a bez internetu nieaktywny przycisk z notatką nad nim.
 * EN: Draws the "Nowa ankieta" button: a link, and without internet an inactive button with a note above it.
 *
 * @param props - PL: czy jest internet. EN: whether there is internet.
 * @returns PL: stopka z przyciskiem. EN: the footer with the button.
 */
function NewSurveyButton({ isOnline }: { isOnline: boolean }) {
  return (
    <div className="sa-footer">
      {isOnline ? null : <PanelNote icon={<WifiOffIcon />} text="Nowa ankieta wymaga internetu." />}
      {isOnline ? (
        <Link className="ui-button ui-button--filled" to="/surveys/admin/new">
          <PlusIcon />
          Nowa ankieta
        </Link>
      ) : (
        <Button variant="filled" disabled>
          <PlusIcon />
          Nowa ankieta
        </Button>
      )}
    </div>
  );
}

/**
 * PL: Rysuje ekran listy ankiet. Pokazuje ostatnio zapisaną listę od razu i odświeża ją z serwera.
 * EN: Draws the survey list screen. Shows the last saved list at once and refreshes it from the server.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SurveyListScreen() {
  const query = usePanelSurveys();
  const isOnline = useIsOnline();
  const list = query.data;

  return (
    <main className="sa sa--flow" data-subtrack="5b" aria-busy={query.isPending}>
      <ScreenTop title="Ankiety" />
      {/* PL: Pusta lista to stan z EKRANY.md: nagłówek i podpowiedź, co dotknąć. EN: An empty list is the EKRANY.md state: a heading and a hint what to tap. */}
      {list !== undefined && list.active.length + list.ended.length === 0 ? (
        <div className="sa-tile sa-tile--center">
          <h2 className="sa-h2">Nie ma jeszcze ankiet</h2>
          <p className="sa-small">Dotknij „Nowa ankieta”, żeby zadać pierwsze pytanie.</p>
        </div>
      ) : null}
      {list === undefined ? null : <SurveySection label="Aktywne" surveys={list.active} isEnded={false} />}
      {list === undefined ? null : <SurveySection label="Zakończone" surveys={list.ended} isEnded />}
      {list === undefined && query.isError ? <ErrorMessage text="Nie udało się pobrać ankiet. Spróbuj ponownie za chwilę." onRetry={() => void query.refetch()} /> : null}
      <NewSurveyButton isOnline={isOnline} />
    </main>
  );
}
