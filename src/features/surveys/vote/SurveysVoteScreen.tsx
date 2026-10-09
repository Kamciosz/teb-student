/**
 * PL: Ekran „W budowie” podtoru 5a (ankieta: głosowanie). Tymczasowo pokazuje tylko tytuł i napis. Właściwy ekran zbuduje agent tego podtoru.
 * EN: The "W budowie" (under construction) screen of subtrack 5a (survey: voting). For now it shows only a title and a label. The agent of this subtrack builds the real screen.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/index.ts::UnderConstruction
 * @uses src/shared/index.ts::Dock
 * @used_by src/features/surveys/vote/index.ts::SurveysVoteScreen
 */

// PL: Wspólny ekran „W budowie” i dolny pasek nawigacji.
// EN: The shared "W budowie" screen and the bottom navigation bar.
import { Dock, UnderConstruction } from '../../../shared';

/**
 * PL: Rysuje tymczasowy ekran podtoru 5a. Nie pobiera danych i nie zmienia nic poza ekranem.
 * EN: Draws the temporary screen of subtrack 5a. It fetches no data and changes nothing outside the screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SurveysVoteScreen() {
  // PL: Zwróć ekran „W budowie” z numerem podtoru, a pod nim dolny pasek. W docs/projekt/EKRANY.md dolny pasek ma lista ankiet, a ekrany pytań go nie mają, więc agent podtoru zostawia go tylko na liście.
  // EN: Return the "W budowie" screen with the subtrack number, and the bottom bar under it. In docs/projekt/EKRANY.md the survey list has the bottom bar and the question screens do not, so the subtrack agent keeps it on the list only.
  return (
    <>
      <UnderConstruction subtrack="5a" title="Ankiety" />
      <Dock />
    </>
  );
}
