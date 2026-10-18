/**
 * PL: Logowanie loginem i hasłem dla ucznia, który założył konto kodem zaproszenia. Docs/projekt/EKRANY.md nie ma tego ekranu, więc układ wzoruje się na ekranie 1.3 (login i hasło), a teksty są zatwierdzone przez właściciela (MESSAGES w inviteMessages.ts).
 * EN: Sign-in with a login and a password for a student who created an account with an invitation code. docs/projekt/EKRANY.md does not have this screen, so the layout follows screen 1.3 (login and password) and the texts are approved by the owner (MESSAGES in inviteMessages.ts).
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses src/features/auth/invite/inviteApi.ts::signInWithPassword
 * @uses src/features/auth/invite/useInviteSubmit.ts::useInviteSubmit
 * @uses src/shared/ui/TextField.tsx::TextField
 * @uses src/shared/ui/Button.tsx::Button
 * @used_by src/features/auth/invite/AuthInviteScreen.tsx::SignInForm
 */

import { useState } from 'react';
import { Button, TextField } from '../../../shared';
import { signInWithPassword } from './inviteApi';
import { MESSAGES, SCREEN_TEXT } from './inviteMessages';
import { useInviteSubmit } from './useInviteSubmit';

/** PL: Numer elementu z komunikatem błędu. EN: The id of the error message element. */
const ERROR_ID = 'auth-invite-signin-error';

/**
 * PL: Dane ekranu logowania.
 * EN: The data of the sign-in screen.
 */
export type SignInFormProps = {
  /** PL: Wywoływane po wciśnięciu „Mam kod zaproszenia”. EN: Called when "Mam kod zaproszenia" (I have an invitation code) is pressed. */
  onSwitch: () => void;
};

/**
 * PL: Rysuje ekran logowania loginem i obsługuje wysłanie. Przycisk jest szary, dopóki któreś pole jest puste.
 * EN: Draws the login sign-in screen and handles submitting. The button is gray while any field is empty.
 *
 * @param props - PL: funkcja przełączenia na zakładanie konta. EN: the function that switches to creating an account.
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SignInForm({ onSwitch }: SignInFormProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const form = useInviteSubmit(() => signInWithPassword({ login, password }));
  const isFilled = login.trim() !== '' && password !== '';

  return (
    <form className="auth-invite__form" onSubmit={form.submit} noValidate>
      <h2 className="auth-invite__title">{MESSAGES.signInHeading}</h2>
      <p className="auth-invite__lead">{MESSAGES.signInLead}</p>

      {/* PL: Błąd ma własny komunikat z role="alert"; pola dostają aria-invalid i opis przez właściwości wejścia. EN: The error has its own message with role="alert"; the fields get aria-invalid and the description through the input properties. */}
      <TextField
        label={SCREEN_TEXT.loginLabel}
        placeholder={SCREEN_TEXT.loginPlaceholder}
        value={login}
        onChange={(event) => setLogin(event.target.value)}
        disabled={form.isBusy}
        autoComplete="username"
        spellCheck={false}
        aria-invalid={form.error === null ? undefined : true}
        aria-describedby={form.error === null ? undefined : ERROR_ID}
      />
      <TextField
        label={SCREEN_TEXT.passwordLabel}
        placeholder={SCREEN_TEXT.passwordPlaceholder}
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={form.isBusy}
        autoComplete="current-password"
        aria-invalid={form.error === null ? undefined : true}
        aria-describedby={form.error === null ? undefined : ERROR_ID}
      />

      {form.error === null ? null : <p id={ERROR_ID} className="auth-invite__error" role="alert">{form.error}</p>}

      <div className="auth-invite__actions">
        <Button type="submit" disabled={form.isBusy || !isFilled}>
          {form.isBusy ? MESSAGES.busySignIn : MESSAGES.signInSubmit}
        </Button>
        <Button variant="plain" onClick={onSwitch}>{MESSAGES.switchToSignUp}</Button>
      </div>
    </form>
  );
}
