/**
 * PL: Test kafla wpisu w panelu: znacznik stanu, przyciski i adres „Otwórz korektę” dla wpisu w korekcie. Wpis w korekcie nie może wyglądać jak opublikowany i nie ma przycisku „Opublikuj”.
 * EN: Test of the entry tile on the panel: the status tag, the buttons and the "Otwórz korektę" address for an entry in review. An entry in review must not look published and has no "Opublikuj" button.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/admin/EntryTile.tsx::EntryTile
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie do tekstu HTML, a router do linków na kaflu.
// EN: Rendering to an HTML string, and the router for the links on the tile.
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
// PL: Kafel i typ wpisu z panelu.
// EN: The tile and the panel entry type.
import type { PanelEntry } from './api';
import { EntryTile } from './EntryTile';

/** PL: Pusta obsługa przycisków, bo test sprawdza tylko wygląd. EN: An empty button handler, because the test checks only the look. */
const noop = () => undefined;

/**
 * PL: Rysuje kafel jednego wpisu w routerze w pamięci i oddaje HTML.
 * EN: Renders the tile of one entry inside an in-memory router and returns the HTML.
 *
 * @param status - PL: stan wpisu. EN: the entry state.
 * @returns PL: tekst HTML kafla. EN: the HTML of the tile.
 */
function tileHtml(status: PanelEntry['status']): string {
  // PL: Wpis o numerze w-1; opublikowany ma chwilę publikacji, szkic i wpis w korekcie nie mają.
  // EN: The entry with id w-1; a published one has a publication moment, a draft and an entry in review do not.
  const entry: PanelEntry = {
    id: 'w-1',
    type: 'news',
    status,
    title: 'Turniej',
    source: 'Samorząd',
    publishedAt: status === 'published' ? '2026-10-09T10:00:00.000Z' : null,
  };
  return renderToString(
    <MemoryRouter>
      <ul>
        <EntryTile entry={entry} isLocked={false} onPublish={noop} onDelete={noop} />
      </ul>
    </MemoryRouter>,
  );
}

// PL: Wpis w korekcie ma znacznik „Do korekty”, link do korekty i nie wygląda na opublikowany.
// EN: An entry in review has the "Do korekty" tag, a link to the review and does not look published.
describe('wpis w korekcie / entry in review', () => {
  // PL: Znacznik „Do korekty” zamiast „Opublikowany”, bez „Opublikuj”, z linkiem do kreatora.
  // EN: The "Do korekty" tag instead of "Opublikowany", no "Opublikuj", with a link to the wizard.
  it('ma znacznik „Do korekty” i link do korekty bez przycisku publikacji / has the "Do korekty" tag and a review link without a publish button', () => {
    const html = tileHtml('in_review');

    expect(html).toContain('Do korekty');
    expect(html).not.toContain('Opublikowany');
    expect(html).not.toContain('Opublikuj');
    expect(html).toContain('href="/news/editor/w-1"');
    expect(html).toContain('Otwórz korektę');
  });

  // PL: „Usuń” jest zawsze, także w korekcie.
  // EN: "Usuń" is always there, also for an entry in review.
  it('ma przycisk „Usuń” / has the "Usuń" button', () => {
    expect(tileHtml('in_review')).toContain('Usuń');
  });
});

// PL: Szkic ma „Edytuj” i „Opublikuj”, opublikowany nie ma żadnego z nich.
// EN: A draft has "Edytuj" and "Opublikuj", a published entry has neither.
describe('pozostałe stany / other states', () => {
  // PL: Szkic pokazuje znacznik „Szkic” i obie czynności.
  // EN: A draft shows the "Szkic" tag and both actions.
  it('szkic ma „Szkic”, „Edytuj” i „Opublikuj” / a draft has "Szkic", "Edytuj" and "Opublikuj"', () => {
    const html = tileHtml('draft');

    expect(html).toContain('Szkic');
    expect(html).toContain('Edytuj');
    expect(html).toContain('Opublikuj');
    expect(html).not.toContain('Do korekty');
  });

  // PL: Wpis opublikowany ma tylko znacznik i „Usuń”.
  // EN: A published entry has only the tag and "Usuń".
  it('opublikowany nie ma „Edytuj”, „Opublikuj” ani „Do korekty” / a published entry has no "Edytuj", "Opublikuj" or "Do korekty"', () => {
    const html = tileHtml('published');

    expect(html).toContain('Opublikowany');
    expect(html).not.toContain('Edytuj');
    expect(html).not.toContain('Opublikuj');
    expect(html).not.toContain('Do korekty');
    expect(html).not.toContain('Otwórz korektę');
  });
});
