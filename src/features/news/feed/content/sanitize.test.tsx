/**
 * PL: Testy czyszczenia i rysowania treści wpisu. Sprawdzają, że link „javascript:” i inne niż https są odrzucane, nieznane elementy znikają, identyfikator filmu jest sprawdzany, a linki mają rel i target. Test oblewa, gdy ktoś usunie sprawdzanie https albo listę dozwolonych elementów.
 * EN: Tests of cleaning and drawing the entry content. They check that "javascript:" and non-https links are rejected, unknown elements disappear, the video id is validated, and links have rel and target. The test fails when someone removes the https check or the allowed element list.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/content/sanitize.ts::sanitizeDocument
 * @uses src/features/news/feed/content/RichContent.tsx::RichContent
 * @used_by vitest.config.ts::include
 */

// PL: Rysowanie komponentu do tekstu HTML, bez przeglądarki.
// EN: Drawing a component to HTML text, without a browser.
import { renderToStaticMarkup } from 'react-dom/server';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie i czyszczenie, które sprawdzamy.
// EN: The drawing and cleaning under test.
import { RichContent } from './RichContent';
import { safeHttpsUrl, safeVideoId, sanitizeDocument } from './sanitize';

/**
 * PL: Składa dokument z jednego akapitu, w którym jest tekst „klik” z linkiem o podanym adresie.
 * EN: Builds a document of one paragraph that holds the text "klik" with a link to the given address.
 *
 * @param href - PL: adres linku. EN: the link address.
 * @returns PL: dokument JSON. EN: a JSON document.
 */
function docWithLink(href: string) {
  const marks = [{ type: 'link', attrs: { href } }];
  return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'klik', marks }] }] };
}

/**
 * PL: Rysuje treść do tekstu HTML.
 * EN: Draws the content to HTML text.
 *
 * @param body - PL: dokument. EN: the document.
 * @returns PL: tekst HTML. EN: the HTML text.
 */
function html(body: unknown): string {
  return renderToStaticMarkup(<RichContent body={body} />);
}

// PL: Grupa testów adresów linków.
// EN: A group of link address tests.
describe('safeHttpsUrl', () => {
  // PL: Wszystkie te adresy muszą zostać odrzucone: inne protokoły, ukryte znaki, login w adresie i śmieci.
  // EN: All these addresses must be rejected: other protocols, hidden characters, a login in the address and garbage.
  it.each([
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    '  javascript:alert(1)',
    'java\nscript:alert(1)',
    'http://example.com',
    'data:text/html,<b>x</b>',
    '//example.com',
    '/relatywny',
    'https://user:haslo@example.com',
    'https://',
    '',
    'nie adres',
  ])('odrzuca %j / rejects it', (raw) => {
    expect(safeHttpsUrl(raw)).toBeNull();
  });

  // PL: Wartość, która nie jest tekstem, też jest odrzucana.
  // EN: A value that is not a string is rejected too.
  it('odrzuca wartość inną niż tekst / rejects a non-string value', () => {
    expect([safeHttpsUrl(null), safeHttpsUrl(undefined), safeHttpsUrl(5), safeHttpsUrl({})]).toEqual([null, null, null, null]);
  });

  // PL: Zwykły adres https przechodzi.
  // EN: A plain https address passes.
  it('przepuszcza zwykły https / lets plain https through', () => {
    expect(safeHttpsUrl('https://example.com/a?b=1')).toBe('https://example.com/a?b=1');
  });
});

