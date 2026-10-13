/**
 * PL: Test kafla wpisu na liście panelu: znacznik stanu, przyciski, adres „Otwórz korektę” dla wpisu w korekcie oraz znacznik „Zaplanowany na …”, który pojawia się tylko przy opublikowanym wpisie z chwilą startu w przyszłości. Zegar jest udawany (vi.setSystemTime), więc test nie zależy od dnia uruchomienia.
 * EN: Test of the entry tile on the panel list: the status tag, the buttons, the "Otwórz korektę" address for an entry in review and the "Zaplanowany na …" tag, which appears only for a published entry with a start moment in the future. The clock is fake (vi.setSystemTime), so the test does not depend on the day it runs.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/admin/EntryTile.tsx::EntryTile
 * @uses src/features/news/admin/schedule.ts::scheduledLabel
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest i udawany zegar.
// EN: Vitest test functions and the fake clock.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Rysowanie do tekstu HTML, a router do linków w kaflu.
// EN: Rendering to an HTML string, and the router for the links in the tile.
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
// PL: Typ wpisu i kafel pod testem.
// EN: The entry type and the tile under test.
import type { PanelEntry } from './api';
import { EntryTile } from './EntryTile';

/** PL: „Teraz” w testach: 24.10.2026 o 14:00 w Warszawie (12:00 UTC), przed zmianą czasu. EN: "Now" in the tests: 24.10.2026 at 14:00 in Warsaw (12:00 UTC), before the time change. */
const NOW = new Date('2026-10-24T12:00:00Z');

/**
 * PL: Tworzy wpis testowy: opublikowany, bez chwili startu, chyba że nadpisano pola.
 * EN: Makes a test entry: published, without a start moment, unless the fields are overridden.
 *
 * @param overrides - PL: pola do zmiany. EN: the fields to change.
 * @returns PL: wpis z listy panelu. EN: the entry from the panel list.
 */
function entry(overrides: Partial<PanelEntry>): PanelEntry {
  return { id: 'w1', type: 'event', status: 'published', title: 'Dzień sportu', source: 'Samorząd', publishedAt: '2026-10-09T10:00:00.000Z', pinnedAt: null, publishAt: null, ...overrides };
}

/**
 * PL: Rysuje kafel w routerze w pamięci i oddaje HTML.
 * EN: Renders the tile inside an in-memory router and returns the HTML.
 *
 * @param item - PL: wpis do pokazania. EN: the entry to show.
 * @returns PL: tekst HTML kafla. EN: the HTML string of the tile.
 */
function tileHtml(item: PanelEntry): string {
  return renderToString(
    <MemoryRouter>
      <ul>
        <EntryTile entry={item} isLocked={false} onPublish={() => {}} onTogglePin={() => {}} onDelete={() => {}} />
      </ul>
    </MemoryRouter>,
  );
}

// PL: Przed każdym testem zegar stoi na „teraz”, a po teście wraca do prawdziwego.
// EN: Before every test the clock stands at "now", and after the test it goes back to the real one.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

// PL: Znacznik zaplanowania na kaflu.
// EN: The scheduled tag on the tile.
describe('EntryTile: znacznik zaplanowania / the scheduled tag', () => {
  // PL: Opublikowany wpis z chwilą startu w przyszłości pokazuje znacznik obok statusu, z godziną w Warszawie.
  // EN: A published entry with a start moment in the future shows the tag next to the status, with the Warsaw hour.
  it('pokazuje „Zaplanowany na …” przy opublikowanym wpisie z przyszłą chwilą / shows "Zaplanowany na …" for a published entry with a future moment', () => {
    const html = tileHtml(entry({ publishAt: '2026-10-25T02:00:00.000Z' }));

    expect(html).toContain('Zaplanowany na 25.10, 03:00');
    expect(html).toContain('Opublikowany');
  });

  // PL: Wpis, którego chwila startu minęła, jest już u uczniów, więc znacznika nie ma.
  // EN: An entry whose start moment has passed is already with the students, so there is no tag.
  it('opublikowany wpis z chwilą w przeszłości nie ma znacznika / a published entry with a past moment has no tag', () => {
    expect(tileHtml(entry({ publishAt: '2026-10-24T11:00:00.000Z' }))).not.toContain('Zaplanowany');
  });

  // PL: Szkic nie dostaje znacznika, nawet z chwilą startu w przyszłości.
  // EN: A draft gets no tag, even with a start moment in the future.
  it('szkic nie ma znacznika, nawet z przyszłą chwilą / a draft has no tag, even with a future moment', () => {
    const html = tileHtml(entry({ status: 'draft', publishedAt: null, publishAt: '2026-10-25T02:00:00.000Z' }));

    expect(html).not.toContain('Zaplanowany');
    expect(html).toContain('Szkic');
  });
});

// PL: Wpis w korekcie ma znacznik „Do korekty”, link do korekty i nie wygląda na opublikowany.
// EN: An entry in review has the "Do korekty" tag, a link to the review and does not look published.
describe('wpis w korekcie / entry in review', () => {
  // PL: Znacznik „Do korekty” zamiast „Opublikowany”, bez „Opublikuj”, z linkiem do kreatora.
  // EN: The "Do korekty" tag instead of "Opublikowany", no "Opublikuj", with a link to the wizard.
  it('ma znacznik „Do korekty” i link do korekty bez przycisku publikacji / has the "Do korekty" tag and a review link without a publish button', () => {
    const html = tileHtml(entry({ id: 'w-1', status: 'in_review', publishedAt: null }));

    expect(html).toContain('Do korekty');
    expect(html).not.toContain('Opublikowany');
    expect(html).not.toContain('Opublikuj');
    expect(html).toContain('href="/news/editor/w-1"');
    expect(html).toContain('Otwórz korektę');
  });

  // PL: „Usuń” jest zawsze, także w korekcie.
  // EN: "Usuń" is always there, also for an entry in review.
  it('ma przycisk „Usuń” / has the "Usuń" button', () => {
    expect(tileHtml(entry({ id: 'w-1', status: 'in_review', publishedAt: null }))).toContain('Usuń');
  });
});

// PL: Szkic ma „Edytuj” i „Opublikuj”, opublikowany nie ma żadnego z nich.
// EN: A draft has "Edytuj" and "Opublikuj", a published entry has neither.
describe('pozostałe stany / other states', () => {
  // PL: Szkic pokazuje znacznik „Szkic” i obie czynności.
  // EN: A draft shows the "Szkic" tag and both actions.
  it('szkic ma „Szkic”, „Edytuj” i „Opublikuj” / a draft has "Szkic", "Edytuj" and "Opublikuj"', () => {
    const html = tileHtml(entry({ id: 'w-1', status: 'draft', publishedAt: null }));

    expect(html).toContain('Szkic');
    expect(html).toContain('Edytuj');
    expect(html).toContain('Opublikuj');
    expect(html).not.toContain('Do korekty');
  });

  // PL: Wpis opublikowany ma tylko znacznik i „Usuń”.
  // EN: A published entry has only the tag and "Usuń".
  it('opublikowany nie ma „Edytuj”, „Opublikuj” ani „Do korekty” / a published entry has no "Edytuj", "Opublikuj" or "Do korekty"', () => {
    const html = tileHtml(entry({ id: 'w-1' }));

    expect(html).toContain('Opublikowany');
    expect(html).not.toContain('Edytuj');
    expect(html).not.toContain('Opublikuj');
    expect(html).not.toContain('Do korekty');
    expect(html).not.toContain('Otwórz korektę');
  });
});
