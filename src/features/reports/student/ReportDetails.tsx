/**
 * PL: Ekran szczegółów zgłoszenia: pasek postępu z etapami, opis, data i oś historii z odpowiedziami Samorządu. Dane bierze z listy „Moje zgłoszenia” (bez nowego endpointu). Pasek postępu jest tylko tutaj; na liście go nie ma. Teksty są zatwierdzone przez właściciela, poza nowym etykietami pasków (zgłoszone w raporcie).
 * EN: The report details screen: the progress bar with the stages, the description, the date and the history axis with the Student Council answers. It takes the data from the "Moje zgłoszenia" list (no new endpoint). The progress bar is only here; the list does not have it. The texts are approved by the owner, except the new progress bar labels (reported in the summary).
 *
 * @author Szymon
 * @since 2026-10-18
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::EmptyState
 * @uses src/shared/index.ts::ProgressBar
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/features/reports/student/api.ts::MyReport
 * @uses src/features/reports/student/queries.ts::useMyReports
 * @uses src/features/reports/student/reportOptions.ts::STAGE_ORDER
 * @uses src/features/reports/student/reportOptions.ts::categoryLabel
 * @uses src/features/reports/student/reportView.ts::formatShortDate
 * @uses src/features/reports/student/reportView.ts::stageLabel
 * @used_by src/features/reports/student/ReportsStudentScreen.tsx::ReportDetails
 */

// PL: Adres z parametrem zgłoszenia i przejście do listy.
// EN: The address with the report parameter and the way to the list.
import { useNavigate, useParams } from 'react-router';
// PL: Elementy wspólnego interfejsu.
// EN: The shared interface elements.
import { Button, EmptyState, ProgressBar, ScreenHeader } from '../../../shared';
// PL: Typ wpisu historii i dane zgłoszenia.
// EN: The history entry type and the report data.
import type { MyReport } from './api';
import { useMyReports } from './queries';
import { STAGE_ORDER, categoryLabel } from './reportOptions';
import { formatShortDate, stageLabel } from './reportView';

// PL: Adres listy, do którego wraca ekran szczegółów.
// EN: The list address that the details screen goes back to.
const LIST_ADDRESS = '/reports/student/moje';

/**
 * PL: Rysuje oś historii zgłoszenia: każdy etap z datą, a przy nim odpowiedź Samorządu, jeśli jest.
 * EN: Draws the history axis of a report: each stage with its date, and the Student Council answer next to it, if there is one.
 *
 * @param props - PL: wpisy historii do pokazania. EN: the history entries to show.
 * @returns PL: lista osi historii. EN: the history axis list.
 */
function ReportHistory({ entries }: { entries: MyReport['history'] }) {
  return (
    <ol className="rs-history" aria-label="Historia zgłoszenia">
      {entries.map((entry) => (
        <li key={`${entry.stage}-${entry.changedAt}`}>
          <span className="rs-small">{formatShortDate(entry.changedAt)}</span>
          <span className="rs-history-stage">{stageLabel(entry.stage)}</span>
          {entry.note ? (
            <p className="rs-note">
              <span className="rs-note-label">Odpowiedź Samorządu</span>
              {entry.note}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * PL: Rysuje treść szczegółów jednego zgłoszenia: pasek postępu, podpisy etapów, opis, datę i historię.
 * EN: Draws the details of one report: the progress bar, the stage captions, the description, the date and the history.
 *
 * @param props - PL: zgłoszenie do pokazania. EN: the report to show.
 * @returns PL: drzewo elementów szczegółów. EN: the tree of details elements.
 */
function ReportDetailsBody({ report }: { report: MyReport }) {
  // PL: Numer etapu liczymy od 1, żeby pasek pokazał już rozpoczęty pierwszy etap.
  // EN: The stage number starts at 1, so the bar already shows the first started stage.
  const index = STAGE_ORDER.findIndex((item) => item.code === report.stage);
  return (
    <>
      <ProgressBar value={index + 1} max={STAGE_ORDER.length} label="Postęp zgłoszenia" />
      <ul className="rs-steps">
        {STAGE_ORDER.map((item) => (
          <li key={item.code} className={item.code === report.stage ? 'rs-now' : undefined} aria-current={item.code === report.stage ? 'step' : undefined}>
            {item.label}
          </li>
        ))}
      </ul>
      <section className="rs-detail">
        <p className="rs-small">{categoryLabel(report.category)} · {formatShortDate(report.createdAt)}</p>
        <h2>{report.description}</h2>
        {report.stage === 'resolved' ? <p className="rs-small">Załatwione {formatShortDate(report.updatedAt)}</p> : null}
      </section>
      <ReportHistory entries={report.history} />
    </>
  );
}

/**
 * PL: Rysuje ekran szczegółów zgłoszenia z listy. Bez danych pokazuje wczytywanie, błąd albo informację, że nie ma takiego zgłoszenia.
 * EN: Draws the details screen of a report from the list. With no data it shows the loading, the error or the note that there is no such report.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ReportDetails() {
  // PL: Identyfikator zgłoszenia z adresu i stan listy (ten sam wspólny dostawca zapytań).
  // EN: The report id from the address and the list state (the same shared query provider).
  const { id } = useParams();
  const query = useMyReports();
  const navigate = useNavigate();
  const report = query.data?.find((item) => item.id === id);

  let body;
  if (report) {
    body = <ReportDetailsBody report={report} />;
  } else if (query.isError) {
    // PL: Błąd bez zapisanej listy: pokaż błąd z przyciskiem ponowienia.
    // EN: An error without a saved list: show the error with a retry button.
    body = (
      <div role="alert">
        <EmptyState title="Nie udało się wczytać zgłoszeń.">
          <Button variant="plain" onClick={() => query.refetch()}>Spróbuj ponownie</Button>
        </EmptyState>
      </div>
    );
  } else if (query.data) {
    // PL: Lista jest, ale nie ma w niej tego zgłoszenia (np. usunięte albo zły adres).
    // EN: The list is there, but this report is not in it (for example removed or a wrong address).
    body = (
      <EmptyState title="Nie znaleziono tego zgłoszenia.">
        <Button variant="plain" onClick={() => navigate(LIST_ADDRESS)}>Moje zgłoszenia</Button>
      </EmptyState>
    );
  } else {
    // PL: Bez danych i bez błędu lista jeszcze się wczytuje.
    // EN: Without data and without an error the list is still loading.
    body = <p className="rs-status" role="status">Wczytuję zgłoszenia…</p>;
  }

  return (
    <>
      <ScreenHeader title="Zgłoszenie" backTo={LIST_ADDRESS} backLabel="Zgłoszenia" />
      {body}
    </>
  );
}
