/**
 * PL: Test przycisku: domyślny typ, wygląd, wyłączenie i wysokość dotyku w CSS. Klawiatura działa, bo to zwykły przycisk, a fokus rysuje base.css. Testy rysują do tekstu (react-dom/server), bo działają w Workerze bez przeglądarki. Zachowanie klawiszy sprawdza e2e/shared-wyglad.spec.ts na prawdziwej stronie.
 * EN: Test of the button: default type, look, disabling and the touch height in CSS. The keyboard works, because it is a plain button and base.css draws the focus. The tests render to a string (react-dom/server), because they run in a Worker without a browser. The key behavior is checked on a real page by e2e/shared-wyglad.spec.ts.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Button.tsx::Button
 * @uses src/shared/ui/Button.css::.ui-button
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
import { Button } from './Button';
// PL: Arkusz stylów jako tekst, żeby sprawdzić wysokość i stany.
// EN: The style sheet as text, to check the height and the states.
import buttonCss from './Button.css?raw';

describe('przycisk / the button', () => {
  it('domyślnie jest przyciskiem typu „button” w wyglądzie głównym / by default it is a "button" type button in the primary look', () => {
    const html = renderToString(<Button>Wyślij</Button>);

    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).toContain('class="ui-button ui-button--accent"');
    expect(html).toContain('Wyślij');
  });

  it('wygląd miękki i z obwódką dają własną klasę / the soft and outlined looks get their own class', () => {
    expect(renderToString(<Button variant="soft">Anuluj</Button>)).toContain('ui-button--soft');
    expect(renderToString(<Button variant="outline">Później</Button>)).toContain('ui-button--outline');
  });

  it('wyłączony przycisk ma atrybut disabled, więc nie reaguje na klik i klawisz / a disabled button has the disabled attribute, so it reacts to neither click nor key', () => {
    const html = renderToString(<Button disabled>Wyślij</Button>);

    expect(html).toContain('disabled=""');
  });

  it('dotyk: wysokość co najmniej 44 px w CSS / touch: at least 44 px high in CSS', () => {
    const minHeight = Number(buttonCss.match(/min-height:\s*(\d+)px/)?.[1]);

    expect(minHeight).toBeGreaterThanOrEqual(44);
  });

  it('fokus: CSS nie wyłącza obwódki / focus: the CSS does not turn the outline off', () => {
    expect(buttonCss).not.toMatch(/outline:\s*(none|0)\b/);
  });

  it('wyłączenie: CSS przygasza przycisk i zmienia kursor / disabled: the CSS fades the button and changes the cursor', () => {
    expect(buttonCss).toContain('.ui-button:disabled');
    expect(buttonCss).toContain('not-allowed');
  });
});
