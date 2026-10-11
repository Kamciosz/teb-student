/**
 * PL: Test wyglądu aplikacji: ustawianie palety i szkoły, zapis i odczyt z pamięci telefonu, zepsuty zapis oraz powrót do wyglądu domyślnego. Element <html> i pamięć są podstawione zwykłymi obiektami, bo testy Vitest działają bez przeglądarki.
 * EN: Test of the app look: setting the palette and school, saving and reading from the phone storage, a broken record and going back to the default look. The <html> element and the storage are replaced by plain objects, because Vitest tests run without a browser.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/look.ts::applyLook
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Funkcje i stałe, które sprawdzamy.
// EN: The functions and constants under test.
import { DEFAULT_LOOK, LOOK_STORAGE_KEY, PALETTES, applyLook, applyStoredLook, readStoredLook, resetLook, type LookStorage, type LookTarget } from './look';

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

// PL: Grupa testów palet.
// EN: A group of tests for the palettes.
describe('PALETTES', () => {
  // PL: Do wyboru jest osiem palet o różnych kodach.
  // EN: There are eight palettes with distinct codes.
  it('ma osiem palet o różnych kodach / has eight palettes with distinct codes', () => {
    expect(PALETTES).toHaveLength(8);
    expect(new Set(PALETTES.map((palette) => palette.code)).size).toBe(8);
  });
});

// PL: Grupa testów ustawiania wyglądu.
// EN: A group of tests for setting the look.
describe('applyLook', () => {
  // PL: Wybór trafia na element <html> i do pamięci, a po ponownym uruchomieniu wraca z pamięci.
  // EN: The choice goes to the <html> element and to the storage, and after a restart it comes back from the storage.
  it('ustawia atrybuty i zostaje po ponownym uruchomieniu / sets the attributes and survives a restart', () => {
    applyLook({ palette: 'CH', school: 'T' }, target, storage);
    expect(target.dataset).toEqual({ paleta: 'CH', szkola: 'T' });

    // PL: „Ponowne uruchomienie”: nowy, pusty element i ta sama pamięć.
    // EN: A "restart": a new, empty element and the same storage.
    const restarted: LookTarget = { dataset: {} };
    applyStoredLook(restarted, storage);
    expect(restarted.dataset).toEqual({ paleta: 'CH', szkola: 'T' });
  });

  // PL: Zablokowana pamięć (zapis rzuca błąd) nie psuje zmiany wyglądu.
  // EN: A blocked storage (saving throws) does not break the look change.
  it('działa, gdy pamięć rzuca błąd / works when the storage throws', () => {
    const blocked: LookStorage = { getItem: () => null, setItem: () => { throw new Error('zablokowane'); }, removeItem: () => undefined };
    applyLook({ palette: 'CA', school: 'L' }, target, blocked);
    expect(target.dataset).toEqual({ paleta: 'CA', szkola: 'L' });
  });
});

// PL: Grupa testów odczytu zapisanego wyglądu.
// EN: A group of tests for reading the saved look.
describe('applyStoredLook i readStoredLook / applyStoredLook and readStoredLook', () => {
  // PL: Bez zapisu działa wygląd domyślny: paleta CE i akcent liceum.
  // EN: Without a record the default look applies: palette CE and the lyceum accent.
  it('bez zapisu daje wygląd domyślny / with no record gives the default look', () => {
    applyStoredLook(target, storage);
    expect(target.dataset).toEqual({ paleta: DEFAULT_LOOK.palette, szkola: DEFAULT_LOOK.school });
  });

  // PL: Zepsuty JSON, nieznana paleta i nieznana szkoła to brak zapisu.
  // EN: Broken JSON, an unknown palette and an unknown school count as no record.
  it.each(['{nie json', JSON.stringify({ palette: 'CZ', school: 'L' }), JSON.stringify({ palette: 'CE', school: 'X' }), 'null', '5'])('zapis %s jest ignorowany / record %s is ignored', (text) => {
    data.set(LOOK_STORAGE_KEY, text);
    expect(readStoredLook(storage)).toBeUndefined();
  });
});

// PL: Grupa testów powrotu do wyglądu domyślnego.
// EN: A group of tests for going back to the default look.
describe('resetLook', () => {
  // PL: Po resecie atrybuty są domyślne, a zapis znika (po usunięciu konta nic nie zostaje na telefonie).
  // EN: After the reset the attributes are the default and the record is gone (after the account deletion nothing stays on the phone).
  it('przywraca wygląd domyślny i kasuje zapis / restores the default look and removes the record', () => {
    applyLook({ palette: 'CF', school: 'T' }, target, storage);

    resetLook(target, storage);

    expect(target.dataset).toEqual({ paleta: DEFAULT_LOOK.palette, szkola: DEFAULT_LOOK.school });
    expect(readStoredLook(storage)).toBeUndefined();
  });
});
