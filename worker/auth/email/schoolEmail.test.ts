/**
 * PL: Testy sprawdzania adresu szkolnego: tylko dokładnie @teb.edu.pl, bez obcych domen i bez podstępów.
 * EN: Tests of the school address check: exactly @teb.edu.pl only, no foreign domains and no tricks.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/schoolEmail.ts::isSchoolEmail
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { isSchoolEmail, normalizeSchoolEmail } from './schoolEmail';

// PL: Grupa testów adresu szkolnego.
// EN: A group of school address tests.
describe('isSchoolEmail', () => {
  // PL: Adresy, które mają przejść.
  // EN: Addresses that must pass.
  it.each(['jan.test@teb.edu.pl', 'a@teb.edu.pl', 'jan-test+1@teb.edu.pl'])('przyjmuje adres / accepts the address: %s', (email) => {
    expect(isSchoolEmail(email)).toBe(true);
  });

  // PL: Adresy, które mają odpaść: obca domena, domena z doklejonym początkiem lub końcem, poddomena, pusta skrzynka, biały znak, drugi znak @.
  // EN: Addresses that must fail: a foreign domain, a domain with something glued to the start or the end, a subdomain, an empty mailbox, whitespace, a second @ sign.
  it.each([
    'jan@gmail.com',
    'a@xteb.edu.pl',
    'a@teb.edu.pl.evil.com',
    'a@sub.teb.edu.pl',
    '@teb.edu.pl',
    'a b@teb.edu.pl',
    'evil@evil.com@teb.edu.pl',
    '',
    'teb.edu.pl',
  ])('odrzuca adres / rejects the address: %s', (email) => {
    expect(isSchoolEmail(email)).toBe(false);
  });
});

// PL: Grupa testów normalizacji.
// EN: A group of normalization tests.
describe('normalizeSchoolEmail', () => {
  // PL: Wielkie litery i spacje z brzegów nie mogą zmieniać konta.
  // EN: Capital letters and edge spaces must not change the account.
  it('zamienia na małe litery i ucina spacje / lowercases and trims', () => {
    expect(normalizeSchoolEmail('  Jan.TEST@TEB.edu.pl ')).toBe('jan.test@teb.edu.pl');
  });
});
