/**
 * PL: Testy sześciu pól na cyfry kodu: wpisywanie, wklejanie, kasowanie, kompletność kodu i odliczanie.
 * EN: Tests of the six code digit fields: typing, pasting, erasing, code completeness and the countdown.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/codeDigits.ts::placeDigits
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { eraseDigit, emptyDigits, formatCountdown, isCodeComplete, placeDigits } from './codeDigits';

// PL: Grupa testów wpisywania cyfr.
// EN: A group of digit typing tests.
describe('placeDigits', () => {
  // PL: Jedna cyfra trafia do pola, a fokus idzie do następnego.
  // EN: One digit goes to the field, and focus moves to the next one.
  it('wpisuje cyfrę i przesuwa fokus / puts in a digit and moves focus', () => {
    const update = placeDigits(emptyDigits(), 0, '4');
    expect(update.digits).toEqual(['4', '', '', '', '', '']);
    expect(update.focus).toBe(1);
  });

  // PL: Wklejony cały kod rozkłada się na sześć pól, a fokus zostaje w ostatnim.
  // EN: A pasted whole code spreads over six fields, and focus stays in the last one.
  it('rozkłada wklejony kod / spreads a pasted code', () => {
    const update = placeDigits(emptyDigits(), 0, '482 195');
    expect(update.digits).toEqual(['4', '8', '2', '1', '9', '5']);
    expect(update.focus).toBe(5);
  });

  // PL: Nadmiar cyfr odpada, litery też.
  // EN: Excess digits are dropped, and so are letters.
  it('ucina nadmiar i litery / drops the excess and letters', () => {
    expect(placeDigits(emptyDigits(), 3, '12a3456').digits).toEqual(['', '', '', '1', '2', '3']);
    const letter = placeDigits(['1', '', '', '', '', ''], 1, 'x');
    expect(letter.digits).toEqual(['1', '', '', '', '', '']);
    expect(letter.focus).toBe(1);
  });
});

// PL: Grupa testów kasowania, kompletności i odliczania.
// EN: A group of erasing, completeness and countdown tests.
describe('eraseDigit, isCodeComplete i formatCountdown', () => {
  // PL: Pole z cyfrą jest czyszczone, puste cofa się do poprzedniego, a pierwsze zostaje na miejscu.
  // EN: A field with a digit is cleared, an empty one steps back to the previous, and the first stays in place.
  it('kasuje cyfrę i cofa fokus / erases a digit and steps focus back', () => {
    expect(eraseDigit(['1', '2', '', '', '', ''], 1)).toEqual({ digits: ['1', '', '', '', '', ''], focus: 1 });
    expect(eraseDigit(['1', '2', '', '', '', ''], 2)).toEqual({ digits: ['1', '', '', '', '', ''], focus: 1 });
    expect(eraseDigit(emptyDigits(), 0).focus).toBe(0);
  });

  // PL: Kod jest pełny dopiero z sześcioma cyframi.
  // EN: The code is complete only with six digits.
  it('rozpoznaje pełny kod / recognizes a complete code', () => {
    expect(isCodeComplete(['4', '8', '2', '1', '9', '5'])).toBe(true);
    expect(isCodeComplete(['4', '8', '2', '1', '9', ''])).toBe(false);
    expect(isCodeComplete(emptyDigits())).toBe(false);
  });

  // PL: Sekundy zamieniają się na minuty i sekundy z zerem.
  // EN: Seconds turn into minutes and seconds with a zero.
  it('formatuje odliczanie / formats the countdown', () => {
    expect(formatCountdown(42)).toBe('0:42');
    expect(formatCountdown(60)).toBe('1:00');
    expect(formatCountdown(5)).toBe('0:05');
  });
});
