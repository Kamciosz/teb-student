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

// PL: Ankieta z dwoma pytaniami jednokrotnego wyboru po dwie odpowiedzi.
// EN: A survey with two single-choice questions of two options each.
const QUESTIONS = [
  { questionId: 'q1', type: 'single_choice' as const, optionIds: ['q1-a', 'q1-b'] },
  { questionId: 'q2', type: 'single_choice' as const, optionIds: ['q2-a', 'q2-b'] },
];

// PL: Ankieta z pytaniem wielokrotnego wyboru po trzy odpowiedzi.
// EN: A survey with a multiple-choice question of three options.
const MULTI_QUESTIONS = [{ questionId: 'm1', type: 'multiple_choice' as const, optionIds: ['m1-a', 'm1-b', 'm1-c'] }];

// PL: Grupa testów kształtu danych.
// EN: A group of tests for the data shape.
describe('parseAnswersBody', () => {
  it('przyjmuje listę pytań z listą wybranych odpowiedzi / accepts a list of questions with lists of picked options', () => {
    const body = { answers: [{ questionId: 'q1', optionIds: ['q1-a', 'q1-b'], extra: 'x' }] };

    // PL: Dodatkowe pole znika, nie jest nigdzie zapisywane.
    // EN: The extra field disappears and is stored nowhere.
    expect(parseAnswersBody(body)).toEqual([{ questionId: 'q1', optionIds: ['q1-a', 'q1-b'] }]);
  });

  it.each([
    ['brak obiektu', null],
    ['brak tablicy', {}],
    ['pusta tablica', { answers: [] }],
    ['element nie jest obiektem', { answers: ['q1'] }],
    ['numer pytania nie jest tekstem', { answers: [{ questionId: 1, optionIds: ['q1-a'] }] }],
    ['brak listy odpowiedzi', { answers: [{ questionId: 'q1' }] }],
    ['stara forma: pojedynczy optionId', { answers: [{ questionId: 'q1', optionId: 'q1-a' }] }],
    ['lista odpowiedzi nie jest tablicą', { answers: [{ questionId: 'q1', optionIds: 'q1-a' }] }],
    ['pusty numer odpowiedzi', { answers: [{ questionId: 'q1', optionIds: [''] }] }],
    ['numer odpowiedzi nie jest tekstem', { answers: [{ questionId: 'q1', optionIds: [7] }] }],
    ['za długi numer', { answers: [{ questionId: 'q'.repeat(65), optionIds: ['a'] }] }],
    ['za dużo odpowiedzi w pytaniu', { answers: [{ questionId: 'q1', optionIds: Array.from({ length: 51 }, (_, i) => `o${i}`) }] }],
    ['za dużo pytań', { answers: Array.from({ length: 51 }, () => ({ questionId: 'q1', optionIds: ['q1-a'] })) }],
  ])('odrzuca: %s / rejects: %s', (_name, body) => {
    expect(parseAnswersBody(body)).toBeNull();
  });

  it('przepuszcza pustą listę wyborów, odrzuca ją dopiero checkAnswers / passes an empty list of picks, checkAnswers rejects it', () => {
    expect(parseAnswersBody({ answers: [{ questionId: 'q1', optionIds: [] }] })).toEqual([{ questionId: 'q1', optionIds: [] }]);
  });
});

// PL: Grupa testów zgodności z pytaniami.
// EN: A group of tests for the match with the questions.
describe('checkAnswers', () => {
  it('przyjmuje komplet odpowiedzi jednokrotnych i oddaje numery wybranych / accepts a full set of single choices and returns the picked ids', () => {
    const answers = [
      { questionId: 'q2', optionIds: ['q2-b'] },
      { questionId: 'q1', optionIds: ['q1-a'] },
    ];

    expect(checkAnswers(QUESTIONS, answers)).toEqual({ ok: true, optionIds: ['q2-b', 'q1-a'] });
  });

  it('przyjmuje kilka odpowiedzi w pytaniu wielokrotnego wyboru / accepts several options in a multiple-choice question', () => {
    const answers = [{ questionId: 'm1', optionIds: ['m1-a', 'm1-c'] }];

    expect(checkAnswers(MULTI_QUESTIONS, answers)).toEqual({ ok: true, optionIds: ['m1-a', 'm1-c'] });
  });

  it('odrzuca brakujące pytanie / rejects a missing question', () => {
    expect(checkAnswers(QUESTIONS, [{ questionId: 'q1', optionIds: ['q1-a'] }])).toEqual({ ok: false, reason: 'missing_question' });
  });

  it('odrzuca pytanie spoza ankiety / rejects a question from outside the survey', () => {
    expect(checkAnswers(QUESTIONS, [{ questionId: 'other', optionIds: ['x'] }])).toEqual({ ok: false, reason: 'unknown_question' });
  });

  it('odrzuca to samo pytanie dwa razy / rejects the same question twice', () => {
    const answers = [
      { questionId: 'q1', optionIds: ['q1-a'] },
      { questionId: 'q1', optionIds: ['q1-b'] },
    ];

    expect(checkAnswers(QUESTIONS, answers)).toEqual({ ok: false, reason: 'duplicate_question' });
  });

  it('odrzuca odpowiedź z cudzego pytania / rejects an option of another question', () => {
    const answers = [
      { questionId: 'q1', optionIds: ['q2-a'] },
      { questionId: 'q2', optionIds: ['q2-a'] },
    ];

    expect(checkAnswers(QUESTIONS, answers)).toEqual({ ok: false, reason: 'unknown_option' });
  });

  it('odrzuca pustą odpowiedź / rejects an empty answer', () => {
    const answers = [
      { questionId: 'q1', optionIds: [] },
      { questionId: 'q2', optionIds: ['q2-a'] },
    ];

    expect(checkAnswers(QUESTIONS, answers)).toEqual({ ok: false, reason: 'empty_answer' });
  });

  it('odrzuca kilka odpowiedzi w pytaniu jednokrotnego wyboru / rejects several options in a single-choice question', () => {
    const answers = [
      { questionId: 'q1', optionIds: ['q1-a', 'q1-b'] },
      { questionId: 'q2', optionIds: ['q2-a'] },
    ];

    expect(checkAnswers(QUESTIONS, answers)).toEqual({ ok: false, reason: 'too_many_options' });
  });

  it('odrzuca tę samą odpowiedź dwa razy w jednym pytaniu / rejects the same option twice in one question', () => {
    const answers = [{ questionId: 'm1', optionIds: ['m1-a', 'm1-a'] }];

    expect(checkAnswers(MULTI_QUESTIONS, answers)).toEqual({ ok: false, reason: 'duplicate_option' });
  });

  it('odrzuca obcą odpowiedź w pytaniu wielokrotnego wyboru / rejects a foreign option in a multiple-choice question', () => {
    const answers = [{ questionId: 'm1', optionIds: ['m1-a', 'q1-a'] }];

    expect(checkAnswers(MULTI_QUESTIONS, answers)).toEqual({ ok: false, reason: 'unknown_option' });
  });
});
