/**
 * PL: Testy budowy węzła zdjęcia z wyniku wysyłki i wyboru komunikatu błędu (przycisk „Zdjęcie” na pasku edytora).
 * EN: Tests of building the photo node from the upload result and of picking the error message (the "Zdjęcie" button on the editor toolbar).
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/editor/photoNode.ts::photoImageNode
 * @uses src/features/news/editor/photoNode.ts::photoErrorMessage
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje do sprawdzenia i teksty, z którymi je porównujemy.
// EN: The functions under test and the texts we compare with.
import { photoErrorMessage, photoImageNode } from './photoNode';
import { TO_AGREE } from './texts';

// PL: Wzorzec adresu zdjęcia, który sprawdza serwer.
// EN: The photo address pattern that the server checks.
const SERVER_SRC_PATTERN = /^\/api\/media\/[A-Za-z0-9_-]{1,64}$/;

describe('węzeł zdjęcia z wyniku wysyłki / the photo node from the upload result', () => {
  it('buduje węzeł image z adresem, wymiarami i pustym opisem i podpisem', () => {
    expect(photoImageNode({ id: 'abc123', src: '/api/media/abc123', width: 1600, height: 900 })).toEqual({
      type: 'image',
      attrs: { src: '/api/media/abc123', width: 1600, height: 900, alt: '', caption: '' },
    });
  });

  it('zachowuje brak wymiarów jako null', () => {
    expect(photoImageNode({ id: 'abc123', src: '/api/media/abc123', width: null, height: null }).attrs).toMatchObject({ width: null, height: null });
  });

  it('adres zdjęcia przechodzi wzorzec, którego pilnuje serwer', () => {
    const { attrs } = photoImageNode({ id: 'Zdj_1-x', src: '/api/media/Zdj_1-x', width: 10, height: 10 });
    expect(attrs.src).toMatch(SERVER_SRC_PATTERN);
  });
});

describe('komunikat błędu na pasku / the error message on the toolbar', () => {
  it('pokazuje polski komunikat zwykłego błędu z modułu media', () => {
    expect(photoErrorMessage(new Error('Plik jest za duży.'))).toBe('Plik jest za duży.');
  });

  it('nie pokazuje angielskiego SyntaxError z nieczytelnej odpowiedzi serwera', () => {
    expect(photoErrorMessage(new SyntaxError('Unexpected token < in JSON at position 0'))).toBe(TO_AGREE.photo.failed);
  });

  it('nie pokazuje błędu innego typu (np. TypeError) ani wartości, która nie jest błędem', () => {
    expect(photoErrorMessage(new TypeError('Failed to fetch'))).toBe(TO_AGREE.photo.failed);
    expect(photoErrorMessage('cokolwiek')).toBe(TO_AGREE.photo.failed);
  });
});
