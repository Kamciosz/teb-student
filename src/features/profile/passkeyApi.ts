/**
 * PL: Rozmowa profilu z kluczami dostępu (Face ID, odcisk palca): dodawanie przez klienta Better Auth, bo to ceremonia WebAuthn, oraz lista i usuwanie przez zwykłe trasy serwera. Każda funkcja oddaje gotowy wynik z komunikatem po polsku i nigdy nie rzuca błędu sieci.
 * EN: The profile's conversation about passkeys (Face ID, fingerprint): adding through the Better Auth client, because it is a WebAuthn ceremony, and listing and deleting through the server's plain routes. Every function returns a ready result with a message in Polish and never throws a network error.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses worker/auth/email/routes.ts::authEmailApp
 * @uses worker/auth/email/passkeys.ts::toPasskeyView
 * @used_by src/features/profile/usePasskeys.ts::usePasskeys
 */

// PL: Klient Better Auth z wtyczką kluczy. Profil nie importuje klienta logowania (to nie drzwi modułu), więc ma własny, z tą samą ścieżką.
// EN: The Better Auth client with the passkey plugin. The profile does not import the sign-in client (it is not a module door), so it has its own, with the same path.
import { passkeyClient } from '@better-auth/passkey/client';
import { createAuthClient } from 'better-auth/client';

const AUTH_BASE = '/api/auth/email';
const LIST_URL = `${AUTH_BASE}/passkey/list-user-passkeys`;
const DELETE_URL = `${AUTH_BASE}/passkey/delete-passkey`;

const authClient = createAuthClient({ basePath: AUTH_BASE, plugins: [passkeyClient()] });

/**
 * PL: Klucz na liście: bez kluczy kryptograficznych, tylko to, co widzi uczeń.
 * EN: A key on the list: no cryptographic keys, only what the student sees.
 */
export type PasskeyItem = {
  id: string;
  name: string | null;
  deviceType: string;
  backedUp: boolean;
  createdAt: string | null;
};

/**
 * PL: Wynik zmiany (dodanie, usunięcie). Przy anulowaniu message jest null i nie pokazujemy błędu.
 * EN: The result of a change (add, delete). On cancel the message is null and no error is shown.
 */
export type PasskeyOutcome = { ok: true } | { ok: false; message: string | null };

/**
 * PL: Wynik pobrania listy: klucze albo komunikat po polsku.
 * EN: The result of loading the list: the keys, or a message in Polish.
 */
export type PasskeyListOutcome = { ok: true; value: PasskeyItem[] } | { ok: false; message: string };

/**
 * PL: Teksty dla ucznia. Trzymane tutaj, bo profil nie czyta komunikatów logowania.
 * EN: Texts for the student. Kept here, because the profile does not read the sign-in messages.
 */
const MESSAGES = {
  unsupported: 'Ten telefon nie obsługuje logowania Face ID ani odciskiem palca.',
  needsLogin: 'Zaloguj się ponownie kodem z maila, potem dodaj klucz.',
  needsLoginDelete: 'Zaloguj się ponownie kodem z maila, potem usuń klucz.',
  needsLoginList: 'Zaloguj się ponownie kodem z maila, żeby zobaczyć klucze.',
  alreadyAdded: 'Ten klucz jest już dodany do konta.',
  addFailed: 'Nie udało się dodać klucza. Spróbuj ponownie.',
  listFailed: 'Nie udało się pobrać listy kluczy. Spróbuj ponownie.',
  deleteFailed: 'Nie udało się usunąć klucza. Spróbuj ponownie.',
  offline: 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.',
} as const;

/** PL: Teksty, które widzi ucznia, gdy telefon nie ma WebAuthn. EN: The text the student sees when the phone has no WebAuthn. */
export const PASSKEY_UNSUPPORTED_MESSAGE = MESSAGES.unsupported;

/**
 * PL: Kody WebAuthn, które znaczą, że uczeń sam przerwał. Wtedy nie pokazujemy błędu.
 * EN: The WebAuthn codes that mean the student stopped it themselves. Then we show no error.
 */
