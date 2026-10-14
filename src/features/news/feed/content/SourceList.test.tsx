/**
 * PL: Testy sekcji „Źródła” na końcu wpisu. Sprawdzają, że linki pokazują domenę bez „www.”, że adres inny niż https (np. „javascript:”) odpada razem z sekcją, a pusta lista nic nie rysuje. Test oblewa, gdy ktoś przestanie czyścić adresy źródeł albo zacznie rysować pustą sekcję.
 * EN: Tests of the "Źródła" (sources) section at the end of an entry. They check that links show the domain without "www.", that an address other than https (for example "javascript:") drops out together with the section, and that an empty list draws nothing. The test fails when someone stops cleaning the source addresses or starts drawing an empty section.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/feed/content/SourceList.tsx::SourceList
 * @uses src/features/news/feed/content/RichContent.tsx::RichContent
 * @used_by vitest.config.ts::include
 */

// PL: Rysowanie komponentu do tekstu HTML, bez przeglądarki.
// EN: Drawing a component to HTML text, without a browser.
import { renderToStaticMarkup } from 'react-dom/server';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie treści wpisu, w którym jest sekcja źródeł.
// EN: Drawing the entry content that holds the sources section.
import { RichContent } from './RichContent';

/**
 * PL: Składa dokument z jedną sekcją „Źródła” o podanych adresach.
 * EN: Builds a document with one "Źródła" section holding the given addresses.
 *
 * @param urls - PL: adresy źródeł. EN: the source addresses.
 * @returns PL: dokument JSON. EN: a JSON document.
 */
function docWithSources(urls: unknown[]) {
  return { type: 'doc', content: [{ type: 'sources', attrs: { urls } }] };
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

describe('sekcja „Źródła” / "Źródła" section', () => {
  // PL: Każdy adres ma domenę bez „www.” jako tekst główny i adres bez „https://” pod spodem.
  // EN: Every address has the domain without "www." as the main text and the address without "https://" below it.
  it('pokazuje listę z domenami i linkami w nowej karcie / shows a list with domains and links in a new tab', () => {
    const result = html(docWithSources(['https://www.gov.pl/web/edukacja', 'https://example.org/a']));

    expect(result).toContain('<h2>Źródła</h2>');
    expect(result).toContain('<span class="news-sources__domain">gov.pl</span>');
    expect(result).toContain('<span class="news-sources__domain">example.org</span>');
    expect(result).toContain('<span class="news-sources__address">www.gov.pl/web/edukacja</span>');
    expect(result).toContain('href="https://www.gov.pl/web/edukacja"');
    expect(result).toContain('target="_blank" rel="noopener noreferrer"');
  });

  // PL: Adres „javascript:” i adres http odpadają, a sekcja bez żadnego poprawnego adresu znika razem z nagłówkiem.
  // EN: The "javascript:" address and the http address drop out, and a section without any valid address disappears together with its heading.
  it('odrzuca javascript: i http, bez poprawnego adresu nie ma sekcji / drops javascript: and http, without a valid address there is no section', () => {
    const result = html(docWithSources(['javascript:alert(1)', 'http://example.org']));

    expect(result).not.toContain('<a');
    expect(result).not.toContain('Źródła');
    expect(result).not.toContain('javascript');
  });

  // PL: Pusta lista nie rysuje nic, nawet nagłówka.
  // EN: An empty list draws nothing, not even the heading.
  it('pusta lista nic nie rysuje / an empty list draws nothing', () => {
    expect(html(docWithSources([]))).toBe('<div class="news-content"></div>');
  });
});
