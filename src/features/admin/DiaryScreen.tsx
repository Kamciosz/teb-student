/**
 * PL: Ekran „Dziennik zmian” w panelu (podtór 8): lista wpisów o wydanych kodach, nadanych i odebranych rolach oraz pobranych plikach z pilotażu. Najnowsze na górze, po 50 na stronę. Widzi go Samorząd i administrator (bramka w AdminScreen).
 * EN: The "Dziennik zmian" screen in the panel (subtrack 8): the list of entries about issued codes, granted and revoked roles and downloaded pilot files. Newest first, 50 per page. The Council and the administrator see it (the gate in AdminScreen).
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/admin/api.ts::DiaryEntry
 * @uses src/features/admin/api.ts::DiaryAction
 * @uses src/features/admin/api.ts::DiaryPage
 * @uses src/features/admin/queries.ts::useDiary
 * @uses src/features/admin/icons.tsx::Icon
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/shared/index.ts::EmptyState
 * @uses src/shared/index.ts::Button
 * @used_by src/features/admin/AdminScreen.tsx::AdminScreen
 */

// PL: Wspólne elementy ekranu: nagłówek, grupa, wiersz, pusty stan i przycisk.
// EN: The shared screen elements: the header, the group, the row, the empty state and the button.
import { useState } from 'react';
import { Button, EmptyState, ListGroup, ListRow, ScreenHeader } from '../../shared';
import type { DiaryAction, DiaryEntry, DiaryPage } from './api';
import { Icon } from './icons';
import { useDiary } from './queries';

/** PL: Nazwy działań po polsku. EN: The action names in Polish. */
const ACTION_NAMES: Record<DiaryAction, string> = {
  invite_issued: 'Wydano kod zaproszenia',
  council_granted: 'Nadano rolę Samorządu',
  council_revoked: 'Odebrano rolę Samorządu',
  editor_granted: 'Nadano rolę redakcji',
  editor_revoked: 'Odebrano rolę redakcji',
  pilot_downloaded: 'Pobrano dane z pilotażu',
  news_published: 'Opublikowano wpis',
  news_deleted: 'Usunięto wpis',
  report_stage_changed: 'Zmieniono etap zgłoszenia',
};

/**
 * PL: Rysuje ekran dziennika: nagłówek, lista wpisów albo pusty stan i przyciski stron.
 * EN: Draws the diary screen: the heading, the list of entries or the empty state and the page buttons.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function DiaryScreen() {
  // PL: Numer strony od 1; strona 1 to najnowsze wpisy.
  // EN: The page number from 1; page 1 is the newest entries.
  const [page, setPage] = useState(1);
  const diary = useDiary(page);
  return (
    <main className="ad-screen" data-subtrack="8">
      <ScreenHeader title="Dziennik zmian" backTo="/admin" backLabel="Panel" />
      <p className="ad-lead">Kto wydał kod, nadał rolę albo pobrał plik. Najnowsze na górze.</p>
      <DiaryContents data={diary.data} isError={diary.isError} />
      <DiaryPager page={page} hasNext={diary.data?.hasNext ?? false} onChange={setPage} />
    </main>
  );
}

/**
 * PL: Wybiera, co pokazać w środku ekranu: błąd, pustą listę albo wpisy. Dopóki strona się wczytuje, nic nie pokazuje.
 * EN: Chooses what to show in the middle of the screen: the error, the empty list or the entries. While the page loads it shows nothing.
 *
 * @param props - PL: strona wpisów albo undefined, i czy pobranie się nie udało. EN: the page of entries or undefined, and whether the fetch failed.
 * @returns PL: element środka ekranu. EN: the element of the middle of the screen.
 */
function DiaryContents({ data, isError }: { data: DiaryPage | undefined; isError: boolean }) {
  if (isError) {
    return (
      <p className="ad-error" role="alert">
        <Icon name="triangle-alert" />
        Nie udało się pobrać dziennika. Spróbuj ponownie za chwilę.
      </p>
    );
  }
  if (data === undefined) return null;
  if (data.entries.length === 0) return <EmptyDiary />;
  return (
    <ListGroup header="Wpisy">
      {data.entries.map((entry) => (
        <DiaryRow key={entry.id} entry={entry} />
      ))}
    </ListGroup>
  );
}

/**
 * PL: Jeden wiersz dziennika: nazwa działania, kto je wykonał i kiedy.
 * EN: One diary row: the action name, who did it and when.
 *
 * @param props - PL: wpis z serwera. EN: the entry from the server.
 * @returns PL: wiersz listy. EN: the list row.
 */
function DiaryRow({ entry }: { entry: DiaryEntry }) {
  return <ListRow title={ACTION_NAMES[entry.action]} subtitle={`${entry.actorName ?? 'Nieznana osoba'} · ${formatDiaryDate(entry.at)}`} />;
}

/**
 * PL: Pusty stan dziennika: tytuł i podpowiedź, co trafi do dziennika.
 * EN: The empty diary state: the title and the hint about what goes into the diary.
 *
 * @returns PL: pusty stan. EN: the empty state.
 */
function EmptyDiary() {
  return (
    <EmptyState title="Nie ma jeszcze wpisów">
      <small>Wpis pojawi się, gdy ktoś wyda kod, nada albo odbierze rolę albo pobierze plik z pilotażu.</small>
    </EmptyState>
  );
}

/**
 * PL: Przyciski stron: „Nowsze” (wcześniejsza strona, nieaktywna na pierwszej) i „Starsze” (nieaktywna, gdy nie ma kolejnej strony).
 * EN: The page buttons: "Nowsze" (the previous page, disabled on the first) and "Starsze" (disabled when there is no next page).
 *
 * @param props - PL: numer strony, czy jest następna i funkcja zmiany strony. EN: the page number, whether there is a next one and the page change function.
 * @returns PL: pasek z dwoma przyciskami. EN: the bar with two buttons.
 */
function DiaryPager({ page, hasNext, onChange }: { page: number; hasNext: boolean; onChange: (page: number) => void }) {
  return (
    <div className="ad-bottom ad-pager">
      <Button variant="plain" disabled={page === 1} onClick={() => onChange(page - 1)}>
        Nowsze
      </Button>
      <Button variant="plain" disabled={!hasNext} onClick={() => onChange(page + 1)}>
        Starsze
      </Button>
    </div>
  );
}

/**
 * PL: Zamienia czas wpisu (ISO z serwera) na zapis dla polskiego użytkownika, w czasie telefonu.
 * EN: Turns the entry time (ISO from the server) into a text for a Polish user, in the phone's time.
 *
 * @param isoDate - PL: data w formacie ISO. EN: the date in ISO format.
 * @returns PL: data i godzina. EN: the date and time.
 */
function formatDiaryDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' });
}
