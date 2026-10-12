/**
 * PL: Test skracania odpowiedzi modułów do danych kafelków pulpitu: wybór wpisu „Ważne”, trzech ogłoszeń, ankiety do wypełnienia i zgłoszenia z etapem, oraz odporność na odpowiedzi o złym kształcie.
 * EN: Test of shortening the module answers to the dashboard tile data: choosing the "Ważne" entry, three announcements, the survey to fill in and the report with its stage, and resistance to answers of a wrong shape.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses worker/dashboard/summary.ts::summarizeNews
 * @uses worker/dashboard/summary.ts::summarizeSurveys
 * @uses worker/dashboard/summary.ts::summarizeReports
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje pod testem.
// EN: The functions under test.
import { summarizeNews, summarizeReports, summarizeSurveys } from './summary';

/**
 * PL: Buduje wpis w kształcie odpowiedzi modułu aktualności.
 * EN: Builds an entry in the shape of the news module answer.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @param type - PL: typ wpisu. EN: the entry type.
 * @returns PL: wpis z listy. EN: an entry from the list.
 */
function entry(id: string, type: string): object {
  return { id, type, source: 'Sekretariat', publishedAt: '2026-10-09T10:00:00.000Z', title: `Tytuł ${id}`, excerpt: `Opis ${id}` };
}

// PL: Grupa testów aktualności.
// EN: A group of news tests.
describe('summarizeNews', () => {
  // PL: Wpis „Ważne” to pierwszy z typem „important”, a ogłoszenia to trzy pierwsze wpisy dowolnego typu.
  // EN: The "Ważne" entry is the first one of the "important" type, and the announcements are the first three entries of any type.
  it('wybiera najnowszy wpis „Ważne” i trzy ostatnie wpisy / picks the newest "Ważne" entry and the three latest entries', () => {
    const result = summarizeNews({ entries: [entry('a', 'news'), entry('b', 'important'), entry('c', 'event'), entry('d', 'sport'), entry('e', 'important')] });

    expect(result.important).toEqual({ id: 'b', title: 'Tytuł b', excerpt: 'Opis b', source: 'Sekretariat', publishedAt: '2026-10-09T10:00:00.000Z' });
    expect(result.announcements.map((row) => row.id)).toEqual(['a', 'b', 'c']);
  });

  // PL: Bez wpisu „Ważne” kafel jest pusty, ale ogłoszenia zostają.
  // EN: Without a "Ważne" entry the tile is empty, but the announcements stay.
  it('bez wpisu „Ważne” oddaje null i ogłoszenia / without a "Ważne" entry returns null and the announcements', () => {
    const result = summarizeNews({ entries: [entry('a', 'news')] });

    expect(result.important).toBeNull();
    expect(result.announcements).toHaveLength(1);
  });

  // PL: Zły kształt odpowiedzi i wiersze bez tytułu dają pusty wynik, a nie błąd.
  // EN: A wrong answer shape and rows without a title give an empty result, not an error.
  it('pomija wiersze o złym kształcie i znosi śmieci / skips rows of a wrong shape and tolerates garbage', () => {
    expect(summarizeNews(null)).toEqual({ important: null, announcements: [] });
    expect(summarizeNews({ entries: 'nie lista' })).toEqual({ important: null, announcements: [] });
    expect(summarizeNews({ entries: [{ id: 'x', type: 'important' }, 5, null] })).toEqual({ important: null, announcements: [] });
  });
});

// PL: Grupa testów ankiet.
// EN: A group of survey tests.
describe('summarizeSurveys', () => {
  // PL: Wypełnionej ankiety kafel nie proponuje, więc bierzemy pierwszą bez głosu ucznia.
  // EN: The tile does not offer a filled-in survey, so we take the first one without the student's vote.
  it('wybiera pierwszą ankietę bez głosu ucznia / picks the first survey without the student\'s vote', () => {
    const active = [
      { id: 's1', title: 'Wypełniona', daysLeft: 2, hasVoted: true },
      { id: 's2', title: 'Do wypełnienia', daysLeft: 3, hasVoted: false },
    ];

    expect(summarizeSurveys({ active, ended: [] })).toEqual({ id: 's2', title: 'Do wypełnienia', daysLeft: 3 });
  });

  // PL: Bez aktywnych albo ze wszystkimi wypełnionymi kafel jest pusty.
  // EN: With no active surveys or all of them filled in, the tile is empty.
  it('oddaje null, gdy nie ma ankiety do wypełnienia / returns null when there is no survey to fill in', () => {
    expect(summarizeSurveys({ active: [], ended: [] })).toBeNull();
    expect(summarizeSurveys({ active: [{ id: 's1', title: 'T', daysLeft: 1, hasVoted: true }] })).toBeNull();
    expect(summarizeSurveys(undefined)).toBeNull();
  });
});

// PL: Grupa testów zgłoszeń.
// EN: A group of report tests.
describe('summarizeReports', () => {
  // PL: Kafel pokazuje najnowsze niezałatwione zgłoszenie z numerem etapu i liczbą niezałatwionych.
  // EN: The tile shows the newest unresolved report with the stage number and the unresolved count.
  it('wybiera najnowsze niezałatwione zgłoszenie z etapem / picks the newest unresolved report with its stage', () => {
    const reports = [
      { description: 'Załatwione', stage: 'resolved' },
      { description: 'Nie działa projektor w sali 204', stage: 'in_progress' },
      { description: 'Przyjęte', stage: 'received' },
    ];

    expect(summarizeReports({ reports })).toEqual({ description: 'Nie działa projektor w sali 204', stage: 2, openCount: 2 });
  });

  // PL: Gdy wszystko jest załatwione, kafel pokazuje najnowsze zgłoszenie z etapem 3 i zerem niezałatwionych.
  // EN: When everything is resolved, the tile shows the newest report with stage 3 and zero unresolved.
  it('przy samych załatwionych pokazuje najnowsze z etapem 3 / with only resolved ones shows the newest with stage 3', () => {
    expect(summarizeReports({ reports: [{ description: 'Okno', stage: 'resolved' }] })).toEqual({ description: 'Okno', stage: 3, openCount: 0 });
  });

  // PL: Bez zgłoszeń, z nieznanym etapem albo ze złym kształtem kafel jest pusty.
  // EN: With no reports, an unknown stage or a wrong shape the tile is empty.
  it('oddaje null bez zgłoszeń i dla nieznanego etapu / returns null with no reports and for an unknown stage', () => {
    expect(summarizeReports({ reports: [] })).toBeNull();
    expect(summarizeReports({ reports: [{ description: 'X', stage: 'dziwny' }] })).toBeNull();
    expect(summarizeReports('śmieci')).toBeNull();
  });
});
