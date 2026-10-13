/**
 * PL: Test sprawdzania nowej ankiety (podtor 5b): poprawna ankieta, przycinanie spacji oraz każda zasada z ekranu 6.5b (tytuł, pytanie, od 2 do 5 odpowiedzi, czas trwania).
 * EN: Test of checking a new survey (subtrack 5b): a valid survey, space trimming and every rule of screen 6.5b (title, question, 2 to 5 options, duration).
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/surveys/admin/validation.ts::parseNewSurvey
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { parseNewSurvey } from './validation';

// PL: Poprawna ankieta, od której test odejmuje po jednej rzeczy.
// EN: A valid survey, from which the test breaks one thing at a time.
const valid = { title: 'Dzień sportu', questions: [{ prompt: 'W co chcesz zagrać?', options: ['Siatkówka', 'Koszykówka'] }], durationDays: 7 };

describe('parseNewSurvey', () => {
  it('przyjmuje poprawną ankietę i przycina spacje / accepts a valid survey and trims spaces', () => {
    const parsed = parseNewSurvey({ ...valid, title: '  Dzień sportu  ' });
    expect(parsed).toEqual(valid);
  });

  it('odrzuca ankietę bez tytułu albo z samymi spacjami / rejects a survey without a title or with spaces only', () => {
    expect(parseNewSurvey({ ...valid, title: '' })).toBeNull();
    expect(parseNewSurvey({ ...valid, title: '   ' })).toBeNull();
    expect(parseNewSurvey({ ...valid, title: 5 })).toBeNull();
  });

  it('odrzuca ankietę bez pytań i pytanie bez treści / rejects a survey without questions and a question without text', () => {
    expect(parseNewSurvey({ ...valid, questions: [] })).toBeNull();
    expect(parseNewSurvey({ ...valid, questions: [{ prompt: ' ', options: ['A', 'B'] }] })).toBeNull();
  });

  it('wymaga od 2 do 5 niepustych odpowiedzi / requires 2 to 5 non-blank options', () => {
    const withOptions = (options: string[]) => ({ ...valid, questions: [{ prompt: 'Pytanie', options }] });
    expect(parseNewSurvey(withOptions(['Jedna']))).toBeNull();
    expect(parseNewSurvey(withOptions(['A', 'B', 'C', 'D', 'E', 'F']))).toBeNull();
    expect(parseNewSurvey(withOptions(['A', '']))).toBeNull();
    expect(parseNewSurvey(withOptions(['A', 'B', 'C', 'D', 'E']))).not.toBeNull();
  });

  it('przyjmuje tylko 3, 7 i 14 dni / accepts only 3, 7 and 14 days', () => {
    for (const durationDays of [3, 7, 14]) expect(parseNewSurvey({ ...valid, durationDays })).not.toBeNull();
    for (const durationDays of [0, 5, '7', null]) expect(parseNewSurvey({ ...valid, durationDays })).toBeNull();
  });

  it('odrzuca śmieci zamiast ankiety / rejects junk instead of a survey', () => {
    for (const junk of [null, undefined, 'tekst', 5, [], {}]) expect(parseNewSurvey(junk)).toBeNull();
  });
});
