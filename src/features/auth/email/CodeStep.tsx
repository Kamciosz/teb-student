/**
 * PL: Ekran 1.2 „Logowanie: kod z maila”: sześć pól na cyfry, odliczanie do ponownej wysyłki i przycisk „Zaloguj”, aktywny dopiero po wpisaniu wszystkich cyfr. Po poprawnym kodzie sesja się odświeża, a ekran nadrzędny przenosi ucznia na pulpit.
 * EN: Screen 1.2 "Logowanie: kod z maila" (sign-in: code from the e-mail): six digit fields, a countdown to a resend and a "Zaloguj" (sign in) button, active only after all digits are entered. After a correct code the session refreshes, and the parent screen takes the student to the dashboard.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/authApi.ts::verifyCode
 * @uses src/features/auth/email/CodeFields.tsx::CodeFields
 * @used_by src/features/auth/email/AuthEmailScreen.tsx::CodeStep
 */

import { useState, type FormEvent } from 'react';
import { requestCode, verifyCode } from './authApi';
import { CodeFields } from './CodeFields';
import { emptyDigits, formatCountdown, isCodeComplete, RESEND_SECONDS } from './codeDigits';
import { Icon } from './icons';
import { maskEmail } from './schoolEmail';
import { useCountdown } from './useCountdown';

/** PL: Numer elementu z komunikatem błędu. EN: The id of the error message element. */
const ERROR_ID = 'auth-email-code-error';

/**
 * PL: Dane ekranu kodu.
 * EN: The code screen data.
 */
export type CodeStepProps = {
  /** PL: Adres, na który poszedł kod, małymi literami. EN: The address the code went to, in lowercase. */
  email: string;
  /** PL: Wywoływane po wciśnięciu strzałki wstecz. EN: Called when the back arrow is pressed. */
  onBack: () => void;
};

/**
 * PL: Stan ekranu kodu: cyfry, komunikaty i trwająca rozmowa z serwerem. Osobny hook, żeby komponent tylko rysował.
 * EN: The code screen state: the digits, the messages and a running server conversation. A separate hook so the component only draws.
 *
 * @param email - PL: adres, na który poszedł kod. EN: the address the code went to.
 * @returns PL: stan i funkcje ekranu. EN: the screen state and functions.
 */
function useCodeStep(email: string) {
  const [digits, setDigits] = useState(emptyDigits);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  // PL: Zmiana numeru odtwarza pola od zera, z fokusem w pierwszym.
  // EN: Changing the number recreates the fields from scratch, with focus in the first one.
  const [round, setRound] = useState(0);
  const countdown = useCountdown(RESEND_SECONDS);

  // PL: Po błędzie wyczyść pola, żeby uczeń zaczął wpisywać od początku.
  // EN: After an error clear the fields so the student starts typing from the beginning.
  const reset = (message: string | null) => {
    setError(message);
    setDigits(emptyDigits());
    setRound((value) => value + 1);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsBusy(true);
    const result = await verifyCode(email, digits.join(''));
    setIsBusy(false);
    if (!result.ok) reset(result.message);
  };

  const resend = async () => {
    setIsBusy(true);
    const result = await requestCode(email);
    setIsBusy(false);
    reset(result.ok ? null : result.message);
    setNotice(result.ok ? 'Wysłaliśmy nowy kod.' : null);
    if (result.ok) countdown.restart();
  };

  return { digits, setDigits, error, notice, isBusy, round, countdown, submit, resend };
}

/**
 * PL: Rysuje ekran 1.2 i obsługuje wpisanie kodu.
 * EN: Draws screen 1.2 and handles entering the code.
 *
 * @param props - PL: adres i funkcja powrotu. EN: the address and the back function.
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function CodeStep({ email, onBack }: CodeStepProps) {
  const step = useCodeStep(email);
  const canResend = step.countdown.secondsLeft === 0;

  return (
    <form className="auth-email__form" onSubmit={step.submit} noValidate>
      <button className="auth-email__back" type="button" onClick={onBack} aria-label="Wróć do wpisania adresu e-mail">
        <Icon name="arrow-left" />
      </button>
      <h1 className="auth-email__title">Wpisz kod</h1>
      <p className="auth-email__lead">Wysłaliśmy sześć cyfr na {maskEmail(email)}. Kod działa 10 minut.</p>

      <CodeFields
        key={step.round}
        digits={step.digits}
        onChange={step.setDigits}
        isDisabled={step.isBusy}
        isInvalid={step.error !== null}
        errorId={ERROR_ID}
      />
      {step.error === null ? null : <p id={ERROR_ID} className="auth-email__error" role="alert">{step.error}</p>}
      {step.notice === null ? null : <p className="auth-email__note" role="status">{step.notice}</p>}

      {canResend ? (
        <button className="auth-email__link" type="button" onClick={step.resend} disabled={step.isBusy}>Wyślij kod ponownie</button>
      ) : (
        <p className="auth-email__hint">Nie dotarł? Wyślij ponownie za {formatCountdown(step.countdown.secondsLeft)}</p>
      )}

      <div className="auth-email__actions">
        <button className="auth-email__button" type="submit" disabled={step.isBusy || !isCodeComplete(step.digits)}>
          {step.isBusy ? 'Logowanie…' : 'Zaloguj'}
          <Icon name="arrow-right" />
        </button>
      </div>
    </form>
  );
}
