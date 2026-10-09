/**
 * PL: Rama panelu Samorządu: menu panelu nad treścią i miejsce na ekran wybranej części panelu. Na razie zwykła lista linków bez wyglądu. Ramę rozwija podtor 8, a ekrany części panelu leżą w katalogach ich modułów (wpisy, zgłoszenia, ankiety).
 * EN: The Student Council panel frame: the panel menu above the content and a place for the screen of the chosen panel section. For now a plain list of links without styling. Subtrack 8 develops the frame, while the screens of the panel sections live in the directories of their modules (entries, reports, surveys).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/index.ts::PANEL_MENU_ITEMS
 * @used_by src/features/admin/index.ts::AdminLayout
 */

// PL: NavLink to link, który sam oznacza bieżący ekran. Outlet to miejsce na ekran wybranej części panelu.
// EN: NavLink is a link that marks the current screen itself. Outlet is the place for the screen of the chosen panel section.
import { NavLink, Outlet } from 'react-router';
// PL: Lista wpisów menu panelu.
// EN: The list of panel menu entries.
import { PANEL_MENU_ITEMS } from '../../shared';

/**
 * PL: Rysuje ramę panelu: menu i wybrany ekran. Nie pobiera danych i nie zmienia nic poza ekranem. Uprawnienia sprawdza serwer, a nie ta rama.
 * EN: Draws the panel frame: the menu and the chosen screen. It fetches no data and changes nothing outside the screen. The server checks permissions, not this frame.
 *
 * @returns PL: drzewo elementów ramy. EN: the tree of frame elements.
 */
export function AdminLayout() {
  // PL: Zwróć ramę: menu panelu i pod nim ekran, który wybrał router.
  // EN: Return the frame: the panel menu and, under it, the screen the router chose.
  return (
    <>
      {/* PL: Menu panelu. Nazwa „Panel Samorządu” jest z nazwy przepływu w docs/projekt/EKRANY.md. EN: The panel menu. The name "Panel Samorządu" comes from the flow name in docs/projekt/EKRANY.md. */}
      <nav aria-label="Panel Samorządu">
        <ul>
          {/* PL: Po jednym linku na wpis menu. EN: One link per menu entry. */}
          {PANEL_MENU_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {/* PL: Tu router wstawia ekran wybranej części panelu. EN: The router puts the screen of the chosen panel section here. */}
      <Outlet />
    </>
  );
}
