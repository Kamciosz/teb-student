/**
 * PL: Ekran 1.1 „Logowanie: e-mail”: uczeń wpisuje szkolny adres i prosi o kod. Obcy adres dostaje komunikat bez wysyłania czegokolwiek do serwera. Druga ścieżka, kod zaproszenia, jest pod przyciskiem „Mam kod zaproszenia”.
 * EN: Screen 1.1 "Logowanie: e-mail" (sign-in: e-mail): the student types the school address and asks for a code. A foreign address gets a message without sending anything to the server. The second path, the invitation code, is under the "Mam kod zaproszenia" button.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/authApi.ts::requestCode
 * @uses src/features/auth/email/schoolEmail.ts::checkEmailInput
 * @uses src/shared/ui/ScreenHeader.tsx::ScreenHeader
 * @uses src/shared/ui/TextField.tsx::TextField
 * @uses src/shared/ui/Button.tsx::Button
 * @used_by src/features/auth/email/AuthEmailScreen.tsx::EmailStep
 */

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Button, ScreenHeader, TextField } from '../../../shared';
import { requestCode } from './authApi';
import { MESSAGES } from './authMessages';
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
      <ScreenHeader title="TEB Student" />
      <p className="auth-email__lead">Aktualności, zgłoszenia i ankiety szkoły w jednym miejscu.</p>

      {/* PL: Błąd ma własny komunikat z role="alert"; pole dostaje aria-invalid i opis przez właściwości wejścia. EN: The error has its own message with role="alert"; the field gets aria-invalid and the description through the input properties. */}
      <TextField
        label="Szkolny e-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="imie.nazwisko@teb.edu.pl"
        value={email}
        disabled={isSending}
        aria-invalid={error === null ? undefined : true}
        aria-describedby={error === null ? undefined : ERROR_ID}
        onChange={(event) => setEmail(event.target.value)}
      />
      {error === null ? null : <p id={ERROR_ID} className="auth-email__error" role="alert">{error}</p>}
      <p className="auth-email__note">Wyślemy sześciocyfrowy kod. Hasło nie jest potrzebne.</p>

      <div className="auth-email__actions">
        <Button type="submit" disabled={isSending}>
          {isSending ? 'Wysyłanie…' : 'Wyślij kod'}
        </Button>
        <Link className="ui-button ui-button--plain" to="/auth/invite">Mam kod zaproszenia</Link>
      </div>
    </form>
  );
}
