/**
 * PL: Górny pasek ekranów profilu: przycisk powrotu i tytuł (ekran 2.4: flowTop z ikoną strzałki w lewo).
 * EN: The top bar of the profile screens: the back button and the title (screen 2.4: flowTop with the arrow-left icon).
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/icons.tsx::Icon
 * @used_by src/features/profile/ProfileHome.tsx::ScreenTop
 * @used_by src/features/profile/SettingsScreen.tsx::ScreenTop
 * @used_by src/features/profile/DeleteAccountScreen.tsx::ScreenTop
 * @used_by src/features/profile/PrivacyScreen.tsx::ScreenTop
 */

// PL: Link do innego ekranu bez przeładowania strony.
// EN: A link to another screen without reloading the page.
import { Link } from 'react-router';
// PL: Ikona strzałki.
// EN: The arrow icon.
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
    <div className="pf-top">
      {/* PL: Okrągły przycisk powrotu: przenosi na poprzedni ekran. EN: The round back button: takes the student to the previous screen. */}
      <Link className="pf-icon-btn" to={backTo} aria-label={backLabel}>
        <Icon name="arrow-left" />
      </Link>
      {/* PL: Tytuł ekranu. EN: The screen title. */}
      <b>{title}</b>
    </div>
  );
}
