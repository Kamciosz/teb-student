/**
 * PL: Ekran podtoru 6 (licznik do dzwonka). Pokazuje licznik; bez planu dzwonków pokazuje krótki napis „Brak planu dzwonków”, bo pusty ekran wygląda na błąd.
 * EN: The screen of subtrack 6 (bell countdown). Shows the countdown; without a bell plan it shows the short text "Brak planu dzwonków", because an empty screen looks like a fault.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/bell/BellCountdown.tsx::BellCountdown
 * @uses src/features/bell/bellState.ts::hasBellPlan
 * @used_by src/features/bell/index.ts::BellScreen
 */

// PL: Licznik do dzwonka.
// EN: The bell countdown.
import { BellCountdown } from './BellCountdown';
import { hasBellPlan } from './bellState';

// PL: Napis, gdy planu dzwonków nie ma. Ten sam co na pulpicie.
// EN: The text shown when there is no bell plan. The same as on the dashboard.
const NO_PLAN_TEXT = 'Brak planu dzwonków';

/**
 * PL: Rysuje ekran podtoru 6. Gdy planu nie ma, pokazuje napis zamiast licznika.
 * EN: Draws the screen of subtrack 6. When there is no plan, it shows a text instead of the countdown.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function BellScreen() {
  // PL: Licznik zajmuje cały ekran; sam decyduje, czy się pokazać. Plan bez lekcji mówimy wprost, bo licznika wtedy nie będzie.
  // EN: The countdown fills the screen; it decides by itself whether to show. A plan with no lessons is said outright, because there will be no countdown then.
  return (
    <div className="bell-screen">
      {hasBellPlan() ? null : <p className="bell-empty">{NO_PLAN_TEXT}</p>}
      <BellCountdown />
    </div>
  );
}