const CANCEL_CODES: readonly string[] = ['AUTH_CANCELLED', 'ERROR_CEREMONY_ABORTED', 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY'];

/** PL: Co wiemy o błędzie: status HTTP albo kod. EN: What we know about an error: an HTTP status or a code. */
type Failure = { status?: number; code?: string };

/**
 * PL: Dobiera komunikat do błędu. Anulowanie daje null, brak statusu i kodu to brak sieci, a 401 albo sesja za stara (403 SESSION_NOT_FRESH) prosi o ponowne logowanie.
 * EN: Picks the message for an error. A cancellation gives null, no status and no code means no network, and a 401 or a stale session (403 SESSION_NOT_FRESH) asks for a new sign-in.
 *
 * @param failure - PL: status i kod błędu. EN: the error status and code.
 * @param needsLogin - PL: komunikat o ponownym logowaniu. EN: the message asking for a new sign-in.
 * @param fallback - PL: ogólny komunikat. EN: the general message.
 * @returns PL: komunikat albo null przy anulowaniu. EN: the message, or null on cancel.
 */
function describeFailure(failure: Failure, needsLogin: string, fallback: string): string | null {
  const code = failure.code?.toUpperCase();
  if (code && CANCEL_CODES.includes(code)) return null;
  if (code === 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED') return MESSAGES.alreadyAdded;
  if (failure.status === 401 || failure.status === 403 || code === 'SESSION_NOT_FRESH') return needsLogin;
  if (!failure.status && !code) return MESSAGES.offline;
  return fallback;
}

/**
 * PL: Czyta status i kod z odpowiedzi serwera. Trasy zwracają { error }, a klient Better Auth { code }.
 * EN: Reads the status and code from the server's response. The routes return { error }, and the Better Auth client returns { code }.
 *
 * @param response - PL: odpowiedź z błędem. EN: the response with an error.
 * @returns PL: status i kod. EN: the status and the code.
 */
async function readFailure(response: Response): Promise<Failure> {
  const body = (await response.json().catch(() => ({}))) as { code?: string; error?: string };
  return { status: response.status, code: body.code ?? body.error };
}

/**
 * PL: Czy telefon umie logowanie kluczem. Bez tego sekcja nie pokazuje przycisku.
 * EN: Whether the phone can sign in with a key. Without it the section shows no button.
 *
 * @returns PL: true, gdy przeglądarka ma WebAuthn. EN: true when the browser has WebAuthn.
 */
export function isPasskeySupported(): boolean {
  return typeof window !== 'undefined' && typeof window.PublicKeyCredential === 'function';
}

/**
 * PL: Domyślna nazwa klucza: data dodania, żeby w liście dało się odróżnić kolejne klucze.
 * EN: The default key name: the date it was added, so the list can tell keys apart.
 *
 * @param now - PL: chwila dodania. EN: the moment of adding.
 * @returns PL: nazwa po polsku. EN: the name in Polish.
 */
function defaultName(now: Date): string {
  return `Klucz z ${now.toLocaleDateString('pl-PL', { timeZone: 'Europe/Warsaw' })}`;
}

/**
 * PL: Dodaje klucz do konta (Face ID albo odcisk palca). Serwer wymaga świeżej sesji, więc bez niej prosi o kod z maila.
 * EN: Adds a key to the account (Face ID or fingerprint). The server needs a fresh session, so without one it asks for the e-mail code.
 *
 * @returns PL: wynik zmiany. EN: the result of the change.
 */
export async function addPasskey(): Promise<PasskeyOutcome> {
  try {
    const { error } = await authClient.passkey.addPasskey({ name: defaultName(new Date()) });
    if (!error) return { ok: true };
    return { ok: false, message: describeFailure(error, MESSAGES.needsLogin, MESSAGES.addFailed) };
  } catch {
    // PL: Wyjątek z fetch to brak sieci.
    // EN: An exception from fetch means no network.
    return { ok: false, message: MESSAGES.offline };
  }
}

/**
 * PL: Pobiera listę kluczy ucznia.
 * EN: Loads the student's list of keys.
 *
 * @returns PL: lista albo komunikat po polsku. EN: the list, or a message in Polish.
 */
export async function listPasskeys(): Promise<PasskeyListOutcome> {
  try {
    const response = await fetch(LIST_URL, { credentials: 'include' });
    if (!response.ok) {
      const message = describeFailure(await readFailure(response), MESSAGES.needsLoginList, MESSAGES.listFailed);
      return { ok: false, message: message ?? MESSAGES.listFailed };
    }
    return { ok: true, value: (await response.json()) as PasskeyItem[] };
  } catch {
    // PL: Wyjątek z fetch to brak sieci.
    // EN: An exception from fetch means no network.
    return { ok: false, message: MESSAGES.offline };
  }
}

/**
 * PL: Usuwa klucz z konta po jego identyfikatorze.
 * EN: Deletes a key from the account by its identifier.
 *
 * @param id - PL: identyfikator klucza z listy. EN: the key identifier from the list.
 * @returns PL: wynik usunięcia. EN: the result of the deletion.
 */
export async function deletePasskey(id: string): Promise<PasskeyOutcome> {
  try {
    const response = await fetch(DELETE_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (response.ok) return { ok: true };
    return { ok: false, message: describeFailure(await readFailure(response), MESSAGES.needsLoginDelete, MESSAGES.deleteFailed) };
  } catch {
    // PL: Wyjątek z fetch to brak sieci.
    // EN: An exception from fetch means no network.
    return { ok: false, message: MESSAGES.offline };
  }
}
