/**
 * PL: Test większego tekstu: ustawianie rozmiaru na <html>, zapis i odczyt z pamięci telefonu, zepsuty zapis oraz powrót do zwykłego tekstu. Element <html> i pamięć są podstawione zwykłymi obiektami, bo testy Vitest działają bez przeglądarki.
 * EN: Test of the larger text: setting the size on <html>, saving and reading from the phone storage, a broken record and going back to the normal text. The <html> element and the storage are replaced by plain objects, because Vitest tests run without a browser.
 *
 * @author Jakub
 * @since 2026-10-13
 * @uses src/features/profile/textSize.ts::applyTextSize
 * @used_by vitest.config.ts::include
 */
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Funkcje i stałe, które sprawdzamy.
// EN: The functions and constants under test.
import { applyStoredTextSize, applyTextSize, DEFAULT_TEXT_SIZE, readStoredTextSize, resetTextSize, TEXT_SIZE_STORAGE_KEY } from './textSize';
import type { LookStorage, LookTarget } from './look';

/** PL: Podstawiony element <html>. EN: A stand-in <html> element. */
let target: LookTarget;
/** PL: Podstawiona pamięć telefonu i jej zawartość. EN: A stand-in phone storage and its content. */
let data: Map<string, string>;
let storage: LookStorage;

// PL: Przed każdym testem pusty element i pusta pamięć.
// EN: Before every test an empty element and an empty storage.
beforeEach(() => {
  target = { dataset: {} };
  data = new Map();
  storage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => void data.set(key, value), removeItem: (key) => void data.delete(key) };
});

// PL: Grupa testów ustawiania i zapisu.
// EN: A group of tests for setting and saving.
describe('applyTextSize: ustawianie i zapis / setting and saving', () => {
  // PL: Większy tekst ustawia atrybut data-tekst i zapisuje wybór.
  // EN: The larger text sets the data-tekst attribute and saves the choice.
  it('ustawia data-tekst i zapisuje wybór / sets data-tekst and saves the choice', () => {
    applyTextSize('duzy', target, storage);
    expect(target.dataset.tekst).toBe('duzy');
    expect(data.get(TEXT_SIZE_STORAGE_KEY)).toBe('duzy');
  });

  // PL: Po przełączeniu z powrotem na zwykły tekst atrybut i zapis pokazują normalny.
  // EN: After switching back to the normal text the attribute and the save show normalny.
  it('wraca do zwykłego tekstu / goes back to the normal text', () => {
    applyTextSize('duzy', target, storage);
    applyTextSize('normalny', target, storage);
    expect(target.dataset.tekst).toBe('normalny');
    expect(readStoredTextSize(storage)).toBe('normalny');
  });

  // PL: Zablokowana pamięć nie psuje zmiany rozmiaru na stronie.
  // EN: A blocked storage does not break the size change on the page.
  it('zablokowana pamięć nie psuje zmiany / a blocked storage does not break the change', () => {
    const blocked: LookStorage = { getItem: () => null, setItem: () => { throw new Error('quota'); }, removeItem: () => undefined };
    expect(() => applyTextSize('duzy', target, blocked)).not.toThrow();
    expect(target.dataset.tekst).toBe('duzy');
  });
});

// PL: Grupa testów odczytu przy starcie aplikacji.
// EN: A group of tests for reading at app start.
describe('applyStoredTextSize: odczyt przy starcie / reading at start', () => {
  // PL: Zapisany rozmiar wraca po ponownym uruchomieniu.
  // EN: The saved size comes back after a restart.
  it('przywraca zapisany rozmiar / restores the saved size', () => {
    data.set(TEXT_SIZE_STORAGE_KEY, 'duzy');
    applyStoredTextSize(target, storage);
    expect(target.dataset.tekst).toBe('duzy');
  });

  // PL: Bez zapisu albo z zepsutym zapisem ustawia zwykły tekst.
  // EN: With no record or a broken record it sets the normal text.
  it.each([undefined, '', 'wielki', '{"size":"duzy"}'])('bez poprawnego zapisu (%s) zwykły tekst / no valid record (%s) gives the normal text', (saved) => {
    if (saved !== undefined) data.set(TEXT_SIZE_STORAGE_KEY, saved);
    applyStoredTextSize(target, storage);
    expect(target.dataset.tekst).toBe(DEFAULT_TEXT_SIZE);
    expect(readStoredTextSize(storage)).toBe(saved === 'duzy' ? 'duzy' : undefined);
  });

  // PL: Pamięć, która rzuca błąd, daje zwykły tekst zamiast wysadzenia aplikacji.
  // EN: A storage that throws gives the normal text instead of breaking the app.
  it('pamięć z błędem daje zwykły tekst / a throwing storage gives the normal text', () => {
    const broken: LookStorage = { getItem: () => { throw new Error('denied'); }, setItem: () => undefined, removeItem: () => undefined };
    applyStoredTextSize(target, broken);
    expect(target.dataset.tekst).toBe('normalny');
  });
});

// PL: Grupa testów powrotu do domyślnego stanu po usunięciu konta.
// EN: A group of tests for going back to the default state after the account deletion.
describe('resetTextSize: po usunięciu konta / after the account deletion', () => {
  // PL: Reset kasuje zapis i ustawia zwykły tekst.
  // EN: The reset deletes the record and sets the normal text.
  it('kasuje zapis i ustawia zwykły tekst / deletes the record and sets the normal text', () => {
    applyTextSize('duzy', target, storage);
    resetTextSize(target, storage);
    expect(target.dataset.tekst).toBe('normalny');
    expect(data.has(TEXT_SIZE_STORAGE_KEY)).toBe(false);
  });
});
