/**
 * PL: Test funkcji widoku profilu: zasłonięty adres, litera w kółku i podpis pod imieniem.
 * EN: Test of the profile view functions: the masked address, the letter in the circle and the caption under the name.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/profileView.ts::maskEmail
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Funkcje, które sprawdzamy.
// EN: The functions under test.
import { avatarLetter, maskEmail, profileCaption } from './profileView';

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

// PL: Grupa testów podpisu.
// EN: A group of tests for the caption.
describe('profileCaption', () => {
  // PL: Klasa i adres jak na ekranie 2.4, a bez klasy sam adres.
  // EN: The class and the address as on screen 2.4, and just the address without a class.
  it('łączy klasę i zasłonięty adres / joins the class and the masked address', () => {
    expect(profileCaption('3TA', 'ola@teb.edu.pl')).toBe('3TA · o***@teb.edu.pl');
    expect(profileCaption('  ', 'ola@teb.edu.pl')).toBe('o***@teb.edu.pl');
  });
});
