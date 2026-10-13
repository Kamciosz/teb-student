/**
 * PL: Test kafla podglądu: opis wycięty tak samo jak na serwerze (te same dane co w worker/news/feed/excerpt.test.ts) i pola wpisu w kształcie listy.
 * EN: Test of the preview tile: the description cut the same way as on the server (the same data as in worker/news/feed/excerpt.test.ts) and the entry fields in the list shape.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/editor/previewEntry.ts::previewEntry
 * @uses src/features/news/editor/previewEntry.ts::previewExcerpt
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { previewEntry, previewExcerpt } from './previewEntry';

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

// PL: Grupa testów opisu kafla podglądu.
// EN: A group of preview tile description tests.
describe('previewExcerpt', () => {
  // PL: Krótki akapit wraca bez zmian, tak jak na serwerze.
  // EN: A short paragraph comes back unchanged, as on the server.
  it('zwraca tekst krótkiego akapitu / returns the text of a short paragraph', () => {
    expect(previewExcerpt(doc('Od poniedziałku czynna do 17:00.'))).toBe('Od poniedziałku czynna do 17:00.');
  });

  // PL: Długi tekst jest ucinany na granicy słowa z wielokropkiem; wynik ma 137 znaków plus „…”, czyli tyle, ile liczy serwer.
  // EN: A long text is cut at a word boundary with an ellipsis; the result is 137 characters plus "…", the same as the server counts.
  it('ucina długi tekst na granicy słowa / cuts a long text at a word boundary', () => {
    expect(previewExcerpt(doc('słowo '.repeat(100)))).toBe('słowo '.repeat(22) + 'słowo…');
  });

  // PL: Blok bez tekstu (sam film) jest pomijany; opis bierze się z pierwszego bloku z tekstem.
  // EN: A block without text (only a video) is skipped; the description comes from the first block with text.
  it('pomija bloki bez tekstu / skips blocks without text', () => {
    const body = { type: 'doc', content: [{ type: 'youtube', attrs: { videoId: 'abcdefghijk' } }, ...doc('Opis').content] };
    expect(previewExcerpt(body)).toBe('Opis');
  });

  // PL: Treść z samym filmem daje pusty opis, a kafel pokazuje sam tytuł.
  // EN: Content with only a video gives an empty description, and the tile shows only the title.
  it('jest pusty, gdy treść ma tylko film / is empty when the content has only a video', () => {
    expect(previewExcerpt({ type: 'doc', content: [{ type: 'youtube', attrs: { videoId: 'abcdefghijk' } }] })).toBe('');
  });
});

// PL: Grupa testów pól wpisu w kształcie listy.
// EN: A group of tests of the entry fields in the list shape.
describe('previewEntry', () => {
  // PL: Wpis podglądu ma stały identyfikator, źródło „Samorząd” i dane z formularza.
  // EN: The preview entry has a fixed id, the source "Samorząd" and the data from the form.
  it('składa wpis w kształcie listy / builds the entry in the list shape', () => {
    expect(previewEntry('event', 'Turniej', doc('Zapisy.'), '2026-10-13T10:00:00.000Z')).toEqual({
      id: 'podglad',
      type: 'event',
      source: 'Samorząd',
      publishedAt: '2026-10-13T10:00:00.000Z',
      title: 'Turniej',
      excerpt: 'Zapisy.',
    });
  });
});
