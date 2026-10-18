/**
 * PL: Test drzwi podtoru 3a: kafel wpisu (EntryCard) i rysowanie treści (RichContent) są wystawione przez index.ts i rysują się z danych wpisu, bez pobierania z serwera. Test oblewa, gdy ktoś usunie eksport z drzwi.
 * EN: Test of the door of subtrack 3a: the entry tile (EntryCard) and the content drawing (RichContent) are exposed by index.ts and draw from the entry data, without fetching from the server. The test fails when someone removes the export from the door.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/feed/index.ts::EntryCard
 * @uses src/features/news/feed/index.ts::RichContent
 * @used_by vitest.config.ts::include
 */

// PL: Rysowanie komponentu do tekstu HTML, bez przeglądarki.
// EN: Drawing a component to HTML text, without a browser.
import { renderToStaticMarkup } from 'react-dom/server';
// PL: Kafel używa odnośnika routera, więc test daje mu router w pamięci.
// EN: The tile uses a router link, so the test gives it an in-memory router.
import { MemoryRouter } from 'react-router';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Komponenty wystawione przez drzwi podtoru 3a, czyli to, co sprawdzamy.
// EN: The components exposed by the door of subtrack 3a, which is what we check.
import { EntryCard, RichContent } from './index';
import type { NewsEntrySummary } from './types';

// PL: Dane wpisu do narysowania (wydumane, bez danych osobowych).
// EN: Entry data to draw (made up, no personal data).
const entry: NewsEntrySummary = {
  id: 'wpis-1',
  type: 'event',
  source: 'Samorząd',
  publishedAt: '2026-10-09T10:00:00.000Z',
  title: 'Dzień sportu',
  excerpt: 'Zapisy w sali gimnastycznej',
  pinned: false,
};

// PL: Grupa testów drzwi podtoru 3a.
// EN: A group of tests of the door of subtrack 3a.
describe('drzwi podtoru 3a / the door of subtrack 3a', () => {
  // PL: Kafel pokazuje typ, źródło, tytuł, opis i odnośnik do wpisu.
  // EN: The tile shows the type, the source, the title, the description and the link to the entry.
  it('rysuje kafel wpisu z danych wpisu / draws the entry tile from the entry data', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EntryCard entry={entry} />
      </MemoryRouter>,
    );

    expect(html).toContain('Wydarzenie');
    expect(html).toContain('Samorząd');
    expect(html).toContain('Dzień sportu');
    expect(html).toContain('Zapisy w sali gimnastycznej');
    expect(html).toContain('href="/news/feed/wpis-1"');
  });

  // PL: Przypięty wpis ma znacznik „Przypięte”, zwykły go nie ma.
  // EN: A pinned entry has the "Przypięte" tag, a plain one does not.
  it('pokazuje znacznik „Przypięte” tylko przy przypiętym wpisie / shows the "Przypięte" tag only on a pinned entry', () => {
    const draw = (item: NewsEntrySummary) =>
      renderToStaticMarkup(
        <MemoryRouter>
          <EntryCard entry={item} />
        </MemoryRouter>,
      );

    expect(draw({ ...entry, pinned: true })).toContain('Przypięte');
    expect(draw(entry)).not.toContain('Przypięte');
  });

  // PL: Wyróżniony wpis dostaje klasę większego kafla, zwykły nie.
  // EN: A featured entry gets the larger tile class, a plain one does not.
  it('dodaje klasę wyróżnienia tylko wyróżnionemu wpisowi / adds the featured class only to a featured entry', () => {
    const draw = (featured?: boolean) =>
      renderToStaticMarkup(
        <MemoryRouter>
          <EntryCard entry={entry} featured={featured} />
        </MemoryRouter>,
      );

    expect(draw(true)).toContain('news-card--featured');
    expect(draw()).not.toContain('news-card--featured');
  });

  // PL: Treść rysuje się z dokumentu wpisu, bez pobierania z serwera.
  // EN: The content draws from the entry document, without fetching from the server.
  it('rysuje treść wpisu z dokumentu / draws the entry content from the document', () => {
    const body = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Zapisy od poniedziałku' }] }],
    };

    const html = renderToStaticMarkup(<RichContent body={body} />);

    expect(html).toContain('<p>');
    expect(html).toContain('Zapisy od poniedziałku');
  });
});
