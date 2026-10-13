/**
 * PL: Dolny pasek nawigacji: Pulpit, przycisk „+” prowadzący do zgłoszenia i Ankiety. Wygląd z makiety (docs/projekt/referencje/uklad_C.html). Ekran sam decyduje, czy go pokazać (docs/projekt/EKRANY.md: dolny pasek mają tylko Pulpit i lista ankiet).
 * EN: The bottom navigation bar: Dashboard, the "+" button leading to a report, and Surveys. The look comes from the mockup (docs/projekt/referencje/uklad_C.html). A screen decides itself whether to show it (docs/projekt/EKRANY.md: only the dashboard and the survey list have the bottom bar).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/navigation/items.ts::DOCK_ITEMS
 * @uses src/shared/ui/Dock.css::.ui-dock
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
// PL: Style paska.
// EN: The bar styles.
import './Dock.css';

// PL: Adres przycisku „+”, czyli zgłoszenia problemu. Ten wpis dostaje wygląd okrągłego przycisku.
// EN: The address of the "+" button, that is reporting a problem. This entry gets the round button look.
const ADD_PATH = '/reports/student';

/**
 * PL: Rysuje dolny pasek z wpisów DOCK_ITEMS. Nie pobiera danych i nie zmienia nic poza ekranem. Przycisk „+” ma znak „+” ukryty przed czytnikiem, a nazwę „Zgłoś problem” czyta czytnik przez ukryty tekst.
 * EN: Draws the bottom bar from the DOCK_ITEMS entries. It fetches no data and changes nothing outside the screen. The "+" button has the "+" sign hidden from the screen reader, and the screen reader reads the name "Zgłoś problem" from hidden text.
 *
 * @returns PL: drzewo elementów paska. EN: the tree of bar elements.
 */
export function Dock() {
  // PL: Zwróć pasek. Nazwa „Menu główne” jest z makiety (docs/projekt/referencje/uklad_C.html).
  // EN: Return the bar. The name "Menu główne" comes from the mockup (docs/projekt/referencje/uklad_C.html).
  return (
    <nav className="ui-dock" aria-label="Menu główne">
      <ul>
        {/* PL: Po jednym linku na wpis. „end” sprawia, że Pulpit nie świeci się na każdym ekranie. EN: One link per entry. "end" keeps the dashboard link from being marked on every screen. */}
        {DOCK_ITEMS.map((item) =>
          item.path === ADD_PATH ? (
            <li key={item.path}>
              <NavLink to={item.path} end className="ui-dock-add">
                {/* PL: Znak „+” jest dekoracją, czytnik czyta tylko nazwę poniżej. EN: The "+" sign is decoration, the screen reader reads only the name below. */}
                <span aria-hidden="true">+</span>
                <span className="ui-sr-only">{item.label}</span>
              </NavLink>
            </li>
          ) : (
            <li key={item.path}>
              <NavLink to={item.path} end className="ui-dock-link">
                {item.label}
              </NavLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
