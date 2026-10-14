/**
 * PL: Podpis autora pod treścią wpisu (gdy wpis ma autora) i stopka „Redakcja gazetki”. Sam serwer podaje tylko imię i nazwisko autora, bez adresu e-mail.
 * EN: The author's signature under the entry content (when the entry has an author) and the "Redakcja gazetki" footer. The server gives only the author's name and surname, without the e-mail address.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/news/feed/EntryScreen.tsx::EntrySignature
 * @used_by src/features/news/feed/EntrySignature.test.tsx::EntrySignature
 */

/**
 * PL: Rysuje podpis autora i stopkę redakcji.
 * EN: Draws the author's signature and the redaction footer.
 *
 * @param props - PL: imię i nazwisko autora albo null. EN: the author's name and surname, or null.
 * @returns PL: stopka wpisu. EN: the entry footer.
 */
export function EntrySignature({ authorName }: { authorName: string | null }) {
  return (
    <footer className="news-entry__footer">
      {authorName ? <p className="news-entry__author">Autor: {authorName}</p> : null}
      <p className="news-entry__redaction">Redakcja gazetki</p>
    </footer>
  );
}
