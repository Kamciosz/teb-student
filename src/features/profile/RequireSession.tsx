/**
 * PL: Bramka dla ekranów profilu, które pokazują dane konta. Uczeń bez sesji trafia na ekran logowania. Polityka prywatności bramki nie ma, bo musi otwierać się bez logowania.
 * EN: The gate for the profile screens that show account data. A student without a session goes to the sign-in screen. The privacy policy has no gate, because it must open without signing in.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/auth/index.ts::useAuthSession
 * @used_by src/features/profile/ProfileScreen.tsx::RequireSession
 */

// PL: Przekierowanie i miejsce na wybrany ekran.
// EN: The redirect and the slot for the chosen screen.
import { Navigate, Outlet } from 'react-router';
// PL: Hook sesji z drzwi modułu auth.
// EN: The session hook from the auth module door.
import { useAuthSession } from '../auth';

/**
 * PL: Przepuszcza ucznia z sesją, bez sesji przenosi na /auth/email, a gdy sesja się sprawdza, pokazuje krótki napis. Gdy nie wiadomo, czy sesja jest (brak internetu), też przepuszcza, bo ekran pokaże ostatnio zapisane dane.
 * EN: Lets a student with a session through, takes one without a session to /auth/email, and shows a short text while the session is being checked. When it is not known whether there is a session (no internet), it lets through too, because the screen shows the last saved data.
 *
 * @returns PL: wybrany ekran, przekierowanie albo napis. EN: the chosen screen, a redirect or a text.
 */
export function RequireSession() {
  // PL: Stan sesji: loading, signed-out, signed-in albo error.
  // EN: The session state: loading, signed-out, signed-in or error.
  const session = useAuthSession();
  // PL: Bez sesji: ekran logowania.
  // EN: Without a session: the sign-in screen.
  if (session.status === 'signed-out') return <Navigate to="/auth/email" replace />;
  // PL: Sesja się sprawdza.
  // EN: The session is being checked.
  if (session.status === 'loading') return <p className="pf-empty" role="status">Wczytuję profil…</p>;
  // PL: Reszta: pokaż wybrany ekran.
  // EN: The rest: show the chosen screen.
  return <Outlet />;
}
