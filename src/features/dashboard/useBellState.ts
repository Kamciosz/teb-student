/**
 * PL: Hook pulpitu: bieżący stan licznika do dzwonka, odświeżany co 30 sekund, gdy karta jest widoczna (logika w bellTicker.ts). Startuje od razu ze stanem z chwili wyrenderowania.
 * EN: Dashboard hook: the current bell countdown state, refreshed every 30 seconds while the tab is visible (logic in bellTicker.ts). It starts at once with the state at the moment of rendering.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/index.ts::currentBellState
 * @uses src/features/dashboard/bellTicker.ts::startBellTicker
 * @used_by src/features/dashboard/DashboardHeader.tsx::DashboardHeader
 */

// PL: Hook React do stanu i efektu odświeżania.
// EN: React hooks for state and the refresh effect.
import { useEffect, useState } from 'react';
// PL: Stan licznika i jego odczyt z drzwi modułu bell.
// EN: The countdown state and its read from the bell module door.
import { currentBellState, type BellState } from '../bell';
// PL: Odświeżanie licznika zależne od widoczności karty.
// EN: The refresh of the countdown that depends on tab visibility.
import { startBellTicker } from './bellTicker';

/**
 * PL: Zwraca stan licznika do dzwonka i odświeża go, dopóki komponent jest na ekranie. Po wyjściu z ekranu zegar i słuchacz są usuwane.
 * EN: Returns the bell countdown state and refreshes it while the component is on screen. After leaving the screen the timer and the listener are removed.
 *
 * @returns PL: stan licznika albo null, gdy nie trwa lekcja ani przerwa. EN: the countdown state, or null when no lesson or break is on.
 */
export function useBellState(): BellState | null {
  // PL: Stan startowy z bieżącej chwili, żeby pierwszy rysunek nie czekał na zegar.
  // EN: The start state from the current moment, so the first drawing does not wait for the timer.
  const [state, setState] = useState<BellState | null>(() => currentBellState());

  // PL: Odświeżanie włącza się przy montowaniu i wyłącza przy odmontowaniu.
  // EN: The refresh turns on at mount and off at unmount.
  useEffect(() => startBellTicker({ read: currentBellState, onChange: setState, page: document }), []);

  return state;
}
