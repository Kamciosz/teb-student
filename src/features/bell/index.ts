/**
 * PL: Drzwi podtoru 6 (licznik do dzwonka) po stronie telefonu. Wystawia ekran dla routera i licznik oraz logikę dla pulpitu (podtor 9). Inne moduły importują tylko stąd.
 * EN: The door of subtrack 6 (bell countdown) on the phone side. Exposes the screen to the router and the countdown and its logic to the dashboard (subtrack 9). Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/bell/BellScreen.tsx::BellScreen
 * @uses src/features/bell/BellCountdown.tsx::BellCountdown
 * @uses src/features/bell/bellState.ts::getBellState
 * @uses src/features/bell/bellState.ts::currentBellState
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 6.
// EN: The screen of subtrack 6.
export { BellScreen } from './BellScreen';
// PL: Licznik do dzwonka i jego logika stanu (typy BellState i NextLesson do użycia przez pulpit).
// EN: The bell countdown and its state logic (the BellState and NextLesson types for the dashboard).
export { BellCountdown } from './BellCountdown';
// PL: Stan licznika dla danej chwili z planu dnia (zwykłego albo skróconego). Przeniesiona do bellState.ts, żeby licznik nie importował drzwi (cykl).
// EN: The countdown state for a given moment from the plan of the day (regular or shortened). Moved to bellState.ts so that the countdown does not import the door (a cycle).
export { currentBellState, getBellState, type BellState, type NextLesson } from './bellState';
