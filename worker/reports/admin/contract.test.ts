/**
 * PL: Test zgodności nazw w panelu z kodami w schemacie bazy: każda kategoria, miejsce i etap z serwera ma polską nazwę na telefonie.
 * EN: Test that the panel's names match the codes in the database schema: every category, place and stage from the server has a Polish name on the phone.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/reportLabels.ts::CATEGORY_LABELS
 * @uses worker/db/schema/reports.ts::REPORT_CATEGORIES
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Nazwy po stronie telefonu. To plik tego samego podtoru, więc import wprost jest dozwolony.
// EN: The names on the phone side. It is a file of the same subtrack, so a direct import is allowed.
import { CATEGORY_LABELS, PLACE_LABELS, STAGES } from '../../../src/features/reports/admin/reportLabels';
// PL: Kody po stronie serwera.
// EN: The codes on the server side.
import { REPORT_CATEGORIES, REPORT_PLACES, REPORT_STAGES } from '../../db/schema/reports';

// PL: Grupa testów zgodności.
// EN: A group of contract tests.
describe('zgodność nazw panelu ze schematem / panel names and schema contract', () => {
  // PL: Te same kody w tej samej kolejności, a etapy dokładnie w kolejności schematu.
  // EN: The same codes in the same order, and the stages exactly in schema order.
  it('kody są takie same / the codes are the same', () => {
    expect(Object.keys(CATEGORY_LABELS)).toEqual([...REPORT_CATEGORIES]);
    expect(Object.keys(PLACE_LABELS)).toEqual([...REPORT_PLACES]);
    expect(STAGES.map((stage) => stage.code)).toEqual([...REPORT_STAGES]);
  });
});
