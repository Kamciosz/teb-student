/**
 * PL: Rama panelu Samorządu: bramka roli przed ekranami panelu. Ekrany podtorów 3c, 4b, 5b i 8 leżą w tej ramie. Uczeń bez roli widzi ekran 6.1d „Tylko dla Samorządu”, a redakcja tylko Wpisy i ekran główny panelu. Rola jest czytana z serwera (z pamięci telefonu, gdy nie ma internetu). To wygoda: uprawnienia sprawdza serwer (requirePanelRole).
 * EN: The Student Council panel frame: the role gate in front of the panel screens. The screens of subtracks 3c, 4b, 5b and 8 live in this frame. A student without a role sees screen 6.1d "Tylko dla Samorządu", and the editorial team only Entries and the panel main screen. The role is read from the server (from the phone's storage when there is no internet). This is a convenience: the server checks permissions (requirePanelRole).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/queries.ts::usePanelLevel
 * @uses src/features/admin/panelView.ts::canOpenPanelPath
 * @uses src/features/admin/NoAccessScreen.tsx::NoAccessScreen
 * @used_by src/features/admin/index.ts::AdminLayout
 */

import { Outlet, useLocation } from 'react-router';
import './admin.css';
import { Icon } from './icons';
import { NoAccessScreen } from './NoAccessScreen';
import { canOpenPanelPath } from './panelView';
import { usePanelLevel } from './queries';

/**
 * PL: Rysuje ramę panelu: ekran wybrany przez router albo ekran braku dostępu. Nie zmienia nic poza ekranem.
 * EN: Draws the panel frame: the screen the router chose or the no-access screen. It changes nothing outside the screen.
 *
 * @returns PL: drzewo elementów ramy. EN: the tree of frame elements.
 */
export function AdminLayout() {
  const { pathname } = useLocation();
  const query = usePanelLevel();
  const level = query.data;

  // PL: Rola jeszcze nie przyszła. Bez internetu i bez zapisu w telefonie zapytanie czeka w uśpieniu (paused), więc pokazujemy błąd, a nie wieczne wczytywanie.
  // EN: The role has not arrived yet. Without internet and without a saved copy the query waits paused, so we show the error and not endless loading.
  if (level === undefined) {
    const hasFailed = query.isError || query.fetchStatus === 'paused';
    return (
      <main className="ad-screen" data-subtrack="8">
        {hasFailed ? (
          <p className="ad-error" role="alert">
            <Icon name="triangle-alert" />
            Nie udało się pobrać panelu. Spróbuj ponownie za chwilę.
          </p>
        ) : (
          <p className="ad-empty" role="status">Wczytuję panel…</p>
        )}
      </main>
    );
  }

  // PL: Uczeń bez roli albo redakcja pod adresem spoza Wpisów dostaje ekran 6.1d.
  // EN: A student without a role or the editorial team at an address outside Entries gets screen 6.1d.
  if (level === null || !canOpenPanelPath(level, pathname)) return <NoAccessScreen />;

  // PL: Rola wystarcza: pokaż ekran wybrany przez router.
  // EN: The role is enough: show the screen the router chose.
  return <Outlet />;
}
