/**
 * PL: Testy sprawdzania treści wpisu na serwerze. Dowodzą, że schemat Tiptap działa w środowisku Workera i że serwer odrzuca to, czego schemat nie łapie (link „javascript:”, zły identyfikator filmu, zdjęcie spoza modułu media) oraz nieznane elementy, złą strukturę i za duże dokumenty. Oblewają, gdy ktoś usunie sprawdzenie adresów albo listę dozwolonych elementów.
 * EN: Tests of the entry content check on the server. They prove that the Tiptap schema works in the Worker environment and that the server rejects what the schema does not catch (a "javascript:" link, a bad video id, a photo outside the media module) as well as unknown elements, a wrong structure and oversized documents. They fail when someone removes the address check or the allowed element list.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/editor/validateBody.ts::validateBody
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
import { validateBody } from './validateBody';

/**
 * PL: Składa dokument z podanych bloków.
 * EN: Builds a document from the given blocks.
 *
 * @param content - PL: bloki dokumentu. EN: the document blocks.
 * @returns PL: dokument JSON. EN: a JSON document.
 */
function doc(...content: unknown[]) {
  return { type: 'doc', content };
}

/**
 * PL: Akapit z jednym fragmentem tekstu i znacznikami.
 * EN: A paragraph with one text piece and marks.
 *
 * @param text - PL: tekst. EN: the text.
 * @param marks - PL: znaczniki tekstu. EN: the text marks.
 * @returns PL: węzeł akapitu. EN: the paragraph node.
 */
function paragraph(text: string, marks?: unknown[]) {
  return { type: 'paragraph', content: [{ type: 'text', text, marks }] };
}

// PL: Dokument, który ma przejść: formatowanie, nagłówek, lista, cytat i link https.
// EN: A document that must pass: formatting, a heading, a list, a quote and an https link.
describe('validateBody: poprawna treść / valid content', () => {
  it('przyjmuje tekst z formatowaniem, listą, cytatem i linkiem https / accepts formatted text, a list, a quote and an https link', () => {
    const result = validateBody(
      doc(
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Tytuł części' }] },
        paragraph('Pogrubione', [{ type: 'bold' }, { type: 'underline' }]),
        paragraph('Link', [{ type: 'link', attrs: { href: 'https://teb.edu.pl/regulamin' } }]),
        { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph('Pierwsza')] }] },
        { type: 'blockquote', content: [paragraph('Cytat')] },
      ),
    );
    expect(result.ok).toBe(true);
  });

  it('przyjmuje film, zdjęcie z podpisem, kartę linku i źródła / accepts a video, a captioned photo, a link card and sources', () => {
    const result = validateBody(
      doc(
        paragraph('Treść'),
        { type: 'youtube', attrs: { videoId: 'dQw4w9WgXcQ' } },
        { type: 'image', attrs: { src: '/api/media/abc', alt: 'Boisko', caption: 'Mecz klas', width: 800, height: 600 } },
        { type: 'linkCard', attrs: { href: 'https://www.instagram.com/p/abc' } },
        { type: 'sources', attrs: { urls: ['https://example.org/zrodlo'] } },
      ),
    );
    expect(result.ok).toBe(true);
  });

  it('film w cytacie i na liście przechodzi (węzeł blokowy) / a video inside a quote and a list item passes (a block node)', () => {
    const video = { type: 'youtube', attrs: { videoId: 'dQw4w9WgXcQ' } };
    const result = validateBody(
      doc(
        { type: 'blockquote', content: [paragraph('Cytat'), video] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph('Pierwsza'), video] }] },
      ),
    );
    expect(result.ok).toBe(true);
  });

  it('film zapisuje tylko identyfikator, bez adresu i HTML / a video keeps only the id, never the address or HTML', () => {
    const result = validateBody(
      doc(paragraph('Treść'), { type: 'youtube', attrs: { videoId: 'dQw4w9WgXcQ', src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', html: '<iframe></iframe>' } }),
    );
    expect(result).toEqual({
      ok: true,
      body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Treść' }] }, { type: 'youtube', attrs: { videoId: 'dQw4w9WgXcQ' } }] },
    });
  });

  it('zwraca dokument odczytany przez schemat, bez obcych pól / returns the document read by the schema, without foreign fields', () => {
    const result = validateBody(doc({ type: 'paragraph', attrs: { onclick: 'x()' }, content: [{ type: 'text', text: 'a', extra: 1 }] }));
    expect(result).toEqual({ ok: true, body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }] } });
  });
});

