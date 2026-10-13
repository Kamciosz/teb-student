/**
 * PL: Test składania listy ankiet: podział na trwające i zakończone, kolejność, dni do końca, godzina zamknięcia i znacznik „wypełniona”.
 * EN: Test of building the survey list: the split into running and ended, the order, the days left, the closing hour and the "filled" mark.
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

// PL: Dzisiejsza data we wszystkich przypadkach i chwila z tego dnia (12:00 w Polsce).
// EN: Today's date in all the cases, and a moment of that day (12:00 in Poland).
const TODAY = '2026-10-29';
const NOW = new Date('2026-10-29T11:00:00Z');

// PL: Trzy ankiety bez godziny zamknięcia: dwie trwające i jedna zakończona.
// EN: Three surveys without a closing hour: two running and one ended.
const THREE_SURVEYS = [
  { id: 'late', label: null, title: 'Obiad', endsOn: '2026-11-10', closesAt: null },
  { id: 'soon', label: 'Temat', title: 'Zajęcia', endsOn: '2026-10-31', closesAt: null },
  { id: 'old', label: null, title: 'Dzwonki', endsOn: '2026-09-30', closesAt: null },
];

// PL: Grupa testów listy ankiet.
// EN: A group of tests for the survey list.
describe('buildSurveyList', () => {
  it('dzieli ankiety, liczy dni i oznacza wypełnione / splits the surveys, counts the days and marks the filled ones', () => {
    const list = buildSurveyList({ rows: THREE_SURVEYS, questionCounts: new Map([['soon', 3]]), votedIds: new Set(['late']), today: TODAY, now: NOW });

    // PL: Kończąca się wcześniej ankieta jest pierwsza, a brak pytań daje 0.
    // EN: The survey ending sooner comes first, and no questions give 0.
    expect(list.active).toEqual([
      { id: 'soon', label: 'Temat', title: 'Zajęcia', questionCount: 3, daysLeft: 3, hasVoted: false, closesAt: null },
      { id: 'late', label: null, title: 'Obiad', questionCount: 0, daysLeft: 13, hasVoted: true, closesAt: null },
    ]);
    expect(list.ended).toEqual([{ id: 'old', title: 'Dzwonki', endsOn: '2026-09-30', endedOn: '2026-09-30' }]);
  });

  it('ankieta kończąca się dziś jeszcze jest na liście trwających / a survey ending today is still in the running list', () => {
    const rows = [{ id: 'a', label: null, title: 'A', endsOn: TODAY, closesAt: null }];
    const list = buildSurveyList({ rows, questionCounts: new Map(), votedIds: new Set(), today: TODAY, now: NOW });

    expect(list.active).toHaveLength(1);
    expect(list.ended).toHaveLength(0);
  });

  it('ankieta zamknięta godziną przed końcem dnia znika z trwających / a survey closed by an hour before the end of the day leaves the running list', () => {
    // PL: Zamknięta o 08:00 UTC (09:00 w Polsce), choć ostatni dzień jest dopiero za tydzień.
    // EN: Closed at 08:00 UTC (09:00 in Poland), although the last day is a week away.
    const rows = [{ id: 'hour', label: null, title: 'Godzinowa', endsOn: '2026-11-05', closesAt: new Date('2026-10-29T08:00:00Z') }];
    const list = buildSurveyList({ rows, questionCounts: new Map(), votedIds: new Set(), today: TODAY, now: NOW });

    expect(list.active).toHaveLength(0);
    // PL: Zakończona pokazuje dzień zamknięcia, a nie późniejszy ostatni dzień.
    // EN: The ended one shows the closing day, not the later last day.
    expect(list.ended).toEqual([{ id: 'hour', title: 'Godzinowa', endsOn: '2026-11-05', endedOn: '2026-10-29' }]);
  });

  it('ankieta z godziną w przyszłości jest trwająca i pokazuje godzinę / a survey with a future hour is running and shows the hour', () => {
    const closesAt = new Date('2026-10-29T20:00:00Z');
    const rows = [{ id: 'later', label: null, title: 'Wieczorem', endsOn: '2026-11-05', closesAt }];
    const list = buildSurveyList({ rows, questionCounts: new Map(), votedIds: new Set(), today: TODAY, now: NOW });

    expect(list.active).toEqual([
      { id: 'later', label: null, title: 'Wieczorem', questionCount: 0, daysLeft: 8, hasVoted: false, closesAt: closesAt.toISOString() },
    ]);
  });

  it('godzina po końcu ostatniego dnia nie jest pokazywana / an hour after the end of the last day is not shown', () => {
    // PL: Ostatni dzień 30.10, a godzina wypada 2.11, więc ankieta kończy się 30.10 i godzina nie ma znaczenia.
    // EN: The last day is 30.10 and the hour falls on 2.11, so the survey ends on 30.10 and the hour does not matter.
    const rows = [{ id: 'after', label: null, title: 'Później', endsOn: '2026-10-30', closesAt: new Date('2026-11-02T10:00:00Z') }];
    const list = buildSurveyList({ rows, questionCounts: new Map(), votedIds: new Set(), today: TODAY, now: NOW });

    expect(list.active[0]?.closesAt).toBeNull();
  });

  it('zakończonych pokazuje najwyżej tyle, ile wolno, najnowsze pierwsze / shows at most the allowed number of ended ones, newest first', () => {
    const rows = Array.from({ length: MAX_ENDED_SURVEYS + 3 }, (_, index) => ({
      id: `s${index}`,
      label: null,
      title: `Ankieta ${index}`,
      endsOn: `2026-09-${String(index + 1).padStart(2, '0')}`,
      closesAt: null,
    }));
    const list = buildSurveyList({ rows, questionCounts: new Map(), votedIds: new Set(), today: TODAY, now: NOW });

    expect(list.ended).toHaveLength(MAX_ENDED_SURVEYS);
    expect(list.ended[0]?.id).toBe(`s${MAX_ENDED_SURVEYS + 2}`);
  });
});
