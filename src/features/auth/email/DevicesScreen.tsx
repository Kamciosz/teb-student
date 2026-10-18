/**
 * PL: Ekran „Moje urządzenia” (adres /auth/email/urzadzenia): lista miejsc, w których konto jest zalogowane, wylogowanie jednego z nich i wylogowanie wszystkich innych. Bieżące urządzenie jest oznaczone i nie ma przycisku wylogowania. Gdy lista niedostępna (stara sesja), nadal działa „Wyloguj z innych urządzeń”.
 * EN: The "Moje urządzenia" (My devices) screen (address /auth/email/urzadzenia): the list of places where the account is signed in, signing out one of them and signing out all others. The current device is marked and has no sign-out button. When the list is unavailable (an old session), "Wyloguj z innych urządzeń" still works.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/auth/email/devicesApi.ts::fetchDevices
 * @uses src/features/auth/email/devicesApi.ts::revokeDevice
 * @uses src/features/auth/email/devicesApi.ts::revokeOtherDevices
 * @uses src/features/auth/email/authApi.ts::signOutStudent
 * @uses src/features/auth/email/useAuthSession.ts::SESSION_QUERY_KEY
 * @uses src/shared/ui/ScreenHeader.tsx::ScreenHeader
 * @uses src/shared/ui/ListGroup.tsx::ListGroup
 * @uses src/shared/ui/ListRow.tsx::ListRow
 * @uses src/shared/ui/Button.tsx::Button
 * @used_by src/features/auth/email/AuthEmailScreen.tsx::AuthEmailScreen
 */

// PL: Zapytanie z danymi, jego unieważnianie i efekt po błędzie sesji.
// EN: The data query, its invalidation and the effect after a session error.
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, ListGroup, ListRow, ScreenHeader } from '../../../shared';
import { signOutStudent } from './authApi';
import { MESSAGES } from './authMessages';
import { fetchDevices, revokeDevice, revokeOtherDevices, type DevicesResult } from './devicesApi';
import { SESSION_QUERY_KEY } from './useAuthSession';

/** PL: Klucz zapytania o listę urządzeń. EN: The key of the device list query. */
const DEVICES_QUERY_KEY = ['auth', 'devices'] as const;

/** PL: Komunikat po akcji: udana (zielony) albo z błędem. EN: The message after an action: successful, or an error. */
type Notice = { text: string; isError: boolean };

/**
 * PL: Zamienia czas ostatniej aktywności na tekst po polsku, w strefie Warszawy, żeby wynik nie zależał od telefonu.
 * EN: Turns the last activity time into Polish text, in the Warsaw time zone, so the result does not depend on the phone.
 *
 * @param iso - PL: czas w formacie ISO. EN: the time in ISO format.
 * @returns PL: data i godzina. EN: the date and the time.
 */
function formatLastActive(iso: string): string {
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Warsaw' }).format(new Date(iso));
}

/**
 * PL: Rysuje ekran urządzeń: lista albo komunikat, przycisk wylogowania innych i powrót do ustawień.
 * EN: Draws the devices screen: the list or a message, the sign-out-others button and the way back to the settings.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function DevicesScreen() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: DEVICES_QUERY_KEY, queryFn: fetchDevices });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const result = query.data;
  const sessionEnded = result !== undefined && !result.ok && result.status === 401;

  // PL: Sesja się skończyła: unieważniamy ją, a ekran nadrzędny odeśle ucznia na logowanie.
  // EN: The session ended: we invalidate it, and the parent screen sends the student to sign-in.
  useEffect(() => {
    if (sessionEnded) void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
  }, [sessionEnded, queryClient]);

  // PL: Po każdej akcji pokazujemy wynik i pobieramy listę od nowa.
  // EN: After each action we show the result and fetch the list again.
  const runAction = async (action: () => Promise<DevicesResult<null>>, doneText: string) => {
    setIsBusy(true);
    const outcome = await action();
    setIsBusy(false);
    setNotice(outcome.ok ? { text: doneText, isError: false } : { text: outcome.message, isError: true });
    await queryClient.invalidateQueries({ queryKey: DEVICES_QUERY_KEY });
  };

  return (
    <main className="auth-email" data-subtrack="1a">
      <ScreenHeader backTo="/profile/ustawienia" title="Moje urządzenia" />
      <p className="auth-email__lead">Tu widać, na których urządzeniach konto jest zalogowane.</p>

      {result === undefined && !query.isError ? <p className="auth-email__hint">Ładowanie listy…</p> : null}

      {result !== undefined && !result.ok && !sessionEnded ? (
        <>
          <p className="auth-email__error" role="alert">{result.message}</p>
          {result.error === 'session_not_fresh' ? (
            <Button variant="destructive" onClick={() => void signOutStudent()} disabled={isBusy}>
              Wyloguj się
            </Button>
          ) : null}
        </>
      ) : null}

      {result !== undefined && result.ok ? (
        <ListGroup>
          {result.value.map((device) => {
            const name = `${device.browser} na ${device.system}`;
            return (
              <ListRow
                key={device.id}
                title={name}
                subtitle={`Ostatnia aktywność: ${formatLastActive(device.lastActiveAt)}`}
                value={device.current ? (
                  'To urządzenie'
                ) : (
                  <Button
                    variant="destructive"
                    disabled={isBusy}
                    aria-label={`Wyloguj: ${name}`}
                    onClick={() => void runAction(() => revokeDevice(device.id), MESSAGES.deviceSignedOut)}
                  >
                    Wyloguj
                  </Button>
                )}
              />
            );
          })}
        </ListGroup>
      ) : null}

      {notice === null ? null : (
        <p className={notice.isError ? 'auth-email__error' : 'auth-email__note'} role={notice.isError ? 'alert' : 'status'}>
          {notice.text}
        </p>
      )}

      <div className="auth-email__actions">
        <Button
          variant="destructive"
          disabled={isBusy || sessionEnded}
          onClick={() => void runAction(revokeOtherDevices, MESSAGES.othersSignedOut)}
        >
          Wyloguj z innych urządzeń
        </Button>
      </div>
    </main>
  );
}
