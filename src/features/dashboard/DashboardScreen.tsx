/**
 * PL: Ekran „W budowie” podtoru 9 (pulpit). Tymczasowo pokazuje tylko tytuł i napis. Właściwy ekran zbuduje agent tego podtoru.
 * EN: The "W budowie" (under construction) screen of subtrack 9 (dashboard). For now it shows only a title and a label. The agent of this subtrack builds the real screen.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/index.ts::UnderConstruction
 * @uses src/shared/index.ts::Dock
 * @used_by src/features/dashboard/index.ts::DashboardScreen
 */

// PL: Wspólny ekran „W budowie” i dolny pasek nawigacji.
// EN: The shared "W budowie" screen and the bottom navigation bar.
import { Dock, UnderConstruction } from '../../shared';

/**
 * PL: Rysuje tymczasowy ekran podtoru 9. Nie pobiera danych i nie zmienia nic poza ekranem.
 * EN: Draws the temporary screen of subtrack 9. It fetches no data and changes nothing outside the screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function DashboardScreen() {
  // PL: Zwróć ekran „W budowie” z numerem podtoru, a pod nim dolny pasek. W docs/projekt/EKRANY.md dolny pasek ma ten ekran.
  // EN: Return the "W budowie" screen with the subtrack number, and the bottom bar under it. In docs/projekt/EKRANY.md this screen has the bottom bar.
  return (
    <>
      <UnderConstruction subtrack="9" title="Pulpit" />
      <Dock />
    </>
  );
}
