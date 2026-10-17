/**
 * PL: Test paska postępu: rola i wartości aria, przycinanie do zakresu (także NaN i pusty zakres) oraz szerokość wypełnienia. Pasek nie jest sterowny, więc nie ma klawiatury ani stanu wyłączenia.
 * EN: Test of the progress bar: the role and aria values, clamping to the range (also NaN and an empty range) and the fill scale. The bar is not a control, so it has no keyboard or disabled state.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/ProgressBar.tsx::ProgressBar
 * @uses src/shared/ui/ProgressBar.tsx::clampPercent
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie komponentu do tekstu HTML.
// EN: Rendering a component to an HTML string.
import { renderToString } from 'react-dom/server';
// PL: Komponent i funkcja przycinania pod testem.
// EN: The component and the clamping function under test.
import { ProgressBar, clampPercent } from './ProgressBar';

describe('pasek postępu / the progress bar', () => {
  it('ma rolę progressbar i wartości aria / has the progressbar role and aria values', () => {
    const html = renderToString(<ProgressBar value={40} label="Postęp zgłoszenia" />);

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-label="Postęp zgłoszenia"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-valuenow="40"');
  });

  it('wypełnienie ma skalę odpowiadającą procentom / the fill has a scale matching the percent', () => {
    expect(renderToString(<ProgressBar value={3} max={4} label="Etap" />)).toContain('transform:scaleX(0.75)');
  });

  it('wartość powyżej maksimum przycina się do 100 % / a value above the maximum is clamped to 100 %', () => {
    const html = renderToString(<ProgressBar value={250} label="Etap" />);

    expect(html).toContain('transform:scaleX(1)');
    expect(html).toContain('aria-valuenow="100"');
  });

  it('clampPercent: wartości poza zakresem, pusty zakres i NaN nie rzucają błędu / clampPercent: out-of-range values, an empty range and NaN do not throw', () => {
    expect(clampPercent(-5, 10)).toBe(0);
    expect(clampPercent(15, 10)).toBe(100);
    expect(clampPercent(1, 3)).toBe(33);
    expect(clampPercent(5, 0)).toBe(0);
    expect(clampPercent(Number.NaN, 10)).toBe(0);
  });
});
