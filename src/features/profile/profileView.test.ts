/**
 * PL: Test funkcji widoku profilu: zasłonięty adres i litera w kółku.
 * EN: Test of the profile view functions: the masked address and the letter in the circle.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/profileView.ts::maskEmail
 * @uses src/features/profile/profileView.ts::accountRow
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { accountRow, avatarLetter, maskEmail } from './profileView';

// PL: Grupa testów zasłaniania adresu.
// EN: A group of tests for masking the address.
describe('maskEmail', () => {
  // PL: Przykład z ekranu 2.4 z docs/projekt/EKRANY.md.
  // EN: The example from screen 2.4 in docs/projekt/EKRANY.md.
  it('zasłania adres jak na ekranie 2.4 / masks the address as on screen 2.4', () => {
    expect(maskEmail('ola.testowa@teb.edu.pl')).toBe('o***@teb.edu.pl');
  });

  // PL: Tekst bez „@” albo z „@” na początku zostaje bez zmian.
  // EN: A text without "@" or with "@" at the start stays unchanged.
  it.each(['brak-malpy', '@teb.edu.pl', ''])('zostawia „%s” / leaves "%s"', (text) => {
    expect(maskEmail(text)).toBe(text);
  });
});

// PL: Grupa testów wiersza „Konto”.
// EN: A group of tests for the "Konto" row.
describe('accountRow', () => {
  // PL: Konto z loginem nie pokazuje adresu technicznego.
  // EN: A login account does not show the technical address.
  it('pokazuje login / shows the login', () => {
    expect(accountRow('uczen7@login.invalid')).toEqual({ title: 'Login', value: 'uczen7' });
  });

  // PL: Konto z adresem szkolnym pokazuje zasłonięty adres.
  // EN: A school address account shows the masked address.
  it('zasłania adres szkolny / masks the school address', () => {
    expect(accountRow('ola.testowa@teb.edu.pl')).toEqual({ title: 'E-mail', value: 'o***@teb.edu.pl' });
  });
});

// PL: Grupa testów litery w kółku.
// EN: A group of tests for the letter in the circle.
describe('avatarLetter', () => {
  // PL: Imię ma pierwszeństwo, litera jest wielka (także polska).
  // EN: The name comes first and the letter is a capital (also a Polish one).
  it.each([
    ['Ola', 'x@teb.edu.pl', 'O'],
    ['  łukasz', 'x@teb.edu.pl', 'Ł'],
    ['', 'ola@teb.edu.pl', 'O'],
    ['   ', 'ola@teb.edu.pl', 'O'],
  ])('imię „%s”, adres „%s” daje „%s” / name "%s", address "%s" gives "%s"', (name, email, letter) => {
    expect(avatarLetter(name, email)).toBe(letter);
  });
});
