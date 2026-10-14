/**
 * PL: Ekran podtoru 6 (licznik do dzwonka). Pokazuje licznik; bez planu dzwonków pokazuje krótki napis „Brak planu dzwonków”, bo pusty ekran wygląda na błąd (pulpit prowadzi tu z tego napisu). Osobie z rolą Samorządu pokazuje też przełącznik „Lekcje skrócone dziś”; uczeń go nie widzi.
 * EN: The screen of subtrack 6 (bell countdown). Shows the countdown; without a bell plan it shows the short text "Brak planu dzwonków", because an empty screen looks like a fault (the dashboard links here from that text). The person with the Student Council role also sees the "Lekcje skrócone dziś" switch; a student does not see it.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/index.ts::usePanelEntry
 * @uses src/features/bell/BellCountdown.tsx::BellCountdown
 * @uses src/features/bell/ShortenedDaySwitch.tsx::ShortenedDaySwitch
 * @uses src/features/bell/shortenedQueries.ts::useShortenedDays
 * @uses src/features/bell/bellState.ts::hasBellPlan
 * @used_by src/features/bell/index.ts::BellScreen
 */

// PL: Rola zalogowanej osoby w panelu (żeby pokazać przełącznik tylko Samorządowi).
// EN: The role of the logged-in person in the panel (to show the switch only to the Council).
import { usePanelEntry } from '../admin';
// PL: Licznik do dzwonka, przełącznik dni skróconych i lista tych dni.
// EN: The bell countdown, the shortened-day switch and the list of those days.
import { BellCountdown } from './BellCountdown';
import { ShortenedDaySwitch } from './ShortenedDaySwitch';
import { hasBellPlan } from './bellState';
import { useShortenedDays } from './shortenedQueries';

// PL: Etykieta panelu Samorządu z admin/queries.ts (panelEntryFor). Po niej poznajemy Samorząd.
// EN: The label of the Student Council panel from admin/queries.ts (panelEntryFor). We know the Council by it.
const COUNCIL_LABEL = 'Panel Samorządu';
// PL: Napis, gdy planu dzwonków nie ma. Ten sam co na pulpicie. TO_AGREE: tekstu nie ma w EKRANY.md, uzgodnić z zespołem.
// EN: The text shown when there is no bell plan. The same as on the dashboard. TO_AGREE: the text is not in EKRANY.md, to be agreed with the team.
const NO_PLAN_TEXT = 'Brak planu dzwonków';

/**
 * PL: Rysuje ekran podtoru 6. Dane dni skróconych bierze z zapytania; przełącznik pokazuje tylko, gdy wejście do panelu to Samorząd. Gdy planu dnia nie ma, pokazuje napis zamiast licznika.
 * EN: Draws the screen of subtrack 6. It takes the shortened days from the query; the switch shows only when the panel entry is the Council. When there is no plan for the day, it shows a text instead of the countdown.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function BellScreen() {
  // PL: Wejście do panelu zależy od roli; gdy rola się nie wczytała, przełącznika nie ma.
  // EN: The panel entry depends on the role; when the role has not loaded, there is no switch.
  const entry = usePanelEntry();
  const shortenedDays = useShortenedDays();
  const isCouncil = entry?.label === COUNCIL_LABEL;
  // PL: Czy dzisiejszy dzień ma wpisany plan (zwykły albo skrócony). Bez planu licznik się nie pokaże, więc mówimy to wprost.
  // EN: Whether today has a plan entered (regular or shortened). Without a plan the countdown does not show, so we say so.
  const hasPlan = hasBellPlan(new Date(), shortenedDays);
  // PL: Licznik zajmuje cały ekran; sam decyduje, czy się pokazać.
  // EN: The countdown fills the screen; it decides by itself whether to show.
  return (
    <div className="bell-screen">
      {isCouncil ? <ShortenedDaySwitch /> : null}
      {hasPlan ? null : <p className="bell-empty">{NO_PLAN_TEXT}</p>}
      <BellCountdown shortenedDays={shortenedDays} />
    </div>
  );
}
