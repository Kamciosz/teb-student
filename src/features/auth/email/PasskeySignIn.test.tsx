/**
 * PL: Testy przycisku „Zaloguj Face ID lub odciskiem palca” na ekranie logowania: bez WebAuthn przycisku nie ma, a z WebAuthn jest. Rysowanie bez sieci (renderToString), atrapa window.PublicKeyCredential przez vi.stubGlobal.
 * EN: Tests of the "Zaloguj Face ID lub odciskiem palca" button on the sign-in screen: without WebAuthn there is no button, with WebAuthn it is there. Drawn without the network (renderToString), the window.PublicKeyCredential stub through vi.stubGlobal.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/auth/email/PasskeySignIn.tsx::PasskeySignIn
 * @uses src/features/auth/email/authApi.ts::isPasskeySupported
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { afterEach, describe, expect, it, vi } from 'vitest';
// PL: Renderowanie komponentu do HTML bez przeglądarki.
// EN: Rendering the component to HTML without a browser.
import { renderToString } from 'react-dom/server';
// PL: Klient zapytań, którego wymaga useSessionRefresh.
// EN: The query client that useSessionRefresh needs.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PasskeySignIn } from './PasskeySignIn';

const BUTTON_TEXT = 'Zaloguj Face ID lub odciskiem palca';

/**
 * PL: Rysuje przycisk logowania w dostawcy klienta zapytań.
 * EN: Draws the sign-in button inside the query client provider.
 *
 * @returns PL: HTML komponentu. EN: the HTML of the component.
 */
function renderPasskeySignIn(): string {
  return renderToString(
    <QueryClientProvider client={new QueryClient()}>
      <PasskeySignIn />
    </QueryClientProvider>,
  );
}

describe('PasskeySignIn', () => {
  // PL: Po każdym teście przywracamy prawdziwe globalne `window` (bez atrapy).
  // EN: After each test we restore the real global `window` (without the stub).
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // PL: Przeglądarka bez WebAuthn: przycisku nie ma wcale, więc logowanie kodem z maila zostaje jedyną drogą.
  // EN: A browser without WebAuthn: there is no button at all, so the e-mail code stays the only way in.
  it('bez WebAuthn nie rysuje przycisku / draws no button without WebAuthn', () => {
    vi.stubGlobal('window', {});
    expect(renderPasskeySignIn()).not.toContain(BUTTON_TEXT);
  });

  // PL: Telefon z WebAuthn: przycisk jest, z wyłączoną blokadą i w stylu przycisku konturowego.
  // EN: A phone with WebAuthn: the button is there, not disabled, and in the outline button style.
  it('z WebAuthn rysuje przycisk logowania / draws the sign-in button with WebAuthn', () => {
    vi.stubGlobal('window', { PublicKeyCredential: function PublicKeyCredential() {} });
    const html = renderPasskeySignIn();
    expect(html).toContain(BUTTON_TEXT);
    expect(html).toContain('auth-email__button--outline');
    expect(html).not.toContain('disabled');
  });
});
