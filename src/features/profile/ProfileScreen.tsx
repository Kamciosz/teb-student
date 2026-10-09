/**
 * PL: Ekran „W budowie” podtoru 7 (profil i ustawienia). Tymczasowo pokazuje tylko tytuł i napis. Właściwy ekran zbuduje agent tego podtoru.
 * EN: The "W budowie" (under construction) screen of subtrack 7 (profile and settings). For now it shows only a title and a label. The agent of this subtrack builds the real screen.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/index.ts::UnderConstruction
 * @used_by src/features/profile/index.ts::ProfileScreen
 */

// PL: Wspólny ekran „W budowie”.
// EN: The shared "W budowie" screen.
import { UnderConstruction } from '../../shared';

/**
 * PL: Rysuje tymczasowy ekran podtoru 7. Nie pobiera danych i nie zmienia nic poza ekranem.
 * EN: Draws the temporary screen of subtrack 7. It fetches no data and changes nothing outside the screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ProfileScreen() {
  // PL: Zwróć wspólny ekran „W budowie” z numerem podtoru, żeby test i recenzent widzieli, który to ekran.
  // EN: Return the shared "W budowie" screen with the subtrack number, so a test and a reviewer see which screen it is.
  return <UnderConstruction subtrack="7" title="Profil" />;
}
