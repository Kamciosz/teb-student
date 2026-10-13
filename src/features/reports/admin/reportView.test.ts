/**
 * PL: Test czystych funkcji widoku panelu zgłoszeń: filtr po etapie, nazwy, miejsce, krótka data i liczba osób („Mnie też”).
 * EN: Test of the pure functions of the reports panel view: the stage filter, the names, the place, the short date and the number of people ("Me too").
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/reportView.ts::filterByStage
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Typ zgłoszenia i funkcje, które sprawdzamy.
// EN: The report type and the functions under test.
import type { AdminReport } from './api';
import { categoryLabel, filterByStage, formatShortDate, joinText, placeText, stageLabel } from './reportView';

/**
 * PL: Buduje zgłoszenie testowe z podanym etapem.
 * EN: Builds a test report with the given stage.
 *
 * @param id - PL: numer zgłoszenia. EN: the report id.
 * @param stage - PL: kod etapu. EN: the stage code.
 * @returns PL: zgłoszenie. EN: the report.
 */
function report(id: string, stage: string): AdminReport {
  // PL: Pola nieistotne dla filtra mają stałe wartości.
  // EN: The fields irrelevant to the filter have constant values.
  return { id, isAnonymous: true, category: 'idea', place: 'field', placeDetail: null, description: 'Opis', stage, createdAt: 1, updatedAt: 1, joinCount: 0 };
}

// PL: Grupa testów filtra.
// EN: A group of filter tests.
describe('filterByStage', () => {
  /** PL: Trzy zgłoszenia na trzech etapach. EN: Three reports at three stages. */
  const reports = [report('a', 'received'), report('b', 'in_progress'), report('c', 'resolved')];

  // PL: „Wszystkie” zostawia wszystko w tej samej kolejności.
  // EN: "Wszystkie" keeps everything in the same order.
  it('„all” zostawia wszystkie / "all" keeps all', () => {
    // PL: Wszystkie trzy w tej samej kolejności.
    // EN: All three in the same order.
    expect(filterByStage(reports, 'all').map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  // PL: Etap zostawia tylko swoje zgłoszenia, a pusty etap daje pustą listę.
  // EN: A stage keeps only its own reports, and an empty stage gives an empty list.
  it('etap zostawia tylko swoje / a stage keeps only its own', () => {
    // PL: Etap „w trakcie” zostawia jedno zgłoszenie, a etap bez zgłoszeń daje pustą listę.
    // EN: The "in progress" stage keeps one report, and a stage without reports gives an empty list.
    expect(filterByStage(reports, 'in_progress').map((item) => item.id)).toEqual(['b']);
    expect(filterByStage([report('a', 'received')], 'resolved')).toEqual([]);
  });
});

// PL: Grupa testów nazw i miejsca.
// EN: A group of name and place tests.
describe('nazwy i miejsce / names and place', () => {
  // PL: Znane kody mają polskie nazwy, nieznany zostaje kodem.
  // EN: Known codes have Polish names, an unknown one stays a code.
  it('nazwy etapu i kategorii / stage and category names', () => {
    // PL: Znane kody mają polskie nazwy, nieznany zostaje kodem.
    // EN: Known codes have Polish names, an unknown one stays a code.
    expect(stageLabel('in_progress')).toBe('W trakcie');
    expect(categoryLabel('room_equipment')).toBe('Sala lub sprzęt');
    expect(stageLabel('coś-nowego')).toBe('coś-nowego');
  });

  // PL: Dokładne miejsce ma pierwszeństwo, a bez niego jest rodzaj miejsca.
  // EN: The exact place takes priority, and without it the kind of place is shown.
  it('miejsce: dokładne albo rodzaj / place: exact or kind', () => {
    // PL: Dokładne miejsce wygrywa, a bez niego jest rodzaj miejsca.
    // EN: The exact place wins, and without it the kind of place is shown.
    expect(placeText({ place: 'classroom', placeDetail: 'Sala 204' })).toBe('Sala 204');
    expect(placeText({ place: 'corridor', placeDetail: null })).toBe('Korytarz');
  });
});

// PL: Grupa testów krótkiej daty.
// EN: A group of short date tests.
describe('formatShortDate', () => {
  // PL: Doba liczy się w czasie szkoły, bez zer wiodących.
  // EN: The day counts in school time, without leading zeros.
  it('liczy dobę w czasie szkoły / counts the day in school time', () => {
    // PL: 8:00 UTC to ten sam dzień, a 23:30 UTC dzień wcześniej to już 6.10 w Warszawie.
    // EN: 8:00 UTC is the same day, and 23:30 UTC the day before is already 6.10 in Warsaw.
    expect(formatShortDate(Date.UTC(2026, 9, 6, 8, 0))).toBe('6.10');
    expect(formatShortDate(Date.UTC(2026, 9, 5, 23, 30))).toBe('6.10');
  });
});

// PL: Grupa testów liczby osób („Mnie też”).
// EN: A group of tests for the number of people ("Me too").
describe('joinText', () => {
  // PL: Brak danych albo zero: nic nie pokazujemy.
  // EN: No data or zero: we show nothing.
  it('brak danych i zero dają null / no data and zero give null', () => {
    // PL: Stare zapisy bez pola i zero dołączeń nie mają czego pokazać.
    // EN: Old copies without the field and zero joins have nothing to show.
    expect(joinText(undefined)).toBeNull();
    expect(joinText(0)).toBeNull();
  });

  // PL: Odmiana: 1 → „osoba”, 2–4 → „osoby”, 5 i więcej → „osób”.
  // EN: The form: 1 → "osoba", 2–4 → "osoby", 5 and more → "osób".
  it('odmienia według reguł polskich / follows the Polish plural rules', () => {
    // PL: Jedna osoba.
    // EN: One person.
    expect(joinText(1)).toBe('+1 osoba');
    // PL: Dwie, trzy, cztery osoby.
    // EN: Two, three, four people.
    expect(joinText(2)).toBe('+2 osoby');
    expect(joinText(4)).toBe('+4 osoby');
    // PL: Pięć i więcej to „osób”, także 12–14, a 22 i 25 wracają do „osoby” i „osób”.
    // EN: Five and more is "osób", also 12–14, and 22 and 25 go back to "osoby" and "osób".
    expect(joinText(5)).toBe('+5 osób');
    expect(joinText(12)).toBe('+12 osób');
    expect(joinText(14)).toBe('+14 osób');
    expect(joinText(22)).toBe('+22 osoby');
    expect(joinText(25)).toBe('+25 osób');
    expect(joinText(112)).toBe('+112 osób');
  });
});
