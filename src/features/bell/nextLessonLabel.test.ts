/**
 * PL: Test napisu o następnej lekcji: numer lekcji i godzina bez zera z przodu.
 * EN: Test of the next lesson text: the lesson number and the time without a leading zero.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/features/bell/nextLessonLabel.ts::nextLessonLabel
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcja pod testem.
// EN: The function under test.
import { nextLessonLabel } from './nextLessonLabel';

// PL: Grupa testów napisu o następnej lekcji.
// EN: A group of tests of the next lesson text.
describe('nextLessonLabel', () => {
  // PL: Godzina z zerem z przodu traci zero, a dwucyfrowa zostaje bez zmian.
  // EN: A time with a leading zero loses it, and a two-digit hour stays as it is.
  it('pisze numer lekcji i godzinę bez zera z przodu / writes the lesson number and the time without a leading zero', () => {
    expect(nextLessonLabel({ lessonNo: 3, start: '09:50' })).toBe('Następna: lekcja 3 o 9:50');
    expect(nextLessonLabel({ lessonNo: 4, start: '10:45' })).toBe('Następna: lekcja 4 o 10:45');
  });
});
