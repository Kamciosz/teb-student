/**
 * PL: Testy sekcji „Face ID i odcisk palca” w ustawieniach: bez WebAuthn jedno zdanie i brak przycisku, z WebAuthn legenda i przycisk dodania. Rysowanie bez sieci (renderToString), atrapa window.PublicKeyCredential przez vi.stubGlobal.
 * EN: Tests of the "Face ID i odcisk palca" section in the settings: without WebAuthn one sentence and no button, with WebAuthn the legend and the add button. Drawn without the network (renderToString), the window.PublicKeyCredential stub through vi.stubGlobal.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/profile/PasskeySection.tsx::PasskeySection
 * @uses src/features/profile/passkeyApi.ts::PASSKEY_UNSUPPORTED_MESSAGE
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { afterEach, describe, expect, it, vi } from 'vitest';
// PL: Renderowanie komponentu do HTML bez przeglądarki.
// EN: Rendering the component to HTML without a browser.
import { renderToString } from 'react-dom/server';
// PL: Klient zapytań, którego wymaga lista kluczy.
// EN: The query client that the list of keys needs.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PasskeySection } from './PasskeySection';
import { PASSKEY_UNSUPPORTED_MESSAGE } from './passkeyApi';

const ADD_BUTTON_TEXT = 'Dodaj Face ID lub odcisk palca';
const LEGEND = 'Face ID i odcisk palca';

/**
 * PL: Rysuje sekcję w dostawcy klienta zapytań.
 * EN: Draws the section inside the query client provider.
 *
 * @returns PL: HTML sekcji. EN: the HTML of the section.
 */
function renderSection(): string {
  return renderToString(
    <QueryClientProvider client={new QueryClient()}>
      <PasskeySection />
    </QueryClientProvider>,
  );
}

describe('PasskeySection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // PL: Bez WebAuthn zostaje jedno zdanie, bez przycisku dodania.
  // EN: Without WebAuthn one sentence stays, with no add button.
  it('bez WebAuthn pokazuje zdanie zamiast przycisku / shows a sentence instead of the button without WebAuthn', () => {
    vi.stubGlobal('window', {});
    const html = renderSection();
    expect(html).toContain(PASSKEY_UNSUPPORTED_MESSAGE);
    expect(html).not.toContain(ADD_BUTTON_TEXT);
  });

  // PL: Z WebAuthn sekcja ma legendę i przycisk dodania; lista ładuje się przy otwarciu.
  // EN: With WebAuthn the section has the legend and the add button; the list loads when it opens.
  it('z WebAuthn pokazuje legendę i przycisk dodania / shows the legend and the add button with WebAuthn', () => {
    vi.stubGlobal('window', { PublicKeyCredential: function PublicKeyCredential() {} });
    const html = renderSection();
    expect(html).toContain(LEGEND);
    expect(html).toContain(ADD_BUTTON_TEXT);
    expect(html).not.toContain(PASSKEY_UNSUPPORTED_MESSAGE);
  });
});
