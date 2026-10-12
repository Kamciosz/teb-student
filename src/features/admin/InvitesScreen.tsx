/**
 * PL: Ekran „Kody zaproszeń” (6.2a i 6.2b w docs/projekt/EKRANY.md): opis, przycisk „Wydaj kod” i po wydaniu kafel „Nowy kod” z datą końca ważności i kopiowaniem. Bez internetu przycisk jest nieaktywny, a nad nim stoi „Wydanie kodu wymaga internetu.”. Listy kodów, które nadal działają, tu jeszcze nie ma: moduł zaproszeń (podtor 1b) nie wystawia jej w swoich drzwiach.
 * EN: The "Kody zaproszeń" screen (6.2a and 6.2b in docs/projekt/EKRANY.md): the description, the "Wydaj kod" button and, after issuing, the "Nowy kod" tile with the expiry date and copying. Without internet the button is disabled and "Wydanie kodu wymaga internetu." stands above it. The list of codes that still work is not here yet: the invitations module (subtrack 1b) does not expose it in its door.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/queries.ts::useIssueInvite
 * @uses src/features/admin/useOnline.ts::useOnline
 * @uses src/features/admin/panelView.ts::formatInviteEnd
 * @uses src/features/admin/CopyCodeButton.tsx::CopyCodeButton
 * @used_by src/features/admin/AdminScreen.tsx::InvitesScreen
 */

import { CopyCodeButton } from './CopyCodeButton';
import { Icon } from './icons';
import { formatInviteEnd } from './panelView';
import { useIssueInvite } from './queries';
import { ScreenTop } from './ScreenTop';
import { useOnline } from './useOnline';

/**
 * PL: Rysuje ekran kodów zaproszeń. Przycisk prosi serwer o nowy kod (zmienia bazę), a ekran pokazuje ostatnio wydany kod.
 * EN: Draws the invitation codes screen. The button asks the server for a new code (changes the database), and the screen shows the last issued code.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function InvitesScreen() {
  const isOnline = useOnline();
  const issue = useIssueInvite();
  const invite = issue.data;

  return (
    <>
      <ScreenTop title="Kody zaproszeń" backTo="/admin" backLabel="Wróć do panelu" />
      {/* PL: Do kogo jest kod i jak długo działa. EN: Who the code is for and how long it works. */}
      <p className="ad-lead">Dla osób bez szkolnej skrzynki. Kod działa jeden raz i jest ważny 14 dni.</p>
      {/* PL: Nowy kod: pokazuje się po udanym wydaniu. Atrybut aria-live sprawia, że czytnik ekranu odczyta nowy kod. EN: The new code: it shows after a successful issue. aria-live makes a screen reader read the new code. */}
      {invite ? (
        <section className="ad-code-tile" aria-live="polite">
          <span className="ad-label">Nowy kod</span>
          <span className="ad-code">{invite.code}</span>
          <small>Ważny 14 dni, do {formatInviteEnd(invite.expiresAt)}.</small>
          {/* PL: Klucz z kodem zeruje napis „Skopiowano” przy każdym nowym kodzie. EN: The key with the code resets the "Skopiowano" label for every new code. */}
          <CopyCodeButton key={invite.code} code={invite.code} />
        </section>
      ) : null}
      {/* PL: Dół ekranu: napis o internecie albo błąd nad głównym przyciskiem. EN: The bottom of the screen: the internet text or the error above the main button. */}
      <div className="ad-bottom">
        {isOnline ? null : <p className="ad-hint">Wydanie kodu wymaga internetu.</p>}
        {issue.isError ? (
          <p className="ad-error" role="alert">
            <Icon name="triangle-alert" />
            Nie udało się wydać kodu. Spróbuj ponownie za chwilę.
          </p>
        ) : null}
        <button type="button" className="ad-btn ad-btn-accent" disabled={!isOnline || issue.isPending} onClick={() => issue.mutate()}>
          <Icon name="plus" />
          Wydaj kod
        </button>
      </div>
    </>
  );
}
