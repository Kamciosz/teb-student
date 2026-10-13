/**
 * PL: Ekran pulpitu (podtor 9, ekran 2.1 w docs/projekt/EKRANY.md): powitanie i kafelki „Ważne”, „Ankieta”, „Zgłoszenia” i „Ogłoszenia”, a pod nimi dolny pasek. Dane przychodzą jednym zapytaniem do serwera pulpitu i są zapisane w telefonie, więc bez internetu widać ostatnio pobrane. Bez danych kafelki pokazują pusty stan.
 * EN: The dashboard screen (subtrack 9, screen 2.1 in docs/projekt/EKRANY.md): the greeting and the "Ważne", "Ankieta", "Zgłoszenia" and "Ogłoszenia" tiles, with the bottom bar below. The data comes in one request to the dashboard server and is saved on the phone, so without internet the last fetched data shows. Without data the tiles show the empty state.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/shared/index.ts::Dock
 * @uses src/features/dashboard/queries.ts::useDashboard
 * @uses src/features/dashboard/TileRows.tsx::TileRows
 * @uses src/features/dashboard/tileOrder.ts::loadTileOrder
 * @used_by src/features/dashboard/index.ts::DashboardScreen
 */

// PL: Stan ekranu: kolejność i tryb edycji.
// EN: The screen state: the order and the edit mode.
import { useState } from 'react';
// PL: Dolny pasek nawigacji.
// EN: The bottom navigation bar.
import { Dock } from '../../shared';
// PL: Górny rząd i kafelki w zapisanej kolejności.
// EN: The top row and the tiles in the saved order.
import { DashboardHeader } from './DashboardHeader';
import { TileRows } from './TileRows';
// PL: Dane pulpitu.
// EN: The dashboard data.
import { useDashboard } from './queries';
// PL: Kolejność kafelków i jej zapis.
// EN: The tile order and its saving.
import { loadTileOrder, moveTile, saveTileOrder, type TileId } from './tileOrder';
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

  // PL: Kolejność kafelków z zapisu w telefonie (albo domyślna) i tryb edycji. Tryb edycji nie zapisuje się, po odświeżeniu wraca wyłączony.
  // EN: The tile order from the phone's saved copy (or the default) and the edit mode. The edit mode is not saved, so after a refresh it is off again.
  const [order, setOrder] = useState<TileId[]>(() => loadTileOrder());
  const [editing, setEditing] = useState(false);

  // PL: Przesunięcie kafelka od razu zapisuje nową kolejność.
  // EN: Moving a tile saves the new order at once.
  const handleMove = (id: TileId, step: -1 | 1) => {
    const next = moveTile(order, id, step);
    setOrder(next);
    saveTileOrder(next);
  };

  return (
    <>
      <main className="dash" data-subtrack="9">
        <DashboardHeader editing={editing} onToggleEdit={() => setEditing((on) => !on)} />
        <FetchNote query={query} />
        <TileRows order={order} data={data} editing={editing} onMove={handleMove} />
      </main>
      {/* PL: Dolny pasek nawigacji, jak na ekranie 2.1. EN: The bottom navigation bar, as on screen 2.1. */}
      <Dock />
    </>
  );
}
