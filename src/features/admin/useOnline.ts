/**
 * PL: Hook mówiący, czy telefon ma sieć. Ekrany panelu wyłączają przez niego przyciski zapisu i pokazują napis „… wymaga internetu.” (zasada wspólna ekranów 6.x w docs/projekt/EKRANY.md).
 * EN: A hook that says whether the phone has a network. The panel screens use it to disable the save buttons and show the "… wymaga internetu." text (the shared rule of the 6.x screens in docs/projekt/EKRANY.md).
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/admin/InvitesScreen.tsx::useOnline
 */

import { useSyncExternalStore } from 'react';

/**
 * PL: Zapisuje się na zmiany stanu sieci w przeglądarce.
 * EN: Subscribes to network state changes in the browser.
 *
 * @param onChange - PL: funkcja do wywołania przy zmianie. EN: the function to call on a change.
 * @returns PL: funkcja kończąca zapis. EN: the function that ends the subscription.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

/**
 * PL: Podaje, czy telefon ma sieć, i odświeża ekran przy zmianie.
 * EN: Says whether the phone has a network and refreshes the screen on a change.
 *
 * @returns PL: true, gdy jest sieć. EN: true when there is a network.
 */
export function useOnline(): boolean {
  // PL: Stan sieci z przeglądarki; przy renderowaniu bez przeglądarki zakładamy, że sieć jest.
  // EN: The network state from the browser; when rendering without a browser we assume there is a network.
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
