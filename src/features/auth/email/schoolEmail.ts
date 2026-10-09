/**
 * PL: Sprawdzanie adresu w telefonie, zanim cokolwiek pójdzie do serwera: pusty adres, adres spoza @teb.edu.pl i maskowanie adresu na ekranie z kodem. Serwer sprawdza to samo jeszcze raz (worker/auth/email/schoolEmail.ts), bo telefonowi nie wolno ufać. Tu chodzi tylko o szybki komunikat bez czekania na sieć.
 * EN: Address checks on the phone before anything goes to the server: an empty address, an address outside @teb.edu.pl and masking the address on the code screen. The server checks the same again (worker/auth/email/schoolEmail.ts), because the phone must not be trusted. Here it is only about a quick message without waiting for the network.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/auth/email/EmailStep.tsx::checkEmailInput
 * @used_by src/features/auth/email/CodeStep.tsx::maskEmail
 * @used_by src/features/auth/email/schoolEmail.test.ts::checkEmailInput
 */

/** PL: Końcówka adresu szkolnego. EN: The school address ending. */
const SCHOOL_EMAIL_SUFFIX = '@teb.edu.pl';

/**
 * PL: Wynik sprawdzenia wpisanego adresu: dobry, pusty albo spoza szkoły.
 * EN: The result of checking the typed address: good, empty or from outside the school.
 */
export type EmailCheck = 'ok' | 'empty' | 'foreign';

/**
 * PL: Ujednolica adres: ucina spacje z brzegów i zamienia na małe litery, żeby to samo konto nie powstało dwa razy.
 * EN: Normalizes the address: trims edge spaces and lowercases it, so the same account is not created twice.
 *
 * @param raw - PL: tekst z pola. EN: the text from the field.
 * @returns PL: adres małymi literami. EN: the address in lowercase.
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * PL: Sprawdza wpisany adres. Dobry adres ma niepustą skrzynkę przed końcówką @teb.edu.pl, bez spacji i drugiego znaku @.
 * EN: Checks the typed address. A good address has a non-empty mailbox before the @teb.edu.pl ending, with no spaces and no second @ sign.
 *
 * @param raw - PL: tekst z pola. EN: the text from the field.
 * @returns PL: ok, empty albo foreign. EN: ok, empty or foreign.
 */
export function checkEmailInput(raw: string): EmailCheck {
  const email = normalizeEmail(raw);
  if (email === '') return 'empty';

  // PL: Skrzynka to wszystko przed końcówką szkoły.
  // EN: The mailbox is everything before the school ending.
  const mailbox = email.slice(0, email.length - SCHOOL_EMAIL_SUFFIX.length);
  const isSchool = email.endsWith(SCHOOL_EMAIL_SUFFIX) && mailbox !== '' && !/[\s@]/.test(mailbox);
  return isSchool ? 'ok' : 'foreign';
}

/**
 * PL: Maskuje adres do pokazania na ekranie: zostaje pierwsza litera i domena, na przykład o***@teb.edu.pl.
 * EN: Masks the address for display: the first letter and the domain stay, for example o***@teb.edu.pl.
 *
 * @param email - PL: pełny adres. EN: the full address.
 * @returns PL: adres z ukrytą skrzynką. EN: the address with a hidden mailbox.
 */
export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;
  return `${email.charAt(0)}***${email.slice(atIndex)}`;
}
