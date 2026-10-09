/**
 * PL: Dolny pasek nawigacji. Na razie zwykła lista linków bez wyglądu: wygląd robi podtor 0. Ekran sam decyduje, czy go pokazać (docs/projekt/EKRANY.md: dolny pasek mają tylko Pulpit i lista ankiet).
 * EN: The bottom navigation bar. For now a plain list of links without styling: podtor 0 makes the look. A screen decides itself whether to show it (docs/projekt/EKRANY.md: only the dashboard and the survey list have the bottom bar).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/navigation/items.ts::DOCK_ITEMS
 * @used_by src/shared/index.ts::Dock
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 * @used_by src/features/surveys/vote/SurveysVoteScreen.tsx::SurveysVoteScreen
 */

// PL: NavLink to link, który sam oznacza bieżący ekran atrybutem aria-current="page".
// EN: NavLink is a link that marks the current screen itself with the aria-current="page" attribute.
import { NavLink } from 'react-router';
// PL: Lista wpisów dolnego paska.
// EN: The list of bottom bar entries.
import { DOCK_ITEMS } from '../navigation/items';

/**
 * PL: Rysuje dolny pasek z wpisów DOCK_ITEMS. Nie pobiera danych i nie zmienia nic poza ekranem.
 * EN: Draws the bottom bar from the DOCK_ITEMS entries. It fetches no data and changes nothing outside the screen.
 *
 * @returns PL: drzewo elementów paska. EN: the tree of bar elements.
 */
export function Dock() {
  // PL: Zwróć pasek. Nazwa „Menu główne” jest z makiety (docs/projekt/referencje/uklad_C.html).
  // EN: Return the bar. The name "Menu główne" comes from the mockup (docs/projekt/referencje/uklad_C.html).
  return (
    <nav aria-label="Menu główne">
      <ul>
        {/* PL: Po jednym linku na wpis. „end” sprawia, że Pulpit nie świeci się na każdym ekranie. EN: One link per entry. "end" keeps the dashboard link from being marked on every screen. */}
        {DOCK_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink to={item.path} end>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
