/**
 * PL: Pasek braku internetu na górze aplikacji. Pokazuje się tylko wtedy, gdy telefon nie ma sieci, i mówi, od kiedy dane są stare (chwila ostatniego udanego pobrania z pamięci zapytań). Jest jeden, w korzeniu aplikacji, więc ekrany podtorów go nie rysują.
 * EN: The no-internet bar at the top of the app. It shows only when the phone has no network and says since when the data is stale (the moment of the last successful fetch from the query cache). There is one, at the app root, so subtrack screens do not draw it.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/ui/OfflineNotice.tsx::OfflineNotice
 * @uses src/shared/query/queryClient.ts::queryClient
 * @used_by src/App.tsx::App
 */

// PL: useSyncExternalStore czyta dane spoza Reacta (stan sieci, pamięć zapytań) bez migotania.
// EN: useSyncExternalStore reads data from outside React (network state, query cache) without flicker.
import { useSyncExternalStore } from 'react';
// PL: Jedyny klient zapytań, z którego bierzemy chwilę ostatniego pobrania.
// EN: The only query client, from which we take the last-fetch moment.
import { queryClient } from '../query/queryClient';
// PL: Sam napis.
// EN: The label itself.
import { OfflineNotice } from './OfflineNotice';

/**
 * PL: Zapisuje się na zmiany stanu sieci w przeglądarce.
 * EN: Subscribes to network state changes in the browser.
 *
 * @param onChange - PL: funkcja do wywołania przy zmianie. EN: the function to call on a change.
 * @returns PL: funkcja kończąca zapis. EN: the function that ends the subscription.
 */
function subscribeToNetwork(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

/**
 * PL: Podaje chwilę ostatniego udanego pobrania danych (najnowszy dataUpdatedAt) albo 0, gdy nic nie pobrano.
 * EN: Returns the moment of the last successful data fetch (the newest dataUpdatedAt) or 0 when nothing was fetched.
 *
 * @returns PL: milisekundy od 1970 albo 0. EN: milliseconds since 1970 or 0.
 */
function getLastUpdate(): number {
  return Math.max(0, ...queryClient.getQueryCache().getAll().map((query) => query.state.dataUpdatedAt));
}

/**
 * PL: Rysuje pasek braku internetu albo nic, gdy sieć jest.
 * EN: Draws the no-internet bar or nothing when the network is up.
 *
 * @returns PL: napis albo null. EN: the label or null.
 */
export function OfflineBanner() {
  // PL: Stan sieci. Na serwerze (bez window) uznajemy, że sieć jest.
  // EN: The network state. On a server (no window) we assume the network is up.
  const online = useSyncExternalStore(
    subscribeToNetwork,
    () => navigator.onLine,
    () => true,
  );
  // PL: Chwila ostatniego pobrania; przelicza się, gdy pamięć zapytań się zmieni (w tym po odczycie zapisu z telefonu).
  // EN: The last-fetch moment; recomputed when the query cache changes (including after reading the saved data from the phone).
  const lastUpdate = useSyncExternalStore(
    (onChange) => queryClient.getQueryCache().subscribe(onChange),
    getLastUpdate,
    () => 0,
  );

  // PL: Z internetem nic nie pokazujemy.
  // EN: With internet we show nothing.
  if (online) return null;
  return <OfflineNotice staleSince={lastUpdate === 0 ? null : lastUpdate} />;
}
