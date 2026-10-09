/**
 * PL: Logika sześciu pól na cyfry kodu, bez ekranu: wpisywanie i wklejanie cyfr, kasowanie oraz odliczanie do ponownej wysyłki. Zwykłe funkcje, więc da się je sprawdzić testem bez przeglądarki.
 * EN: The logic of the six code digit fields, without a screen: typing and pasting digits, erasing and the countdown to a resend. Plain functions, so a test can check them without a browser.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/auth/email/CodeFields.tsx::placeDigits
 * @used_by src/features/auth/email/CodeStep.tsx::isCodeComplete
 * @used_by src/features/auth/email/codeDigits.test.ts::placeDigits
 */

/** PL: Ile cyfr ma kod. EN: How many digits the code has. */
export const CODE_LENGTH = 6;

/** PL: Po ilu sekundach wolno poprosić o nowy kod. EN: After how many seconds a new code may be requested. */
export const RESEND_SECONDS = 60;

/**
 * PL: Nowy stan pól i numer pola, które ma dostać fokus.
 * EN: The new state of the fields and the index of the field that should get focus.
 */
export type DigitsUpdate = {
  /** PL: Sześć pól: cyfra albo pusty tekst. EN: Six fields: a digit or an empty string. */
  digits: string[];
  /** PL: Numer pola (od 0) z fokusem. EN: The index (from 0) of the field with focus. */
  focus: number;
};

/**
 * PL: Zwraca sześć pustych pól.
 * EN: Returns six empty fields.
 *
 * @returns PL: tablica pustych tekstów. EN: an array of empty strings.
 */
export function emptyDigits(): string[] {
  return Array.from({ length: CODE_LENGTH }, () => '');
}

/**
 * PL: Wstawia cyfry z wpisanego albo wklejonego tekstu, zaczynając od wskazanego pola. Litery i znaki odpadają. Wklejony cały kod rozkłada się na kolejne pola.
 * EN: Puts in the digits from typed or pasted text, starting at the given field. Letters and signs are dropped. A pasted whole code spreads over the next fields.
 *
 * @param digits - PL: obecny stan pól. EN: the current state of the fields.
 * @param index - PL: pole, w którym coś wpisano. EN: the field where something was typed.
 * @param typed - PL: wpisany albo wklejony tekst. EN: the typed or pasted text.
 * @returns PL: nowy stan pól i pole z fokusem. EN: the new state and the field with focus.
 */
export function placeDigits(digits: readonly string[], index: number, typed: string): DigitsUpdate {
  const next = [...digits];
  const typedDigits = typed.replace(/\D/g, '');

  // PL: Wpisano samą literę albo znak: nic się nie zmienia.
  // EN: Only a letter or a sign was typed: nothing changes.
  if (typedDigits === '') return { digits: next, focus: index };

  // PL: Wstaw kolejne cyfry, aż skończą się cyfry albo pola.
  // EN: Put in the next digits until the digits or the fields run out.
  let position = index;
  for (const digit of typedDigits) {
    if (position >= CODE_LENGTH) break;
    next[position] = digit;
    position += 1;
  }
  return { digits: next, focus: Math.min(position, CODE_LENGTH - 1) };
}

/**
 * PL: Kasuje cyfrę po wciśnięciu Backspace. Pole z cyfrą jest czyszczone, a puste pole przekazuje skasowanie poprzedniemu i oddaje mu fokus.
 * EN: Erases a digit after Backspace. A field with a digit is cleared, and an empty field passes the erasing to the previous one and gives it focus.
 *
 * @param digits - PL: obecny stan pól. EN: the current state of the fields.
 * @param index - PL: pole z fokusem. EN: the field with focus.
 * @returns PL: nowy stan pól i pole z fokusem. EN: the new state and the field with focus.
 */
export function eraseDigit(digits: readonly string[], index: number): DigitsUpdate {
  const next = [...digits];
  if (next[index] !== '') {
    next[index] = '';
    return { digits: next, focus: index };
  }

  // PL: Puste pole: wyczyść poprzednie i przejdź do niego. Z pierwszego pola nie ma dokąd iść.
  // EN: An empty field: clear the previous one and move to it. There is nowhere to go from the first field.
  const previous = Math.max(index - 1, 0);
  next[previous] = '';
  return { digits: next, focus: previous };
}

/**
 * PL: Sprawdza, czy wszystkie sześć pól ma cyfrę.
 * EN: Checks whether all six fields have a digit.
 *
 * @param digits - PL: stan pól. EN: the state of the fields.
 * @returns PL: prawda, gdy kod jest pełny. EN: true when the code is complete.
 */
export function isCodeComplete(digits: readonly string[]): boolean {
  return digits.length === CODE_LENGTH && digits.every((digit) => digit !== '');
}

/**
 * PL: Zamienia sekundy na napis minuty:sekundy, na przykład 42 na „0:42”.
 * EN: Turns seconds into a minutes:seconds string, for example 42 into "0:42".
 *
 * @param seconds - PL: liczba sekund. EN: the number of seconds.
 * @returns PL: napis do pokazania. EN: the string to show.
 */
export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
