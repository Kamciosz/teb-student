/**
 * PL: Test funkcji excerptFromBody: opis z pierwszego bloku z tekstem, ucinanie na granicy słowa i odporność na dziwną treść.
 * EN: Test of the excerptFromBody function: the description from the first block with text, cutting at a word boundary and resistance to strange content.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/news/feed/excerpt.ts::excerptFromBody
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy, i limit długości opisu.
// EN: The function under test and the description length limit.
import { EXCERPT_MAX_LENGTH, excerptFromBody } from './excerpt';

/**
 * PL: Składa dokument Tiptap z jednego akapitu z podanym tekstem.
 * EN: Builds a Tiptap document of one paragraph with the given text.
 *
 * @param text - PL: tekst akapitu. EN: the paragraph text.
 * @returns PL: dokument JSON. EN: a JSON document.
 */
function doc(text: string) {
  return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] };
}

// PL: Grupa testów opisu wpisu.
// EN: A group of entry description tests.
describe('excerptFromBody', () => {
  // PL: Zwykły krótki akapit wraca bez zmian.
  // EN: A plain short paragraph comes back unchanged.
  it('zwraca tekst krótkiego akapitu / returns the text of a short paragraph', () => {
    expect(excerptFromBody(doc('Od poniedziałku czynna do 17:00.'))).toBe('Od poniedziałku czynna do 17:00.');
  });

  // PL: Długi tekst jest ucinany na spacji i dostaje wielokropek, a wynik mieści się w limicie.
  // EN: A long text is cut at a space and gets an ellipsis, and the result fits the limit.
  it('ucina długi tekst na granicy słowa / cuts a long text at a word boundary', () => {
    const result = excerptFromBody(doc('słowo '.repeat(100)));
    expect(result.endsWith('słowo…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(EXCERPT_MAX_LENGTH + 1);
  });

  // PL: Pusty akapit na początku jest pomijany, opis bierze się z pierwszego bloku z tekstem.
  // EN: An empty paragraph at the start is skipped, the description comes from the first block with text.
  it('pomija bloki bez tekstu / skips blocks without text', () => {
    const body = { type: 'doc', content: [{ type: 'youtube', attrs: { videoId: 'abcdefghijk' } }, ...doc('Opis').content] };
    expect(excerptFromBody(body)).toBe('Opis');
  });

  // PL: Treść spoza formatu (null, tekst, liczba) daje pusty opis zamiast błędu.
  // EN: Content outside the format (null, a string, a number) gives an empty description instead of an error.
  it('nie wywala się na dziwnej treści / does not throw on strange content', () => {
    expect([excerptFromBody(null), excerptFromBody('tekst'), excerptFromBody(5), excerptFromBody({})]).toEqual(['', '', '', '']);
  });
});
