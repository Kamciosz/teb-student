/**
 * PL: Sprawdzanie adresu szkolnego na serwerze: ujednolicenie zapisu i test domeny. Serwer sprawdza domenę sam, bo ukrycie przycisku w telefonie nikogo nie chroni (docs/STANDARD_KODU.md, część 6).
 * EN: School address checks on the server: normalizing the spelling and the domain test. The server checks the domain itself, because hiding a button in the phone protects nobody (docs/STANDARD_KODU.md, part 6).
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/settings.ts::SCHOOL_EMAIL_SUFFIX
 * @used_by worker/auth/email/routes.ts::createAuthEmailApp
 */

// PL: Domena szkolna.
// EN: The school domain.
import { SCHOOL_EMAIL_SUFFIX } from './settings';

/**
 * PL: Ujednolica adres: obcina spacje i zamienia na małe litery, bo „A@TEB.EDU.PL” to ten sam adres co „a@teb.edu.pl”.
 * EN: Normalizes an address: trims spaces and lowercases it, because "A@TEB.EDU.PL" is the same address as "a@teb.edu.pl".
 *
 * @param raw - PL: adres tak, jak wpisał go uczeń. EN: the address as the student typed it.
 * @returns PL: adres małymi literami bez spacji na brzegach. EN: the lowercase address without outer spaces.
 */
export function normalizeSchoolEmail(raw: string): string {
  // PL: Obetnij spacje z brzegów i zamień litery na małe.
  // EN: Trim the outer spaces and lowercase the letters.
  return raw.trim().toLowerCase();
}

/**
 * PL: Sprawdza, czy ujednolicony adres jest szkolny: ma niepustą część przed „@teb.edu.pl” bez drugiego „@”. Adresy „a@xteb.edu.pl”, „a@sub.teb.edu.pl” i „a@teb.edu.pl.evil.com” odpadają.
 * EN: Checks whether a normalized address is a school one: it has a non-empty part before "@teb.edu.pl" with no second "@". The addresses "a@xteb.edu.pl", "a@sub.teb.edu.pl" and "a@teb.edu.pl.evil.com" are rejected.
 *
 * @param email - PL: adres po normalizeSchoolEmail. EN: the address after normalizeSchoolEmail.
 * @returns PL: prawda, gdy adres jest szkolny. EN: true when the address is a school one.
 */
export function isSchoolEmail(email: string): boolean {
  // PL: Adres musi kończyć się dokładnie domeną szkolną.
  // EN: The address must end with exactly the school domain.
  if (!email.endsWith(SCHOOL_EMAIL_SUFFIX)) return false;

  // PL: Część przed domeną to nazwa skrzynki: niepusta, bez spacji i bez drugiego „@”.
  // EN: The part before the domain is the mailbox name: non-empty, with no spaces and no second "@".
  const mailbox = email.slice(0, -SCHOOL_EMAIL_SUFFIX.length);
  return mailbox.length > 0 && !/[\s@]/.test(mailbox);
}
