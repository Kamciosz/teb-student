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
import { MIN_RESPONSES, scaleAverage, shapeResults, sortTexts, toQuestionResult } from './results';

// PL: Dane ankiety bez wyników.
// EN: The survey data without results.
const survey = { id: 's1', title: 'Obiad w stołówce', endsOn: '2026-10-18', questionCount: 1 };

describe('toQuestionResult', () => {
  it('liczy udziały jak w przykładzie ekranu 6.5d / counts shares as in the screen 6.5d example', () => {
    const result = toQuestionResult('Jak oceniasz obiady?', 'single_choice', [
      { label: 'Dobrze', votes: 5 },
      { label: 'Różnie', votes: 4 },
      { label: 'Słabo', votes: 2 },
      { label: 'Nie jadam w stołówce', votes: 1 },
    ]);
    expect(result.options.map((option) => option.percent)).toEqual([42, 33, 17, 8]);
  });

  it('przy wielokrotnym wyborze liczy udziały od zaznaczeń i zachowuje typ / with multiple choice counts shares from the checked boxes and keeps the type', () => {
    const result = toQuestionResult('Co lubisz?', 'multiple_choice', [{ label: 'A', votes: 3 }, { label: 'B', votes: 1 }]);
    expect(result.type).toBe('multiple_choice');
    expect(result.options.map((option) => option.percent)).toEqual([75, 25]);
  });

  it('pytanie bez głosów daje same zera / a question without votes gives zeros only', () => {
    const result = toQuestionResult('Pytanie', 'single_choice', [{ label: 'A', votes: 0 }, { label: 'B', votes: 0 }]);
    expect(result.options.map((option) => option.percent)).toEqual([0, 0]);
  });
});

describe('scaleAverage', () => {
  it('liczy średnią z pozycji 1…5 ważonych głosami, do jednego miejsca / counts the average of positions 1…5 weighted by votes, to one decimal place', () => {
    expect(scaleAverage([{ votes: 1 }, { votes: 0 }, { votes: 1 }, { votes: 0 }, { votes: 0 }])).toBe(2);
    expect(scaleAverage([{ votes: 2 }, { votes: 1 }, { votes: 0 }, { votes: 0 }, { votes: 0 }])).toBe(1.3);
    expect(scaleAverage([{ votes: 0 }, { votes: 0 }, { votes: 0 }, { votes: 1 }, { votes: 2 }])).toBe(4.7);
  });

  it('bez głosów średniej nie ma / without votes there is no average', () => {
    expect(scaleAverage([{ votes: 0 }, { votes: 0 }, { votes: 0 }, { votes: 0 }, { votes: 0 }])).toBeUndefined();
  });
});

describe('shapeResults', () => {
  it('poniżej progu zwraca liczbę i nie pobiera rozkładu / below the threshold returns the count and does not fetch the distribution', async () => {
    const load = vi.fn(async () => []);
    const result = await shapeResults(survey, MIN_RESPONSES - 1, load);
    expect(result).toEqual({ ...survey, responseCount: 4, minResponses: 5 });
    expect(load).not.toHaveBeenCalled();
  });

  it('skala 1–5 dostaje średnią od progu, a bez głosów pola nie ma / the 1–5 scale gets the average from the threshold, and without votes there is no field', async () => {
    const scale = toQuestionResult('Jak oceniasz?', 'scale_1_5', [
      { label: '1', votes: 2 }, { label: '2', votes: 1 }, { label: '3', votes: 0 }, { label: '4', votes: 0 }, { label: '5', votes: 0 },
    ]);
    const empty = toQuestionResult('Jak oceniasz?', 'scale_1_5', ['1', '2', '3', '4', '5'].map((label) => ({ label, votes: 0 })));
    const result = await shapeResults(survey, MIN_RESPONSES, async () => [scale, empty]);
    expect(result.questions?.[0]?.average).toBe(1.3);
    expect(result.questions?.[1]).not.toHaveProperty('average');
  });

  it('od progu dopisuje pytania / from the threshold adds the questions', async () => {
    const questions = [toQuestionResult('P', 'single_choice', [{ label: 'A', votes: 3 }, { label: 'B', votes: 2 }])];
    const result = await shapeResults(survey, MIN_RESPONSES, async () => questions);
    expect(result.questions).toEqual(questions);
  });
});

// PL: Krótkie odpowiedzi: sortowanie i próg. Odpowiedzi nie mogą zdradzać kolejności zapisu ani autora.
// EN: Short answers: the sorting and the threshold. The answers must not reveal the order written or the author.
describe('krótka odpowiedź / short answer', () => {
  // PL: Kolejność „Mleko, Zupa, Arbuz, Łosoś, Lody” nie jest ani rosnąca, ani malejąca, więc zdradziłaby zapis tylko błędnym sortowaniem. „Ł” ma stać po „L”, a nie na końcu.
  // EN: The order "Mleko, Zupa, Arbuz, Łosoś, Lody" is neither ascending nor descending, so only a wrong sort would show the write order. "Ł" must stand after "L", not at the end.
  const written = ['Mleko', 'Zupa', 'Arbuz', 'Łosoś', 'Lody'];

  it('sortuje alfabetycznie po polsku, niezależnie od kolejności wejścia / sorts alphabetically in Polish, whatever the input order', () => {
    expect(sortTexts(written)).toEqual(['Arbuz', 'Lody', 'Łosoś', 'Mleko', 'Zupa']);
    expect(sortTexts([...written].reverse())).toEqual(['Arbuz', 'Lody', 'Łosoś', 'Mleko', 'Zupa']);
  });

  it('nie zmienia tablicy wejściowej / does not change the input array', () => {
    const input = [...written];
    sortTexts(input);
    expect(input).toEqual(written);
  });

  it('pytanie krótkiej odpowiedzi ma same teksty, bez odpowiedzi do wyboru i bez autora / a short-answer question has the texts only, no options and no author', () => {
    expect(toQuestionResult('Co zjesz?', 'short_text', [], written)).toEqual({ prompt: 'Co zjesz?', type: 'short_text', options: [], texts: ['Arbuz', 'Lody', 'Łosoś', 'Mleko', 'Zupa'] });
  });

  it('poniżej progu nie pobiera tekstów i nie ma ich w odpowiedzi / below the threshold it does not fetch the texts and they are not in the response', async () => {
    const load = vi.fn(async () => [toQuestionResult('Co zjesz?', 'short_text', [], written)]);
    const result = await shapeResults(survey, MIN_RESPONSES - 1, load);
    expect(load).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain('Zupa');
  });

  it('od progu, czyli 5 odpowiedzi, pokazuje teksty / from the threshold, that is 5 responses, it shows the texts', async () => {
    const load = vi.fn(async () => [toQuestionResult('Co zjesz?', 'short_text', [], written)]);
    const result = await shapeResults(survey, MIN_RESPONSES, load);
    expect(load).toHaveBeenCalledOnce();
    expect(result.questions?.[0]?.texts).toEqual(['Arbuz', 'Lody', 'Łosoś', 'Mleko', 'Zupa']);
  });
});
