/**
 * PL: Ekran „Profil” (ekran 2.4 w docs/projekt/EKRANY.md): litera, imię, klasa i zasłonięty adres, wiersze „Moje zgłoszenia” i „Polityka prywatności”, „Wyloguj” oraz „Usuń konto i dane”. Do tego wiersz „Ustawienia”, który prowadzi do zmiany imienia, klasy, szkoły i palety (tekstu nie ma w projekcie ekranów).
 * EN: The "Profil" screen (screen 2.4 in docs/projekt/EKRANY.md): the letter, name, class and masked address, the rows "Moje zgłoszenia" and "Polityka prywatności", "Wyloguj" and "Usuń konto i dane". Plus the "Ustawienia" row, which leads to changing the name, class, school and palette (the screen design has no text for it).
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/auth/index.ts::useAuthSession
 * @uses src/features/auth/index.ts::signOutStudent
 * @uses src/features/profile/queries.ts::useProfile
 * @uses src/features/profile/profileView.ts::profileCaption
 * @used_by src/features/profile/ProfileScreen.tsx::ProfileHome
 */

// PL: useState trzyma komunikat błędu wylogowania.
// EN: useState keeps the sign-out error message.
import { useState } from 'react';
// PL: Link do innego ekranu.
// EN: A link to another screen.
import { Link } from 'react-router';
// PL: Sesja i wylogowanie, przez drzwi modułu auth.
// EN: The session and the sign-out, through the auth module door.
import { signOutStudent, useAuthSession } from '../auth';
// PL: Ikony, pasek, dane i funkcje widoku.
// EN: The icons, the bar, the data and the view functions.
import { Icon, type IconName } from './icons';
import { avatarLetter, profileCaption } from './profileView';
import { useProfile } from './queries';
import { ScreenTop } from './ScreenTop';

/**
 * PL: Jeden wiersz kafla z linkiem: ikona, tekst i strzałka w prawo.
 * EN: One tile row with a link: an icon, the text and the right arrow.
 *
 * @param props - PL: ikona, adres, tekst i opcjonalny podpis pod tekstem. EN: the icon, the address, the text and an optional caption under the text.
 * @returns PL: element listy. EN: a list item.
 */
function LinkRow({ icon, to, label, hint }: { icon: IconName; to: string; label: string; hint?: string }) {
  return (
    <li>
      {/* PL: Cały wiersz jest linkiem do podanego ekranu. EN: The whole row is a link to the given screen. */}
      <Link className="pf-row" to={to}>
        <Icon name={icon} />
        <span className="pf-row-text">
          {label}
          {hint ? <small>{hint}</small> : null}
        </span>
        <Icon name="chevron-right" />
      </Link>
    </li>
  );
}

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
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const email = session.status === 'signed-in' ? session.student.email : '';
  const name = profile?.name ?? '';

  /** PL: Wylogowuje; po sukcesie wspólny kod (clearQueryData) sam przenosi na logowanie, a przy błędzie pokazujemy komunikat z modułu auth. EN: Signs out; after success the shared code (clearQueryData) takes the student to sign-in itself, and on an error we show the message from the auth module. */
  async function handleSignOut(): Promise<void> {
    const result = await signOutStudent();
    if (!result.ok) setSignOutError(result.message);
  }

  return (
    <>
      <ScreenTop title="Profil" backTo="/" backLabel="Wróć na pulpit" />
      {/* PL: Kółko z literą, imię i podpis z klasą i zasłoniętym adresem. EN: The circle with the letter, the name and the caption with the class and the masked address. */}
      <div className="pf-who">
        <div className="pf-avatar" aria-hidden="true">{avatarLetter(name, email)}</div>
        <div className="pf-who-text">
          {name ? <h2>{name}</h2> : null}
          <small>{profileCaption(profile?.className ?? '', email)}</small>
        </div>
      </div>
      {/* PL: Pierwszy kafel: ustawienia, zgłoszenia i polityka prywatności. EN: The first tile: settings, reports and the privacy policy. */}
      <ul className="pf-tile">
        <LinkRow icon="sliders-horizontal" to="/profile/ustawienia" label="Ustawienia" />
        <LinkRow icon="list-checks" to="/reports/student/moje" label="Moje zgłoszenia" />
        <LinkRow icon="file-text" to="/profile/prywatnosc" label="Polityka prywatności" />
      </ul>
      {/* PL: Drugi kafel: wylogowanie i usunięcie konta. EN: The second tile: signing out and deleting the account. */}
      <ul className="pf-tile">
        <li>
          <button type="button" className="pf-row" onClick={handleSignOut}>
            <Icon name="log-out" />
            <span className="pf-row-text">Wyloguj</span>
          </button>
        </li>
        <LinkRow icon="trash-2" to="/profile/usun" label="Usuń konto i dane" hint="Usuniemy zgłoszenia i odpowiedzi." />
      </ul>
      {/* PL: Błąd wylogowania (na przykład brak internetu). EN: The sign-out error (for example no internet). */}
      {signOutError ? <p className="pf-error" role="alert">{signOutError}</p> : null}
      {/* PL: Podpis wersji na dole ekranu. EN: The version caption at the bottom of the screen. */}
      <p className="pf-version">TEB Student · wersja przykładowa</p>
    </>
  );
}
