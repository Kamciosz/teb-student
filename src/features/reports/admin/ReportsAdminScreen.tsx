/**
 * PL: Ekran „W budowie” podtoru 4b (zgłoszenia w panelu: zmiana etapu). Tymczasowo pokazuje tylko napis. Właściwy ekran zbuduje agent tego podtoru.
 * EN: The "W budowie" (under construction) screen of subtrack 4b (reports in the panel: stage change). For now it shows only a label. The agent of this subtrack builds the real screen.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/index.ts::UnderConstruction
 * @used_by src/features/reports/admin/index.ts::ReportsAdminScreen
 */

// PL: Wspólny ekran „W budowie”.
// EN: The shared "W budowie" screen.
import { UnderConstruction } from '../../../shared';

/**
 * PL: Rysuje tymczasowy ekran podtoru 4b. Nie pobiera danych i nie zmienia nic poza ekranem.
 * EN: Draws the temporary screen of subtrack 4b. It fetches no data and changes nothing outside the screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ReportsAdminScreen() {
  // PL: Zwróć wspólny ekran „W budowie” z numerem podtoru, żeby test i recenzent widzieli, który to ekran.
  // EN: Return the shared "W budowie" screen with the subtrack number, so a test and a reviewer see which screen it is.
  return <UnderConstruction subtrack="4b" />;
}
