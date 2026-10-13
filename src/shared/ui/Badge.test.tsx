/**
 * PL: Test znacznika: domyślny ton, ton akcentowy, treść i zawijanie w CSS. Znacznik nie jest sterowny, więc nie ma klawiatury ani stanu wyłączenia. Tekst niesie znaczenie, a kolor jest dodatkiem.
 * EN: Test of the badge: the default tone, the accent tone, the content and wrapping in CSS. The badge is not a control, so it has no keyboard or disabled state. The text carries the meaning, and the color is an extra.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Badge.tsx::Badge
 * @uses src/shared/ui/Badge.css::.ui-badge
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
import { Badge } from './Badge';
// PL: Arkusz stylów jako tekst.
// EN: The style sheet as text.
import badgeCss from './Badge.css?raw';

describe('znacznik / the badge', () => {
  it('domyślnie ma ton neutralny i treść tekstową / by default it has the neutral tone and text content', () => {
    const html = renderToString(<Badge>nowe</Badge>);

    expect(html).toContain('class="ui-badge"');
    expect(html).toContain('data-tone="neutral"');
    expect(html).toContain('nowe');
  });

  it('ton akcentowy trafia do data-tone i do CSS / the accent tone goes to data-tone and to the CSS', () => {
    expect(renderToString(<Badge tone="accent">3</Badge>)).toContain('data-tone="accent"');
    expect(badgeCss).toContain(".ui-badge[data-tone='accent']");
  });

  it('CSS: długi napis zawija się w wąskim ekranie / CSS: a long label wraps on a narrow screen', () => {
    expect(badgeCss).toContain('max-width: 100%');
    expect(badgeCss).toContain('overflow-wrap: anywhere');
  });

  it('nie wyłącza obwódki fokusa, bo nie jest sterowny / does not turn the focus outline off, because it is not a control', () => {
    expect(badgeCss).not.toMatch(/outline:\s*(none|0)\b/);
  });
});
