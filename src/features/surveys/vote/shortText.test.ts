/**
 * PL: Test zasad krótkiej odpowiedzi po stronie telefonu: przycinanie, liczenie znaków (punkty kodowe) i granice 1–200.
 * EN: Test of the short-answer rules on the phone: trimming, counting characters (code points) and the 1–200 limits.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/surveys/vote/shortText.ts::isShortTextReady
 * @uses src/features/surveys/vote/shortText.ts::countShortTextCharacters
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { cleanShortText, countShortTextCharacters, isShortTextReady, SHORT_TEXT_MAX_LENGTH } from './shortText';

describe('countShortTextCharacters, liczenie znaków / character counting', () => {
  it('polskie litery liczą się po jednym znaku / Polish letters count one each', () => {
    expect(countShortTextCharacters('zażółć gęślą jaźń')).toBe(17);
  });

  it('emoji (para zastępcza UTF-16) liczy się jako jeden znak / an emoji (a UTF-16 surrogate pair) counts as one', () => {
    expect('😀'.length).toBe(2);
    expect(countShortTextCharacters('😀')).toBe(1);
  });

  it('pusty tekst ma zero znaków / an empty text has zero characters', () => {
    expect(countShortTextCharacters('')).toBe(0);
  });
});

describe('cleanShortText, przycinanie / trimming', () => {
  it('usuwa spacje i białe znaki z obu stron / removes spaces and whitespace from both ends', () => {
    expect(cleanShortText('  \t Odpowiedź \n ')).toBe('Odpowiedź');
  });
});

describe('isShortTextReady, granice 1–200 / limits 1–200', () => {
  it('zwykły tekst jest gotowy / a normal text is ready', () => {
    expect(isShortTextReady('Chcę zajęcia z robotyki')).toBe(true);
  });

  it('pusty tekst albo same spacje nie są gotowe / an empty text or only spaces are not ready', () => {
    expect(isShortTextReady('')).toBe(false);
    expect(isShortTextReady('   \n\t ')).toBe(false);
  });

  it('dokładnie 200 znaków jest gotowe, 201 nie / exactly 200 characters is ready, 201 is not', () => {
    expect(isShortTextReady('a'.repeat(SHORT_TEXT_MAX_LENGTH))).toBe(true);
    expect(isShortTextReady('a'.repeat(SHORT_TEXT_MAX_LENGTH + 1))).toBe(false);
  });

  it('spacje na brzegach się nie liczą do limitu / spaces at the ends do not count toward the limit', () => {
    expect(isShortTextReady(`   ${'a'.repeat(SHORT_TEXT_MAX_LENGTH)}   `)).toBe(true);
  });

  it('200 emoji to 200 znaków, więc się mieści / 200 emoji are 200 characters, so they fit', () => {
    expect(isShortTextReady('😀'.repeat(SHORT_TEXT_MAX_LENGTH))).toBe(true);
    expect(isShortTextReady('😀'.repeat(SHORT_TEXT_MAX_LENGTH + 1))).toBe(false);
  });
});
