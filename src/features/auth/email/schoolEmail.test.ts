/**
 * PL: Testy sprawdzania adresu w telefonie: pusty, szkolny, obcy i maskowanie.
 * EN: Tests of the address check on the phone: empty, school, foreign and masking.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/schoolEmail.ts::checkEmailInput
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { checkEmailInput, maskEmail, normalizeEmail } from './schoolEmail';

// PL: Grupa testów sprawdzania adresu.
// EN: A group of address check tests.
describe('checkEmailInput', () => {
  // PL: Pusty tekst i same spacje to „empty”.
  // EN: Empty text and only spaces are "empty".
  it('rozpoznaje pusty adres / recognizes an empty address', () => {
    expect(checkEmailInput('')).toBe('empty');
    expect(checkEmailInput('   ')).toBe('empty');
  });

  // PL: Adres szkolny przechodzi także z wielkimi literami i spacjami z brzegów.
  // EN: A school address passes also with capital letters and edge spaces.
  it('przyjmuje adres szkolny / accepts a school address', () => {
    expect(checkEmailInput('ola.testowa@teb.edu.pl')).toBe('ok');
    expect(checkEmailInput('  Ola.TESTOWA@TEB.edu.pl ')).toBe('ok');
  });

  // PL: Obce domeny i podstępy dostają „foreign”.
  // EN: Foreign domains and tricks get "foreign".
  it.each(['ola@gmail.com', 'a@xteb.edu.pl', 'a@teb.edu.pl.evil.com', 'a@sub.teb.edu.pl', '@teb.edu.pl', 'a b@teb.edu.pl', 'zwykły tekst'])(
    'odrzuca obcy adres: %s / rejects a foreign address: %s',
    (email) => {
      expect(checkEmailInput(email)).toBe('foreign');
    },
  );
});

// PL: Grupa testów normalizacji i maskowania.
// EN: A group of normalization and masking tests.
describe('normalizeEmail i maskEmail', () => {
  // PL: Wielkie litery i spacje znikają.
  // EN: Capital letters and spaces go away.
  it('normalizuje adres / normalizes the address', () => {
    expect(normalizeEmail('  Ola@TEB.edu.pl ')).toBe('ola@teb.edu.pl');
  });

  // PL: Zostaje pierwsza litera i domena.
  // EN: The first letter and the domain stay.
  it('maskuje skrzynkę / masks the mailbox', () => {
    expect(maskEmail('ola.testowa@teb.edu.pl')).toBe('o***@teb.edu.pl');
    expect(maskEmail('bez-malpy')).toBe('bez-malpy');
  });
});
