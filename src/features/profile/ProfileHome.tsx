/**
 * PL: Ekran „Profil” w wyglądzie ustawień telefonu: nagłówek „Profil”, kółko z literą, imię i klasa, potem grupy list. Grupa „Konto” pokazuje login albo zasłonięty adres e-mail. Druga grupa ma „Ustawienia”, wiersz panelu (tylko dla osoby z rolą), „Moje zgłoszenia” i „Polityka prywatności”. „Wyloguj” jest w osobnej grupie, a „Usuń konto i dane” na dole, w osobnej grupie, na czerwono. Na dole jest dolny pasek nawigacji.
 * EN: The "Profil" screen in the look of the phone's settings: the "Profil" header, the circle with the letter, the name and the class, then groups of lists. The "Konto" group shows the login or the masked e-mail address. The second group has "Ustawienia", the panel row (only for a person with a role), "Moje zgłoszenia" and "Polityka prywatności". "Wyloguj" is in its own group, and "Usuń konto i dane" at the bottom, in a separate group, in red. The bottom navigation bar is at the bottom.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/shared/index.ts::Dock
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::ListRow
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/features/auth/index.ts::useAuthSession
 * @uses src/features/auth/index.ts::signOutStudent
 * @uses src/features/admin/index.ts::usePanelEntry
 * @uses src/features/profile/queries.ts::useProfile
 * @uses src/features/profile/profileView.ts::avatarLetter
 * @uses src/features/profile/profileView.ts::accountRow
 * @used_by src/features/profile/ProfileScreen.tsx::ProfileHome
 */

// PL: useState trzyma komunikat błędu wylogowania.
// EN: useState keeps the sign-out error message.
import { useState } from 'react';
// PL: Wspólne klocki wyglądu: pasek dolny, grupy, wiersze i nagłówek ekranu.
// EN: The shared look blocks: the bottom bar, the groups, the rows and the screen header.
import { Dock, ListGroup, ListRow, ScreenHeader } from '../../shared';
// PL: Sesja i wylogowanie, przez drzwi modułu auth.
// EN: The session and the sign-out, through the auth module door.
import { signOutStudent, useAuthSession } from '../auth';
// PL: Wiersz panelu dla osoby z rolą, przez drzwi modułu admin.
// EN: The panel row for a person with a role, through the admin module door.
import { usePanelEntry } from '../admin';
// PL: Ikony i funkcje widoku.
// EN: The icons and the view functions.
import { Icon } from './icons';
import { accountRow, avatarLetter } from './profileView';
import { useProfile } from './queries';

/**
 * PL: Rysuje ekran profilu. Wylogowanie kasuje sesję i dane w telefonie, a wspólny kod przenosi potem na ekran logowania.
 * EN: Draws the profile screen. Signing out deletes the session and the data on the phone, and the shared code then takes the student to the sign-in screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ProfileHome() {
  // PL: Sesja daje adres e-mail, profil daje imię i klasę (z serwera albo z zapisu w telefonie).
  // EN: The session gives the e-mail address, the profile gives the name and class (from the server or the saved copy).
  const session = useAuthSession();
  const profile = useProfile().data;
  // PL: Wiersz panelu: null, gdy uczeń nie ma roli (wtedy wiersza panelu nie ma).
  // EN: The panel row: null when the student has no role (then there is no panel row).
  const panel = usePanelEntry();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const email = session.status === 'signed-in' ? session.student.email : '';
  const name = profile?.name ?? '';
  const className = profile?.className.trim() ?? '';

  /** PL: Wylogowuje; po sukcesie wspólny kod (clearQueryData) sam przenosi na logowanie, a przy błędzie pokazujemy komunikat z modułu auth. EN: Signs out; after success the shared code (clearQueryData) takes the student to sign-in itself, and on an error we show the message from the auth module. */
  async function handleSignOut(): Promise<void> {
    const result = await signOutStudent();
    if (!result.ok) setSignOutError(result.message);
  }

  return (
    <>
      <ScreenHeader title="Profil" />
      <div className="pf-stack">
        {/* PL: Kółko z literą, imię i klasa obok. EN: The circle with the letter, the name and the class beside it. */}
        <div className="pf-who">
          <div className="pf-avatar" aria-hidden="true">{avatarLetter(name, email)}</div>
          <div className="pf-who-text">
            {name ? <h2>{name}</h2> : null}
            {className ? <small>{className}</small> : null}
          </div>
        </div>
        {/* PL: Konto z loginem albo zasłoniętym adresem. EN: The account with the login or the masked address. */}
        <ListGroup header="Konto">
          <ListRow {...accountRow(email)} />
        </ListGroup>
        {/* PL: Ustawienia, panel Samorządu (tylko dla osoby z rolą), zgłoszenia i polityka prywatności. EN: Settings, the Samorząd panel (only for a person with a role), reports and the privacy policy. */}
        <ListGroup>
          <ListRow title="Ustawienia" icon={<Icon name="sliders-horizontal" />} to="/profile/ustawienia" />
          {panel ? <ListRow title={panel.label} icon={<Icon name="layout-dashboard" />} to="/admin" /> : null}
          <ListRow title="Moje zgłoszenia" icon={<Icon name="list-checks" />} to="/reports/student/moje" />
          <ListRow title="Polityka prywatności" icon={<Icon name="file-text" />} to="/profile/prywatnosc" />
        </ListGroup>
        {/* PL: Wylogowanie jako osobna grupa z jednym wierszem-akcją. EN: Signing out as a separate group with one action row. */}
        <ListGroup>
          <ListRow title="Wyloguj" icon={<Icon name="log-out" />} onClick={handleSignOut} />
        </ListGroup>
        {/* PL: Błąd wylogowania (na przykład brak internetu). EN: The sign-out error (for example no internet). */}
        {signOutError ? <p className="pf-error" role="alert">{signOutError}</p> : null}
        {/* PL: Usunięcie konta na dole, w osobnej grupie, na czerwono. EN: Deleting the account at the bottom, in a separate group, in red. */}
        <ListGroup>
          <ListRow
            title="Usuń konto i dane"
            subtitle="Usuniemy zgłoszenia i odpowiedzi."
            icon={<Icon name="trash-2" />}
            to="/profile/usun"
            destructive
          />
        </ListGroup>
        {/* PL: Podpis wersji na dole ekranu. EN: The version caption at the bottom of the screen. */}
        <p className="pf-version">TEB Student · wersja przykładowa</p>
      </div>
      <Dock />
    </>
  );
}
