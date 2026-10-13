/**
 * PL: Test pola tekstowego: podpis połączony z polem, błąd z aria-invalid i aria-describedby, wyłączenie i wysokość dotyku w CSS. Wpisywanie z klawiatury to zwykłe pole, a fokus rysuje base.css. Testy rysują do tekstu (react-dom/server), bo działają w Workerze bez przeglądarki.
 * EN: Test of the text field: the label tied to the field, the error with aria-invalid and aria-describedby, disabling and the touch height in CSS. Typing on a keyboard is a plain field, and base.css draws the focus. The tests render to a string (react-dom/server), because they run in a Worker without a browser.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/TextField.tsx::TextField
 * @uses src/shared/ui/TextField.css::.ui-field
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
import { TextField } from './TextField';
// PL: Arkusz stylów jako tekst, żeby sprawdzić wysokość i stany.
// EN: The style sheet as text, to check the height and the states.
import fieldCss from './TextField.css?raw';

describe('pole tekstowe / the text field', () => {
  it('podpis wskazuje pole przez htmlFor i id / the label points at the field through htmlFor and id', () => {
    const html = renderToString(<TextField label="Adres szkolny" />);
    const id = html.match(/<input id="([^"]+)"/)?.[1];

    expect(id).toBeTruthy();
    expect(html).toContain(`<label for="${id}"`);
    expect(html).toContain('Adres szkolny');
  });

  it('bez błędu nie ma aria-invalid ani opisu / without an error it has no aria-invalid or description', () => {
    const html = renderToString(<TextField label="Imię" />);

    expect(html).not.toContain('aria-invalid');
    expect(html).not.toContain('aria-describedby');
  });

  it('z błędem ma aria-invalid i opis wskazujący komunikat / with an error it has aria-invalid and a description pointing at the message', () => {
    const html = renderToString(<TextField label="Imię" error="Podaj imię" />);
    const errorId = html.match(/id="([^"]+-blad)"/)?.[1];

    expect(html).toContain('aria-invalid="true"');
    expect(errorId).toBeTruthy();
    expect(html).toContain(`aria-describedby="${errorId}"`);
    expect(html).toContain('Podaj imię');
  });

  it('wyłączone pole ma atrybut disabled / a disabled field has the disabled attribute', () => {
    expect(renderToString(<TextField label="Imię" disabled />)).toContain('disabled=""');
  });

  it('dotyk: pole ma co najmniej 48 px wysokości w CSS / touch: the field is at least 48 px high in CSS', () => {
    const minHeight = Number(fieldCss.match(/min-height:\s*(\d+)px/)?.[1]);

    expect(minHeight).toBeGreaterThanOrEqual(44);
  });

  it('stany: CSS ma wyłączenie i błąd / states: the CSS has the disabled and the error rules', () => {
    expect(fieldCss).toContain('.ui-field input:disabled');
    expect(fieldCss).toContain(".ui-field input[aria-invalid='true']");
  });

  it('fokus: CSS nie wyłącza obwódki / focus: the CSS does not turn the outline off', () => {
    expect(fieldCss).not.toMatch(/outline:\s*(none|0)\b/);
  });
});
