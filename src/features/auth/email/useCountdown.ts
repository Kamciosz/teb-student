/**
 * PL: Hook odliczania sekund do ponownej wysyłki kodu. Liczy od zegara, a nie od licznika tyknięć, więc po uśpieniu telefonu pokazuje prawdziwy czas.
 * EN: The hook counting seconds to a code resend. It counts from the clock, not from a tick counter, so after the phone sleeps it shows the real time.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/auth/email/CodeStep.tsx::useCountdown
 */

import { useEffect, useState } from 'react';

/**
 * PL: Wynik hooka: ile sekund zostało i jak zacząć od nowa.
 * EN: The hook result: how many seconds are left and how to start over.
 */
export type Countdown = {
  /** PL: Pozostałe sekundy, od pełnej liczby do 0. EN: The seconds left, from the full number down to 0. */
  secondsLeft: number;
  /** PL: Zaczyna odliczanie od początku. EN: Starts the countdown from the beginning. */
  restart: () => void;
};

/**
 * PL: Odlicza podaną liczbę sekund od chwili użycia hooka.
 * EN: Counts down the given number of seconds from the moment the hook is used.
 *
 * @param totalSeconds - PL: długość odliczania. EN: the countdown length.
 * @returns PL: pozostałe sekundy i funkcja restartu. EN: the seconds left and the restart function.
 */
export function useCountdown(totalSeconds: number): Countdown {
  const [endsAt, setEndsAt] = useState(() => Date.now() + totalSeconds * 1000);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  // PL: Co sekundę przelicz, ile zostało do końca. Po restarcie endsAt się zmienia, więc zegar startuje od nowa.
  // EN: Every second recompute how much is left. After a restart endsAt changes, so the timer starts anew.
  useEffect(() => {
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [endsAt]);

  return { secondsLeft, restart: () => setEndsAt(Date.now() + totalSeconds * 1000) };
}
