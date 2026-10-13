/**
 * PL: Test sprawdzania nowej ankiety (podtor 5b): poprawna ankieta, przycinanie spacji, każda zasada z ekranu 6.5b (tytuł, pytanie, od 2 do 5 odpowiedzi, czas trwania) oraz termin zamknięcia (brak terminu, poprawny termin w przyszłości, termin przeszły i zły zapis).
 * EN: Test of checking a new survey (subtrack 5b): a valid survey, space trimming, every rule of screen 6.5b (title, question, 2 to 5 options, duration) and the closing time (no time, a valid time in the future, a past time and a bad text).
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/surveys/admin/validation.ts::parseNewSurvey
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { parseNewSurvey } from './validation';

// PL: Chwila sprawdzania w teście: 13.10.2026 o 12:00 w Warszawie (10:00 UTC, czas letni).
// EN: The moment of the check in the test: 13.10.2026 at 12:00 in Warsaw (10:00 UTC, summer time).
const now = new Date('2026-10-13T10:00:00Z');

// PL: Poprawna ankieta, od której test odejmuje po jednej rzeczy. Bez terminu zamknięcia.
// EN: A valid survey, from which the test breaks one thing at a time. Without a closing time.
const valid = { title: 'Dzień sportu', questions: [{ prompt: 'W co chcesz zagrać?', options: ['Siatkówka', 'Koszykówka'] }], durationDays: 7 };

describe('parseNewSurvey', () => {
  it('przyjmuje poprawną ankietę i przycina spacje / accepts a valid survey and trims spaces', () => {
    const parsed = parseNewSurvey({ ...valid, title: '  Dzień sportu  ' }, now);
    expect(parsed).toEqual({ ...valid, questions: [{ ...valid.questions[0], type: 'single_choice' }], closesAt: null });
  });

  it('bierze typ pytania z listy, a brak typu to jednokrotny wybór / takes the question type from the list, and no type means single choice', () => {
    const withType = (type: unknown) => ({ ...valid, questions: [{ ...valid.questions[0], type }] });
    expect(parseNewSurvey(withType('multiple_choice'), now)?.questions[0]?.type).toBe('multiple_choice');
    expect(parseNewSurvey(withType('single_choice'), now)?.questions[0]?.type).toBe('single_choice');
    expect(parseNewSurvey(withType(undefined), now)?.questions[0]?.type).toBe('single_choice');
    expect(parseNewSurvey(withType(null), now)?.questions[0]?.type).toBe('single_choice');
  });

  it('odrzuca typ spoza QUESTION_TYPES / rejects a type outside QUESTION_TYPES', () => {
    const withType = (type: unknown) => ({ ...valid, questions: [{ ...valid.questions[0], type }] });
    for (const type of ['open_text', 'Multiple_Choice', 'multiple_choice ', '', 1, ['single_choice']]) expect(parseNewSurvey(withType(type), now)).toBeNull();
  });

  it('skala 1–5 tworzy pięć odpowiedzi 1…5 niezależnie od body / the 1–5 scale makes five options 1…5 whatever the body says', () => {
    const scale = (options: unknown) => ({ ...valid, questions: [{ prompt: 'Jak oceniasz?', type: 'scale_1_5', options }] });
    expect(parseNewSurvey(scale(['A', 'B']), now)?.questions[0]).toEqual({ prompt: 'Jak oceniasz?', type: 'scale_1_5', options: ['1', '2', '3', '4', '5'] });
    expect(parseNewSurvey(scale(undefined), now)?.questions[0]?.options).toEqual(['1', '2', '3', '4', '5']);
    expect(parseNewSurvey(scale([]), now)?.questions[0]?.options).toEqual(['1', '2', '3', '4', '5']);
  });

  it('odrzuca ankietę bez tytułu albo z samymi spacjami / rejects a survey without a title or with spaces only', () => {
    expect(parseNewSurvey({ ...valid, title: '' }, now)).toBeNull();
    expect(parseNewSurvey({ ...valid, title: '   ' }, now)).toBeNull();
    expect(parseNewSurvey({ ...valid, title: 5 }, now)).toBeNull();
  });

  it('odrzuca ankietę bez pytań i pytanie bez treści / rejects a survey without questions and a question without text', () => {
    expect(parseNewSurvey({ ...valid, questions: [] }, now)).toBeNull();
    expect(parseNewSurvey({ ...valid, questions: [{ prompt: ' ', options: ['A', 'B'] }] }, now)).toBeNull();
  });

  it('wymaga od 2 do 5 niepustych odpowiedzi / requires 2 to 5 non-blank options', () => {
    const withOptions = (options: string[]) => ({ ...valid, questions: [{ prompt: 'Pytanie', options }] });
    expect(parseNewSurvey(withOptions(['Jedna']), now)).toBeNull();
    expect(parseNewSurvey(withOptions(['A', 'B', 'C', 'D', 'E', 'F']), now)).toBeNull();
    expect(parseNewSurvey(withOptions(['A', '']), now)).toBeNull();
    expect(parseNewSurvey(withOptions(['A', 'B', 'C', 'D', 'E']), now)).not.toBeNull();
  });

  it('przyjmuje tylko 3, 7 i 14 dni / accepts only 3, 7 and 14 days', () => {
    for (const durationDays of [3, 7, 14]) expect(parseNewSurvey({ ...valid, durationDays }, now)).not.toBeNull();
    for (const durationDays of [0, 5, '7', null]) expect(parseNewSurvey({ ...valid, durationDays }, now)).toBeNull();
  });

  it('odrzuca śmieci zamiast ankiety / rejects junk instead of a survey', () => {
    for (const junk of [null, undefined, 'tekst', 5, [], {}]) expect(parseNewSurvey(junk, now)).toBeNull();
  });
});

describe('parseNewSurvey: termin zamknięcia / closing time', () => {
  it('pusty termin to brak terminu / an empty closing time means no closing time', () => {
    expect(parseNewSurvey({ ...valid, closesAt: null }, now)?.closesAt).toBeNull();
    expect(parseNewSurvey({ ...valid, closesAt: '' }, now)?.closesAt).toBeNull();
  });

  it('poprawny termin w przyszłości zamienia się na chwilę UTC / a valid future time becomes a UTC moment', () => {
    // PL: 20.10.2026 o 12:00 w Warszawie to 10:00 UTC.
    // EN: 20.10.2026 at 12:00 in Warsaw is 10:00 UTC.
    expect(parseNewSurvey({ ...valid, closesAt: '2026-10-20T12:00' }, now)?.closesAt).toBe(Date.parse('2026-10-20T10:00:00Z'));
  });

  it('odrzuca termin w przeszłości, także o minutę / rejects a time in the past, even by one minute', () => {
    // PL: 13.10.2026 o 11:59 w Warszawie to już minęło (chwila sprawdzania to 12:00).
    // EN: 13.10.2026 at 11:59 in Warsaw has already passed (the check is at 12:00).
    expect(parseNewSurvey({ ...valid, closesAt: '2026-10-13T11:59' }, now)).toBeNull();
    expect(parseNewSurvey({ ...valid, closesAt: '2026-10-01T09:00' }, now)).toBeNull();
  });

  it('odrzuca zły zapis i datę, której nie ma / rejects a bad text and a date that does not exist', () => {
    expect(parseNewSurvey({ ...valid, closesAt: 'jutro' }, now)).toBeNull();
    expect(parseNewSurvey({ ...valid, closesAt: 5 }, now)).toBeNull();
    expect(parseNewSurvey({ ...valid, closesAt: '2030-02-30T12:00' }, now)).toBeNull();
  });
});

describe('parseNewSurvey: krótka odpowiedź / short answer', () => {
  it('krótka odpowiedź nie ma odpowiedzi do wyboru, a te z telefonu są ignorowane / a short answer has no options, and the ones from the phone are ignored', () => {
    const shortText = (options: unknown) => ({ ...valid, questions: [{ prompt: 'Co zjesz?', type: 'short_text', options }] });
    expect(parseNewSurvey(shortText(undefined), now)?.questions[0]).toEqual({ prompt: 'Co zjesz?', type: 'short_text', options: [] });
    expect(parseNewSurvey(shortText([]), now)?.questions[0]?.options).toEqual([]);
    expect(parseNewSurvey(shortText(['A', 'B']), now)?.questions[0]?.options).toEqual([]);
  });

  it('krótka odpowiedź bez treści pytania odpada / a short answer without question text is rejected', () => {
    expect(parseNewSurvey({ ...valid, questions: [{ prompt: '  ', type: 'short_text', options: [] }] }, now)).toBeNull();
  });
});
