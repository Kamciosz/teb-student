/**
 * PL: Ekran 1.1 „Logowanie: e-mail”: uczeń wpisuje szkolny adres i prosi o kod. Obcy adres dostaje komunikat bez wysyłania czegokolwiek do serwera. Druga ścieżka, kod zaproszenia, jest pod przyciskiem „Mam kod zaproszenia”.
 * EN: Screen 1.1 "Logowanie: e-mail" (sign-in: e-mail): the student types the school address and asks for a code. A foreign address gets a message without sending anything to the server. The second path, the invitation code, is under the "Mam kod zaproszenia" button.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/authApi.ts::requestCode
 * @uses src/features/auth/email/schoolEmail.ts::checkEmailInput
 * @used_by src/features/auth/email/AuthEmailScreen.tsx::EmailStep
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { requestCode } from './authApi';
import { MESSAGES } from './authMessages';
import { Icon } from './icons';
import { checkEmailInput, normalizeEmail } from './schoolEmail';

/** PL: Numer elementu z komunikatem błędu. EN: The id of the error message element. */
const ERROR_ID = 'auth-email-error';

/**
 * PL: Dane ekranu adresu.
 * EN: The address screen data.
 */
export type EmailStepProps = {
  /** PL: Wywoływane, gdy serwer przyjął prośbę o kod. Dostaje adres małymi literami. EN: Called when the server accepted the code request. It gets the address in lowercase. */
  onCodeSent: (email: string) => void;
};

/**
 * PL: Sprawdza adres i prosi o kod. Zwraca komunikat błędu albo null, gdy kod poszedł.
 * EN: Checks the address and requests a code. Returns the error message, or null when the code went out.
 *
 * @param raw - PL: tekst z pola. EN: the text from the field.
 * @returns PL: komunikat błędu albo null. EN: the error message or null.
 */
async function submitEmail(raw: string): Promise<string | null> {
  const check = checkEmailInput(raw);
  if (check === 'empty') return MESSAGES.emailEmpty;
  if (check === 'foreign') return MESSAGES.emailForeign;

  const result = await requestCode(normalizeEmail(raw));
  return result.ok ? null : result.message;
}

/**
 * PL: Pole adresu z etykietą i komunikatem błędu pod spodem.
 * EN: The address field with a label and the error message below it.
 *
 * @param props - PL: wartość, funkcja zmiany, blokada i błąd. EN: the value, the change function, the lock and the error.
 * @returns PL: etykieta, pole i opcjonalny błąd. EN: the label, the field and an optional error.
 */
function EmailField(props: {
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  error: string | null;
}) {
  return (
    <>
      <label className="auth-email__label" htmlFor="auth-email-input">Szkolny e-mail</label>
      <input
        id="auth-email-input"
        className="auth-email__input"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="imie.nazwisko@teb.edu.pl"
        value={props.value}
        disabled={props.isDisabled}
        aria-invalid={props.error !== null}
        aria-describedby={props.error === null ? undefined : ERROR_ID}
        onChange={(event) => props.onChange(event.target.value)}
      />
      {props.error === null ? null : <p id={ERROR_ID} className="auth-email__error" role="alert">{props.error}</p>}
    </>
  );
}

/**
 * PL: Rysuje ekran 1.1 i obsługuje wysłanie formularza.
 * EN: Draws screen 1.1 and handles the form submission.
 *
 * @param props - PL: funkcja wywoływana po wysłaniu kodu. EN: the function called after the code is sent.
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function EmailStep({ onCodeSent }: EmailStepProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // PL: Wyślij formularz: pokaż błąd albo przejdź do ekranu kodu.
  // EN: Submit the form: show the error or move on to the code screen.
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    const message = await submitEmail(email);
    setIsSending(false);
    setError(message);
    if (message === null) onCodeSent(normalizeEmail(email));
  };

  return (
    <form className="auth-email__form" onSubmit={handleSubmit} noValidate>
      <div className="auth-email__mark" aria-hidden="true">T</div>
      <h1 className="auth-email__title">TEB Student</h1>
      <p className="auth-email__lead">Aktualności, zgłoszenia i ankiety szkoły w jednym miejscu.</p>
      <EmailField value={email} onChange={setEmail} isDisabled={isSending} error={error} />
      <p className="auth-email__note"><Icon name="lock" />Wyślemy sześciocyfrowy kod. Hasło nie jest potrzebne.</p>

      <div className="auth-email__actions">
        <Link className="auth-email__button auth-email__button--outline" to="/auth/invite">Mam kod zaproszenia</Link>
        <button className="auth-email__button" type="submit" disabled={isSending}>
          {isSending ? 'Wysyłanie…' : 'Wyślij kod'}
          <Icon name="send" />
        </button>
      </div>
    </form>
  );
}
