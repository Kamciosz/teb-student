/**
 * PL: Przeniesienie ucznia na ekran logowania (/auth/email). Jedno miejsce dla całej aplikacji: korzystają z niego wylogowanie (przez clearQueryData) i bramka 401 (signInGate). Używa window.location.replace, więc przeglądarka ładuje aplikację od nowa: otwarty ekran nie zostaje w starym stanie, a przycisk „Wstecz” nie wraca do chronionego ekranu.
 * EN: Taking the student to the sign-in screen (/auth/email). One place for the whole app: sign-out (through clearQueryData) and the 401 gate (signInGate) use it. It uses window.location.replace, so the browser loads the app from scratch: the open screen does not stay in its old state, and the Back button does not return to the protected screen.
 *
 * @author Szymon
 * @since 2026-10-11
 * @used_by src/shared/query/clearQueryData.ts::clearQueryData
 * @used_by src/shared/auth/signInGate.ts::installSignInGate
 */

/**
 * PL: Adres ekranu logowania (docs/adr/0003-adresy-podtorow.md).
 * EN: The sign-in screen address (docs/adr/0003-adresy-podtorow.md).
 */
export const SIGN_IN_PATH = '/auth/email';

/**
 * PL: Przenosi przeglądarkę na ekran logowania. Poza przeglądarką (testy Workera) nic nie robi.
 * EN: Takes the browser to the sign-in screen. Outside a browser (Worker tests) it does nothing.
 */
export function redirectToSignIn(): void {
  // PL: Bez window nie ma dokąd przenosić.
  // EN: Without window there is nowhere to go.
  if (typeof window === 'undefined') return;
  // PL: replace nie dopisuje wpisu do historii, więc „Wstecz” nie wróci do ekranu bez sesji.
  // EN: replace adds no history entry, so Back does not return to the screen without a session.
  window.location.replace(SIGN_IN_PATH);
}
