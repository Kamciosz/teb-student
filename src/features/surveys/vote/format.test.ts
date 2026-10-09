/**
 * PL: Test tekstów z liczbami: odmiana, szacowany czas, opis ankiety i data.
 * EN: Test of the texts with numbers: declension, estimated time, survey description and date.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/format.ts::pluralPl
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { daysWord, describeSurvey, estimateMinutes, formatShortDate, pluralPl } from './format';

// PL: Formy słowa „pytanie”.
// EN: The forms of the word "pytanie".
const QUESTION_FORMS = ['pytanie', 'pytania', 'pytań'] as const;

// PL: Grupa testów odmiany.
// EN: A group of tests for declension.
describe('pluralPl', () => {
  it.each([
    [1, 'pytanie'],
    [2, 'pytania'],
    [4, 'pytania'],
    [5, 'pytań'],
    [12, 'pytań'],
    [14, 'pytań'],
    [22, 'pytania'],
    [25, 'pytań'],
    [0, 'pytań'],
  ])('%i daje „%s” / gives "%s"', (count, expected) => {
    expect(pluralPl(count, QUESTION_FORMS)).toBe(expected);
  });
});

// PL: Grupa testów czasu i opisu.
// EN: A group of tests for the time and the description.
describe('describeSurvey', () => {
  it('trzy pytania to jedna minuta jak w makiecie / three questions are one minute as in the mockup', () => {
    expect(estimateMinutes(3)).toBe(1);
    expect(describeSurvey(3)).toBe('3 pytania · 1 minuta');
  });

  it('nigdy mniej niż minuta i zaokrągla w górę / never under a minute and rounds up', () => {
    expect(estimateMinutes(0)).toBe(1);
    expect(estimateMinutes(4)).toBe(2);
    expect(describeSurvey(12)).toBe('12 pytań · 4 minuty');
  });
});

// PL: Grupa testów dni i daty.
// EN: A group of tests for days and the date.
describe('daysWord i formatShortDate', () => {
  it('jeden dzień, reszta dni / one day, the rest days', () => {
    expect(daysWord(1)).toBe('dzień');
    expect(daysWord(3)).toBe('dni');
  });

  it('data jak w makiecie / the date as in the mockup', () => {
    expect(formatShortDate('2026-09-30')).toBe('30.09');
    expect(formatShortDate('2026-10-02')).toBe('2.10');
  });
});
