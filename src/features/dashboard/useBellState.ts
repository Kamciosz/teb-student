/**
 * PL: Hook pulpitu: bieżący stan licznika do dzwonka i stan dnia, odświeżane co 30 sekund, gdy karta jest widoczna (logika w bellTicker.ts). Startuje od razu z odczytem z chwili wyrenderowania. Oba stany liczone są razem przy każdym odczycie, więc napis dnia zmienia się przy przejściu przez północ albo przy początku lekcji, nawet gdy licznik zostaje pusty.
 * EN: Dashboard hook: the current bell countdown state and the day state, refreshed every 30 seconds while the tab is visible (logic in bellTicker.ts). It starts at once with the reading from the moment of rendering. Both states are computed together on every read, so the day text changes at midnight or at the start of a lesson, even when the countdown stays empty.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/index.ts::currentBellState
 * @uses src/features/bell/index.ts::bellDayStatus
 * @uses src/features/bell/index.ts::BellState
 * @uses src/features/bell/index.ts::BellDayStatus
 * @uses src/features/dashboard/bellTicker.ts::startBellTicker
 * @used_by src/features/dashboard/DashboardHeader.tsx::DashboardHeader
 */

// PL: Hook React do stanu i efektu odświeżania.
// EN: React hooks for state and the refresh effect.
import { useEffect, useState } from 'react';
// PL: Stan licznika, stan dnia i ich odczyty z drzwi modułu bell.
// EN: The countdown state, the day state and their reads from the bell module door.
import { bellDayStatus, currentBellState, type BellDayStatus, type BellState } from '../bell';
// PL: Odświeżanie zależne od widoczności karty.
// EN: The refresh that depends on tab visibility.
import { startBellTicker } from './bellTicker';

/**
 * PL: Odczyt pulpitu w jednej chwili: stan licznika (albo null) i stan dnia.
 * EN: The dashboard reading at one moment: the countdown state (or null) and the day state.
 */
export type BellSnapshot = { state: BellState | null; day: BellDayStatus };

/**
 * PL: Czyta stan licznika i stan dnia dla bieżącej chwili. Zawsze zwraca nowy obiekt, więc każdy takt zegara wymusza nowy rysunek, nawet gdy licznik nadal jest pusty.
 * EN: Reads the countdown state and the day state for the current moment. It always returns a new object, so every clock tick forces a new drawing, even when the countdown is still empty.
 *
 * @returns PL: odczyt pulpitu. EN: the dashboard reading.
 */
export function readBellSnapshot(): BellSnapshot {
  return { state: currentBellState(), day: bellDayStatus() };
}

/**
 * PL: Zwraca odczyt pulpitu i odświeża go, dopóki komponent jest na ekranie. Po wyjściu z ekranu zegar i słuchacz są usuwane.
 * EN: Returns the dashboard reading and refreshes it while the component is on screen. After leaving the screen the timer and the listener are removed.
 *
 * @returns PL: stan licznika i stan dnia. EN: the countdown state and the day state.
 */
export function useBellState(): BellSnapshot {
  // PL: Odczyt startowy z bieżącej chwili, żeby pierwszy rysunek nie czekał na zegar.
  // EN: The start reading from the current moment, so the first drawing does not wait for the timer.
  const [snapshot, setSnapshot] = useState<BellSnapshot>(readBellSnapshot);

  // PL: Odświeżanie włącza się przy montowaniu i wyłącza przy odmontowaniu.
  // EN: The refresh turns on at mount and off at unmount.
  useEffect(() => startBellTicker({ read: readBellSnapshot, onChange: setSnapshot, page: document }), []);

  return snapshot;
}
