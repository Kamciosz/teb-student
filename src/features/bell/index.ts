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
 * @uses src/features/bell/bellPlan.ts::SHORTENED_BELL_PLAN
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Plany dzwonków: zwykły i skrócony, z których pulpit bierze stan bieżącej chwili.
// EN: The bell plans, regular and shortened, the dashboard takes the current state from.
import { BELL_PLAN, SHORTENED_BELL_PLAN } from './bellPlan';
// PL: Logika stanu licznika (dla planu podanego z zewnątrz) i data dnia w strefie szkoły.
// EN: The countdown state logic (for a plan passed in from outside) and the day's date in the school zone.
import { getBellState, warsawDate, type BellState } from './bellState';

// PL: Ekran podtoru 6.
// EN: The screen of subtrack 6.
export { BellScreen } from './BellScreen';
// PL: Licznik do dzwonka i jego logika stanu (typy BellState i NextLesson do użycia przez pulpit).
// EN: The bell countdown and its state logic (the BellState and NextLesson types for the dashboard).
export { BellCountdown } from './BellCountdown';
export { getBellState, type BellState, type NextLesson } from './bellState';

/**
 * PL: Stan licznika dla podanej chwili (domyślnie teraz) z planu szkoły. Dzień z listy dni skróconych (RRRR-MM-DD, czas polski) bierze plan skrócony, pozostałe dni zwykły. Zwraca null, gdy planu nie ma (pusty plan) albo nie trwa lekcja ani przerwa (przed pierwszą, po ostatniej, weekend).
 * EN: The countdown state for a given moment (default: now) from the school plan. A day in the list of shortened days (YYYY-MM-DD, Polish time) takes the shortened plan, other days the regular one. Returns null when there is no plan (empty plan) or no lesson or break is on (before the first, after the last, weekend).
 *
 * @param now - PL: chwila w czasie. EN: the moment in time.
 * @param shortenedDays - PL: dni skrócone, każdy w formacie RRRR-MM-DD (domyślnie żaden). EN: the shortened days, each as YYYY-MM-DD (none by default).
 * @returns PL: stan licznika albo null. EN: the countdown state or null.
 */
export function currentBellState(now: Date = new Date(), shortenedDays: ReadonlySet<string> = new Set()): BellState | null {
  // PL: Wybór planu według dnia tej chwili w strefie szkoły.
  // EN: Choose the plan by the day of this moment in the school zone.
  const plan = shortenedDays.has(warsawDate(now)) ? SHORTENED_BELL_PLAN : BELL_PLAN;
  return getBellState(plan, now);
}
