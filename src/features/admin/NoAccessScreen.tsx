/**
 * PL: Ekran 6.1d „Panel: brak dostępu” z docs/projekt/EKRANY.md: uczeń bez roli (albo z rolą za niską dla ekranu) widzi tylko ten komunikat i przycisk powrotu na pulpit. To wygoda, a nie zabezpieczenie: uprawnienia sprawdza serwer (403).
 * EN: Screen 6.1d "Panel: brak dostępu" from docs/projekt/EKRANY.md: a student without a role (or with a role too low for the screen) sees only this message and a button back to the dashboard. This is a convenience, not a protection: the server checks permissions (403).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/icons.tsx::Icon
 * @uses src/shared/index.ts::ScreenHeader
 * @used_by src/features/admin/PanelGate.tsx::NoAccessScreen
 */

// PL: Link powrotu na pulpit i wspólny nagłówek ekranu.
// EN: The link back to the dashboard and the shared screen header.
import { Link } from 'react-router';
import { ScreenHeader } from '../../shared';
// PL: Ikona kłódki w kole.
// EN: The lock icon in the circle.
import { Icon } from './icons';

/**
 * PL: Rysuje ekran braku dostępu. Nie pobiera danych i nie zmienia nic poza ekranem.
 * EN: Draws the no-access screen. It fetches no data and changes nothing outside the screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function NoAccessScreen() {
  return (
    <main className="ad-screen" data-subtrack="8">
      <ScreenHeader title="Panel Samorządu" backTo="/" backLabel="Wróć" />
      {/* PL: Środek ekranu: koło z kłódką, nagłówek i wyjaśnienie, wyśrodkowane. EN: The middle of the screen: the circle with a lock, the heading and the explanation, centered. */}
      <div className="ad-center">
        <div className="ad-circle" aria-hidden="true">
          <Icon name="lock" />
        </div>
        <h2>Tylko dla Samorządu</h2>
        <p className="ad-lead">Ten panel jest dla Samorządu i redakcji gazetki. Jeśli to pomyłka, zgłoś ją Samorządowi.</p>
      </div>
      {/* PL: Na dole przycisk powrotu na pulpit, w wyglądzie wypełnionego przycisku. EN: At the bottom the button back to the dashboard, in the look of the filled button. */}
      <div className="ad-bottom">
        <Link className="ui-button ui-button--filled" to="/">
          Wróć na pulpit
        </Link>
      </div>
    </main>
  );
}
