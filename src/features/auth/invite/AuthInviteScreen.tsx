/**
 * PL: Ekran kodu zaproszenia (podtor 1b): zakładanie konta kodem od Samorządu (1.3) albo logowanie loginem i hasłem. Zalogowanego ucznia przenosi na pulpit. Oba widoki są pod jednym adresem /auth/invite, bo to jedna ścieżka dla osób bez szkolnej skrzynki, a wstecz wraca strzałka na górze.
 * EN: The invitation code screen (subtrack 1b): creating an account with the code from the Student Council (1.3) or signing in with a login and a password. It takes a signed-in student to the dashboard. Both views are at one address, /auth/invite, because it is one path for people without a school mailbox, and going back is the arrow at the top.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/auth/email/index.ts::useAuthSession
 * @uses src/features/auth/invite/SignUpForm.tsx::SignUpForm
 * @uses src/features/auth/invite/SignInForm.tsx::SignInForm
 * @used_by src/features/auth/invite/index.ts::AuthInviteScreen
 */

import { useState } from 'react';
import { Link, Navigate } from 'react-router';
// PL: Stan sesji z podtoru 1a, tylko przez jego drzwi.
// EN: The session state from subtrack 1a, only through its door.
import { useAuthSession } from '../email';
import './authInvite.css';
import { Icon } from './icons';
import { MESSAGES, SCREEN_TEXT } from './inviteMessages';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

/**
 * PL: Rysuje ekran: pasek z strzałką wstecz i tytułem, a pod nim zakładanie konta albo logowanie.
 * EN: Draws the screen: a bar with the back arrow and the title, and below it creating an account or signing in.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function AuthInviteScreen() {
  const session = useAuthSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // PL: Zalogowany uczeń nie ma tu nic do roboty, więc idzie na pulpit.
  // EN: A signed-in student has nothing to do here, so they go to the dashboard.
  if (session.status === 'signed-in') return <Navigate to="/" replace />;

  // PL: Dopóki serwer nie odpowie, pokaż pustą kolumnę zamiast formularza, żeby ten nie mignął zalogowanemu.
  // EN: Until the server answers, show an empty column instead of the form, so it does not flash for a signed-in student.
  if (session.status === 'loading') return <main className="auth-invite" data-subtrack="1b" aria-busy="true" />;

  return (
    <main className="auth-invite" data-subtrack="1b">
      <header className="auth-invite__bar">
        {/* PL: Strzałka wraca do logowania szkolnym adresem e-mail (ekran 1.1). EN: The arrow goes back to sign-in with the school e-mail address (screen 1.1). */}
        <Link className="auth-invite__back" to="/auth/email" aria-label={MESSAGES.backLabel}><Icon name="arrow-left" /></Link>
        <span className="auth-invite__bar-title">{isSigningIn ? MESSAGES.signInTopBarTitle : SCREEN_TEXT.topBarTitle}</span>
      </header>
      {isSigningIn ? <SignInForm onSwitch={() => setIsSigningIn(false)} /> : <SignUpForm onSwitch={() => setIsSigningIn(true)} />}
    </main>
  );
}