// PL: Dokumenty, które muszą zostać odrzucone, i powód odrzucenia.
// EN: Documents that must be rejected, and the rejection reason.
describe('validateBody: odrzucenia / rejections', () => {
  const cases: [string, unknown, string][] = [
    ['link javascript: / a javascript: link', doc(paragraph('x', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }])), 'bad_link'],
    ['link http bez s / a plain http link', doc(paragraph('x', [{ type: 'link', attrs: { href: 'http://teb.edu.pl' } }])), 'bad_link'],
    ['identyfikator filmu zamiast adresu ramki / a frame address instead of an id', doc({ type: 'youtube', attrs: { videoId: 'https://evil.example/x' } }), 'bad_video'],
    ['identyfikator filmu za krótki (10 znaków) / a video id too short (10 characters)', doc({ type: 'youtube', attrs: { videoId: 'dQw4w9WgXc' } }), 'bad_video'],
    ['identyfikator filmu za długi (12 znaków) / a video id too long (12 characters)', doc({ type: 'youtube', attrs: { videoId: 'dQw4w9WgXcQA' } }), 'bad_video'],
    ['identyfikator filmu z niedozwolonym znakiem / a video id with an illegal character', doc({ type: 'youtube', attrs: { videoId: 'dQw4w9WgXc!' } }), 'bad_video'],
    ['identyfikator filmu o wartości null / a video id that is null', doc({ type: 'youtube', attrs: { videoId: null } }), 'bad_video'],
    ['identyfikator filmu liczbą / a video id that is a number', doc({ type: 'youtube', attrs: { videoId: 42 } }), 'bad_video'],
    ['film bez pól / a video without fields', doc({ type: 'youtube' }), 'bad_video'],
    ['zdjęcie z adresem data: / a photo with a data: address', doc({ type: 'image', attrs: { src: 'data:image/png;base64,AAAA' } }), 'bad_image'],
    ['zdjęcie z adresem https / a photo with an https address', doc({ type: 'image', attrs: { src: 'https://example.org/a.jpg' } }), 'bad_image'],
    ['zdjęcie z adresem javascript: / a photo with a javascript: address', doc({ type: 'image', attrs: { src: 'javascript:alert(1)' } }), 'bad_image'],
    ['zdjęcie z przejściem w górę ścieżki / a photo with a path traversal', doc({ type: 'image', attrs: { src: '/api/media/../x' } }), 'bad_image'],
    ['zdjęcie spoza /api/media / a photo outside /api/media', doc({ type: 'image', attrs: { src: '/api/other/abc' } }), 'bad_image'],
    ['zdjęcie z pustym identyfikatorem / a photo with an empty id', doc({ type: 'image', attrs: { src: '/api/media/' } }), 'bad_image'],
    ['zdjęcie z identyfikatorem dłuższym niż 64 znaki / a photo with an id longer than 64 characters', doc({ type: 'image', attrs: { src: `/api/media/${'a'.repeat(65)}` } }), 'bad_image'],
    ['zdjęcie bez adresu / a photo without an address', doc({ type: 'image', attrs: {} }), 'bad_image'],
    ['zdjęcie z adresem jako tablica / a photo with an address as an array', doc({ type: 'image', attrs: { src: ['/api/media/abc'] } }), 'bad_image'],
    ['karta linku do obcej domeny / a link card to a foreign domain', doc({ type: 'linkCard', attrs: { href: 'https://fakeinstagram.com/x' } }), 'bad_card'],
    ['źródła z adresem javascript: / sources with a javascript: address', doc({ type: 'sources', attrs: { urls: ['javascript:1'] } }), 'bad_sources'],
    ['nieznany element script / an unknown script element', doc({ type: 'script', content: [] }), 'schema'],
    ['blok kodu spoza listy / a code block off the list', doc({ type: 'codeBlock', content: [{ type: 'text', text: 'x' }] }), 'schema'],
    ['nagłówek poziomu 1 / a level 1 heading', doc({ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'x' }] }), 'schema'],
    ['pozycja listy poza listą / a list item outside a list', doc({ type: 'listItem', content: [paragraph('x')] }), 'schema'],
    ['pusty dokument / an empty document', doc({ type: 'paragraph' }), 'empty'],
    ['wartość, która nie jest dokumentem / a value that is not a document', { type: 'paragraph' }, 'not_a_document'],
    ['tekst za długi / text too long', doc(paragraph('a'.repeat(20_001))), 'too_long'],
  ];
  it.each(cases)('%s', (_name, input, reason) => {
    expect(validateBody(input)).toEqual({ ok: false, reason });
  });

  it('odrzuca dokument za duży w bajtach / rejects a document too large in bytes', () => {
    const big = doc(...Array.from({ length: 4000 }, () => paragraph('a'.repeat(60))));
    expect(validateBody(big)).toEqual({ ok: false, reason: 'too_large' });
  });

  it('odrzuca zbyt głębokie zagnieżdżenie / rejects nesting that is too deep', () => {
    let node: unknown = paragraph('x');
    for (let level = 0; level < 12; level += 1) node = { type: 'blockquote', content: [node] };
    expect(validateBody(doc(node))).toEqual({ ok: false, reason: 'too_deep' });
  });
});
