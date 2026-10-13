/**
 * PL: Test podpisu autora i stopki wpisu. Sprawdza, że przy autorze pokazuje się jego imię i nazwisko, a bez autora podpisu nie ma, i że stopka „Redakcja gazetki” zawsze stoi pod wpisem.
 * EN: Test of the author's signature and the entry footer. Checks that with an author their name and surname show, that without an author there is no signature, and that the "Redakcja gazetki" footer always stands under the entry.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/feed/EntrySignature.tsx::EntrySignature
 * @used_by vitest.config.ts::include
 */

// PL: Rysowanie komponentu do tekstu HTML, bez przeglądarki.
// EN: Drawing a component to HTML text, without a browser.
import { renderToStaticMarkup } from 'react-dom/server';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Podpis, który sprawdzamy.
// EN: The signature under test.
import { EntrySignature } from './EntrySignature';

// PL: Grupa testów podpisu i stopki.
// EN: A group of signature and footer tests.
describe('podpis autora i stopka / author signature and footer', () => {
  // PL: Z autorem podpis pokazuje imię i nazwisko, a stopka jest zawsze.
  // EN: With an author the signature shows the name and surname, and the footer is always there.
  it('pokazuje autora i stopkę / shows the author and the footer', () => {
    const html = renderToStaticMarkup(<EntrySignature authorName="Ola Testowa" />);

    expect(html).toContain('Autor: Ola Testowa');
    expect(html).toContain('Redakcja gazetki');
  });

  // PL: Bez autora nie ma podpisu, a stopka zostaje.
  // EN: Without an author there is no signature, and the footer stays.
  it('bez autora nie pokazuje podpisu, ale stopka zostaje / without an author shows no signature, but the footer stays', () => {
    const html = renderToStaticMarkup(<EntrySignature authorName={null} />);

    expect(html).not.toContain('Autor:');
    expect(html).toContain('Redakcja gazetki');
  });
});
