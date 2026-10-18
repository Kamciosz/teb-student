/**
 * PL: Kafel wpisu na liście: znacznik typu, źródło z czasem, tytuł i krótki opis. Cały kafel jest odnośnikiem do wpisu (ekran 2.2). Zdjęcia w kaflach czekają na podtor 2.
 * EN: An entry tile on the list: the type tag, the source with the time, the title and a short description. The whole tile is a link to the entry (screen 2.2). Photos in tiles wait for subtrack 2.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/format.ts::formatRelative
 * @used_by src/features/news/feed/FeedListScreen.tsx::EntryCard
 */

// PL: Odnośnik routera.
// EN: The router link.
import { Link } from 'react-router';
// PL: Czas „20 min temu”.
// EN: The "20 min temu" time.
import { formatRelative } from './format';
// PL: Typ wpisu i nazwy typów.
// EN: The entry type and type names.
import { NEWS_TYPE_LABELS, type NewsEntrySummary } from './types';

/**
 * PL: Dane kafla.
 * EN: Tile data.
 */
export type EntryCardProps = {
  /** PL: Wpis do pokazania. EN: The entry to show. */
  entry: NewsEntrySummary;
  /** PL: Czy to wyróżniony, większy wpis na górze listy. EN: Whether it is the highlighted, larger entry at the top of the list. */
  featured?: boolean;
};

/**
 * PL: Rysuje kafel wpisu. Wyróżniony wpis ma większy tytuł i dwa wiersze opisu, zwykły jest zwarty.
 * EN: Draws the entry tile. A featured entry has a larger title and two lines of description, a regular one is compact.
 *
 * @param props - PL: wpis i czy wyróżniony. EN: the entry and whether it is featured.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function EntryCard({ entry, featured = false }: EntryCardProps) {
  const className = ['news-card', `news-card--${entry.type}`, featured ? 'news-card--featured' : ''].filter(Boolean).join(' ');
  return (
    <Link className={className} to={`/news/feed/${encodeURIComponent(entry.id)}`}>
      <span className="news-card__meta">
        <span className="news-tag" data-type={entry.type}>{NEWS_TYPE_LABELS[entry.type]}</span>
        {entry.pinned ? <span className="news-tag news-tag--pinned">Przypięte</span> : null}
        <small>
          {entry.source} · {formatRelative(entry.publishedAt)}
        </small>
      </span>
      <h2>{entry.title}</h2>
      {entry.excerpt === '' ? null : <small className="news-card__excerpt">{entry.excerpt}</small>}
    </Link>
  );
}
