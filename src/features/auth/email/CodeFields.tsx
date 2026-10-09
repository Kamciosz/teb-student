/**
 * PL: Sześć pól na cyfry kodu. Obsługuje wpisywanie z automatycznym przejściem do następnego pola, wklejenie całego kodu (także z podpowiedzi klawiatury iPhone'a), Backspace i strzałki. Pola mają polskie opisy dla czytnika ekranu.
 * EN: The six code digit fields. Handles typing with automatic move to the next field, pasting the whole code (also from the iPhone keyboard suggestion), Backspace and arrows. The fields have Polish labels for the screen reader.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/codeDigits.ts::placeDigits
 * @used_by src/features/auth/email/CodeStep.tsx::CodeFields
 */

import { useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { CODE_LENGTH, eraseDigit, placeDigits, type DigitsUpdate } from './codeDigits';

/**
 * PL: Dane pól kodu.
 * EN: The code fields data.
 */
export type CodeFieldsProps = {
  /** PL: Sześć pól: cyfra albo pusty tekst. EN: Six fields: a digit or an empty string. */
  digits: readonly string[];
  /** PL: Wywoływane po każdej zmianie z nowym stanem pól. EN: Called after every change with the new state of the fields. */
  onChange: (digits: string[]) => void;
  /** PL: Prawda w czasie logowania: pola są wtedy zablokowane. EN: True while signing in: the fields are then locked. */
  isDisabled: boolean;
  /** PL: Prawda po błędzie kodu. EN: True after a code error. */
  isInvalid: boolean;
  /** PL: Numer elementu z komunikatem błędu, żeby czytnik ekranu go odczytał. EN: The id of the element with the error message, so the screen reader reads it. */
  errorId: string;
};

/**
 * PL: Funkcje obsługi pól: zapisanie zmiany, przeniesienie fokusu i klawisze. Osobny hook, żeby komponent tylko rysował.
 * EN: The field handlers: saving a change, moving focus and keys. A separate hook so the component only draws.
 *
 * @param digits - PL: stan pól. EN: the field state.
 * @param onChange - PL: wywoływane z nowym stanem pól. EN: called with the new field state.
 * @returns PL: funkcje do podpięcia pod pola. EN: the functions to attach to the fields.
 */
function useDigitHandlers(digits: readonly string[], onChange: (digits: string[]) => void) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // PL: Zapisz nowy stan i przenieś fokus na wskazane pole.
  // EN: Save the new state and move focus to the given field.
  const apply = (update: DigitsUpdate) => {
    onChange(update.digits);
    inputs.current[update.focus]?.focus();
  };

  return {
    setInput: (index: number, element: HTMLInputElement | null) => {
      inputs.current[index] = element;
    },
    // PL: Zmiana w polu: pusta wartość to skasowanie, reszta to cyfry do wstawienia.
    // EN: A change in a field: an empty value is an erase, the rest are digits to put in.
    handleChange: (index: number, event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      apply(value === '' ? eraseDigit(digits, index) : placeDigits(digits, index, value));
    },
    // PL: Backspace w pustym polu cofa się do poprzedniego. Strzałki przechodzą między polami.
    // EN: Backspace in an empty field steps back to the previous one. Arrows move between fields.
    handleKeyDown: (index: number, event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace' && digits[index] === '') {
        event.preventDefault();
        apply(eraseDigit(digits, index));
      }
      if (event.key === 'ArrowLeft') inputs.current[Math.max(index - 1, 0)]?.focus();
      if (event.key === 'ArrowRight') inputs.current[Math.min(index + 1, CODE_LENGTH - 1)]?.focus();
    },
  };
}

/**
 * PL: Rysuje sześć pól na cyfry kodu.
 * EN: Draws the six code digit fields.
 *
 * @param props - PL: stan pól i funkcja zmiany. EN: the field state and the change function.
 * @returns PL: grupa sześciu pól. EN: a group of six fields.
 */
export function CodeFields({ digits, onChange, isDisabled, isInvalid, errorId }: CodeFieldsProps) {
  const { setInput, handleChange, handleKeyDown } = useDigitHandlers(digits, onChange);

  return (
    <div className="auth-email__code" role="group" aria-label="Kod z e-maila">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => setInput(index, element)}
          className="auth-email__digit"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={index === 0}
          value={digit}
          disabled={isDisabled}
          aria-label={`Cyfra ${index + 1} z ${CODE_LENGTH}`}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? errorId : undefined}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
