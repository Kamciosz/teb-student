/**
 * PL: Rama panelu Samorządu: bramka roli nad ekranem wybranej części panelu. Menu panelu usunął podtor 8, a jego główny ekran (kafle części) prowadzi do części. Rama pobiera rolę przez PanelGate, więc uczeń bez roli widzi ekran 6.1d zamiast każdej części panelu. Uprawnienia i tak sprawdza serwer (requirePanelRole). Ekrany części panelu leżą w katalogach ich modułów (wpisy, zgłoszenia, ankiety).
 * EN: The Student Council panel frame: a role gate above the screen of the chosen panel section. Subtrack 8 removed the panel menu, and its main screen (the section tiles) leads to the sections. The frame reads the role through PanelGate, so a student without a role sees screen 6.1d instead of every panel section. The server checks permissions anyway (requirePanelRole). The screens of the panel sections live in the directories of their modules (entries, reports, surveys).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/PanelGate.tsx::PanelGate
 * @used_by src/features/admin/index.ts::AdminLayout
 */

// PL: Outlet to miejsce na ekran wybranej części panelu.
// EN: Outlet is the place for the screen of the chosen panel section.
import { Outlet } from 'react-router';
// PL: Bramka roli: przepuszcza każdą rolę panelu (domyślne minimum), a ucznia bez roli zatrzymuje na ekranie 6.1d.
// EN: The role gate: lets through every panel role (the default minimum) and stops a student without a role on screen 6.1d.
import { PanelGate } from './PanelGate';

/**
 * PL: Rysuje ramę panelu: bramkę roli i wybrany ekran. Nie pobiera danych poza rolą i nie zmienia nic poza ekranem. Uprawnienia sprawdza serwer, a nie ta rama.
 * EN: Draws the panel frame: the role gate and the chosen screen. It fetches no data beyond the role and changes nothing outside the screen. The server checks permissions, not this frame.
 *
 * @returns PL: drzewo elementów ramy. EN: the tree of frame elements.
 */
export function AdminLayout() {
  // PL: Zwróć ramę: ekran wybrany przez router, pokazany tylko dla roli panelu.
  // EN: Return the frame: the screen the router chose, shown only to a panel role.
  return (
    <PanelGate>
      {/* PL: Tu router wstawia ekran wybranej części panelu. EN: The router puts the screen of the chosen panel section here. */}
      <Outlet />
    </PanelGate>
  );
}
