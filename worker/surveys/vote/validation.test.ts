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

// PL: Ankieta ze skalą 1–5: pięć zwykłych odpowiedzi „1”…„5”, wybiera się jedną, jak przy jednokrotnym wyborze.
// EN: A survey with a 1–5 scale: five ordinary options "1"…"5", one is picked, like a single choice.
const SCALE_QUESTIONS = [{ questionId: 's1', type: 'scale_1_5' as const, optionIds: ['s1-1', 's1-2', 's1-3', 's1-4', 's1-5'] }];

// PL: Ankieta z pytaniem krótkiej odpowiedzi (bez odpowiedzi do wyboru) i jednym wyborem obok.
// EN: A survey with a short-answer question (no options to pick) and a single choice next to it.
const TEXT_QUESTIONS = [
  { questionId: 't1', type: 'short_text' as const, optionIds: [] },
  { questionId: 'q1', type: 'single_choice' as const, optionIds: ['q1-a', 'q1-b'] },
];

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
    ['tekst nie jest tekstem', { answers: [{ questionId: 't1', optionIds: [], text: 5 }] }],
    ['tekst jest tablicą', { answers: [{ questionId: 't1', optionIds: [], text: ['a'] }] }],
    ['surowy tekst za długi', { answers: [{ questionId: 't1', optionIds: [], text: 'a'.repeat(1001) }] }],
  ])('odrzuca: %s / rejects: %s', (_name, body) => {
    expect(parseAnswersBody(body)).toBeNull();
  });

  it('przepuszcza pustą listę wyborów, odrzuca ją dopiero checkAnswers / passes an empty list of picks, checkAnswers rejects it', () => {
    expect(parseAnswersBody({ answers: [{ questionId: 'q1', optionIds: [] }] })).toEqual([{ questionId: 'q1', optionIds: [] }]);
  });

  it('zostawia tekst bez przycinania, a brak tekstu albo null znaczy brak pola / keeps the text untrimmed, a missing or null text means no field', () => {
    const body = { answers: [{ questionId: 't1', optionIds: [], text: '  abc  ' }, { questionId: 'q1', optionIds: ['q1-a'], text: null }] };

    expect(parseAnswersBody(body)).toEqual([
      { questionId: 't1', optionIds: [], text: '  abc  ' },
      { questionId: 'q1', optionIds: ['q1-a'] },
    ]);
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

    expect(checkAnswers(QUESTIONS, answers)).toEqual({ ok: true, optionIds: ['q2-b', 'q1-a'], texts: [] });
  });

  it('przyjmuje kilka odpowiedzi w pytaniu wielokrotnego wyboru / accepts several options in a multiple-choice question', () => {
    const answers = [{ questionId: 'm1', optionIds: ['m1-a', 'm1-c'] }];

    expect(checkAnswers(MULTI_QUESTIONS, answers)).toEqual({ ok: true, optionIds: ['m1-a', 'm1-c'], texts: [] });
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

  it('przyjmuje jedną wybraną wartość skali / accepts one picked scale value', () => {
    const answers = [{ questionId: 's1', optionIds: ['s1-3'] }];

    expect(checkAnswers(SCALE_QUESTIONS, answers)).toEqual({ ok: true, optionIds: ['s1-3'], texts: [] });
  });

  it('odrzuca dwie wartości skali / rejects two scale values', () => {
    const answers = [{ questionId: 's1', optionIds: ['s1-2', 's1-3'] }];

    expect(checkAnswers(SCALE_QUESTIONS, answers)).toEqual({ ok: false, reason: 'too_many_options' });
  });

  it('odrzuca wartość skali z innego pytania / rejects a scale value from another question', () => {
    const answers = [{ questionId: 's1', optionIds: ['q1-a'] }];

    expect(checkAnswers([...SCALE_QUESTIONS, ...QUESTIONS], answers)).toEqual({ ok: false, reason: 'unknown_option' });
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

// PL: Grupa testów krótkiej odpowiedzi: długość liczona w znakach po przycięciu, pusty tekst odrzucany, tekst i odpowiedzi nie mieszają się.
// EN: A group of tests for the short answer: the length counted in characters after trimming, an empty text rejected, text and options never mixed.
describe('checkAnswers, krótka odpowiedź / short answer', () => {
  it('przyjmuje tekst i oddaje go przycięty / accepts the text and returns it trimmed', () => {
    const answers = [
      { questionId: 't1', optionIds: [], text: '  Więcej sportu  ' },
      { questionId: 'q1', optionIds: ['q1-a'] },
    ];

    expect(checkAnswers(TEXT_QUESTIONS, answers)).toEqual({
      ok: true,
      optionIds: ['q1-a'],
      texts: [{ questionId: 't1', text: 'Więcej sportu' }],
    });
  });

  it('przyjmuje dokładnie 200 znaków / accepts exactly 200 characters', () => {
    const answers = [{ questionId: 't1', optionIds: [], text: 'a'.repeat(200) }];

    expect(checkAnswers([TEXT_QUESTIONS[0]], answers)).toEqual({ ok: true, optionIds: [], texts: [{ questionId: 't1', text: 'a'.repeat(200) }] });
  });

  it('odrzuca 201 znaków / rejects 201 characters', () => {
    const answers = [{ questionId: 't1', optionIds: [], text: 'a'.repeat(201) }];

    expect(checkAnswers([TEXT_QUESTIONS[0]], answers)).toEqual({ ok: false, reason: 'text_too_long' });
  });

  it('liczy znaki, nie jednostki kodu: 200 emoji przechodzi, 201 nie / counts characters, not code units: 200 emoji pass, 201 do not', () => {
    const ok = [{ questionId: 't1', optionIds: [], text: '🙂'.repeat(200) }];
    const tooLong = [{ questionId: 't1', optionIds: [], text: '🙂'.repeat(201) }];

    expect(checkAnswers([TEXT_QUESTIONS[0]], ok).ok).toBe(true);
    expect(checkAnswers([TEXT_QUESTIONS[0]], tooLong)).toEqual({ ok: false, reason: 'text_too_long' });
  });

  it('spacje z obu stron nie wliczają się w limit / spaces on both ends do not count toward the limit', () => {
    const answers = [{ questionId: 't1', optionIds: [], text: `  ${'a'.repeat(200)}  ` }];

    expect(checkAnswers([TEXT_QUESTIONS[0]], answers)).toEqual({ ok: true, optionIds: [], texts: [{ questionId: 't1', text: 'a'.repeat(200) }] });
  });

  it('odrzuca tekst z samych białych znaków / rejects a text of whitespace only', () => {
    const answers = [{ questionId: 't1', optionIds: [], text: ' \t \n ' }];

    expect(checkAnswers([TEXT_QUESTIONS[0]], answers)).toEqual({ ok: false, reason: 'empty_text' });
  });

  it('odrzuca brak tekstu w pytaniu krótkiej odpowiedzi / rejects a missing text in a short-answer question', () => {
    const answers = [{ questionId: 't1', optionIds: [] }];

    expect(checkAnswers([TEXT_QUESTIONS[0]], answers)).toEqual({ ok: false, reason: 'empty_text' });
  });

  it('odrzuca odpowiedź do wyboru w pytaniu krótkiej odpowiedzi / rejects an option in a short-answer question', () => {
    const answers = [{ questionId: 't1', optionIds: ['q1-a'], text: 'abc' }];

    expect(checkAnswers(TEXT_QUESTIONS, answers)).toEqual({ ok: false, reason: 'unexpected_option' });
  });

  it('odrzuca tekst w pytaniu wyboru, nawet pusty / rejects text in a choice question, even an empty one', () => {
    const withText = [
      { questionId: 't1', optionIds: [], text: 'abc' },
      { questionId: 'q1', optionIds: ['q1-a'], text: 'abc' },
    ];
    const withEmpty = [
      { questionId: 't1', optionIds: [], text: 'abc' },
      { questionId: 'q1', optionIds: ['q1-a'], text: '' },
    ];

    expect(checkAnswers(TEXT_QUESTIONS, withText)).toEqual({ ok: false, reason: 'unexpected_text' });
    expect(checkAnswers(TEXT_QUESTIONS, withEmpty)).toEqual({ ok: false, reason: 'unexpected_text' });
  });

  it('odrzuca brakujące pytanie krótkiej odpowiedzi / rejects a missing short-answer question', () => {
    const answers = [{ questionId: 'q1', optionIds: ['q1-a'] }];

    expect(checkAnswers(TEXT_QUESTIONS, answers)).toEqual({ ok: false, reason: 'missing_question' });
  });
});
