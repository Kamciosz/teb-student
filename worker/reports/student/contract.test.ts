/**
 * PL: Test zgodności telefonu z serwerem: kody kategorii, miejsc i etapów oraz limity długości w formularzu (src/features/reports/student/reportOptions.ts) muszą być takie same jak w schemacie bazy i walidacji serwera. Rozjazd oznaczałby, że serwer odrzuca to, co formularz pozwala wysłać.
 * EN: A phone-to-server contract test: the category, place and stage codes and the length limits in the form (src/features/reports/student/reportOptions.ts) must equal those in the database schema and the server validation. A mismatch would mean the server rejects what the form lets the student send.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/reportOptions.ts::CATEGORY_OPTIONS
 * @uses worker/db/schema/reports.ts::REPORT_CATEGORIES
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Kody i limity po stronie telefonu. To plik tego samego podtoru, więc import wprost jest dozwolony.
// EN: The codes and limits on the phone side. It is a file of the same subtrack, so a direct import is allowed.
import { CATEGORY_OPTIONS, MAX_DESCRIPTION_LENGTH, MAX_PLACE_DETAIL_LENGTH, PLACE_OPTIONS, STAGE_ORDER } from '../../../src/features/reports/student/reportOptions';
// PL: Kody i limity po stronie serwera.
// EN: The codes and limits on the server side.
import { REPORT_CATEGORIES, REPORT_PLACES, REPORT_STAGES } from '../../db/schema/reports';
import { MAX_DESCRIPTION_LENGTH as SERVER_MAX_DESCRIPTION, MAX_PLACE_DETAIL_LENGTH as SERVER_MAX_PLACE_DETAIL } from './validation';

// PL: Grupa testów zgodności.
// EN: A group of contract tests.
describe('zgodność formularza z serwerem / form and server contract', () => {
  // PL: Te same kategorie, miejsca i etapy, w tej samej kolejności.
  // EN: The same categories, places and stages, in the same order.
  it('kody są takie same / the codes are the same', () => {
    // PL: Porównaj listy kodów po obu stronach.
    // EN: Compare the code lists on both sides.
    expect(CATEGORY_OPTIONS.map((option) => option.code)).toEqual([...REPORT_CATEGORIES]);
    expect(PLACE_OPTIONS.map((option) => option.code)).toEqual([...REPORT_PLACES]);
    expect(STAGE_ORDER.map((stage) => stage.code)).toEqual([...REPORT_STAGES]);
  });

  // PL: Pole formularza nie przyjmie więcej, niż serwer.
  // EN: A form field does not accept more than the server does.
  it('limity długości są takie same / the length limits are the same', () => {
    // PL: Porównaj limity opisu i dokładnego miejsca.
    // EN: Compare the description and exact place limits.
    expect(MAX_DESCRIPTION_LENGTH).toBe(SERVER_MAX_DESCRIPTION);
    expect(MAX_PLACE_DETAIL_LENGTH).toBe(SERVER_MAX_PLACE_DETAIL);
  });
});
