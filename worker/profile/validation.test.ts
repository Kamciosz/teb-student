/**
 * PL: Test sprawdzania danych profilu. Dobre dane przechodzą (z przyciętymi spacjami), a złe pola trafiają na listę błędów.
 * EN: Test of the profile data check. Good data passes (with trimmed spaces) and bad fields land on the error list.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses worker/profile/validation.ts::parseProfileInput
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja i limity, które sprawdzamy.
// EN: The function and the limits under test.
import { MAX_CLASS_LENGTH, MAX_NAME_LENGTH, parseProfileInput } from './validation';

/** PL: Poprawny profil, od którego psujemy po jednym polu. EN: A valid profile, from which we break one field at a time. */
const VALID = { name: 'Ola', className: '3TA', school: 'T', palette: 'CE' };

// PL: Grupa testów poprawnych danych.
// EN: A group of tests for valid data.
describe('parseProfileInput: dobre dane / good data', () => {
  // PL: Poprawny profil przechodzi bez zmian.
  // EN: A valid profile passes unchanged.
  it('przyjmuje poprawny profil / accepts a valid profile', () => {
    expect(parseProfileInput(VALID)).toEqual({ ok: true, value: VALID });
  });

  // PL: Spacje na brzegach znikają, a puste imię i klasa są dozwolone (tak zaczyna nowy uczeń).
  // EN: The spaces at the edges disappear, and an empty name and class are allowed (that is how a new student starts).
  it('przycina spacje i dopuszcza puste pola / trims spaces and allows empty fields', () => {
    expect(parseProfileInput({ ...VALID, name: '  Ola  ', className: '   ' })).toEqual({ ok: true, value: { ...VALID, name: 'Ola', className: '' } });
  });

  // PL: Każdy kod palety CA–CH jest dozwolony.
  // EN: Every palette code CA–CH is allowed.
  it.each(['CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH'])('paleta %s / palette %s', (palette) => {
    expect(parseProfileInput({ ...VALID, palette }).ok).toBe(true);
  });
});

// PL: Grupa testów złych danych.
// EN: A group of tests for bad data.
describe('parseProfileInput: złe dane / bad data', () => {
  // PL: Każde złe pole jest wskazane po nazwie.
  // EN: Every bad field is named.
  it.each([
    ['imię za długie', { name: 'a'.repeat(MAX_NAME_LENGTH + 1) }, 'name'],
    ['imię nie tekst', { name: 5 }, 'name'],
    ['klasa za długa', { className: 'a'.repeat(MAX_CLASS_LENGTH + 1) }, 'className'],
    ['nieznana szkoła', { school: 'X' }, 'school'],
    ['nieznana paleta', { palette: 'CZ' }, 'palette'],
    ['paleta małymi literami', { palette: 'ce' }, 'palette'],
  ])('%s / bad field', (_label, change, field) => {
    expect(parseProfileInput({ ...VALID, ...change })).toEqual({ ok: false, fields: [field] });
  });

  // PL: Treść, która nie jest obiektem, ma złe wszystkie pola.
  // EN: A body that is not an object has every field bad.
  it.each([undefined, null, 'tekst', 5])('treść %s nie jest obiektem / body %s is not an object', (body) => {
    expect(parseProfileInput(body)).toEqual({ ok: false, fields: ['name', 'className', 'school', 'palette'] });
  });
});