// PL: Grupa testów identyfikatora filmu.
// EN: A group of video id tests.
describe('safeVideoId', () => {
  // PL: Tylko 11 znaków z liter, cyfr, myślnika i podkreślenia.
  // EN: Only 11 characters of letters, digits, hyphen and underscore.
  it('sprawdza kształt identyfikatora / checks the id shape', () => {
    expect(safeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(safeVideoId('za-krotki')).toBeNull();
    expect(safeVideoId('dQw4w9WgXcQ" onload="x')).toBeNull();
    expect(safeVideoId(12345678901)).toBeNull();
  });
});

// PL: Grupa testów rysowania treści.
// EN: A group of content drawing tests.
describe('RichContent', () => {
  // PL: Link „javascript:” znika, a tekst zostaje bez odnośnika.
  // EN: A "javascript:" link disappears, and the text stays without a link.
  it('nie rysuje linku javascript: / does not draw a javascript: link', () => {
    const output = html(docWithLink('javascript:alert(1)'));

    expect(output).not.toContain('<a');
    expect(output).not.toContain('javascript:');
    expect(output).toContain('klik');
  });

  // PL: Link https ma target i rel.
  // EN: An https link has target and rel.
  it('link https ma target=_blank i rel=noopener noreferrer / an https link has target=_blank and rel=noopener noreferrer', () => {
    const output = html(docWithLink('https://example.com/'));

    expect(output).toContain('href="https://example.com/"');
    expect(output).toContain('target="_blank"');
    expect(output).toContain('rel="noopener noreferrer"');
  });

  // PL: Nieznane elementy znikają: skrypt, obrazek z obsługą błędu i zwykły HTML w tekście.
  // EN: Unknown elements disappear: a script, an image with an error handler and plain HTML in text.
  it('odrzuca nieznane elementy / rejects unknown elements', () => {
    const body = {
      type: 'doc',
      content: [
        { type: 'script', content: [{ type: 'text', text: 'alert(1)' }] },
        { type: 'image', attrs: { src: 'https://example.com/a.png' } },
        { type: 'iframe', attrs: { src: 'https://example.com' } },
        { type: 'paragraph', content: [{ type: 'text', text: '<img src=x onerror=alert(1)>' }] },
      ],
    };

    const output = html(body);

    expect(output).not.toContain('<script');
    expect(output).not.toContain('<iframe');
    expect(output).not.toContain('<img');
    expect(output).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  // PL: Dozwolone elementy są rysowane: nagłówek, pogrubienie, lista i cytat.
  // EN: Allowed elements are drawn: a heading, bold, a list and a quote.
  it('rysuje dozwolone elementy / draws the allowed elements', () => {
    const text = (value: string, marks?: unknown[]) => ({ type: 'text', text: value, marks });
    const body = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [text('Tytuł')] },
        { type: 'paragraph', content: [text('mocny', [{ type: 'bold' }])] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [text('punkt')] }] }] },
        { type: 'blockquote', content: [{ type: 'paragraph', content: [text('cytat')] }] },
      ],
    };

    expect(html(body)).toBe(
      '<div class="news-content"><h2><span>Tytuł</span></h2><p><span><strong>mocny</strong></span></p><ul><li><p><span>punkt</span></p></li></ul><blockquote><p><span>cytat</span></p></blockquote></div>',
    );
  });

  // PL: Film bez poprawnego identyfikatora znika, a poprawny daje miniaturę bez ramki.
  // EN: A video without a valid id disappears, and a valid one gives a thumbnail without a frame.
  it('film: miniatura bez iframe, zły identyfikator znika / video: a thumbnail without an iframe, a bad id disappears', () => {
    const video = (videoId: string) => ({ type: 'doc', content: [{ type: 'youtube', attrs: { videoId } }] });

    const good = html(video('dQw4w9WgXcQ'));
    const bad = html(video('x" onload="alert(1)'));

    expect(good).toContain('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    expect(good).not.toContain('<iframe');
    expect(bad).not.toContain('ytimg');
  });

  // PL: Treść spoza formatu i bardzo głębokie zagnieżdżenie nie wywalają rysowania.
  // EN: Content outside the format and very deep nesting do not break drawing.
  it('znosi dziwną i bardzo głęboką treść / survives strange and very deep content', () => {
    let deep: Record<string, unknown> = { type: 'paragraph' };
    for (let i = 0; i < 5000; i++) deep = { type: 'blockquote', content: [deep] };

    expect(sanitizeDocument(null)).toEqual([]);
    expect(sanitizeDocument('tekst')).toEqual([]);
    expect(() => html({ type: 'doc', content: [deep] })).not.toThrow();
  });
});
