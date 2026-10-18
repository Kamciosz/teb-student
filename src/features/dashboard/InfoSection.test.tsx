/**
 * PL: Testy sekcji „Informacje”: wiersze ogłoszeń z krótką datą i linkiem, pusty stan bez wpisów oraz wiersz „Wszystkie aktualności” na końcu.
 * EN: Tests of the "Informacje" section: announcement rows with the short date and a link, the empty state with no entries, and the "Wszystkie aktualności" row at the end.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/features/dashboard/InfoSection.tsx::InfoSection
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Renderowanie na tekst i router, którego wymagają linki wierszy.
// EN: Rendering to text and the router that the row links need.
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
// PL: Testowana sekcja i typ wiersza.
// EN: The tested section and the row type.
import { InfoSection } from './InfoSection';
import type { AnnouncementRow } from './types';

// PL: Trzy przykładowe ogłoszenia, od najnowszego.
// EN: Three sample announcements, newest first.
const ROWS: AnnouncementRow[] = [
  { id: 'n-3', title: 'Dzień sportu', publishedAt: '2026-10-12T08:00:00Z' },
  { id: 'n-2', title: 'Zmiana sali', publishedAt: '2026-10-10T08:00:00Z' },
  { id: 'n-1', title: 'Wycieczka', publishedAt: '2026-10-08T08:00:00Z' },
];

/**
 * PL: Renderuje sekcję w routerze.
 * EN: Renders the section inside a router.
 *
 * @param rows - PL: wiersze ogłoszeń. EN: the announcement rows.
 * @returns PL: HTML sekcji. EN: the HTML of the section.
 */
function renderInfo(rows: AnnouncementRow[]): string {
  return renderToString(
    <MemoryRouter>
      <InfoSection rows={rows} />
    </MemoryRouter>,
  );
}

describe('InfoSection', () => {
  // PL: Każdy wiersz ma tytuł, krótką datę i link do wpisu.
  // EN: Each row has a title, a short date and a link to the entry.
  it('pokazuje wiersze z krótką datą i linkiem / shows the rows with the short date and the link', () => {
    const html = renderInfo(ROWS);

    expect(html).toContain('Informacje');
    expect(html).toContain('Dzień sportu');
    expect(html).toContain('12.10');
    expect(html).toContain('href="/news/feed/n-3"');
    expect(html).toContain('href="/news/feed/n-1"');
  });

  // PL: Na końcu jest wiersz do pełnej listy aktualności.
  // EN: At the end there is a row to the full news list.
  it('kończy wierszem „Wszystkie aktualności” / ends with the "Wszystkie aktualności" row', () => {
    const html = renderInfo(ROWS);

    expect(html).toContain('Wszystkie aktualności');
    expect(html).toContain('href="/news/feed"');
    expect(html.indexOf('Wycieczka')).toBeLessThan(html.indexOf('Wszystkie aktualności'));
  });

  // PL: Bez wpisów pokazujemy napis zamiast pustej grupy, a link do aktualności zostaje.
  // EN: Without entries we show a text instead of an empty group, and the news link stays.
  it('bez wpisów pokazuje pusty stan / without entries shows the empty state', () => {
    const html = renderInfo([]);

    expect(html).toContain('Nie ma jeszcze wpisów.');
    expect(html).toContain('Wszystkie aktualności');
  });
});
