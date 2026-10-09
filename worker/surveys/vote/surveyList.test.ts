/**
 * PL: Test składania listy ankiet: podział na trwające i zakończone, kolejność, dni do końca i znacznik „wypełniona”.
 * EN: Test of building the survey list: the split into running and ended, the order, the days left and the "filled" mark.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/surveyList.ts::buildSurveyList
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja, którą sprawdzamy.
// EN: The function under test.
import { buildSurveyList, MAX_ENDED_SURVEYS } from './surveyList';

// PL: Dzisiejsza data we wszystkich przypadkach.
// EN: Today's date in all the cases.
const TODAY = '2026-10-29';

// PL: Trzy ankiety: dwie trwające i jedna zakończona.
// EN: Three surveys: two running and one ended.
const THREE_SURVEYS = [
  { id: 'late', label: null, title: 'Obiad', endsOn: '2026-11-10' },
  { id: 'soon', label: 'Temat', title: 'Zajęcia', endsOn: '2026-10-31' },
  { id: 'old', label: null, title: 'Dzwonki', endsOn: '2026-09-30' },
];

// PL: Grupa testów listy ankiet.
// EN: A group of tests for the survey list.
describe('buildSurveyList', () => {
  it('dzieli ankiety, liczy dni i oznacza wypełnione / splits the surveys, counts the days and marks the filled ones', () => {
    const list = buildSurveyList({ rows: THREE_SURVEYS, questionCounts: new Map([['soon', 3]]), votedIds: new Set(['late']), today: TODAY });

    // PL: Kończąca się wcześniej ankieta jest pierwsza, a brak pytań daje 0.
    // EN: The survey ending sooner comes first, and no questions give 0.
    expect(list.active).toEqual([
      { id: 'soon', label: 'Temat', title: 'Zajęcia', questionCount: 3, daysLeft: 3, hasVoted: false },
      { id: 'late', label: null, title: 'Obiad', questionCount: 0, daysLeft: 13, hasVoted: true },
    ]);
    expect(list.ended).toEqual([{ id: 'old', title: 'Dzwonki', endsOn: '2026-09-30' }]);
  });

  it('ankieta kończąca się dziś jeszcze jest na liście trwających / a survey ending today is still in the running list', () => {
    const list = buildSurveyList({ rows: [{ id: 'a', label: null, title: 'A', endsOn: TODAY }], questionCounts: new Map(), votedIds: new Set(), today: TODAY });

    expect(list.active).toHaveLength(1);
    expect(list.ended).toHaveLength(0);
  });

  it('zakończonych pokazuje najwyżej tyle, ile wolno, najnowsze pierwsze / shows at most the allowed number of ended ones, newest first', () => {
    const rows = Array.from({ length: MAX_ENDED_SURVEYS + 3 }, (_, index) => ({
      id: `s${index}`,
      label: null,
      title: `Ankieta ${index}`,
      endsOn: `2026-09-${String(index + 1).padStart(2, '0')}`,
    }));
    const list = buildSurveyList({ rows, questionCounts: new Map(), votedIds: new Set(), today: TODAY });

    expect(list.ended).toHaveLength(MAX_ENDED_SURVEYS);
    expect(list.ended[0]?.id).toBe(`s${MAX_ENDED_SURVEYS + 2}`);
  });
});
