/**
 * PL: Górny pasek ekranów panelu: przycisk powrotu i tytuł (flowTop z ikoną strzałki w lewo w ekranach 6.x w docs/projekt/EKRANY.md).
 * EN: The top bar of the panel screens: the back button and the title (flowTop with the arrow-left icon in the 6.x screens in docs/projekt/EKRANY.md).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/icons.tsx::Icon
 * @used_by src/features/admin/PanelHome.tsx::ScreenTop
 * @used_by src/features/admin/InvitesScreen.tsx::ScreenTop
 * @used_by src/features/admin/NoAccessScreen.tsx::ScreenTop
 */

import { Link } from 'react-router';
import { Icon } from './icons';

/**
 * PL: Rysuje pasek z przyciskiem powrotu i tytułem.
 * EN: Draws the bar with the back button and the title.
 *
 * @param props - PL: tytuł, adres powrotu i podpis przycisku dla czytników ekranu. EN: the title, the back address and the button label for screen readers.
 * @returns PL: drzewo elementów paska. EN: the tree of bar elements.
 */
export function ScreenTop({ title, backTo, backLabel }: { title: string; backTo: string; backLabel: string }) {
  return (
    <div className="ad-top">
      {/* PL: Okrągły przycisk powrotu: przenosi na poprzedni ekran. EN: The round back button: takes the student to the previous screen. */}
      <Link className="ad-icon-btn" to={backTo} aria-label={backLabel}>
        <Icon name="arrow-left" />
      </Link>
      {/* PL: Tytuł ekranu. EN: The screen title. */}
      <b>{title}</b>
    </div>
  );
}
