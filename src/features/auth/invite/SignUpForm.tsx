/**
 * PL: Ekran 1.3 „Logowanie: kod zaproszenia”: uczeń wpisuje kod od Samorządu, wymyśla login i hasło i zakłada konto. Teksty są z docs/projekt/EKRANY.md.
 * EN: Screen 1.3 "Logowanie: kod zaproszenia" (sign-in: invitation code): the student types the code from the Student Council, makes up a login and a password and creates the account. The texts are from docs/projekt/EKRANY.md.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses src/features/auth/invite/inviteApi.ts::signUpWithCode
 * @uses src/features/auth/invite/useInviteSubmit.ts::useInviteSubmit
 * @used_by src/features/auth/invite/AuthInviteScreen.tsx::SignUpForm
 */

import { useState } from 'react';
import { signUpWithCode } from './inviteApi';
import { InviteField } from './InviteField';
import { MESSAGES, SCREEN_TEXT } from './inviteMessages';
import { Icon } from './icons';
import { useInviteSubmit } from './useInviteSubmit';

/** PL: Numer elementu z komunikatem błędu. EN: The id of the error message element. */
const ERROR_ID = 'auth-invite-signup-error';

/**
 * PL: Dane ekranu 1.3.
 * EN: The data of screen 1.3.
 */
export type SignUpFormProps = {
  /** PL: Wywoływane po wciśnięciu „Mam już konto”. EN: Called when "Mam już konto" (I already have an account) is pressed. */
  onSwitch: () => void;
};

/**
 * PL: Rysuje ekran 1.3 i obsługuje założenie konta. Przycisk jest szary, dopóki któreś pole jest puste.
 * EN: Draws screen 1.3 and handles creating the account. The button is gray while any field is empty.
 *
 * @param props - PL: funkcja przełączenia na logowanie. EN: the function that switches to sign-in.
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SignUpForm({ onSwitch }: SignUpFormProps) {
  const [code, setCode] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const form = useInviteSubmit(() => signUpWithCode({ code, login, password }));
  const isFilled = code.trim() !== '' && login.trim() !== '' && password !== '';

  return (
    <form className="auth-invite__form" onSubmit={form.submit} noValidate>
      <h1 className="auth-invite__title">{SCREEN_TEXT.heading}</h1>
      <p className="auth-invite__lead">{SCREEN_TEXT.lead}</p>

      <InviteField name="code" label={SCREEN_TEXT.codeLabel} placeholder={SCREEN_TEXT.codePlaceholder} value={code} onChange={setCode} disabled={form.isBusy} autoCapitalize="characters" autoComplete="off" />
      <InviteField name="login" label={SCREEN_TEXT.loginLabel} placeholder={SCREEN_TEXT.loginPlaceholder} value={login} onChange={setLogin} disabled={form.isBusy} autoComplete="username" />
      <InviteField name="password" label={SCREEN_TEXT.passwordLabel} placeholder={SCREEN_TEXT.passwordPlaceholder} type="password" value={password} onChange={setPassword} disabled={form.isBusy} autoComplete="new-password" aria-invalid={form.error !== null} aria-describedby={form.error === null ? undefined : ERROR_ID} />

      {form.error === null ? null : <p id={ERROR_ID} className="auth-invite__error" role="alert">{form.error}</p>}
      <p className="auth-invite__note"><Icon name="lock" />{SCREEN_TEXT.note}</p>

      <div className="auth-invite__actions">
        <button className="auth-invite__button auth-invite__button--outline" type="button" onClick={onSwitch}>{MESSAGES.switchToSignIn}</button>
        <button className="auth-invite__button" type="submit" disabled={form.isBusy || !isFilled}>
          {form.isBusy ? MESSAGES.busySignUp : SCREEN_TEXT.submit}
          <Icon name="arrow-right" />
        </button>
      </div>
    </form>
  );
}
