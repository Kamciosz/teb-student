/**
 * PL: Ekran podtoru 7 (profil i ustawienia): podtrasy w /profile/*. Profil, ustawienia i usunięcie konta wymagają sesji, a polityka prywatności nie.
 * EN: The screen of subtrack 7 (profile and settings): the sub-routes in /profile/*. The profile, settings and account deletion need a session, the privacy policy does not.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/profile/ProfileHome.tsx::ProfileHome
 * @uses src/features/profile/SettingsScreen.tsx::SettingsScreen
 * @uses src/features/profile/DeleteAccountScreen.tsx::DeleteAccountScreen
 * @uses src/features/profile/PrivacyScreen.tsx::PrivacyScreen
 * @uses src/features/profile/RequireSession.tsx::RequireSession
 * @used_by src/features/profile/index.ts::ProfileScreen
 */

// PL: Podtrasy w obrębie /profile/*.
// EN: The sub-routes inside /profile/*.
import { Route, Routes } from 'react-router';
// PL: Style tego ekranu. Dostawca zapytań stoi w korzeniu aplikacji.
// EN: The styles of this screen. The query provider stands at the app root.
import './profile.css';
// PL: Ekrany podtoru i bramka sesji.
// EN: The subtrack screens and the session gate.
import { DeleteAccountScreen } from './DeleteAccountScreen';
import { PrivacyScreen } from './PrivacyScreen';
import { ProfileHome } from './ProfileHome';
import { RequireSession } from './RequireSession';
import { SettingsScreen } from './SettingsScreen';

/**
 * PL: Rysuje ramę ekranu i wybiera podekran z adresu.
 * EN: Draws the screen frame and picks the sub-screen from the address.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ProfileScreen() {
  // PL: Znacznik data-subtrack zostaje, bo po nim testy poznają ekran podtoru (jak w UnderConstruction).
  // EN: The data-subtrack marker stays, because tests use it to recognise the subtrack screen (as in UnderConstruction).
  return (
    <main className="pf-screen" data-subtrack="7">
      <Routes>
        {/* PL: Polityka prywatności jest poza bramką: otwiera się bez logowania. EN: The privacy policy is outside the gate: it opens without signing in. */}
        <Route path="prywatnosc" element={<PrivacyScreen />} />
        {/* PL: Reszta wymaga sesji. EN: The rest needs a session. */}
        <Route element={<RequireSession />}>
          <Route path="ustawienia" element={<SettingsScreen />} />
          <Route path="usun" element={<DeleteAccountScreen />} />
          <Route path="*" element={<ProfileHome />} />
        </Route>
      </Routes>
    </main>
  );
}
