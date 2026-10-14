/**
 * PL: Podpis autora pod treścią wpisu (gdy wpis ma autora) i stopka „Redakcja gazetki” (tylko gdy autor ma rolę redakcji). Sam serwer podaje tylko imię i nazwisko autora, bez adresu e-mail, oraz flagę, czy autor jest w redakcji.
 * EN: The author's signature under the entry content (when the entry has an author) and the "Redakcja gazetki" footer (only when the author has the editorial role). The server gives only the author's name and surname, without the e-mail address, and the flag whether the author is in the editorial team.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/news/feed/EntryScreen.tsx::EntrySignature
 * @used_by src/features/news/feed/EntrySignature.test.tsx::EntrySignature
 */

/**
 * PL: Rysuje podpis autora i, gdy autor jest z redakcji, stopkę redakcji. Bez autora i bez redakcji nic nie rysuje.
 * EN: Draws the author's signature and, when the author is from the editorial team, the editorial footer. Without an author and without the editorial team it draws nothing.
 *
 * @param props - PL: imię i nazwisko autora albo null oraz flaga redakcji. EN: the author's name and surname or null, and the editorial flag.
 * @returns PL: stopka wpisu albo null. EN: the entry footer, or null.
 */
export function EntrySignature({ authorName, byEditorialTeam }: { authorName: string | null; byEditorialTeam: boolean }) {
  // PL: Bez autora i bez stopki nie ma czego rysować, więc nie tworzymy pustego elementu.
  // EN: Without an author and without the footer there is nothing to draw, so no empty element is made.
  if (!authorName && !byEditorialTeam) return null;

  return (
    <footer className="news-entry__footer">
      {authorName ? <p className="news-entry__author">Autor: {authorName}</p> : null}
      {byEditorialTeam ? <p className="news-entry__redaction">Redakcja gazetki</p> : null}
    </footer>
  );
}
