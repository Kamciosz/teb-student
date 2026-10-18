/**
 * PL: Ekran „Moje zgłoszenia” (ekran 3.5): duży nagłówek z akcją „Zgłoś problem”, lista wierszy z tytułem, kategorią i datą oraz etapem po prawej. Pasek postępu jest tylko w szczegółach, więc lista go nie pokazuje. Bez internetu pokazuje ostatnio zapisaną listę (pasek „Brak internetu” jest wspólny dla aplikacji). Teksty są zatwierdzone przez właściciela.
 * EN: The "Moje zgłoszenia" screen (screen 3.5): a large header with the "Zgłoś problem" action, a list of rows with the title, the category and the date, and the stage on the right. The progress bar is only in the details, so the list does not show it. Without internet it shows the last saved list (the "Brak internetu" banner is shared by the app). The texts are approved by the owner.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::Dock
 * @uses src/shared/index.ts::EmptyState
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/features/reports/student/api.ts::MyReport
 * @uses src/features/reports/student/queries.ts::useMyReports
 * @uses src/features/reports/student/reportOptions.ts::categoryLabel
 * @uses src/features/reports/student/reportView.ts::formatShortDate
 * @uses src/features/reports/student/reportView.ts::stageLabel
 * @used_by src/features/reports/student/ReportsStudentScreen.tsx::MyReports
 */

// PL: Przejście do kreatora zgłoszenia.
// EN: The way to the report wizard.
import { useNavigate } from 'react-router';
// PL: Elementy wspólnego interfejsu.
// EN: The shared interface elements.
import { Button, Dock, EmptyState, ListGroup, ListRow, ScreenHeader } from '../../../shared';
// PL: Typ zgłoszenia i dane listy.
// EN: The report type and the list data.
import type { MyReport } from './api';
import { useMyReports } from './queries';
import { categoryLabel } from './reportOptions';
import { formatShortDate, stageLabel } from './reportView';

// PL: Adres kreatora zgłoszenia (formularz pod adresem głównym podtoru).
// EN: The address of the report wizard (the form is at the root address of the subtrack).
const NEW_REPORT_ADDRESS = '/reports/student';

/**
 * PL: Rysuje jeden wiersz listy: opis, kategoria z datą, etap po prawej. Wiersz otwiera szczegóły.
 * EN: Draws one list row: the description, the category with the date, the stage on the right. The row opens the details.
 *
 * @param props - PL: zgłoszenie do pokazania. EN: the report to show.
 * @returns PL: wiersz listy. EN: the list row.
 */
function ReportRow({ report }: { report: MyReport }) {
  // PL: Załatwione jest jedynym etapem w zielonym kolorze sukcesu.
  // EN: Resolved is the only stage in the green success color.
  const isResolved = report.stage === 'resolved';
  return (
    <li>
      <ListRow
        title={report.description}
        subtitle={`${categoryLabel(report.category)} · ${formatShortDate(report.createdAt)}`}
        value={<span className={isResolved ? 'rs-stage rs-stage-done' : 'rs-stage'}>{stageLabel(report.stage)}</span>}
        to={`/reports/student/moje/${encodeURIComponent(report.id)}`}
      />
    </li>
  );
}

/**
 * PL: Rysuje treść listy: wiersze, pusty stan, błąd albo wczytywanie. Zapisana lista ma pierwszeństwo, więc przy błędzie sieci uczeń nadal ją widzi.
 * EN: Draws the list body: the rows, the empty state, the error or the loading. The saved list takes priority, so with a network error the student still sees it.
 *
 * @param props - PL: wynik zapytania i akcja nowego zgłoszenia. EN: the query result and the new-report action.
 * @returns PL: drzewo elementów treści. EN: the tree of body elements.
 */
function ReportsBody({ query, onNewReport }: { query: ReturnType<typeof useMyReports>; onNewReport: () => void }) {
  // PL: Dane (z serwera albo z zapisu w telefonie) mają pierwszeństwo nad stanem zapytania.
  // EN: The data (from the server or from the saved copy) takes priority over the query state.
  if (query.data) {
    // PL: Pusty stan ma jedną akcję tekstową, bez ilustracji.
    // EN: The empty state has one text action, with no illustration.
    if (query.data.length === 0) {
      return (
        <EmptyState title="Nie masz jeszcze żadnych zgłoszeń.">
          <Button variant="plain" onClick={onNewReport}>Zgłoś problem</Button>
        </EmptyState>
      );
    }
    return (
      <ListGroup>
        <ul className="rs-rows">
          {query.data.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </ul>
      </ListGroup>
    );
  }
  // PL: Bez danych i z błędem pokaż błąd z przyciskiem ponowienia.
  // EN: Without data and with an error, show the error with a retry button.
  if (query.isError) {
    return (
      <div role="alert">
        <EmptyState title="Nie udało się wczytać zgłoszeń.">
          <Button variant="plain" onClick={() => query.refetch()}>Spróbuj ponownie</Button>
        </EmptyState>
      </div>
    );
  }
  // PL: Bez danych i bez błędu zapytanie jeszcze trwa.
  // EN: Without data and without an error the query is still running.
  return <p className="rs-status" role="status">Wczytuję zgłoszenia…</p>;
}

/**
 * PL: Rysuje ekran „Moje zgłoszenia”.
 * EN: Draws the "Moje zgłoszenia" screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function MyReports() {
  // PL: Lista z serwera albo z zapisu w telefonie (wspólny dostawca zapytań). Pasek „Brak internetu” rysuje wspólny OfflineBanner z App.tsx.
  // EN: The list from the server or from the saved copy (the shared query provider). The "Brak internetu" banner is drawn by the shared OfflineBanner from App.tsx.
  const query = useMyReports();
  const navigate = useNavigate();
  const openNewReport = () => navigate(NEW_REPORT_ADDRESS);
  return (
    <>
      <ScreenHeader
        title="Moje zgłoszenia"
        action={<Button variant="plain" onClick={openNewReport}>Zgłoś problem</Button>}
      />
      <ReportsBody query={query} onNewReport={openNewReport} />
      <Dock />
    </>
  );
}
