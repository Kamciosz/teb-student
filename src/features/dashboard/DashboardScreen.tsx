/**
 * PL: Ekran pulpitu (podtor 9, ekran 2.1 w docs/projekt/EKRANY.md) w stylu aplikacji systemowej: nagłówek „Dzisiaj”, góra z licznikiem do dzwonka i blokiem „Ważne”, potem sekcje „Do zrobienia” i „Informacje” jako grupy wierszy, pod nimi kafel „Zgłoś problem”, a na dole dolny pasek. Sekcje można przesuwać przyciskami „Wyżej” i „Niżej”. Dane przychodzą jednym zapytaniem do serwera pulpitu i są zapisane w telefonie, więc bez internetu widać ostatnio pobrane. Bez danych sekcje pokazują pusty stan.
 * EN: The dashboard screen (subtrack 9, screen 2.1 in docs/projekt/EKRANY.md) in the system app style: the "Dzisiaj" header, the top with the bell countdown and the "Ważne" block, then the "Do zrobienia" and "Informacje" sections as groups of rows, below them the "Zgłoś problem" tile, and the bottom bar at the end. The sections can be moved with the "Wyżej" and "Niżej" buttons. The data comes in one request to the dashboard server and is saved on the phone, so without internet the last fetched data shows. Without data the sections show the empty state.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::Dock
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/shared/index.ts::PlusIcon
 * @uses src/features/dashboard/queries.ts::useDashboard
 * @uses src/features/dashboard/DashboardHeader.tsx::DashboardHeader
 * @uses src/features/dashboard/DashboardHero.tsx::DashboardHero
 * @uses src/features/dashboard/Sections.tsx::Sections
 * @uses src/features/dashboard/tileOrder.ts::loadSectionOrder
 * @used_by src/features/dashboard/index.ts::DashboardScreen
 */

// PL: Stan ekranu: kolejność i tryb edycji.
// EN: The screen state: the order and the edit mode.
import { useState } from 'react';
// PL: Przycisk tekstowy, dolny pasek nawigacji, grupa wierszy, wiersz i ikona plusa.
// EN: The text button, the bottom navigation bar, the row group, the row and the plus icon.
import { Button, Dock, ListGroup, ListRow, PlusIcon } from '../../shared';
// PL: Nagłówek, góra z licznikiem i sekcje.
// EN: The header, the top with the countdown and the sections.
import { DashboardHeader } from './DashboardHeader';
import { DashboardHero } from './DashboardHero';
import { Sections } from './Sections';
// PL: Dane pulpitu.
// EN: The dashboard data.
import { useDashboard } from './queries';
// PL: Kolejność sekcji i jej zapis.
// EN: The section order and its saving.
import { loadSectionOrder, moveSection, saveSectionOrder, type SectionId } from './tileOrder';
// PL: Style pulpitu.
// EN: The dashboard styles.
import './dashboard.css';

/**
 * PL: Rysuje komunikat o stanie pobierania: ładowanie, brak internetu bez zapisanych danych, błąd z przyciskiem ponowienia albo ostrzeżenie, że pokazujemy zapisane dane. Gdy wszystko jest w porządku, nie rysuje nic. Napisy są jak w module aktualności.
 * EN: Draws a message about the fetching state: loading, no internet without saved data, an error with a retry button, or a warning that we show saved data. When everything is fine, it draws nothing. The labels are as in the news module.
 *
 * @param props - PL: wynik zapytania o pulpit. EN: the dashboard query result.
 * @returns PL: komunikat albo null. EN: the message or null.
 */
function FetchNote({ query }: { query: ReturnType<typeof useDashboard> }) {
  // PL: Dane z zapisu w telefonie albo z serwera, ale ostatnie odświeżenie się nie udało: uczeń widzi pulpit i ostrzeżenie.
  // EN: Data from the phone's saved copy or from the server, but the last refresh failed: the student sees the dashboard and a warning.
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
        <Button variant="plain" onClick={() => void query.refetch()}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }
  return null;
}

/**
 * PL: Rysuje ekran pulpitu. Gdy danych jeszcze nie ma, sekcje są puste i widać komunikat o stanie pobierania.
 * EN: Draws the dashboard screen. When there is no data yet, the sections are empty and a fetching state message shows.
 *
 * @returns PL: ekran z nagłówkiem, górą, sekcjami i dolnym paskiem. EN: the screen with the header, the top, the sections and the bottom bar.
 */
export function DashboardScreen() {
  // PL: Dane pulpitu. Bez nich (ładowanie, błąd, brak internetu) sekcje dostają pusty stan.
  // EN: The dashboard data. Without it (loading, an error, no internet) the sections get the empty state.
  const query = useDashboard();
  const data = query.data;

  // PL: Kolejność sekcji z zapisu w telefonie (albo domyślna) i tryb edycji. Tryb edycji nie zapisuje się, po odświeżeniu wraca wyłączony.
  // EN: The section order from the phone's saved copy (or the default) and the edit mode. The edit mode is not saved, so after a refresh it is off again.
  const [order, setOrder] = useState<SectionId[]>(() => loadSectionOrder());
  const [editing, setEditing] = useState(false);

  // PL: Przesunięcie sekcji od razu zapisuje nową kolejność.
  // EN: Moving a section saves the new order at once.
  const handleMove = (id: SectionId, step: -1 | 1) => {
    const next = moveSection(order, id, step);
    setOrder(next);
    saveSectionOrder(next);
  };

  return (
    <>
      <main className="dash" data-subtrack="9">
        <DashboardHeader editing={editing} onToggleEdit={() => setEditing((on) => !on)} />
        <DashboardHero important={data?.important ?? null} />
        <FetchNote query={query} />
        <Sections order={order} data={data} editing={editing} onMove={handleMove} />
        {/* PL: Kafel „Zgłoś problem” pod sekcjami: jeden wiersz prowadzi do formularza zgłoszenia. EN: The "Zgłoś problem" tile under the sections: one row leads to the report form. */}
        <div className="dash-section">
          <ListGroup>
            <ListRow
              title="Zgłoś problem"
              subtitle="Napisz, co nie działa w szkole."
              icon={<PlusIcon />}
              to="/reports/student"
            />
          </ListGroup>
        </div>
      </main>
      {/* PL: Dolny pasek nawigacji, jak na ekranie 2.1. EN: The bottom navigation bar, as on screen 2.1. */}
      <Dock />
    </>
  );
}
