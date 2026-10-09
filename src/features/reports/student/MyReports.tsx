/**
 * PL: Ekran „Moje zgłoszenia” (ekran 3.5): lista zgłoszeń ucznia z paskiem etapu (przyjęte, w trakcie, załatwione). Bez internetu pokazuje ostatnio zapisaną listę (pasek „Brak internetu” jest wspólny dla aplikacji).
 * EN: The "Moje zgłoszenia" screen (screen 3.5): the student's report list with the stage bar (received, in progress, resolved). Without internet it shows the last saved list (the "Brak internetu" banner is shared by the app).
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/queries.ts::useMyReports
 * @uses src/features/reports/student/reportView.ts::stageSegments
 * @used_by src/features/reports/student/ReportsStudentScreen.tsx::MyReports
 */

// PL: Link do innego ekranu.
// EN: A link to another screen.
import { Link } from 'react-router';
// PL: Elementy ekranu i dane.
// EN: The screen elements and data.
import { FlowTop } from './FlowTop';
import type { MyReport } from './api';
import { useMyReports } from './queries';
import { STAGE_ORDER, categoryLabel } from './reportOptions';
import { formatShortDate, stageSegments } from './reportView';

/**
 * PL: Rysuje jeden kafel zgłoszenia: znacznik, datę, opis, pasek etapu i podpisy.
 * EN: Draws one report tile: the tag, the date, the description, the stage bar and the captions.
 *
 * @param props - PL: zgłoszenie do pokazania. EN: the report to show.
 * @returns PL: drzewo elementów kafla. EN: the tree of tile elements.
 */
function ReportTile({ report }: { report: MyReport }) {
  // PL: Które segmenty świecą i na którym etapie jesteśmy.
  // EN: Which segments are lit and which stage we are at.
  const segments = stageSegments(report.stage);
  return (
    <li className="rs-tile">
      <div className="rs-tile-head">
        <span className="rs-tag">{categoryLabel(report.category)}</span>
        <span className="rs-small">{formatShortDate(report.createdAt)}</span>
      </div>
      <h2>{report.description}</h2>
      <div className="rs-stages" aria-hidden="true">
        {segments.map((lit, index) => (
          <i key={STAGE_ORDER[index]?.code} className={lit ? 'rs-on' : undefined} />
        ))}
      </div>
      <div className="rs-captions">
        {STAGE_ORDER.map((item) => (
          <span key={item.code} className={item.code === report.stage ? 'rs-now' : undefined} aria-current={item.code === report.stage ? 'step' : undefined}>{item.label}</span>
        ))}
      </div>
      {report.stage === 'resolved' ? <span className="rs-small">Załatwione {formatShortDate(report.updatedAt)}</span> : null}
    </li>
  );
}

/**
 * PL: Rysuje pustą listę z przyciskiem do zgłoszenia.
 * EN: Draws the empty list with a button to report.
 *
 * @returns PL: drzewo elementów. EN: the tree of elements.
 */
function EmptyList() {
  // PL: Pusta lista mówi wprost, że nic nie ma (część 7 planu), i podpowiada, co dalej.
  // EN: The empty list says plainly that there is nothing (part 7 of the plan), and suggests what to do next.
  return (
    <div className="rs-empty">
      <p>Nie masz jeszcze żadnych zgłoszeń.</p>
      <Link className="rs-btn rs-btn-accent" to="/reports/student">Zgłoś problem</Link>
    </div>
  );
}

/**
 * PL: Rysuje treść ekranu: listę, pustą listę, błąd albo wczytywanie. Zapisana lista ma pierwszeństwo, więc przy błędzie sieci uczeń nadal ją widzi.
 * EN: Draws the screen body: the list, the empty list, the error or the loading. The saved list takes priority, so with a network error the student still sees it.
 *
 * @param props - PL: wynik zapytania o zgłoszenia. EN: the result of the reports query.
 * @returns PL: drzewo elementów treści. EN: the tree of body elements.
 */
function ReportsBody({ query }: { query: ReturnType<typeof useMyReports> }) {
  // PL: Dane (z serwera albo z zapisu w telefonie) mają pierwszeństwo nad stanem zapytania.
  // EN: The data (from the server or from the saved copy) takes priority over the query state.
  if (query.data) {
    return query.data.length === 0 ? (
      <EmptyList />
    ) : (
      <ul className="rs-list">
        {query.data.map((report) => (
          <ReportTile key={report.id} report={report} />
        ))}
      </ul>
    );
  }
  // PL: Bez danych i z błędem pokaż błąd z przyciskiem ponowienia.
  // EN: Without data and with an error, show the error with a retry button.
  if (query.isError) {
    return (
      <div className="rs-empty" role="alert">
        <p>Nie udało się wczytać zgłoszeń.</p>
        <button type="button" className="rs-btn rs-btn-soft" onClick={() => query.refetch()}>Spróbuj ponownie</button>
      </div>
    );
  }
  // PL: Bez danych i bez błędu zapytanie jeszcze trwa.
  // EN: Without data and without an error the query is still running.
  return <p className="rs-empty" role="status">Wczytuję zgłoszenia…</p>;
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
  return (
    <>
      <FlowTop title="Moje zgłoszenia" to="/" button={{ icon: 'arrow-left', label: 'Wróć na pulpit' }} />
      <ReportsBody query={query} />
    </>
  );
}
