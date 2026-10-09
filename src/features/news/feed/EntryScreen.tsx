/**
 * PL: Ekran jednego wpisu (ekran 2.3): znacznik typu, źródło z datą, tytuł, treść i przycisk z linkiem. Treść rysuje RichContent, który czyści dokument JSON. Szkic i nieznany numer pokazują „Nie znaleziono wpisu”.
 * EN: The single entry screen (screen 2.3): the type tag, the source with the date, the title, the content and the link button. RichContent draws the content and cleans the JSON document. A draft and an unknown id show "Nie znaleziono wpisu" (entry not found).
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/hooks.ts::useEntry
 * @uses src/features/news/feed/content/RichContent.tsx::RichContent
 * @used_by src/features/news/feed/NewsFeedScreen.tsx::EntryScreen
 */

// PL: Numer wpisu z adresu.
// EN: The entry id from the address.
import { useParams } from 'react-router';
// PL: Treść wpisu i pasek ekranu.
// EN: The entry content and the screen bar.
import { RichContent } from './content/RichContent';
import { safeHttpsUrl } from './content/sanitize';
import { ScreenTop } from './ScreenTop';
// PL: Dane, błąd API i zapis daty.
// EN: Data, the API error and the date format.
import { NewsApiError } from './api';
import { formatDay } from './format';
import { useEntry } from './hooks';
// PL: Nazwy typów.
// EN: The type names.
import { NEWS_TYPE_LABELS, type NewsEntryDetail } from './types';

/**
 * PL: Rysuje przycisk z linkiem pod wpisem, o ile adres jest poprawnym adresem https.
 * EN: Draws the link button under the entry, as long as the address is a valid https address.
 *
 * @param entry - PL: wpis. EN: the entry.
 * @returns PL: przycisk albo null. EN: the button or null.
 */
function EntryLink({ entry }: { entry: NewsEntryDetail }) {
  const href = safeHttpsUrl(entry.linkUrl);
  if (href === null) return null;
  return (
    <a className="news-button news-button--outline" href={href} target="_blank" rel="noopener noreferrer">
      {entry.linkLabel ?? 'Otwórz link'}
    </a>
  );
}

/**
 * PL: Rysuje ekran jednego wpisu.
 * EN: Draws the single entry screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function EntryScreen() {
  // PL: Numer wpisu pochodzi z adresu /news/feed/:id.
  // EN: The entry id comes from the /news/feed/:id address.
  const { id = '' } = useParams();
  const query = useEntry(id);
  const entry = query.data;
  const notFound = query.error instanceof NewsApiError && query.error.status === 404;

  return (
    <main className="news-feed" data-subtrack="3a">
      <ScreenTop title={entry ? entry.title : 'Aktualność'} backTo="/news/feed" backLabel="Wróć do listy aktualności" />
      {query.isPending ? (
        <p role="status" className="news-note">
          Ładuję wpis…
        </p>
      ) : null}
      {notFound ? <p className="news-note">Nie znaleziono wpisu.</p> : null}
      {query.isError && !notFound ? (
        <div className="news-note">
          <p>Nie udało się pobrać wpisu.</p>
          <button type="button" className="news-button" onClick={() => void query.refetch()}>
            Spróbuj ponownie
          </button>
        </div>
      ) : null}
      {entry ? (
        <article className="news-entry">
          <p className="news-card__meta">
            <span className="news-tag">{NEWS_TYPE_LABELS[entry.type]}</span>
            <small>
              {entry.source} · {formatDay(entry.publishedAt)}
            </small>
          </p>
          <RichContent body={entry.body} />
          <EntryLink entry={entry} />
        </article>
      ) : null}
    </main>
  );
}
