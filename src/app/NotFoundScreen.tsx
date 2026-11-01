/**
 * PL: Ekran nieznanego adresu. Router pokazuje go dla każdego adresu, którego nie ma w APP_ROUTES, zamiast surowego błędu „404 Not Found”. Ekran ma komunikat i przycisk powrotu na pulpit. Nie pobiera danych i nie wymaga logowania.
 * EN: The unknown address screen. The router shows it for every address that is not in APP_ROUTES, instead of the raw "404 Not Found" error. The screen has a message and a button back to the dashboard. It fetches no data and needs no sign-in.
 *
 * @author Szymon Sosnowski
 * @since 2026-11-01
 * @uses src/app/NotFoundScreen.css
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Link powrotu na pulpit.
// EN: The link back to the dashboard.
import { Link } from 'react-router';
// PL: Style ekranu (wąska kolumna dla telefonu, tokeny z shared/styles).
// EN: The screen styles (a narrow column for the phone, tokens from shared/styles).
import './NotFoundScreen.css';

/**
 * PL: Rysuje ekran nieznanego adresu: nagłówek, krótkie wyjaśnienie i przycisk na dole.
 * EN: Draws the unknown address screen: a heading, a short explanation and a button at the bottom.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function NotFoundScreen() {
  return (
    <main className="nf-screen">
      {/* PL: Środek ekranu: komunikat wyśrodkowany w pionie i w poziomie. EN: The middle of the screen: the message centered vertically and horizontally. */}
      <div className="nf-center">
        <h1 className="nf-title">Nie ma takiej strony</h1>
        <p className="nf-lead">Ten adres nie prowadzi do żadnego ekranu.</p>
      </div>
      {/* PL: Na dole przycisk powrotu na pulpit, na pełną szerokość. EN: At the bottom the button back to the dashboard, full width. */}
      <div className="nf-bottom">
        <Link className="ui-button ui-button--filled" to="/">
          Wróć na pulpit
        </Link>
      </div>
    </main>
  );
}
