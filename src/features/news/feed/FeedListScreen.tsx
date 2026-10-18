/**
 * PL: Ekran listy aktualności (ekran 2.2): pole szukania, filtr po typie i kafle wpisów od najnowszego. Szukanie idzie do serwera z opóźnieniem 300 ms, żeby nie wysyłać zapytania przy każdej literze. Pokazuje stan ładowania, błędu i braku wpisów. Brak internetu zgłasza wspólny pasek z korzenia aplikacji, a ekran pokazuje wtedy zapisane wpisy.
 * EN: The news list screen (screen 2.2): the search field, the type filter and entry tiles, newest first. The search goes to the server after a 300 ms delay, so no request is sent on every letter. Shows the loading, error and empty states. The shared bar at the app root reports missing internet, and the screen then shows the saved entries.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/hooks.ts::useEntries
 * @uses src/features/news/feed/filter.ts::filterEntries
 * @uses src/features/news/feed/useDebouncedValue.ts::useDebouncedValue
 * @used_by src/features/news/feed/NewsFeedScreen.tsx::FeedListScreen
 */

// PL: Stan wpisanego tekstu i wybranego filtra.
// EN: The typed text and the chosen filter state.
import { useState } from 'react';
// PL: Pasek ekranu, Dock, nagłówek zakładki.
// EN: The screen header, the Dock.
import { Dock, ScreenHeader } from '../../../shared';
// PL: Kafel wpisu, rząd chipów, pole szukania.
// EN: The entry tile, the chip row, the search field.
import { EntryCard } from './EntryCard';
import { SearchField } from './SearchField';
import { TypeFilterRow } from './TypeFilter';
// PL: Filtrowanie i dane.
// EN: Filtering and data.
import { filterEntries, type TypeFilter } from './filter';
import { useEntries } from './hooks';
import { useDebouncedValue } from './useDebouncedValue';

// PL: Opóźnienie po ostatniej literze, zanim tekst pójdzie do serwera.
// EN: The delay after the last letter before the text goes to the server.
const SEARCH_DELAY_MS = 300;

/**
 * PL: Komunikat, gdy lista jest pusta. Przy szukaniu podaje szukany tekst.
 * EN: The message when the list is empty. When searching, it gives the searched text.
 *
 * @param term - PL: szukany tekst (może być pusty). EN: the searched text (may be empty).
 * @param filter - PL: wybrany typ wpisów. EN: the chosen entry type.
 * @returns PL: tekst komunikatu. EN: the message text.
 */
function emptyMessage(term: string, filter: TypeFilter): string {
  if (term !== '') return `Nic nie znaleziono dla „${term}”.`;
  return filter === 'all' ? 'Nie ma jeszcze wpisów.' : 'Nie ma wpisów tego typu.';
}

/**
 * PL: Rysuje ekran listy aktualności.
 * EN: Draws the news list screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function FeedListScreen() {
  // PL: Wybrany typ wpisów.
  // EN: The chosen entry type.
  const [filter, setFilter] = useState<TypeFilter>('all');
  // PL: Tekst w polu od razu, a do serwera idzie po przerwie w pisaniu.
  // EN: The text in the field at once, and it goes to the server after a pause in typing.
  const [text, setText] = useState('');
  const term = useDebouncedValue(text.trim(), SEARCH_DELAY_MS);
  const query = useEntries(term);
  const visible = query.data ? filterEntries(query.data, filter) : [];

  return (
    <main className="news-feed" data-subtrack="3a">
      <ScreenHeader title="Aktualności" />
      <div className="news-feed__body">
        <SearchField value={text} onChange={setText} />
        <TypeFilterRow value={filter} onChange={setFilter} />
        {query.isError && query.data !== undefined ? <p className="news-note">Nie udało się odświeżyć wpisów. Pokazujemy zapisane.</p> : null}
        {query.isPending && query.fetchStatus !== 'paused' ? (
          <p role="status" className="news-note">
            Ładuję wpisy…
          </p>
        ) : null}
        {query.isPending && query.fetchStatus === 'paused' ? <p className="news-note">Brak internetu i brak zapisanych wpisów.</p> : null}
        {query.isError && query.data === undefined ? (
          <div className="news-note">
            <p>Nie udało się pobrać wpisów.</p>
            <button type="button" className="news-button" onClick={() => void query.refetch()}>
              Spróbuj ponownie
            </button>
          </div>
        ) : null}
        {query.data !== undefined && visible.length === 0 ? (
          <p className="news-note">{emptyMessage(term, filter)}</p>
        ) : null}
        <div className="news-list">
          {visible.map((entry, index) => (
            // PL: Pierwszy wpis przypięty lub ważny dostaje większy kafel.
            // EN: The first entry, pinned or important, gets the larger tile.
            <EntryCard key={entry.id} entry={entry} featured={index === 0 && (entry.pinned || entry.type === 'important')} />
          ))}
        </div>
      </div>
      <Dock />
    </main>
  );
}
