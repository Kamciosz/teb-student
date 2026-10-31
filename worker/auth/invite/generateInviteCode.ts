/**
 * PL: Losowanie kodu zaproszenia w formie „TEB-XXXX-XX”. Plik nie zna bazy ani Workera, więc działa tak samo w Workerze, w testach i w skrypcie SQL pierwszego wdrożenia (scripts/prodSql.ts).
 * EN: Drawing an invitation code in the form "TEB-XXXX-XX". The file knows nothing about the database or the Worker, so it works the same in the Worker, in tests and in the first-deploy SQL script (scripts/prodSql.ts).
 *
 * @author Szymon
 * @since 2026-10-31
 * @uses worker/auth/invite/settings.ts::INVITE_ALPHABET
 * @used_by worker/auth/invite/inviteCodes.ts::prepareInviteCode
 * @used_by worker/auth/invite/firstAdminSql.ts::buildFirstAdminSql
 */

// PL: Alfabet kodu i jego kształt są w settings.ts, żeby kod i sprawdzenie wpisu zgadzały się ze sobą.
// EN: The code alphabet and its shape are in settings.ts, so the drawing and the input check agree.
import { INVITE_ALPHABET } from './settings';

/** PL: Znaki w pierwszej i drugiej grupie kodu „TEB-XXXX-XX”. EN: The characters in the first and the second group of the code "TEB-XXXX-XX". */
const GROUP_LENGTHS = [4, 2] as const;

/**
 * PL: Wylosowuje jedną grupę znaków kodu. Losowość pochodzi z crypto, bo kod jest sekretem.
 * EN: Draws one group of code characters. The randomness comes from crypto, because the code is a secret.
 *
 * @param length - PL: ile znaków. EN: how many characters.
 * @returns PL: tekst z wylosowanymi znakami. EN: the text with the drawn characters.
 */
function randomGroup(length: number): string {
  // PL: Bajt & 31 to liczba 0–31, czyli indeks w 32-znakowym alfabecie bez przekrzywienia rozkładu.
  // EN: A byte & 31 is a number 0–31, an index in the 32-character alphabet without skewing the distribution.
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => INVITE_ALPHABET.charAt(byte & 31)).join('');
}

/**
 * PL: Losuje nowy kod zaproszenia, na przykład „TEB-7K4Q-92”. Sam nic nie zapisuje.
 * EN: Draws a new invitation code, for example "TEB-7K4Q-92". It saves nothing itself.
 *
 * @returns PL: kod w formie TEB-XXXX-XX. EN: the code in the form TEB-XXXX-XX.
 */
export function generateInviteCode(): string {
  // PL: Złóż kod z grup znaków.
  // EN: Assemble the code from groups of characters.
  return `TEB-${GROUP_LENGTHS.map(randomGroup).join('-')}`;
}
