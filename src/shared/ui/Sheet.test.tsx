/**
 * PL: Test arkusza: natywny dialog z nazwą (aria-labelledby), brak atrybutu open przy zamknięciu, obsługa Escape w kodzie (onCancel woła onClose), brak ukrywania fokusa i blokada tła w CSS. Otwarcie i fokus wymagają przeglądarki, więc sprawdza je e2e/shared-wyglad.spec.ts, gdy jakiś ekran użyje arkusza.
 * EN: Test of the sheet: the native dialog with a name (aria-labelledby), no open attribute when closed, Escape handling in code (onCancel calls onClose), no hiding of the focus and the background block in CSS. Opening and the focus need a browser, so e2e/shared-wyglad.spec.ts checks them once a screen uses the sheet.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Sheet.tsx::Sheet
 * @uses src/shared/ui/Sheet.css::.ui-sheet
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
// PL: Kod komponentu i arkusz stylów jako tekst, żeby sprawdzić obsługę Escape i stany.
// EN: The component code and the style sheet as text, to check the Escape handling and the states.
import sheetSource from './Sheet.tsx?raw';
import sheetCss from './Sheet.css?raw';

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

  it('CSS: nie ustawia display na oknie, żeby zamknięte okno zostało ukryte / CSS: does not set display on the window, so a closed window stays hidden', () => {
    expect(sheetCss).not.toMatch(/\.ui-sheet\s*\{[^}]*display\s*:/);
  });

  it('CSS: tło za oknem jest przyciemnione z palety / CSS: the backdrop is dimmed from the palette', () => {
    expect(sheetCss).toContain('.ui-sheet::backdrop');
    expect(sheetCss).toContain('var(--bg)');
  });

  it('CSS: nie wyłącza obwódki fokusa / CSS: does not turn the focus outline off', () => {
    expect(sheetCss).not.toMatch(/outline:\s*(none|0)\b/);
  });
});
