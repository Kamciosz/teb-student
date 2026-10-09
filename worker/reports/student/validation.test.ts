/**
 * PL: Test sprawdzania danych zgłoszenia. Sprawdza poprawne dane, domyślną anonimowość, każdy rodzaj błędu i to, że nieznane pola (na przykład cudzy numer autora) giną.
 * EN: Test of the report data validation. Checks valid data, default anonymity, every kind of error and that unknown fields (for example someone else's author id) are dropped.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/reports/student/validation.ts::parseReportInput
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja i limity, które sprawdzamy.
// EN: The function and limits under test.
import { MAX_DESCRIPTION_LENGTH, MAX_PLACE_DETAIL_LENGTH, parseReportInput } from './validation';

/** PL: Poprawne dane wyjściowe dla testów. EN: Valid base data for the tests. */
const VALID = { category: 'room_equipment', place: 'classroom', placeDetail: 'Sala 204', description: 'Nie działa projektor', isAnonymous: true };

// PL: Grupa testów sprawdzania danych zgłoszenia.
// EN: A group of tests for the report data validation.
describe('parseReportInput', () => {
  // PL: Poprawne dane przechodzą bez zmian.
  // EN: Valid data passes unchanged.
  it('przyjmuje poprawne dane / accepts valid data', () => {
    // PL: Sprawdź poprawne dane.
    // EN: Validate valid data.
    expect(parseReportInput(VALID)).toEqual({ ok: true, value: VALID });
  });

  // PL: Brak anonimowości w treści oznacza anonimowe zgłoszenie.
  // EN: Missing anonymity in the body means an anonymous report.
  it('domyślnie zgłoszenie jest anonimowe / the report is anonymous by default', () => {
    // PL: Usuń pole anonimowości.
    // EN: Remove the anonymity field.
    const { isAnonymous: _removed, ...body } = VALID;
    const result = parseReportInput(body);

    // PL: Wartość ma być prawdą.
    // EN: The value must be true.
    expect(result.ok && result.value.isAnonymous).toBe(true);
  });

  // PL: Puste albo brakujące dokładne miejsce to `null`, a spacje na brzegach znikają.
  // EN: An empty or missing exact place is `null`, and edge spaces are trimmed.
  it('czyści dokładne miejsce i opis / cleans the exact place and the description', () => {
    // PL: Dane ze spacjami i pustym miejscem.
    // EN: Data with spaces and an empty place.
    const result = parseReportInput({ ...VALID, placeDetail: '   ', description: '  Brak światła  ' });

    // PL: Miejsce to null, opis bez spacji.
    // EN: The place is null, the description has no spaces.
    expect(result).toMatchObject({ ok: true, value: { placeDetail: null, description: 'Brak światła' } });
  });

});

// PL: Grupa testów błędów danych.
// EN: A group of tests for data errors.
describe('parseReportInput błędy / errors', () => {
  // PL: Każdy błąd wskazuje właściwe pole.
  // EN: Every error names the right field.
  it.each([
    ['nieznana kategoria / unknown category', { category: 'xyz' }, 'category'],
    ['kategoria nie jest tekstem / category is not a string', { category: 5 }, 'category'],
    ['nieznane miejsce / unknown place', { place: 'kuchnia' }, 'place'],
    ['pusty opis / empty description', { description: '   ' }, 'description'],
    ['opis za długi / description too long', { description: 'a'.repeat(MAX_DESCRIPTION_LENGTH + 1) }, 'description'],
    ['miejsce za długie / place detail too long', { placeDetail: 'a'.repeat(MAX_PLACE_DETAIL_LENGTH + 1) }, 'placeDetail'],
    ['miejsce nie jest tekstem / place detail is not a string', { placeDetail: 7 }, 'placeDetail'],
    ['anonimowość nie jest logiczna / anonymity is not boolean', { isAnonymous: 'tak' }, 'isAnonymous'],
  ])('odrzuca: %s', (_name, patch, field) => {
    // PL: Złe dane muszą wskazać dokładnie to pole.
    // EN: Bad data must name exactly this field.
    expect(parseReportInput({ ...VALID, ...patch })).toEqual({ ok: false, fields: [field] });
  });

  // PL: Opis o granicznej długości jest poprawny.
  // EN: A description of the boundary length is valid.
  it('przyjmuje opis o największej długości / accepts a description of the maximum length', () => {
    // PL: Opis dokładnie na limicie.
    // EN: A description exactly at the limit.
    expect(parseReportInput({ ...VALID, description: 'a'.repeat(MAX_DESCRIPTION_LENGTH) }).ok).toBe(true);
  });

});

// PL: Grupa testów brzegowych.
// EN: A group of edge-case tests.
describe('parseReportInput brzegi / edges', () => {
  // PL: Treść, która nie jest obiektem, zgłasza wszystkie pola wymagane.
  // EN: A body that is not an object reports all required fields.
  it.each([[null], ['tekst'], [undefined], [42]])('odrzuca treść %s / rejects body %s', (body) => {
    // PL: Wynik to błąd z polami wymaganymi.
    // EN: The result is an error with the required fields.
    expect(parseReportInput(body)).toEqual({ ok: false, fields: ['category', 'place', 'description'] });
  });

  // PL: Numer autora z telefonu nie trafia do wyniku.
  // EN: An author id from the phone does not reach the result.
  it('gubi nieznane pola / drops unknown fields', () => {
    // PL: Dodaj cudzy numer autora i etap.
    // EN: Add someone else's author id and a stage.
    const result = parseReportInput({ ...VALID, authorId: 'inny-uczen', stage: 'resolved' });

    // PL: Wynik ma tylko znane pola.
    // EN: The result has only the known fields.
    expect(result.ok && Object.keys(result.value).sort()).toEqual(['category', 'description', 'isAnonymous', 'place', 'placeDetail']);
  });
});
