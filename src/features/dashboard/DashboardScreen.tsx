/**
 * PL: Ekran pulpitu (podtor 9, ekran 2.1 w docs/projekt/EKRANY.md): powitanie i kafelki „Ważne”, „Ankieta”, „Zgłoszenia” i „Ogłoszenia”, a pod nimi dolny pasek. Dane przychodzą jednym zapytaniem do serwera pulpitu i są zapisane w telefonie, więc bez internetu widać ostatnio pobrane. Bez danych kafelki pokazują pusty stan.
 * EN: The dashboard screen (subtrack 9, screen 2.1 in docs/projekt/EKRANY.md): the greeting and the "Ważne", "Ankieta", "Zgłoszenia" and "Ogłoszenia" tiles, with the bottom bar below. The data comes in one request to the dashboard server and is saved on the phone, so without internet the last fetched data shows. Without data the tiles show the empty state.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/shared/index.ts::Dock
 * @uses src/features/dashboard/queries.ts::useDashboard
 * @used_by src/features/dashboard/index.ts::DashboardScreen
 */

// PL: Dolny pasek nawigacji.
// EN: The bottom navigation bar.
import { Dock } from '../../shared';
// PL: Górny rząd i cztery kafelki.
// EN: The top row and the four tiles.
import { AnnouncementsTile } from './AnnouncementsTile';
import { DashboardHeader } from './DashboardHeader';
import { ImportantTile } from './ImportantTile';
import { ReportTile } from './ReportTile';
import { SurveyTile } from './SurveyTile';
// PL: Dane pulpitu.
// EN: The dashboard data.
import { useDashboard } from './queries';
// PL: Style pulpitu.
// EN: The dashboard styles.
import './dashboard.css';

/**
 * PL: Rysuje komunikat o stanie pobierania: ładowanie, brak internetu bez zapisanych danych, błąd z przyciskiem ponowienia albo ostrzeżenie, że pokazujemy zapisane dane. Gdy wszystko jest w porządku, nie rysuje nic. Napisy są jak w module aktualności (do ustalenia z zespołem).
 * EN: Draws a message about the fetching state: loading, no internet without saved data, an error with a retry button, or a warning that we show saved data. When everything is fine, it draws nothing. The labels are as in the news module (to be agreed with the team).
 *
 * @param props - PL: wynik zapytania o pulpit. EN: the dashboard query result.
 * @returns PL: komunikat albo null. EN: the message or null.
 */
function FetchNote({ query }: { query: ReturnType<typeof useDashboard> }) {
  // PL: Dane z zapisu w telefonie albo z serwera, ale ostatnie odświeżenie się nie udało: uczeń widzi kafelki i ostrzeżenie.
  // EN: Data from the phone's saved copy or from the server, but the last refresh failed: the student sees the tiles and a warning.
  if (query.isError && query.data !== undefined) return <p className="dash-note">Nie udało się odświeżyć pulpitu. Pokazujemy zapisane dane.</p>;

  // PL: Bez danych i bez internetu zapytanie czeka (wstrzymane), więc mówimy o braku internetu zamiast wiecznego „Ładuję”.
  // EN: Without data and without internet the query waits (paused), so we say there is no internet instead of an endless "Ładuję".
  if (query.isPending && query.fetchStatus === 'paused') return <p className="dash-note">Brak internetu i brak zapisanych danych.</p>;

  // PL: Pierwsze pobranie trwa. role="status" sprawia, że czytnik ekranu ogłasza napis.
  // EN: The first fetch is running. role="status" makes a screen reader announce the label.
  if (query.isPending) return <p role="status" className="dash-note">Ładuję pulpit…</p>;

  // PL: Błąd bez żadnych danych: komunikat i przycisk ponowienia.
  // EN: An error without any data: a message and a retry button.
  if (query.isError) {
    return (
      <div className="dash-note" role="alert">
        <p>Nie udało się pobrać pulpitu.</p>
        <button type="button" className="dash-button" onClick={() => void query.refetch()}>
          Spróbuj ponownie
        </button>
      </div>
    );
  }
  return null;
}

/**
 * PL: Rysuje ekran pulpitu. Gdy danych jeszcze nie ma, kafelki są puste i widać komunikat o stanie pobierania.
 * EN: Draws the dashboard screen. When there is no data yet, the tiles are empty and a fetching state message shows.
 *
 * @returns PL: ekran z kafelkami i dolnym paskiem. EN: the screen with the tiles and the bottom bar.
 */
export function DashboardScreen() {
  // PL: Dane pulpitu. Bez nich (ładowanie, błąd, brak internetu) wszystkie kafelki dostają pusty stan.
  // EN: The dashboard data. Without it (loading, an error, no internet) all tiles get the empty state.
  const query = useDashboard();
  const data = query.data;

  return (
    <>
      <main className="dash" data-subtrack="9">
        <DashboardHeader />
        <FetchNote query={query} />
        <ImportantTile entry={data?.important ?? null} />
        {/* PL: Ankieta i zgłoszenia obok siebie, a na bardzo wąskim ekranie jedno pod drugim. EN: The survey and reports side by side, and one under the other on a very narrow screen. */}
        <div className="dash-pair">
          <SurveyTile survey={data?.survey ?? null} />
          <ReportTile report={data?.report ?? null} />
        </div>
        <AnnouncementsTile rows={data?.announcements ?? []} />
      </main>
      {/* PL: Dolny pasek nawigacji, jak na ekranie 2.1. EN: The bottom navigation bar, as on screen 2.1. */}
      <Dock />
    </>
  );
}
