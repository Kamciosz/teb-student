/**
 * PL: Ekrany podtoru 8 pod adresem /admin: ekran główny panelu (6.1b, 6.1c) i kody zaproszeń (6.2). Nieznany adres pod /admin wraca na ekran główny. Ekrany stoją za bramką roli (PanelGate). Ekrany ról (6.3) i danych z pilotażu (6.1e) dojdą po eksportach modułów auth, reports i surveys.
 * EN: The screens of subtrack 8 under /admin: the panel main screen (6.1b, 6.1c) and invitation codes (6.2). An unknown address under /admin goes back to the main screen. The roles (6.3) and pilot data (6.1e) screens will come after exports of the auth, reports and surveys modules.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/PanelHome.tsx::PanelHome
 * @uses src/features/admin/InvitesScreen.tsx::InvitesScreen
 * @uses src/features/admin/PanelGate.tsx::PanelGate
 * @used_by src/features/admin/index.ts::AdminScreen
 */

import { Navigate, Route, Routes } from 'react-router';
import { InvitesScreen } from './InvitesScreen';
import { PanelGate } from './PanelGate';
import { PanelHome } from './PanelHome';

/**
 * PL: Rysuje wybrany ekran podtoru 8. Każdy ekran stoi za bramką roli: ekran główny wpuszcza każdą rolę (redakcja widzi tam tylko Wpisy), kody zaproszeń od Samorządu wzwyż.
 * EN: Draws the chosen screen of subtrack 8. Every screen stands behind the role gate: the main screen lets every role in (the editorial team sees only Entries there), invitation codes from the Council up.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function AdminScreen() {
  return (
    <Routes>
      {/* PL: Kody zaproszeń: Samorząd i administrator, a redakcja dostaje ekran 6.1d. EN: Invitation codes: the Council and the administrator, while the editorial team gets screen 6.1d. */}
      <Route path="kody" element={<PanelGate minimum="council"><InvitesScreen /></PanelGate>} />
      {/* PL: Ekran główny panelu dla każdej roli. EN: The panel main screen for every role. */}
      <Route index element={<PanelGate><PanelHome /></PanelGate>} />
      {/* PL: Każdy inny adres pod /admin wraca na ekran główny. EN: Any other address under /admin goes back to the main screen. */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
