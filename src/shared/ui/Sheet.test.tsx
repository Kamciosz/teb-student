/**
 * PL: Test arkusza: natywny dialog z nazwą (aria-labelledby), brak atrybutu open przy zamknięciu i obsługa Escape w kodzie (onCancel woła onClose). Otwarcie i fokus wymagają przeglądarki.
 * EN: Test of the sheet: the native dialog with a name (aria-labelledby), no open attribute when closed, and Escape handling in code (onCancel calls onClose). Opening and the focus need a browser.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Sheet.tsx::Sheet
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie komponentu do tekstu HTML.
// EN: Rendering a component to an HTML string.
import { renderToString } from 'react-dom/server';
// PL: Komponent pod testem.
// EN: The component under test.
import { Sheet } from './Sheet';
// PL: Kod komponentu jako tekst, żeby sprawdzić obsługę otwarcia, zamknięcia i Escape.
// EN: The component code as text, to check opening, closing and the Escape handling.
import sheetSource from './Sheet.tsx?raw';

describe('arkusz / the sheet', () => {
  it('jest natywnym dialogiem z nazwą z tytułu / is a native dialog named by its title', () => {
    const html = renderToString(
      <Sheet open={false} onClose={() => {}} title="Wybierz klasę">
        <p>treść</p>
      </Sheet>,
    );
    const titleId = html.match(/aria-labelledby="([^"]+)"/)?.[1];

    expect(html).toContain('<dialog');
    expect(titleId).toBeTruthy();
    expect(html).toContain(`id="${titleId}"`);
    expect(html).toContain('Wybierz klasę');
    expect(html).toContain('treść');
  });

  it('zamknięty arkusz nie ma atrybutu open, stan trzyma efekt / a closed sheet has no open attribute, the effect keeps the state', () => {
    const html = renderToString(
      <Sheet open onClose={() => {}} title="Potwierdź">
        x
      </Sheet>,
    );

    expect(html).not.toContain(' open=""');
    expect(sheetSource).toContain('showModal()');
    expect(sheetSource).toContain('dialog.close()');
  });

  it('klawisz Escape idzie do onClose, a nie zamyka okna po cichu / the Escape key goes to onClose and does not close the window silently', () => {
    expect(sheetSource).toContain('onCancel=');
    expect(sheetSource).toContain('event.preventDefault()');
    expect(sheetSource).toContain('onClose()');
  });
});
