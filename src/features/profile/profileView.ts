/**
 * PL: Proste funkcje do ekranu profilu: zasłonięty adres e-mail i litera w kółku. Bez Reacta, żeby dało się je sprawdzić zwykłym testem.
 * EN: Simple functions for the profile screen: the masked e-mail address and the letter in the circle. Without React, so a plain test can check them.
 *
 * @author Jakub
 * @since 2026-10-11
 * @used_by src/features/profile/ProfileHome.tsx::maskEmail
 * @used_by src/features/profile/ProfileHome.tsx::avatarLetter
 * @used_by src/features/profile/profileView.test.ts::maskEmail
 */

/**
 * PL: Zasłania adres e-mail: zostaje pierwsza litera, trzy gwiazdki i domena (ekran 2.4: „o***@teb.edu.pl”).
 * EN: Masks an e-mail address: the first letter, three asterisks and the domain stay (screen 2.4: "o***@teb.edu.pl").
 *
 * @param email - PL: adres ucznia. EN: the student's address.
 * @returns PL: zasłonięty adres. Tekst bez „@” zostaje bez zmian. EN: the masked address. A text without "@" stays unchanged.
 */
export function maskEmail(email: string): string {
  // PL: Znajdź „@”, który oddziela nazwę od domeny.
  // EN: Find the "@" that separates the name from the domain.
  const at = email.indexOf('@');
  if (at < 1) return email;
  // PL: Pierwsza litera nazwy, gwiazdki i domena.
  // EN: The first letter of the name, the asterisks and the domain.
  return `${email.slice(0, 1)}***${email.slice(at)}`;
}

/**
 * PL: Litera w kółku z lewej strony profilu: pierwsza litera imienia, a bez imienia pierwsza litera adresu e-mail.
 * EN: The letter in the circle on the left of the profile: the first letter of the name, and without a name the first letter of the e-mail address.
 *
 * @param name - PL: imię z profilu (może być puste). EN: the name from the profile (may be empty).
 * @param email - PL: adres e-mail ucznia. EN: the student's e-mail address.
 * @returns PL: wielka litera albo pusty tekst, gdy nie ma z czego jej wziąć. EN: a capital letter, or an empty text when there is nothing to take it from.
 */
export function avatarLetter(name: string, email: string): string {
  // PL: Imię ma pierwszeństwo, a adres jest zapasem.
  // EN: The name comes first and the address is the fallback.
  const source = name.trim() || email;
  return source.slice(0, 1).toLocaleUpperCase('pl');
}
