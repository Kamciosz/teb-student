/**
 * PL: Ekran „Kody zaproszeń” (6.2a i 6.2b w docs/projekt/EKRANY.md): opis, przycisk „Wydaj kod”, po wydaniu kafel „Nowy kod” z datą końca ważności i kopiowaniem, pod nim „Wydane wcześniej” z kodami, które nadal działają (albo pusty stan, gdy nie ma żadnego). Bez internetu przycisk jest nieaktywny, a nad nim stoi „Wydanie kodu wymaga internetu.”.
 * EN: The "Kody zaproszeń" screen (6.2a and 6.2b in docs/projekt/EKRANY.md): the description, the "Wydaj kod" button, after issuing the "Nowy kod" tile with the expiry date and copying, below it "Wydane wcześniej" with the codes that still work (or the empty state when there are none). Without internet the button is disabled and "Wydanie kodu wymaga internetu." stands above it.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/queries.ts::useIssueInvite
 * @uses src/features/admin/queries.ts::useInvites
 * @uses src/features/admin/useOnline.ts::useOnline
 * @uses src/features/admin/panelView.ts::formatInviteEnd
 * @uses src/features/admin/CopyCodeButton.tsx::CopyCodeButton
 * @uses src/features/admin/InviteList.tsx::InviteList
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/shared/index.ts::Button
 * @used_by src/features/admin/AdminScreen.tsx::InvitesScreen
 */

// PL: Wspólny nagłówek ekranu i przycisk.
// EN: The shared screen header and the button.
import { Button, ScreenHeader } from '../../shared';
import { CopyCodeButton } from './CopyCodeButton';
import { Icon } from './icons';
import { InviteList } from './InviteList';
import { formatInviteEnd } from './panelView';
import { useInvites, useIssueInvite } from './queries';
import { useOnline } from './useOnline';

/**
 * PL: Rysuje ekran kodów zaproszeń. Przycisk prosi serwer o nowy kod (zmienia bazę), ekran pokazuje ostatnio wydany kod i listę kodów, które nadal działają.
 * EN: Draws the invitation codes screen. The button asks the server for a new code (changes the database), the screen shows the last issued code and the list of codes that still work.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function InvitesScreen() {
  const isOnline = useOnline();
  const issue = useIssueInvite();
  // PL: Lista kodów, które nadal działają (z pamięci podręcznej, gdy jest).
  // EN: The list of codes that still work (from the cache, when there is one).
  const codes = useInvites();

  return (
    <main className="ad-screen" data-subtrack="8">
      <ScreenHeader title="Kody zaproszeń" backTo="/admin" backLabel="Panel" />
      {/* PL: Do kogo jest kod i jak długo działa. EN: Who the code is for and how long it works. */}
      <p className="ad-lead">Dla osób bez szkolnej skrzynki. Kod działa jeden raz i jest ważny 14 dni.</p>
      <NewCodeTile invite={issue.data} />
      {/* PL: Kody, które nadal działają, albo pusty stan, albo błąd pobrania. EN: The codes that still work, or the empty state, or the fetch error. */}
      <InviteList codes={codes.data} isError={codes.isError} shownCode={issue.data?.code} />
      {/* PL: Dół ekranu: napis o internecie albo błąd nad głównym przyciskiem. EN: The bottom of the screen: the internet text or the error above the main button. */}
      <div className="ad-bottom">
        {isOnline ? null : <p className="ad-hint">Wydanie kodu wymaga internetu.</p>}
        {issue.isError ? (
          <p className="ad-error" role="alert">
            <Icon name="triangle-alert" />
            Nie udało się wydać kodu. Spróbuj ponownie za chwilę.
          </p>
        ) : null}
        <Button disabled={!isOnline || issue.isPending} onClick={() => issue.mutate()}>
          <Icon name="plus" />
          Wydaj kod
        </Button>
      </div>
    </main>
  );
}

/**
 * PL: Kafel „Nowy kod” po udanym wydaniu: kod, data końca i kopiowanie. Przed wydaniem kafla nie ma.
 * EN: The "Nowy kod" tile after a successful issue: the code, the end date and copying. Before an issue there is no tile.
 *
 * @param props - PL: wydany kod albo brak (przed wydaniem). EN: the issued code, or nothing (before an issue).
 * @returns PL: kafel albo nic. EN: the tile or nothing.
 */
function NewCodeTile({ invite }: { invite: { code: string; expiresAt: string } | undefined }) {
  if (!invite) return null;
  // PL: Nowy kod: pokazuje się po udanym wydaniu. Atrybut aria-live sprawia, że czytnik ekranu odczyta nowy kod. EN: The new code: it shows after a successful issue. aria-live makes a screen reader read the new code.
  return (
    <section className="ad-code-tile" aria-live="polite">
      <span className="ad-label">Nowy kod</span>
      <span className="ad-code">{invite.code}</span>
      <small>Ważny 14 dni, do {formatInviteEnd(invite.expiresAt)}.</small>
      {/* PL: Klucz z kodem zeruje napis „Skopiowano” przy każdym nowym kodzie. EN: The key with the code resets the "Skopiowano" label for every new code. */}
      <CopyCodeButton key={invite.code} code={invite.code} />
    </section>
  );
}
