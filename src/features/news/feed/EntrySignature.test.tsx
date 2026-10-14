/**
 * PL: Test podpisu autora i stopki wpisu. Sprawdza, że przy autorze pokazuje się jego imię i nazwisko, a stopka „Redakcja gazetki” pojawia się tylko przy autorze z redakcji, także bez podpisu.
 * EN: Test of the author's signature and the entry footer. Checks that with an author their name and surname show, and that the "Redakcja gazetki" footer appears only for an author from the editorial team, also without a signature.
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
  // PL: Autor z redakcji: podpis pokazuje imię i nazwisko, a stopka jest.
  // EN: An author from the editorial team: the signature shows the name and surname, and the footer is there.
  it('pokazuje autora i stopkę redakcji / shows the author and the editorial footer', () => {
    const html = renderToStaticMarkup(<EntrySignature authorName="Ola Testowa" byEditorialTeam />);

    expect(html).toContain('Autor: Ola Testowa');
    expect(html).toContain('Redakcja gazetki');
  });

  // PL: Autor spoza redakcji (np. Samorząd bez roli „editor”): podpis zostaje, stopki nie ma.
  // EN: An author outside the editorial team (for example the Samorząd without the "editor" role): the signature stays, there is no footer.
  it('autor bez roli redakcji: podpis tak, stopki nie / author without the editorial role: signature yes, footer no', () => {
    const html = renderToStaticMarkup(<EntrySignature authorName="Samorząd Szkolny" byEditorialTeam={false} />);

    expect(html).toContain('Autor: Samorząd Szkolny');
    expect(html).not.toContain('Redakcja gazetki');
  });

  // PL: Bez autora i bez redakcji nie ma nic: ani podpisu, ani stopki.
  // EN: Without an author and without the editorial team there is nothing: neither signature nor footer.
  it('bez autora i bez redakcji nic nie rysuje / without an author and the editorial team draws nothing', () => {
    const html = renderToStaticMarkup(<EntrySignature authorName={null} byEditorialTeam={false} />);

    expect(html).toBe('');
  });

  // PL: Bez autora, ale z flagą redakcji: stopka jest, podpisu nie ma.
  // EN: Without an author but with the editorial flag: the footer is there, there is no signature.
  it('bez autora, ale z flagą redakcji: sama stopka / without an author but with the editorial flag: only the footer', () => {
    const html = renderToStaticMarkup(<EntrySignature authorName={null} byEditorialTeam />);

    expect(html).not.toContain('Autor:');
    expect(html).toContain('Redakcja gazetki');
  });
});
