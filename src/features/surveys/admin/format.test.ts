/**
 * PL: Test tekstów i dat ankiet w panelu (podtor 5b): polska odmiana liczebników, daty z EKRANY.md i ostatni dzień ankiety (7 dni od 12.10 to 19.10.2026).
 * EN: Test of the panel survey texts and dates (subtrack 5b): Polish numeral forms, the dates from EKRANY.md and the last day of a survey (7 days from 12.10 is 19.10.2026).
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/format.ts::pluralPl
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { describeQuestions, describeResponses, formatShortDate, lastDayLabel } from './format';

describe('odmiana / plural forms', () => {
  it('pytania: 1 pytanie, 3 pytania, 5 pytań, 12 pytań, 22 pytania / questions', () => {
    expect([1, 3, 5, 12, 22].map(describeQuestions)).toEqual(['1 pytanie', '3 pytania', '5 pytań', '12 pytań', '22 pytania']);
  });

  it('odpowiedzi: 1 odpowiedź, 3 odpowiedzi, 12 odpowiedzi, 21 odpowiedzi / responses', () => {
    expect([0, 1, 3, 12, 21].map(describeResponses)).toEqual(['0 odpowiedzi', '1 odpowiedź', '3 odpowiedzi', '12 odpowiedzi', '21 odpowiedzi']);
  });
});

describe('daty / dates', () => {
  it('data krótka ma dzień bez zera i miesiąc z zerem / the short date has the day without a zero and the month with one', () => {
    expect(formatShortDate('2026-09-30')).toBe('30.09');
    expect(formatShortDate('2026-10-06')).toBe('6.10');
  });

  it('7 dni od 12.10.2026 to ostatni dzień 19.10.2026 / 7 days from 12.10.2026 is the last day 19.10.2026', () => {
    expect(lastDayLabel(new Date('2026-10-12T10:00:00Z'), 7)).toBe('19.10.2026');
  });

  it('liczy dzień w Polsce: po północy w Polsce to już następny dzień / counts the day in Poland: after midnight in Poland it is the next day', () => {
    expect(lastDayLabel(new Date('2026-10-12T22:30:00Z'), 3)).toBe('16.10.2026');
  });
});
