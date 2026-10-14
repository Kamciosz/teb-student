/**
 * PL: Testy karty linku do mediów społecznościowych w czytniku. Sprawdzają kartę dla każdego z czterech serwisów, odrzucanie adresów innych niż https i obcych domen oraz brak osadzania (iframe, script, obrazka). Test oblewa, gdy ktoś usunie sprawdzanie https albo domeny albo zacznie osadzać treść serwisu.
 * EN: Tests of the social media link card in the reader. They check the card for each of the four networks, rejection of addresses that are not https or are on a foreign domain, and no embedding (no iframe, script or image). The test fails when someone removes the https or domain check, or starts embedding the network's content.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/feed/content/RichContent.tsx::RichContent
 * @uses src/features/news/feed/content/sanitize.ts::sanitizeDocument
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
import { sanitizeDocument } from './sanitize';

/**
 * PL: Składa dokument z jednego węzła karty linku o podanym adresie.
 * EN: Builds a document of one link card node with the given address.
 *
 * @param href - PL: adres karty. EN: the card address.
 * @returns PL: dokument JSON. EN: a JSON document.
 */
function docWithCard(href: unknown) {
  return { type: 'doc', content: [{ type: 'linkCard', attrs: { href } }] };
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

// PL: Cztery serwisy z kartą, z adresami w różnych formach (także subdomeny i stara domena X).
// EN: The four networks with a card, with addresses in different forms (also subdomains and the old X domain).
const NETWORK_CASES = [
  { name: 'Instagram', href: 'https://www.instagram.com/p/abc123/', host: 'www.instagram.com' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@przyklad/video/1', host: 'www.tiktok.com' },
  { name: 'Facebook', href: 'https://www.facebook.com/przyklad', host: 'www.facebook.com' },
  { name: 'X', href: 'https://x.com/przyklad', host: 'x.com' },
  { name: 'X', href: 'https://twitter.com/przyklad', host: 'twitter.com' },
];

// PL: Grupa testów karty dla każdego serwisu.
// EN: A group of card tests for each network.
describe('karta linku do mediów społecznościowych', () => {
  // PL: Każdy serwis dostaje kartę z nazwą serwisu i adresem, a link otwiera się w nowej karcie.
  // EN: Each network gets a card with the network name and the address, and the link opens in a new tab.
  it.each(NETWORK_CASES)('rysuje kartę dla $name ($href) / draws a card for $name ($href)', ({ name, href }) => {
    const output = html(docWithCard(href));

    expect(output).toContain('class="news-link-card"');
    expect(output).toContain(`href="${href}"`);
    expect(output).toContain('target="_blank"');
    expect(output).toContain('rel="noopener noreferrer"');
    expect(output).toContain(`>${name}<`);
    expect(output).toContain(`>${href}<`);
  });

  // PL: Nazwa serwisu jest wyliczana z domeny, a obca domena nie dostaje nazwy.
  // EN: The network name is worked out from the domain, and a foreign domain gets no name.
  it.each(NETWORK_CASES)('wylicza nazwę $name z domeny $host / works out the name $name from the domain $host', ({ name, host }) => {
    const [block] = sanitizeDocument(docWithCard(`https://${host}/`));

    expect(block).toEqual({ kind: 'linkCard', href: `https://${host}/`, network: name });
  });

  // PL: Adres nie-https albo z obcej domeny odpada razem z kartą, więc nic nie zostaje w HTML.
  // EN: A non-https address or one on a foreign domain is dropped with the card, so nothing is left in the HTML.
  it.each([
    'http://www.instagram.com/p/abc123/',
    'javascript:alert(1)',
    '//www.tiktok.com/@przyklad',
    'https://example.com/',
    'https://fakeinstagram.com/przyklad',
    'https://user:haslo@www.facebook.com/przyklad',
    'nie adres',
    '',
    null,
  ])('odrzuca kartę dla %j / rejects the card for %j', (href) => {
    const output = html(docWithCard(href));

    expect(sanitizeDocument(docWithCard(href))).toEqual([]);
    expect(output).not.toContain('news-link-card');
    expect(output).not.toContain('<a');
    expect(output).not.toContain('href');
  });

  // PL: Karta nie osadza niczego z serwisu: bez ramki, skryptu i obrazka, także w dłuższym wpisie.
  // EN: The card embeds nothing from the network: no frame, script or image, also in a longer entry.
  it('nie osadza treści serwisu / does not embed the network content', () => {
    const body = {
      type: 'doc',
      content: [
        { type: 'linkCard', attrs: { href: 'https://www.instagram.com/p/abc123/' } },
        { type: 'linkCard', attrs: { href: 'https://www.tiktok.com/@przyklad/video/1' } },
        { type: 'linkCard', attrs: { href: 'https://www.facebook.com/przyklad' } },
        { type: 'linkCard', attrs: { href: 'https://x.com/przyklad' } },
      ],
    };

    const output = html(body);

    expect(output).not.toContain('<iframe');
    expect(output).not.toContain('<script');
    expect(output).not.toContain('<img');
    expect(output).not.toContain('<embed');
    expect(output).not.toContain('<object');
  });
});
