/**
 * PL: Kafel „Ogłoszenia”: do trzech ostatnich wpisów z aktualności, każdy jako wiersz z datą. Wiersz prowadzi do wpisu, a nagłówek do listy aktualności. Bez wpisów kafel mówi, że nic nie ma (docs/projekt/EKRANY.md, ekran 2.1).
 * EN: The "Ogłoszenia" tile: up to three latest news entries, each as a row with a date. A row leads to its entry and the heading to the news list. Without entries the tile says there is nothing (docs/projekt/EKRANY.md, screen 2.1).
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/format.ts::formatShortDate
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Link do ekranu aktualności bez przeładowania strony.
// EN: A link to the news screen without reloading the page.
import { Link } from 'react-router';
// PL: Krótka data wiersza.
// EN: The short date of a row.
import { formatShortDate } from './format';
// PL: Typ danych kafla.
// EN: The tile data type.
import type { AnnouncementRow } from './types';

/**
 * PL: Dane kafla „Ogłoszenia”.
 * EN: The data of the "Ogłoszenia" tile.
 */
export type AnnouncementsTileProps = {
  /** PL: Ostatnie wpisy, od najnowszego. Pusta lista to pusty stan. EN: The latest entries, newest first. An empty list is the empty state. */
  rows: AnnouncementRow[];
};

/**
 * PL: Rysuje kafel „Ogłoszenia” z wierszami albo z pustym stanem.
 * EN: Draws the "Ogłoszenia" tile with rows or with the empty state.
 *
 * @param props - PL: wiersze do pokazania. EN: the rows to show.
 * @returns PL: kafel z listą wpisów albo z napisem o braku wpisów. EN: a tile with the entry list, or with a label about no entries.
 */
export function AnnouncementsTile({ rows }: AnnouncementsTileProps) {
  // PL: Nagłówek kafla prowadzi do pełnej listy aktualności.
  // EN: The tile heading leads to the full news list.
  return (
    <section className="dash-tile" aria-label="Ogłoszenia">
      <Link className="dash-label dash-label--link" to="/news/feed">
        Ogłoszenia
      </Link>
      {/* PL: Bez wpisów kafel mówi to wprost (napis z modułu aktualności, do ustalenia z zespołem). EN: Without entries the tile says so plainly (the label from the news module, to be agreed with the team). */}
      {rows.length === 0 ? <p className="dash-empty">Nie ma jeszcze wpisów.</p> : null}
      {/* PL: Wiersze: data i tytuł. Dotknięcie otwiera wpis. EN: The rows: a date and a title. A tap opens the entry. */}
      <ul className="dash-rows">
        {rows.map((row) => (
          <li key={row.id}>
            <Link className="dash-row" to={`/news/feed/${encodeURIComponent(row.id)}`}>
              <span className="dash-row__date">{formatShortDate(row.publishedAt)}</span>
              <span>{row.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
