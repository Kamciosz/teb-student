/**
 * PL: Dolny pasek nawigacji: Pulpit, Aktualności, Zgłoszenia, Ankiety i Profil. Wygląd natywnej aplikacji iPhone'a: pełna szerokość, przyklejony do dołu, ikona nad krótkim napisem. Pasek rysuje też odstęp pod treścią, więc ekran z paskiem nie musi nic dodawać.
 * EN: The bottom navigation bar: Dashboard, News, Reports, Surveys and Profile. The look of a native iPhone app: full width, pinned to the bottom, an icon above a short label. The bar also draws the space under the content, so a screen with the bar needs to add nothing.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/navigation/items.ts::DOCK_ITEMS
 * @uses src/shared/ui/Icon.tsx::Icon
 * @uses src/shared/ui/Dock.css::.ui-dock
 * @used_by src/shared/index.ts::Dock
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 * @used_by src/features/surveys/vote/SurveyListScreen.tsx::SurveyListScreen
 */

// PL: NavLink to link, który sam oznacza bieżący ekran atrybutem aria-current="page".
// EN: NavLink is a link that marks the current screen itself with the aria-current="page" attribute.
import { NavLink } from 'react-router';
// PL: Lista wpisów dolnego paska.
// EN: The list of bottom bar entries.
import { DOCK_ITEMS } from '../navigation/items';
// PL: Wspólne ikony aplikacji.
// EN: The shared app icons.
import { Icon } from './Icon';
// PL: Style paska i odstępu pod treścią.
// EN: The bar and the space under the content styles.
import './Dock.css';

/**
 * PL: Rysuje dolny pasek z wpisów DOCK_ITEMS. Nie pobiera danych i nie zmienia nic poza ekranem. Pusty blok przed paskiem daje treści odstęp, żeby ostatni element dało się przewinąć nad pasek.
 * EN: Draws the bottom bar from the DOCK_ITEMS entries. It fetches no data and changes nothing outside the screen. The empty block before the bar gives the content space, so the last element can be scrolled above the bar.
 *
 * @returns PL: odstęp i pasek. EN: the space and the bar.
 */
export function Dock() {
  // PL: Pusty blok idzie przed paskiem, czyli na końcu treści ekranu. Nazwa „Menu główne” jest z makiety (docs/projekt/referencje/uklad_C.html).
  // EN: The empty block goes before the bar, so at the end of the screen content. The name "Menu główne" comes from the mockup (docs/projekt/referencje/uklad_C.html).
  return (
    <>
      <div className="ui-dock-spacer" aria-hidden="true" />
      <nav className="ui-dock" aria-label="Menu główne">
        <ul>
          {/* PL: Po jednym linku na wpis. „end” tylko dla Pulpitu, żeby zostawał zaznaczony wyłącznie na swoim ekranie. EN: One link per entry. "end" only for the dashboard, so it stays marked only on its own screen. */}
          {DOCK_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} end={item.path === '/'} className="ui-dock-link">
                <Icon name={item.icon} />
                <span className="ui-dock-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
