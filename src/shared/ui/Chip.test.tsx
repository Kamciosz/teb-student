/**
 * PL: Test żetonu wyboru: typ przycisku, aria-pressed przy włączeniu i wyłączeniu, wyłączenie i fokus w CSS. Klawisze Enter i Spacja to zwykły przycisk, więc działają bez kodu. Sprawdza je e2e/shared-wyglad.spec.ts na prawdziwej stronie.
 * EN: Test of the choice chip: the button type, aria-pressed when on and off, disabling and focus in CSS. The Enter and Space keys are a plain button, so they work without code. e2e/shared-wyglad.spec.ts checks them on a real page.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Chip.tsx::Chip
 * @uses src/shared/ui/Chip.css::.ui-chip
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
import { Chip } from './Chip';
// PL: Arkusz stylów jako tekst, żeby sprawdzić wysokość i stany.
// EN: The style sheet as text, to check the height and the states.
import chipCss from './Chip.css?raw';

describe('żeton wyboru / the choice chip', () => {
  it('jest przyciskiem typu „button” z aria-pressed=false, gdy nie jest wybrany / is a "button" type button with aria-pressed=false when not chosen', () => {
    const html = renderToString(<Chip selected={false}>Uczniowie</Chip>);

    expect(html).toContain('<button');
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('Uczniowie');
  });

  it('po wybraniu ma aria-pressed=true, więc czytnik mówi „włączony” / when chosen it has aria-pressed=true, so the screen reader says "on"', () => {
    expect(renderToString(<Chip selected>Nauczyciele</Chip>)).toContain('aria-pressed="true"');
  });

  it('wyłączony żeton ma atrybut disabled / a disabled chip has the disabled attribute', () => {
    expect(renderToString(<Chip selected={false} disabled>Brak</Chip>)).toContain('disabled=""');
  });

  it('dotyk: wysokość co najmniej 44 px w CSS / touch: at least 44 px high in CSS', () => {
    const minHeight = Number(chipCss.match(/min-height:\s*(\d+)px/)?.[1]);

    expect(minHeight).toBeGreaterThanOrEqual(44);
  });

  it('stan włączenia rysuje aria-pressed w CSS, a wyłączenie przygasza / the on state is drawn by aria-pressed in CSS and disabling fades it', () => {
    expect(chipCss).toContain(".ui-chip[aria-pressed='true']");
    expect(chipCss).toContain('.ui-chip:disabled');
  });

  it('fokus: CSS nie wyłącza obwódki / focus: the CSS does not turn the outline off', () => {
    expect(chipCss).not.toMatch(/outline:\s*(none|0)\b/);
  });
});
