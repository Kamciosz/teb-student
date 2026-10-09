/**
 * PL: Ekran listy aktualności (ekran 2.2): filtr po typie i kafle wpisów od najnowszego. Pokazuje stan ładowania, błędu, braku wpisów i zapisaną kopię bez internetu.
 * EN: The news list screen (screen 2.2): the type filter and entry tiles, newest first. Shows the loading, error and empty states, and the saved copy without internet.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/hooks.ts::useEntries
 * @uses src/features/news/feed/filter.ts::filterEntries
 * @used_by src/features/news/feed/NewsFeedScreen.tsx::FeedListScreen
 */

// PL: Stan wybranego filtra.
// EN: The chosen filter state.
import { useState } from 'react';
// PL: Kafel wpisu, rząd chipów, pasek ekranu.
// EN: The entry tile, the chip row, the screen bar.
import { EntryCard } from './EntryCard';
import { ScreenTop } from './ScreenTop';
import { TypeFilterRow } from './TypeFilter';
// PL: Filtrowanie i dane.
// EN: Filtering and data.
import { filterEntries, type TypeFilter } from './filter';
import { useEntries } from './hooks';

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
  const query = useEntries();
  const visible = query.data ? filterEntries(query.data, filter) : [];
  // PL: Zapisana kopia jest pokazywana, gdy odświeżenie się nie udało albo telefon nie ma internetu.
  // EN: The saved copy is shown when the refresh failed or the phone has no internet.
  const showingSavedCopy = query.data !== undefined && (query.isError || query.fetchStatus === 'paused');

  return (
    <main className="news-feed" data-subtrack="3a">
      <ScreenTop title="Aktualności" backTo="/" backLabel="Wróć do pulpitu" />
      <TypeFilterRow value={filter} onChange={setFilter} />
      {showingSavedCopy ? <p className="news-note">Brak połączenia. Pokazujemy zapisane wpisy.</p> : null}
      {query.isPending && query.fetchStatus !== 'paused' ? (
        <p role="status" className="news-note">
          Ładuję wpisy…
        </p>
      ) : null}
      {query.isPending && query.fetchStatus === 'paused' ? <p className="news-note">Brak połączenia i brak zapisanych wpisów.</p> : null}
      {query.isError && query.data === undefined ? (
        <div className="news-note">
          <p>Nie udało się pobrać wpisów.</p>
          <button type="button" className="news-button" onClick={() => void query.refetch()}>
            Spróbuj ponownie
          </button>
        </div>
      ) : null}
      {query.data !== undefined && visible.length === 0 ? (
        <p className="news-note">{filter === 'all' ? 'Nie ma jeszcze wpisów.' : 'Nie ma wpisów tego typu.'}</p>
      ) : null}
      <div className="news-list">
        {visible.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </main>
  );
}
