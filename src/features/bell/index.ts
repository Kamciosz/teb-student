/**
 * PL: Drzwi podtoru 6 (licznik do dzwonka) po stronie telefonu. Wystawia ekran dla routera i licznik oraz logikę dla pulpitu (podtor 9). Inne moduły importują tylko stąd.
 * EN: The door of subtrack 6 (bell countdown) on the phone side. Exposes the screen to the router and the countdown and its logic to the dashboard (subtrack 9). Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/bell/BellScreen.tsx::BellScreen
 * @uses src/features/bell/BellCountdown.tsx::BellCountdown
 * @uses src/features/bell/bellState.ts::getBellState
 * @uses src/features/bell/bellPlan.ts::BELL_PLAN
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Plan dzwonków, z którego pulpit bierze stan bieżącej chwili.
// EN: The bell plan the dashboard takes the current state from.
import { BELL_PLAN } from './bellPlan';
// PL: Logika stanu licznika (dla planu podanego z zewnątrz).
// EN: The countdown state logic (for a plan passed in from outside).
import { getBellState, type BellState } from './bellState';

// PL: Ekran podtoru 6.
// EN: The screen of subtrack 6.
export { BellScreen } from './BellScreen';
// PL: Licznik do dzwonka i jego logika stanu (typy BellState i NextLesson do użycia przez pulpit).
// EN: The bell countdown and its state logic (the BellState and NextLesson types for the dashboard).
export { BellCountdown } from './BellCountdown';
export { getBellState, type BellState, type NextLesson } from './bellState';

/**
 * PL: Stan licznika dla podanej chwili (domyślnie teraz) z planu szkoły. Zwraca null, gdy planu nie ma (pusty plan) albo nie trwa lekcja ani przerwa (przed pierwszą, po ostatniej, weekend).
 * EN: The countdown state for a given moment (default: now) from the school plan. Returns null when there is no plan (empty plan) or no lesson or break is on (before the first, after the last, weekend).
 *
 * @param now - PL: chwila w czasie. EN: the moment in time.
 * @returns PL: stan licznika albo null. EN: the countdown state or null.
 */
export function currentBellState(now: Date = new Date()): BellState | null {
  return getBellState(BELL_PLAN, now);
}
