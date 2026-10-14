/**
 * PL: Ekrany podtoru 8 pod adresem /admin: ekran główny panelu (6.1b, 6.1c), kody zaproszeń (6.2), role (6.3) i dane z pilotażu (6.1e). Nieznany adres pod /admin wraca na ekran główny. Ekrany stoją za bramką roli (PanelGate).
 * EN: The screens of subtrack 8 under /admin: the panel main screen (6.1b, 6.1c), invitation codes (6.2), roles (6.3) and pilot data (6.1e). An unknown address under /admin goes back to the main screen. The screens stand behind the role gate (PanelGate).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/PanelHome.tsx::PanelHome
 * @uses src/features/admin/InvitesScreen.tsx::InvitesScreen
 * @uses src/features/admin/PanelGate.tsx::PanelGate
 * @uses src/features/admin/RoleScreen.tsx::RoleScreen
 * @uses src/features/admin/RoleCardScreen.tsx::RoleCardScreen
 * @uses src/features/admin/PilotScreen.tsx::PilotScreen
 * @uses src/features/admin/DiaryScreen.tsx::DiaryScreen
 * @used_by src/features/admin/index.ts::AdminScreen
 */

import { Navigate, Route, Routes } from 'react-router';
import { DiaryScreen } from './DiaryScreen';
import { InvitesScreen } from './InvitesScreen';
import { PanelGate } from './PanelGate';
import { PanelHome } from './PanelHome';
import { PilotScreen } from './PilotScreen';
import { RoleCardScreen } from './RoleCardScreen';
import { RoleScreen } from './RoleScreen';

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
      {/* PL: Dziennik zmian: Samorząd i administrator, redakcja dostaje ekran 6.1d. EN: The change diary: the Council and the administrator, while the editorial team gets screen 6.1d. */}
      <Route path="dziennik" element={<PanelGate minimum="council"><DiaryScreen /></PanelGate>} />
      {/* PL: Ekran główny panelu dla każdej roli. EN: The panel main screen for every role. */}
      <Route index element={<PanelGate><PanelHome /></PanelGate>} />
      {/* PL: Role i dane z pilotażu tylko dla administratora. EN: Roles and the pilot data only for the administrator. */}
      <Route path="role" element={<PanelGate minimum="admin"><RoleScreen /></PanelGate>} />
      <Route path="role/:studentId" element={<PanelGate minimum="admin"><RoleCardScreen /></PanelGate>} />
      <Route path="pilotaz" element={<PanelGate minimum="admin"><PilotScreen /></PanelGate>} />
      {/* PL: Każdy inny adres pod /admin wraca na ekran główny. EN: Any other address under /admin goes back to the main screen. */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
