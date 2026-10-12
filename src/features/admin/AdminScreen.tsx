/**
 * PL: Ekrany podtoru 8 pod adresem /admin: ekran główny panelu (6.1b, 6.1c) i kody zaproszeń (6.2). Nieznany adres pod /admin wraca na ekran główny. Ekrany ról (6.3) i danych z pilotażu (6.1e) dojdą po eksportach modułów auth, reports i surveys.
 * EN: The screens of subtrack 8 under /admin: the panel main screen (6.1b, 6.1c) and invitation codes (6.2). An unknown address under /admin goes back to the main screen. The roles (6.3) and pilot data (6.1e) screens will come after exports of the auth, reports and surveys modules.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/PanelHome.tsx::PanelHome
 * @uses src/features/admin/InvitesScreen.tsx::InvitesScreen
 * @used_by src/features/admin/index.ts::AdminScreen
 */

import { Navigate, Route, Routes } from 'react-router';
import { InvitesScreen } from './InvitesScreen';
import { PanelHome } from './PanelHome';

/**
 * PL: Rysuje wybrany ekran podtoru 8. Rama panelu (AdminLayout) wpuszcza tu tylko uczniów z rolą.
 * EN: Draws the chosen screen of subtrack 8. The panel frame (AdminLayout) lets only students with a role in here.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function AdminScreen() {
  return (
    <main className="ad-screen" data-subtrack="8">
      <Routes>
        {/* PL: Kody zaproszeń (Samorząd i administrator; redakcję odsyła rama panelu). EN: Invitation codes (the Council and the administrator; the panel frame turns the editorial team away). */}
        <Route path="kody" element={<InvitesScreen />} />
        {/* PL: Ekran główny panelu. EN: The panel main screen. */}
        <Route index element={<PanelHome />} />
        {/* PL: Każdy inny adres pod /admin wraca na ekran główny. EN: Any other address under /admin goes back to the main screen. */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </main>
  );
}
