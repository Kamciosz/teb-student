/**
 * PL: Bramka roli dla ekranów panelu po stronie telefonu. Zakłada ją na swoim ekranie każdy moduł, który leży w ramie panelu (3c, 4b, 5b i podtor 8). Uczeń bez wystarczającej roli widzi ekran 6.1d „Tylko dla Samorządu”. To wygoda, a nie zabezpieczenie: uprawnienia sprawdza serwer (requirePanelRole). Rola jest czytana z serwera, a bez internetu z pamięci telefonu.
 * EN: The role gate for the panel screens on the phone side. Every module that lives in the panel frame (3c, 4b, 5b and subtrack 8) puts it on its own screen. A student without a sufficient role sees screen 6.1d "Tylko dla Samorządu". This is a convenience, not a protection: the server checks permissions (requirePanelRole). The role is read from the server, and without internet from the phone's storage.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/queries.ts::usePanelLevel
 * @uses src/features/admin/panelView.ts::isLevelEnough
 * @uses src/features/admin/NoAccessScreen.tsx::NoAccessScreen
 * @used_by src/features/admin/index.ts::PanelGate
 * @used_by src/features/admin/AdminScreen.tsx::PanelGate
 */

import type { ReactNode } from 'react';
import './admin.css';
import type { PanelLevel } from './api';
import { Icon } from './icons';
import { NoAccessScreen } from './NoAccessScreen';
import { isLevelEnough } from './panelView';
import { usePanelLevel } from './queries';

/**
 * PL: Przepuszcza ucznia z wystarczającą rolą, a innemu pokazuje ekran 6.1d. Gdy rola jeszcze się wczytuje, pokazuje krótki napis. Nie zmienia nic poza ekranem.
 * EN: Lets a student with a sufficient role through and shows screen 6.1d to others. While the role is loading it shows a short text. It changes nothing outside the screen.
 *
 * @param props - PL: najniższa rola, która wystarcza (domyślnie redakcja, czyli każda rola), i ekran do pokazania. EN: the lowest role that is enough (the editorial team by default, that is any role) and the screen to show.
 * @returns PL: ekran, napis albo ekran braku dostępu. EN: the screen, a text or the no-access screen.
 */
export function PanelGate({ minimum = 'editor', children }: { minimum?: PanelLevel; children: ReactNode }) {
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

  // PL: Uczeń bez roli albo z rolą za niską dostaje ekran 6.1d.
  // EN: A student without a role or with a too low role gets screen 6.1d.
  if (level === null || !isLevelEnough(level, minimum)) return <NoAccessScreen />;

  // PL: Rola wystarcza: pokaż ekran modułu.
  // EN: The role is enough: show the module screen.
  return <>{children}</>;
}
