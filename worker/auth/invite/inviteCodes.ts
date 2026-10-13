/**
 * PL: Kody zaproszeń w bazie: tworzenie kodu (dla panelu Samorządu, podtor 8, i dla testów), zużycie kodu (dokładnie raz) i oddanie kodu. Kody leżą w tabeli verification z identyfikatorem „invite-code-<kod>”, więc podtor 1b nie zmienia schematu bazy. Wiersz znika po użyciu, a wygasa po 14 dniach.
 * EN: Invitation codes in the database: creating a code (for the Student Council panel, subtrack 8, and for tests), using a code (exactly once) and giving a code back. Codes live in the verification table with the identifier "invite-code-<code>", so subtrack 1b does not change the database schema. The row disappears after use and expires after 14 days.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/settings.ts::INVITE_LIFETIME_DAYS
 * @uses worker/db/schema/auth.ts::verification
 * @used_by worker/auth/invite/createInviteAuth.ts::createInviteAuth
 * @used_by worker/auth/invite/index.ts::issueInviteCode
 * @used_by worker/auth/invite/index.ts::listInviteCodes
 * @used_by worker/auth/invite/routes.test.ts::issueInviteCode
 */

// PL: Drizzle: warunki zapytań i zapytania na D1.
// EN: Drizzle: query conditions and queries on D1.
import { and, asc, eq, gt, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela, w której leżą kody.
// EN: The table where the codes live.
import { verification } from '../../db/schema/auth';
import {
  INVITE_ALPHABET,
  INVITE_CODE_PATTERN,
  INVITE_IDENTIFIER_PREFIX,
  INVITE_LIFETIME_DAYS,
} from './settings';

/** PL: Ile milisekund ma doba. EN: How many milliseconds a day has. */
const DAY_MS = 24 * 60 * 60 * 1000;

/** PL: Znaki w pierwszej i drugiej grupie kodu „TEB-XXXX-XX”. EN: The characters in the first and the second group of the code "TEB-XXXX-XX". */
const GROUP_LENGTHS = [4, 2] as const;

/**
 * PL: Wiersz kodu zużytego z bazy. Wystarczy, żeby oddać kod w niezmienionej postaci.
 * EN: The row of a code taken from the database. Enough to give the code back unchanged.
 */
export type ConsumedInviteCode = {
  /** PL: Numer wiersza w tabeli verification. EN: The row id in the verification table. */
  id: string;
  /** PL: Do kiedy kod był ważny. EN: Until when the code was valid. */
  expiresAt: Date;
};

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
 * PL: Sprowadza kod wpisany przez ucznia do jednej postaci: bez spacji na brzegach, wielkimi literami. Zwraca null, gdy kod nie ma kształtu „TEB-XXXX-XX”, więc nie ma po co pytać bazy.
 * EN: Brings the code typed by the student to one form: without edge spaces, in capitals. Returns null when the code does not have the shape "TEB-XXXX-XX", so there is no point asking the database.
 *
 * @param raw - PL: tekst z pola. EN: the text from the field.
 * @returns PL: kod albo null. EN: the code or null.
 */
export function normalizeInviteCode(raw: string): string | null {
  const code = raw.trim().toUpperCase();
  return INVITE_CODE_PATTERN.test(code) ? code : null;
}

/**
 * PL: Tworzy kod zaproszenia ważny 14 dni i zapisuje go w bazie. Kod działa jeden raz. Wywołuje go panel Samorządu (podtor 8) i testy.
 * EN: Creates an invitation code valid for 14 days and saves it in the database. The code works once. The Student Council panel (subtrack 8) and tests call it.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param now - PL: chwila utworzenia (domyślnie teraz). EN: the creation moment (now by default).
 * @returns PL: kod do przekazania uczniowi i data wygaśnięcia. EN: the code to hand to the student and the expiry date.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function issueInviteCode(db: D1Database, now = new Date()): Promise<{ code: string; expiresAt: Date }> {
  // PL: Złóż kod z grup znaków, na przykład „TEB-7K4Q-92”.
  // EN: Assemble the code from groups of characters, for example "TEB-7K4Q-92".
  const code = `TEB-${GROUP_LENGTHS.map(randomGroup).join('-')}`;
  const expiresAt = new Date(now.getTime() + INVITE_LIFETIME_DAYS * DAY_MS);

  // PL: Zapisz wiersz. Wartość jest pusta, bo liczy się samo istnienie kodu i jego termin.
  // EN: Save the row. The value is empty, because only the code's existence and its deadline matter.
  await drizzle(db)
    .insert(verification)
    .values({ id: crypto.randomUUID(), identifier: `${INVITE_IDENTIFIER_PREFIX}${code}`, value: '', expiresAt });
  return { code, expiresAt };
}

/**
 * PL: Zużywa kod: kasuje jego wiersz jednym zapytaniem (DELETE … RETURNING), więc dwie próby naraz nie zużyją tego samego kodu. Kod po terminie nie zostaje zużyty.
 * EN: Uses a code: deletes its row with one query (DELETE … RETURNING), so two attempts at once cannot use the same code. An expired code is not used.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param code - PL: kod po normalizeInviteCode. EN: the code after normalizeInviteCode.
 * @param now - PL: chwila próby (domyślnie teraz). EN: the moment of the attempt (now by default).
 * @returns PL: zużyty wiersz albo null, gdy kodu nie ma, jest zużyty albo wygasł. EN: the used row, or null when the code does not exist, is used or expired.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function consumeInviteCode(db: D1Database, code: string, now = new Date()): Promise<ConsumedInviteCode | null> {
  // PL: Skasuj wiersz tylko wtedy, gdy kod jeszcze nie wygasł, i odczytaj, co skasowano.
  // EN: Delete the row only when the code has not expired yet, and read what was deleted.
  const [row] = await drizzle(db)
    .delete(verification)
    .where(and(eq(verification.identifier, `${INVITE_IDENTIFIER_PREFIX}${code}`), gt(verification.expiresAt, now)))
    .returning({ id: verification.id, expiresAt: verification.expiresAt });
  return row ?? null;
}

/**
 * PL: Oddaje zużyty kod do bazy w niezmienionej postaci. Używamy tego, gdy konta nie dało się założyć, na przykład przez zajęty login, żeby uczeń nie stracił kodu.
 * EN: Puts a used code back into the database unchanged. We use it when the account could not be created, for example because of a taken login, so the student does not lose the code.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param code - PL: kod po normalizeInviteCode. EN: the code after normalizeInviteCode.
 * @param row - PL: wiersz zwrócony przez consumeInviteCode. EN: the row returned by consumeInviteCode.
 * @returns PL: obietnica, która kończy się po zapisie. EN: a promise that settles after saving.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function restoreInviteCode(db: D1Database, code: string, row: ConsumedInviteCode): Promise<void> {
  await drizzle(db)
    .insert(verification)
    .values({ id: row.id, identifier: `${INVITE_IDENTIFIER_PREFIX}${code}`, value: '', expiresAt: row.expiresAt });
}

/**
 * PL: Lista kodów, które jeszcze działają: niezużyte i niewygasłe, od najkrócej ważnego. Zużyty kod znika z bazy, więc nie ma go na liście. Panel Samorządu (podtor 8) pokazuje tę listę.
 * EN: The list of codes that still work: not used and not expired, from the one valid for the shortest time. A used code disappears from the database, so it is not on the list. The Student Council panel (subtrack 8) shows this list.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param now - PL: chwila sprawdzenia (domyślnie teraz). EN: the moment of the check (now by default).
 * @returns PL: kody z datami wygaśnięcia. EN: the codes with their expiry dates.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function listInviteCodes(db: D1Database, now = new Date()): Promise<{ code: string; expiresAt: Date }[]> {
  // PL: Wybierz wiersze z prefiksem kodu, których termin jeszcze nie minął, od najwcześniejszego terminu.
  // EN: Pick the rows with the code prefix whose deadline has not passed yet, from the earliest deadline.
  const rows = await drizzle(db)
    .select({ identifier: verification.identifier, expiresAt: verification.expiresAt })
    .from(verification)
    .where(and(like(verification.identifier, `${INVITE_IDENTIFIER_PREFIX}%`), gt(verification.expiresAt, now)))
    .orderBy(asc(verification.expiresAt));
  return rows.map((row) => ({ code: row.identifier.slice(INVITE_IDENTIFIER_PREFIX.length), expiresAt: row.expiresAt }));
}
