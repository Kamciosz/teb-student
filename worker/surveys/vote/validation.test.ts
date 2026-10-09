/**
 * PL: Test sprawdzania odpowiedzi ucznia: kształt danych z telefonu i zgodność z pytaniami ankiety.
 * EN: Test of checking the student's answers: the shape of the data from the phone and the match with the survey questions.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/validation.ts::checkAnswers
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { checkAnswers, parseAnswersBody } from './validation';

// PL: Ankieta z dwoma pytaniami po dwie odpowiedzi.
// EN: A survey with two questions of two options each.
const QUESTIONS = [
  { questionId: 'q1', optionIds: ['q1-a', 'q1-b'] },
  { questionId: 'q2', optionIds: ['q2-a', 'q2-b'] },
];

// PL: Grupa testów kształtu danych.
// EN: A group of tests for the data shape.
describe('parseAnswersBody', () => {
  it('przyjmuje listę par pytanie–odpowiedź / accepts a list of question–option pairs', () => {
    const body = { answers: [{ questionId: 'q1', optionId: 'q1-a', extra: 'x' }] };

    // PL: Dodatkowe pole znika, nie jest nigdzie zapisywane.
    // EN: The extra field disappears and is stored nowhere.
    expect(parseAnswersBody(body)).toEqual([{ questionId: 'q1', optionId: 'q1-a' }]);
  });

  it.each([
    ['brak obiektu', null],
    ['brak tablicy', {}],
    ['pusta tablica', { answers: [] }],
    ['element nie jest obiektem', { answers: ['q1'] }],
    ['numer nie jest tekstem', { answers: [{ questionId: 1, optionId: 'q1-a' }] }],
    ['pusty numer', { answers: [{ questionId: 'q1', optionId: '' }] }],
    ['za długi numer', { answers: [{ questionId: 'q'.repeat(65), optionId: 'a' }] }],
    ['za dużo odpowiedzi', { answers: Array.from({ length: 51 }, () => ({ questionId: 'q1', optionId: 'q1-a' })) }],
  ])('odrzuca: %s / rejects: %s', (_name, body) => {
    expect(parseAnswersBody(body)).toBeNull();
  });
});

// PL: Grupa testów zgodności z pytaniami.
// EN: A group of tests for the match with the questions.
describe('checkAnswers', () => {
  it('przyjmuje komplet odpowiedzi i oddaje numery wybranych / accepts a full set and returns the picked ids', () => {
    const answers = [
      { questionId: 'q2', optionId: 'q2-b' },
      { questionId: 'q1', optionId: 'q1-a' },
    ];

    expect(checkAnswers(QUESTIONS, answers)).toEqual({ ok: true, optionIds: ['q2-b', 'q1-a'] });
  });

  it('odrzuca brakujące pytanie / rejects a missing question', () => {
    expect(checkAnswers(QUESTIONS, [{ questionId: 'q1', optionId: 'q1-a' }])).toEqual({ ok: false, reason: 'missing_question' });
  });

  it('odrzuca pytanie spoza ankiety / rejects a question from outside the survey', () => {
    expect(checkAnswers(QUESTIONS, [{ questionId: 'other', optionId: 'x' }])).toEqual({ ok: false, reason: 'unknown_question' });
  });

  it('odrzuca to samo pytanie dwa razy / rejects the same question twice', () => {
    const answers = [
      { questionId: 'q1', optionId: 'q1-a' },
      { questionId: 'q1', optionId: 'q1-b' },
    ];

    expect(checkAnswers(QUESTIONS, answers)).toEqual({ ok: false, reason: 'duplicate_question' });
  });

  it('odrzuca odpowiedź z cudzego pytania / rejects an option of another question', () => {
    const answers = [
      { questionId: 'q1', optionId: 'q2-a' },
      { questionId: 'q2', optionId: 'q2-a' },
    ];

    expect(checkAnswers(QUESTIONS, answers)).toEqual({ ok: false, reason: 'unknown_option' });
  });
});
