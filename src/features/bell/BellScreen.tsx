/**
 * PL: Ekran podtoru 6 (licznik do dzwonka). Pokazuje licznik; bez planu dzwonków ekran jest pusty, bo licznik się nie pokazuje.
 * EN: The screen of subtrack 6 (bell countdown). Shows the countdown; without a bell plan the screen is empty, because the countdown does not show.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/bell/BellCountdown.tsx::BellCountdown
 * @used_by src/features/bell/index.ts::BellScreen
 */

// PL: Licznik do dzwonka.
// EN: The bell countdown.
import { BellCountdown } from './BellCountdown';

/**
 * PL: Rysuje ekran podtoru 6. Nie pobiera danych z serwera.
 * EN: Draws the screen of subtrack 6. It fetches no data from the server.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function BellScreen() {
  // PL: Licznik zajmuje cały ekran; sam decyduje, czy się pokazać.
  // EN: The countdown fills the screen; it decides by itself whether to show.
  return (
    <div className="bell-screen">
      <BellCountdown />
    </div>
  );
}
