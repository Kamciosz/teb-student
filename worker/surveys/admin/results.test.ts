/**
 * PL: Test składania wyników (podtor 5b): udziały w pełnych procentach z przykładu ekranu 6.5d (5, 4, 2, 1 z 12 daje 42, 33, 17, 8), pytanie bez głosów oraz próg 5 odpowiedzi (poniżej progu rozkład nie jest nawet pobierany).
 * EN: Test of building the results (subtrack 5b): shares in whole percent from the example of screen 6.5d (5, 4, 2, 1 of 12 gives 42, 33, 17, 8), a question without votes and the 5-response threshold (below the threshold the distribution is not even fetched).
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/surveys/admin/results.ts::shapeResults
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it, vi } from 'vitest';
import { MIN_RESPONSES, shapeResults, toQuestionResult } from './results';

// PL: Dane ankiety bez wyników.
// EN: The survey data without results.
const survey = { id: 's1', title: 'Obiad w stołówce', endsOn: '2026-10-18', questionCount: 1 };

describe('toQuestionResult', () => {
  it('liczy udziały jak w przykładzie ekranu 6.5d / counts shares as in the screen 6.5d example', () => {
    const result = toQuestionResult('Jak oceniasz obiady?', [
      { label: 'Dobrze', votes: 5 },
      { label: 'Różnie', votes: 4 },
      { label: 'Słabo', votes: 2 },
      { label: 'Nie jadam w stołówce', votes: 1 },
    ]);
    expect(result.options.map((option) => option.percent)).toEqual([42, 33, 17, 8]);
  });

  it('pytanie bez głosów daje same zera / a question without votes gives zeros only', () => {
    const result = toQuestionResult('Pytanie', [{ label: 'A', votes: 0 }, { label: 'B', votes: 0 }]);
    expect(result.options.map((option) => option.percent)).toEqual([0, 0]);
  });
});

describe('shapeResults', () => {
  it('poniżej progu zwraca liczbę i nie pobiera rozkładu / below the threshold returns the count and does not fetch the distribution', async () => {
    const load = vi.fn(async () => []);
    const result = await shapeResults(survey, MIN_RESPONSES - 1, load);
    expect(result).toEqual({ ...survey, responseCount: 4, minResponses: 5 });
    expect(load).not.toHaveBeenCalled();
  });

  it('od progu dopisuje pytania / from the threshold adds the questions', async () => {
    const questions = [toQuestionResult('P', [{ label: 'A', votes: 3 }, { label: 'B', votes: 2 }])];
    const result = await shapeResults(survey, MIN_RESPONSES, async () => questions);
    expect(result.questions).toEqual(questions);
  });
});
