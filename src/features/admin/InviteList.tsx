/**
 * PL: Lista kodów zaproszeń na ekranie 6.2 z docs/projekt/EKRANY.md: „Wydane wcześniej” (6.2b) z kodami, które nadal działają, przy każdym kopiowanie, albo pusty stan „Ważne kody” (6.2a), gdy nie ma żadnego kodu. Błąd pobrania listy stoi w tym samym miejscu. Dopóki lista się wczytuje, nic nie rysuje. Kod, który właśnie pokazuje kafel „Nowy kod”, nie jest tu drugi raz.
 * EN: The list of invitation codes on screen 6.2 in docs/projekt/EKRANY.md: "Wydane wcześniej" (6.2b) with the codes that still work, each with copying, or the empty state "Ważne kody" (6.2a) when there is no code. A list-loading error stands in the same place. While the list loads, nothing is drawn. The code that the "Nowy kod" tile is showing right now is not listed a second time.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/admin/api.ts::InviteCode
 * @uses src/features/admin/CopyCodeButton.tsx::CopyCodeButton
 * @uses src/features/admin/panelView.ts::formatInviteEnd
 * @uses src/features/admin/icons.tsx::Icon
 * @used_by src/features/admin/InvitesScreen.tsx::InviteList
 */

import type { InviteCode } from './api';
import { CopyCodeButton } from './CopyCodeButton';
import { Icon } from './icons';
import { formatInviteEnd } from './panelView';

/** PL: Wejście komponentu listy: kody z serwera (albo brak), błąd pobrania i kod z kafla „Nowy kod”. EN: The input of the list component: the codes from the server (or none), the loading error and the code of the "Nowy kod" tile. */
type InviteListProps = {
  /** PL: Kody, które nadal działają; undefined, dopóki lista się nie wczytała. EN: The codes that still work; undefined until the list has loaded. */
  codes: InviteCode[] | undefined;
  /** PL: Czy pobranie listy się nie udało. EN: Whether fetching the list failed. */
  isError: boolean;
  /** PL: Kod pokazany już na kaflu „Nowy kod” (nie powtarza się na liście). EN: The code already shown on the "Nowy kod" tile (it is not repeated in the list). */
  shownCode?: string;
};

/**
 * PL: Rysuje część ekranu z kodami poniżej kafla „Nowy kod”: listę, pusty stan albo błąd.
 * EN: Draws the part of the screen with the codes below the "Nowy kod" tile: the list, the empty state or the error.
 *
 * @param props - PL: kody, stan błędu i kod z kafla. EN: the codes, the error state and the code of the tile.
 * @returns PL: element listy albo null. EN: the list element or null.
 */
export function InviteList({ codes, isError, shownCode }: InviteListProps) {
  // PL: Lista jeszcze się wczytuje: nic nie pokazujemy, chyba że pobranie się nie udało.
  // EN: The list is still loading: we show nothing, unless the fetch failed.
  if (codes === undefined) return isError ? <ListError /> : null;

  // PL: Bez kafla „Nowy kod” kod z kafla nie jest odfiltrowany, więc pusta lista to tylko brak kodów.
  // EN: Without the "Nowy kod" tile nothing is filtered out, so an empty list only means there are no codes.
  const others = codes.filter((item) => item.code !== shownCode);
  if (others.length > 0) return <CodeRows codes={others} />;
  return shownCode ? null : <NoCodes />;
}

/**
 * PL: Rysuje nagłówek „Wydane wcześniej” i kafel z wierszami kodów, każdy z kopiowaniem.
 * EN: Draws the "Wydane wcześniej" heading and the tile with the code rows, each with copying.
 *
 * @param props - PL: kody do pokazania. EN: the codes to show.
 * @returns PL: nagłówek i lista. EN: the heading and the list.
 */
function CodeRows({ codes }: { codes: InviteCode[] }) {
  return (
    <>
      {/* PL: Nagłówek listy z odstępem 8 pod nim (6.2b). EN: The list heading with 8 below it (6.2b). */}
      <span className="ad-label ad-label-below">Wydane wcześniej</span>
      <ul className="ad-tile">
        {codes.map((item) => (
          <li key={item.code}>
            {/* PL: Wiersz: kod i data końca, a z prawej kopiowanie. EN: The row: the code and the end date, and copying on the right. */}
            <div className="ad-row">
              <div className="ad-row-text">
                <span className="ad-code-row">{item.code}</span>
                <small>do {formatInviteEnd(item.expiresAt)}</small>
              </div>
              <CopyCodeButton code={item.code} compact />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * PL: Pusty stan z 6.2a: nie ma ważnych kodów, a kod wydaje przycisk na dole.
 * EN: The empty state from 6.2a: there are no valid codes, and the button at the bottom issues one.
 *
 * @returns PL: nagłówek i kafel z pustym stanem. EN: the heading and the tile with the empty state.
 */
function NoCodes() {
  return (
    <>
      {/* PL: Nagłówek „Ważne kody” z odstępem 8 pod nim (6.2a). EN: The "Ważne kody" heading with 8 below it (6.2a). */}
      <span className="ad-label ad-label-below">Ważne kody</span>
      <div className="ad-empty-tile">
        {/* PL: Ikona biletu, tytuł i podpowiedź, jak w projekcie. EN: The ticket icon, the title and the hint, as in the design. */}
        <Icon name="ticket" />
        <h2>Nie ma ważnych kodów</h2>
        <small>Dotknij „Wydaj kod”, żeby wydać pierwszy.</small>
      </div>
    </>
  );
}

/**
 * PL: Komunikat o błędzie pobrania listy, w tym samym wyglądzie co błąd wydania.
 * EN: The message about the failed list fetch, in the same look as the issue error.
 *
 * @returns PL: element błędu. EN: the error element.
 */
function ListError() {
  return (
    <p className="ad-error" role="alert">
      <Icon name="triangle-alert" />
      Nie udało się pobrać kodów. Spróbuj ponownie za chwilę.
    </p>
  );
}
