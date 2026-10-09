/**
 * PL: Ekran logowania kodem z maila (podtor 1a): najpierw adres szkolny (1.1), potem kod z maila (1.2). Zalogowanego ucznia przenosi na pulpit. Oba kroki są w jednym adresie /auth/email, bo to jedna czynność, a wstecz wraca strzałką na ekranie.
 * EN: The e-mail code sign-in screen (subtrack 1a): first the school address (1.1), then the code from the e-mail (1.2). It takes a signed-in student to the dashboard. Both steps are at one address, /auth/email, because it is one action, and going back is the arrow on the screen.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/useAuthSession.ts::useAuthSession
 * @uses src/features/auth/email/EmailStep.tsx::EmailStep
 * @uses src/features/auth/email/CodeStep.tsx::CodeStep
 * @used_by src/features/auth/email/index.ts::AuthEmailScreen
 */

import { useState } from 'react';
import { Navigate } from 'react-router';
import './authEmail.css';
import { CodeStep } from './CodeStep';
import { EmailStep } from './EmailStep';
import { useAuthSession } from './useAuthSession';

/**
 * PL: Rysuje ekran logowania: krok adresu albo krok kodu.
 * EN: Draws the sign-in screen: the address step or the code step.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function AuthEmailScreen() {
  const session = useAuthSession();
  // PL: Adres, na który poszedł kod. Dopóki go nie ma, pokazujemy krok adresu.
  // EN: The address the code went to. Until it exists, we show the address step.
  const [sentTo, setSentTo] = useState<string | null>(null);

  // PL: Zalogowany uczeń nie ma tu nic do roboty: pulpit jest pod adresem głównym.
  // EN: A signed-in student has nothing to do here: the dashboard is at the root address.
  if (session.status === 'signed-in') return <Navigate to="/" replace />;

  // PL: Dopóki serwer nie odpowiedział, nie pokazujemy formularza, żeby zalogowany uczeń nie widział go przez chwilę.
  // EN: Until the server answers, we do not show the form, so a signed-in student does not see it for a moment.
  if (session.status === 'loading') return <main className="auth-email" data-subtrack="1a" aria-busy="true" />;

  return (
    <main className="auth-email" data-subtrack="1a">
      {sentTo === null ? (
        <EmailStep onCodeSent={setSentTo} />
      ) : (
        <CodeStep email={sentTo} onBack={() => setSentTo(null)} />
      )}
    </main>
  );
}
