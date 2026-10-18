/**
 * PL: Sekcja „Informacje” na pulpicie: grupa z ostatnimi ogłoszeniami (krótka data i tytuł) i wierszem „Wszystkie aktualności”, który prowadzi do pełnej listy. Bez wpisów zamiast wierszy stoi jeden wiersz z informacją.
 * EN: The "Informacje" (Information) section on the dashboard: a group with the latest announcements (short date and title) and a "Wszystkie aktualności" row that leads to the full list. Without entries, one row with a note stands instead of the rows.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/features/dashboard/format.ts::formatShortDate
 * @uses src/features/dashboard/types.ts::AnnouncementRow
 * @used_by src/features/dashboard/Sections.tsx::Sections
 */

// PL: Grupa wierszy w stylu iOS i pojedynczy wiersz.
// EN: The iOS-style group of rows and a single row.
import { ListGroup, ListRow } from '../../shared';
// PL: Krótka data wiersza.
// EN: The short date of the row.
import { formatShortDate } from './format';
// PL: Typ wiersza ogłoszenia.
// EN: The announcement row type.
import type { AnnouncementRow } from './types';

/** PL: Własności sekcji „Informacje”. EN: The properties of the "Informacje" section. */
export type InfoSectionProps = {
  /** PL: Do trzech ostatnich ogłoszeń, od najnowszego. EN: Up to three latest announcements, newest first. */
  rows: AnnouncementRow[];
};

/**
 * PL: Rysuje sekcję „Informacje”: wiersze ogłoszeń i na końcu link do wszystkich aktualności.
 * EN: Draws the "Informacje" section: the announcement rows and, at the end, a link to all the news.
 *
 * @param props - PL: ogłoszenia do pokazania. EN: the announcements to show.
 * @returns PL: grupa wierszy. EN: the group of rows.
 */
export function InfoSection({ rows }: InfoSectionProps) {
  return (
    <ListGroup header="Informacje">
      {rows.length === 0 ? <ListRow title="Nie ma jeszcze wpisów." /> : null}
      {rows.map((row) => (
        <ListRow
          key={row.id}
          title={row.title}
          value={formatShortDate(row.publishedAt)}
          to={`/news/feed/${encodeURIComponent(row.id)}`}
        />
      ))}
      <ListRow title="Wszystkie aktualności" to="/news/feed" />
    </ListGroup>
  );
}
