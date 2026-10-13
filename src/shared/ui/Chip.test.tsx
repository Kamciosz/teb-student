/**
 * PL: Test żetonu wyboru: typ przycisku, aria-pressed przy włączeniu i wyłączeniu oraz wyłączenie. Klawisze Enter i Spacja to zwykły przycisk, więc działają bez kodu.
 * EN: Test of the choice chip: the button type, aria-pressed when on and off, and disabling. The Enter and Space keys are a plain button, so they work without code.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Chip.tsx::Chip
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
});
