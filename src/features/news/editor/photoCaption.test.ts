/**
 * PL: Testy przycinania opisu i podpisu zdjęcia oraz szukania zdjęcia w dokumencie.
 * EN: Tests of cutting the photo description and caption and of looking for a photo in the document.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/editor/photoCaption.ts::clampText
 * @uses src/features/news/editor/photoCaption.ts::captionAttrs
 * @uses src/features/news/editor/photoCaption.ts::findPhotoPos
 */

// PL: Funkcje testowe Vitest i schemat dokumentu do sprawdzenia szukania.
// EN: Vitest test functions and a document schema for checking the search.
import { describe, expect, it } from 'vitest';
import { Schema } from '@tiptap/pm/model';
import { captionAttrs, clampText, findPhotoPos } from './photoCaption';
import { MAX_CAPTION_CHARS } from './document/limits';

// PL: Mały schemat z akapitem i zdjęciem, wystarczający do szukania.
// EN: A small schema with a paragraph and a photo, enough for the search.
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'text*' },
    image: { group: 'block', atom: true, attrs: { src: { default: null } } },
    text: {},
  },
});

describe('przycinanie tekstu / cutting the text', () => {
  it('zostawia tekst, który mieści się w limicie, bez zmian', () => {
    expect(clampText('Mecz klas', 300)).toBe('Mecz klas');
    expect(clampText('a'.repeat(MAX_CAPTION_CHARS), MAX_CAPTION_CHARS)).toHaveLength(MAX_CAPTION_CHARS);
  });

  it('tnie tekst dłuższy o jeden znak do limitu', () => {
    expect(clampText('a'.repeat(MAX_CAPTION_CHARS + 1))).toHaveLength(MAX_CAPTION_CHARS);
  });

  it('nie rozcina emoji na pół, więc wynik zostaje krótszy o jeden znak', () => {
    const text = `${'a'.repeat(299)}😀`;
    expect(clampText(text, 300)).toBe('a'.repeat(299));
  });

  it('zostawia emoji, które mieści się w całości', () => {
    const text = `${'a'.repeat(298)}😀`;
    expect(clampText(text, 300)).toBe(text);
  });
});

describe('atrybuty zdjęcia / the photo attributes', () => {
  it('obcina spacje na końcach opisu i podpisu', () => {
    expect(captionAttrs('  Zwycięski gol  ', ' Mecz klas ')).toEqual({ alt: 'Zwycięski gol', caption: 'Mecz klas' });
  });

  it('pusty opis i pusty podpis zostają puste', () => {
    expect(captionAttrs('   ', '')).toEqual({ alt: '', caption: '' });
  });

  it('polskie litery liczą się jak jeden znak', () => {
    expect(captionAttrs('ą'.repeat(MAX_CAPTION_CHARS + 5), '').alt).toHaveLength(MAX_CAPTION_CHARS);
  });
});

describe('szukanie zdjęcia w dokumencie / looking for the photo in the document', () => {
  it('zwraca pozycję zdjęcia o podanym adresie', () => {
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('a')]),
      schema.node('image', { src: '/api/media/x1' }),
    ]);
    expect(findPhotoPos(doc, '/api/media/x1')).toBe(3);
  });

  it('zwraca null, gdy zdjęcia o tym adresie nie ma', () => {
    const doc = schema.node('doc', null, [schema.node('paragraph', null, [schema.text('a')])]);
    expect(findPhotoPos(doc, '/api/media/x1')).toBeNull();
  });
});
