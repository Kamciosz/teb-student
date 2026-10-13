/**
 * PL: Testy przełącznika „Lekcje skrócone dziś”: stan włączony i wyłączony, blokada podczas zapisu, komunikat przy odmowie 403 i przy innym błędzie. Rysowanie bez sieci (renderToString).
 * EN: Tests of the "Lekcje skrócone dziś" switch: on and off state, locking while saving, a message for a 403 refusal and for another error. Drawn without the network (renderToString).
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/ShortenedDaySwitch.tsx::ShortenedDayToggle
 * @uses src/features/bell/ShortenedDaySwitch.tsx::errorTextFor
 * @uses src/features/bell/shortenedApi.ts::BellHttpError
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Renderowanie komponentu do HTML bez przeglądarki.
// EN: Rendering the component to HTML without a browser.
import { renderToString } from 'react-dom/server';
import { ShortenedDayToggle, errorTextFor } from './ShortenedDaySwitch';
import { BellHttpError } from './shortenedApi';

// PL: Pusta funkcja zmiany dla testów rysowania.
// EN: An empty change function for the drawing tests.
const noop = () => {};

describe('ShortenedDayToggle', () => {
  it('przy włączonym dniu pokazuje zaznaczony przełącznik z etykietą', () => {
    const html = renderToString(<ShortenedDayToggle checked busy={false} error={null} onToggle={noop} />);
    expect(html).toContain('role="switch"');
    expect(html).toContain('checked');
    expect(html).toContain('Lekcje skrócone dziś');
    expect(html).not.toContain('role="alert"');
  });

  it('przy wyłączonym dniu przełącznik nie jest zaznaczony', () => {
    const html = renderToString(<ShortenedDayToggle checked={false} busy={false} error={null} onToggle={noop} />);
    expect(html).not.toContain('checked');
  });

  it('w czasie zapisu przełącznik jest zablokowany', () => {
    const html = renderToString(<ShortenedDayToggle checked={false} busy error={null} onToggle={noop} />);
    expect(html).toContain('disabled');
  });

  it('przy odmowie 403 pokazuje komunikat o braku roli', () => {
    const html = renderToString(
      <ShortenedDayToggle checked={false} busy={false} error={errorTextFor(new BellHttpError(403))} onToggle={noop} />,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('Tylko Samorząd może zmienić dzień skrócony.');
  });
});

describe('errorTextFor', () => {
  it('odmowa 403 ma inny komunikat niż inny błąd zapisu', () => {
    expect(errorTextFor(new BellHttpError(403))).not.toBe(errorTextFor(new BellHttpError(500)));
  });

  it('błąd sieci dostaje ogólny komunikat zapisu', () => {
    expect(errorTextFor(new TypeError('Failed to fetch'))).toContain('Nie udało się zapisać');
  });
});
