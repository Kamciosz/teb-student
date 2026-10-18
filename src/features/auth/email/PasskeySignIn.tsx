/**
 * PL: Przycisk logowania Face ID lub odciskiem palca pod formularzem z e-mailem. Pokazuje się tylko tam, gdzie telefon umie WebAuthn. Komponent tylko rysuje; logika jest w signInWithPasskey, a po sukcesie odświeża sesję useSessionRefresh, tak jak po kodzie z maila.
 * EN: The Face ID or fingerprint sign-in button under the e-mail form. It shows only where the phone supports WebAuthn. The component only draws; the logic is in signInWithPasskey, and after success useSessionRefresh refreshes the session, just like after the e-mail code.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/auth/email/authApi.ts::signInWithPasskey
 * @uses src/features/auth/email/authApi.ts::isPasskeySupported
 * @uses src/features/auth/email/useAuthSession.ts::useSessionRefresh
 * @used_by src/features/auth/email/AuthEmailScreen.tsx::AuthEmailScreen
 */
import { useState } from 'react';
import { Button } from '../../../shared';
import { isPasskeySupported, signInWithPasskey } from './authApi';
import { useSessionRefresh } from './useAuthSession';

export function PasskeySignIn() {
  const refreshSession = useSessionRefresh();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // PL: Bez WebAuthn nie ma czego pokazać, więc nie rysujemy nic.
  // EN: Without WebAuthn there is nothing to show, so we draw nothing.
  if (!isPasskeySupported()) return null;

  async function handleSignIn() {
    setBusy(true);
    setMessage(null);
    const result = await signInWithPasskey();
    setBusy(false);
    if (result.ok) {
      await refreshSession();
      return;
    }
    // PL: Anulowanie daje message null, więc nic nie pokazujemy.
    // EN: A cancellation gives message null, so we show nothing.
    setMessage(result.message);
  }

  return (
    <>
      {/* PL: Przycisk tekstowy, wysokość 44 px z klasy Button. EN: A text button, 44 px high from the Button class. */}
      <Button variant="plain" onClick={handleSignIn} disabled={busy}>
        Zaloguj Face ID lub odciskiem palca
      </Button>
      {message && (
        <p className="auth-email__error" role="alert">
          {message}
        </p>
      )}
    </>
  );
}
