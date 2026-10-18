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
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/shared/index.ts::EmptyState
 * @used_by src/features/admin/InvitesScreen.tsx::InviteList
 */

// PL: Wspólne elementy listy: grupa, wiersz i pusty stan.
// EN: The shared list elements: the group, the row and the empty state.
import { EmptyState, ListGroup, ListRow } from '../../shared';
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
 * PL: Rysuje grupę „Wydane wcześniej” z wierszami kodów, każdy z kopiowaniem.
 * EN: Draws the "Wydane wcześniej" group with the code rows, each with copying.
 *
 * @param props - PL: kody do pokazania. EN: the codes to show.
 * @returns PL: grupa wierszy. EN: the group of rows.
 */
function CodeRows({ codes }: { codes: InviteCode[] }) {
  return (
    <ListGroup header="Wydane wcześniej">
      {codes.map((item) => (
        <ListRow
          key={item.code}
          title={<span className="ad-code-row">{item.code}</span>}
          subtitle={`do ${formatInviteEnd(item.expiresAt)}`}
          value={<CopyCodeButton code={item.code} compact />}
        />
      ))}
    </ListGroup>
  );
}

/**
 * PL: Pusty stan z 6.2a: nie ma ważnych kodów, a kod wydaje przycisk na dole. Nagłówek „Ważne kody” stoi nad pustym kaflem.
 * EN: The empty state from 6.2a: there are no valid codes, and the button at the bottom issues one. The "Ważne kody" heading stands above the empty tile.
 *
 * @returns PL: nagłówek i pusty stan. EN: the heading and the empty state.
 */
function NoCodes() {
  return (
    <>
      <span className="ad-label ad-label-below">Ważne kody</span>
      <EmptyState title="Nie ma ważnych kodów">
        {/* PL: Podpowiedź pod tytułem pustego stanu. EN: The hint under the empty state title. */}
        <small>Dotknij „Wydaj kod”, żeby wydać pierwszy.</small>
      </EmptyState>
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
