/**
 * PL: Ikony ekranu profilu. Kształty są we wspólnym zestawie src/shared/ui/Icon.tsx; tutaj tylko nadajemy im klasę profilu (rozmiar 20 px).
 * EN: The icons of the profile screen. The shapes live in the shared set src/shared/ui/Icon.tsx; here they only get the profile class (20 px size).
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/shared/index.ts::Icon
 * @used_by src/features/profile/ProfileHome.tsx::Icon
 * @used_by src/features/profile/SettingsScreen.tsx::Icon
 */

// PL: Wspólny zestaw ikon i jego nazwy.
// EN: The shared icon set and its names.
import { Icon as SharedIcon, type IconName } from '../../shared';

export type { IconName };

/**
 * PL: Rysuje ikonę profilu. Ikona jest ozdobą (czytniki ekranu ją pomijają).
 * EN: Draws a profile icon. The icon is decoration (screen readers skip it).
 *
 * @param props - PL: nazwa ikony. EN: the icon name.
 * @returns PL: element SVG z klasą pf-icon. EN: the SVG element with the pf-icon class.
 */
export function Icon({ name }: { name: IconName }) {
  return <SharedIcon name={name} className="pf-icon" />;
}
