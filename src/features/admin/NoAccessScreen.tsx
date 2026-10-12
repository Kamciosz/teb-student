/**
 * PL: Ekran 6.1d „Panel: brak dostępu” z docs/projekt/EKRANY.md: uczeń bez roli (albo redakcja pod adresem, który nie jest Wpisami) widzi tylko ten komunikat i przycisk powrotu na pulpit. To wygoda, a nie zabezpieczenie: uprawnienia sprawdza serwer (403).
 * EN: Screen 6.1d "Panel: brak dostępu" from docs/projekt/EKRANY.md: a student without a role (or the editorial team at an address that is not Entries) sees only this message and a button back to the dashboard. This is a convenience, not a protection: the server checks permissions (403).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/icons.tsx::Icon
 * @uses src/features/admin/ScreenTop.tsx::ScreenTop
 * @used_by src/features/admin/AdminLayout.tsx::NoAccessScreen
 */

import { Link } from 'react-router';
import { Icon } from './icons';
import { ScreenTop } from './ScreenTop';

/**
 * PL: Rysuje ekran braku dostępu. Nie pobiera danych i nie zmienia nic poza ekranem.
 * EN: Draws the no-access screen. It fetches no data and changes nothing outside the screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function NoAccessScreen() {
  return (
    <main className="ad-screen" data-subtrack="8">
      <ScreenTop title="Panel Samorządu" backTo="/" backLabel="Wróć" />
      {/* PL: Środek ekranu: koło z kłódką, nagłówek i wyjaśnienie, wyśrodkowane. EN: The middle of the screen: the circle with a lock, the heading and the explanation, centered. */}
      <div className="ad-center">
        <div className="ad-circle" aria-hidden="true">
          <Icon name="lock" />
        </div>
        <h1>Tylko dla Samorządu</h1>
        <p className="ad-lead">Ten panel jest dla Samorządu i redakcji gazetki. Jeśli to pomyłka, zgłoś ją Samorządowi.</p>
      </div>
      {/* PL: Na dole przycisk powrotu na pulpit. EN: At the bottom the button back to the dashboard. */}
      <div className="ad-bottom">
        <Link className="ad-btn ad-btn-accent" to="/">
          Wróć na pulpit
          <Icon name="arrow-right" />
        </Link>
      </div>
    </main>
  );
}
