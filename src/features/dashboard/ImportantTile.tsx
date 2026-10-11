/**
 * PL: Kafel „Ważne”: najnowszy wpis typu „Ważne” z aktualności. Cały kafel prowadzi do tego wpisu. Bez wpisu kafel mówi, że nic nie ma (docs/projekt/EKRANY.md, ekran 2.1).
 * EN: The "Ważne" tile: the newest entry of the "Ważne" type from the news. The whole tile leads to that entry. Without an entry the tile says there is nothing (docs/projekt/EKRANY.md, screen 2.1).
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/format.ts::formatAge
 * @uses src/features/dashboard/icons.tsx::AlertIcon
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Link do ekranu wpisu bez przeładowania strony.
// EN: A link to the entry screen without reloading the page.
import { Link } from 'react-router';
// PL: Wiek wpisu i ikona.
// EN: The entry age and the icon.
import { formatAge } from './format';
import { AlertIcon } from './icons';
// PL: Typ danych kafla.
// EN: The tile data type.
import type { ImportantEntry } from './types';

/**
 * PL: Dane kafla „Ważne”.
 * EN: The data of the "Ważne" tile.
 */
export type ImportantTileProps = {
  /** PL: Najnowszy wpis „Ważne” albo null, gdy takiego nie ma. EN: The newest "Ważne" entry, or null when there is none. */
  entry: ImportantEntry | null;
};

/**
 * PL: Rysuje kafel „Ważne” z wpisem albo z pustym stanem.
 * EN: Draws the "Ważne" tile with an entry or with the empty state.
 *
 * @param props - PL: wpis do pokazania. EN: the entry to show.
 * @returns PL: kafel z linkiem do wpisu albo kafel z napisem o braku wpisów. EN: a tile with a link to the entry, or a tile with a label about no entries.
 */
export function ImportantTile({ entry }: ImportantTileProps) {
  // PL: Bez wpisu kafel nie znika, tylko mówi, że nic nie ma. Napis jest z modułu aktualności (do ustalenia z zespołem).
  // EN: Without an entry the tile does not disappear, it says there is nothing. The label is from the news module (to be agreed with the team).
  if (entry === null) {
    return (
      <section className="dash-tile dash-tile--important" aria-label="Ważne">
        <p className="dash-label">
          <AlertIcon /> Ważne
        </p>
        <p className="dash-empty">Nie ma jeszcze wpisów.</p>
      </section>
    );
  }

  // PL: Kafel jest linkiem do wpisu. Etykieta ma źródło wpisu, a po prawej wiek wpisu.
  // EN: The tile is a link to the entry. The label has the entry source and, on the right, the entry age.
  return (
    <Link className="dash-tile dash-tile--important" to={`/news/feed/${encodeURIComponent(entry.id)}`}>
      <span className="dash-label dash-label--split">
        <span>
          <AlertIcon /> {entry.source === '' ? 'Ważne' : `Ważne · ${entry.source}`}
        </span>
        <span>{formatAge(entry.publishedAt)}</span>
      </span>
      {/* PL: Tytuł wpisu. EN: The entry title. */}
      <h2 className="dash-title">{entry.title}</h2>
      {/* PL: Fragment treści, tylko gdy wpis go ma. EN: The content excerpt, only when the entry has one. */}
      {entry.excerpt === '' ? null : <small className="dash-small">{entry.excerpt}</small>}
    </Link>
  );
}
