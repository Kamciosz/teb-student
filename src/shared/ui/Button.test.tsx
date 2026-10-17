/**
 * PL: Test przycisku: domyślny typ, wygląd i wyłączenie. Klawiatura działa, bo to zwykły przycisk. Testy rysują do tekstu (react-dom/server), bo działają w Workerze bez przeglądarki.
 * EN: Test of the button: default type, look and disabling. The keyboard works, because it is a plain button. The tests render to a string (react-dom/server), because they run in a Worker without a browser.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Button.tsx::Button
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

describe('przycisk / the button', () => {
  it('domyślnie jest przyciskiem typu „button” w wyglądzie wypełnionym / by default it is a "button" type button in the filled look', () => {
    const html = renderToString(<Button>Wyślij</Button>);

    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).toContain('class="ui-button ui-button--filled"');
    expect(html).toContain('Wyślij');
  });

  it('wygląd tekstowy i w kolorze błędu dają własną klasę / the text and the error-colored looks get their own class', () => {
    expect(renderToString(<Button variant="plain">Edytuj</Button>)).toContain('ui-button--plain');
    expect(renderToString(<Button variant="destructive">Usuń konto</Button>)).toContain('ui-button--destructive');
  });

  it('wyłączony przycisk ma atrybut disabled, więc nie reaguje na klik i klawisz / a disabled button has the disabled attribute, so it reacts to neither click nor key', () => {
    const html = renderToString(<Button disabled>Wyślij</Button>);

    expect(html).toContain('disabled=""');
  });
});
