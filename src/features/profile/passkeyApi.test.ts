/**
 * PL: Testy rozmowy profilu z kluczami dostępu: lista, usuwanie i dodawanie z atrapą fetch. Sprawdzamy brak sieci, sukces, sesję za starą (401 i 403 SESSION_NOT_FRESH) i brak obsługi WebAuthn. Podpisu WebAuthn nie testujemy.
 * EN: Tests of the profile's conversation about passkeys: the list, deleting and adding with a fetch stub. We check no network, success, a stale session (401 and 403 SESSION_NOT_FRESH) and no WebAuthn support. The WebAuthn signature is not tested.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/profile/passkeyApi.ts::listPasskeys
 * @uses src/features/profile/passkeyApi.ts::deletePasskey
 * @uses src/features/profile/passkeyApi.ts::addPasskey
 * @uses src/features/profile/passkeyApi.ts::isPasskeySupported
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { addPasskey, deletePasskey, isPasskeySupported, listPasskeys } from './passkeyApi';

const NEEDS_LOGIN = 'Zaloguj się ponownie kodem z maila, potem dodaj klucz.';
const NEEDS_LOGIN_LIST = 'Zaloguj się ponownie kodem z maila, żeby zobaczyć klucze.';
const NEEDS_LOGIN_DELETE = 'Zaloguj się ponownie kodem z maila, potem usuń klucz.';
const OFFLINE = 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.';
const LIST_FAILED = 'Nie udało się pobrać listy kluczy. Spróbuj ponownie.';
const DELETE_FAILED = 'Nie udało się usunąć klucza. Spróbuj ponownie.';

/**
 * PL: Odpowiedź JSON o podanym statusie, tak jak zwraca serwer.
 * EN: A JSON response with the given status, as the server returns it.
 *
 * @param status - PL: kod HTTP. EN: the HTTP status.
 * @param body - PL: treść odpowiedzi. EN: the response body.
 * @returns PL: odpowiedź. EN: the response.
 */
function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/**
 * PL: Podstawia atrapę fetch, która zawsze zwraca tę samą odpowiedź.
 * EN: Stubs fetch with a fake that always returns the same response.
 *
 * @param response - PL: odpowiedź atrapy. EN: the fake's response.
 */
function stubFetch(response: Response): void {
  vi.stubGlobal('fetch', vi.fn(async () => response.clone()));
}

describe('isPasskeySupported', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // PL: Bez WebAuthn w przeglądarce sekcja nie pokaże przycisku.
  // EN: Without WebAuthn in the browser the section shows no button.
  it('zwraca false bez WebAuthn i true z WebAuthn / returns false without WebAuthn and true with it', () => {
    vi.stubGlobal('window', {});
    expect(isPasskeySupported()).toBe(false);
    vi.stubGlobal('window', { PublicKeyCredential: function PublicKeyCredential() {} });
    expect(isPasskeySupported()).toBe(true);
  });
});

describe('listPasskeys', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // PL: Sukces: serwer zwraca tablicę kluczy, którą dostajemy bez zmian.
  // EN: Success: the server returns an array of keys, which we get unchanged.
  it('zwraca listę kluczy przy 200 / returns the list of keys on 200', async () => {
    const keys = [{ id: 'k1', name: 'Klucz z 14 paź 2026', deviceType: 'multiDevice', backedUp: true, createdAt: '2026-10-14T08:00:00.000Z' }];
    stubFetch(jsonResponse(200, keys));
    expect(await listPasskeys()).toEqual({ ok: true, value: keys });
  });

  // PL: Sesja za stara albo brak logowania (401 lub 403): prosimy o ponowne logowanie kodem.
  // EN: A stale session or no sign-in (401 or 403): we ask for a new sign-in with the code.
  it('przy 401 i 403 SESSION_NOT_FRESH prosi o ponowne logowanie / asks for a new sign-in on 401 and 403 SESSION_NOT_FRESH', async () => {
    stubFetch(jsonResponse(401, { error: 'unauthorized' }));
    expect(await listPasskeys()).toEqual({ ok: false, message: NEEDS_LOGIN_LIST });
    stubFetch(jsonResponse(403, { error: 'SESSION_NOT_FRESH' }));
    expect(await listPasskeys()).toEqual({ ok: false, message: NEEDS_LOGIN_LIST });
  });

  // PL: Brak sieci (fetch rzuca wyjątek) daje komunikat o połączeniu, a nie błąd w konsoli.
  // EN: No network (fetch throws) gives a message about the connection, not an error in the console.
  it('przy braku sieci daje komunikat o połączeniu / gives the connection message when there is no network', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));
    expect(await listPasskeys()).toEqual({ ok: false, message: OFFLINE });
  });

  // PL: Inny błąd z działającego serwera dostaje ogólny tekst o liście.
  // EN: Any other error from a working server gets the general text about the list.
  it('przy innym błędzie pokazuje ogólny komunikat / shows the general message on another error', async () => {
    stubFetch(jsonResponse(500, { error: 'boom' }));
    expect(await listPasskeys()).toEqual({ ok: false, message: LIST_FAILED });
  });
});

describe('deletePasskey', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // PL: Sukces: serwer usuwa klucz i odpowiada 200.
  // EN: Success: the server deletes the key and answers 200.
  it('przy 200 zwraca sukces / returns success on 200', async () => {
    stubFetch(jsonResponse(200, { ok: true }));
    expect(await deletePasskey('k1')).toEqual({ ok: true });
  });

  // PL: Sesja za stara przy usuwaniu (403 SESSION_NOT_FRESH) prosi o ponowne logowanie, a klucz zostaje.
  // EN: A stale session when deleting (403 SESSION_NOT_FRESH) asks for a new sign-in, and the key stays.
  it('przy 403 SESSION_NOT_FRESH prosi o ponowne logowanie / asks for a new sign-in on 403 SESSION_NOT_FRESH', async () => {
    stubFetch(jsonResponse(403, { error: 'SESSION_NOT_FRESH' }));
    expect(await deletePasskey('k1')).toEqual({ ok: false, message: NEEDS_LOGIN_DELETE });
  });

  // PL: Brak sieci przy usuwaniu daje komunikat o połączeniu.
  // EN: No network when deleting gives the connection message.
  it('przy braku sieci daje komunikat o połączeniu / gives the connection message when there is no network', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));
    expect(await deletePasskey('k1')).toEqual({ ok: false, message: OFFLINE });
  });

  // PL: Inny błąd serwera przy usuwaniu daje ogólny tekst.
  // EN: Any other server error when deleting gives the general text.
  it('przy innym błędzie pokazuje ogólny komunikat / shows the general message on another error', async () => {
    stubFetch(jsonResponse(404, { error: 'not_found' }));
    expect(await deletePasskey('nieistniejacy')).toEqual({ ok: false, message: DELETE_FAILED });
  });
});

describe('addPasskey', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  // PL: Klient Better Auth zapamiętuje fetch przy tworzeniu, więc moduł ładujemy ponownie po podstawieniu atrapy.
  // EN: The Better Auth client remembers fetch when it is made, so we load the module again after stubbing the fake.
  /**
   * PL: Ładuje moduł od nowa, żeby klient użył atrapy fetch.
   * EN: Loads the module again, so the client uses the fetch fake.
   *
   * @returns PL: funkcja dodawania klucza. EN: the add-key function.
   */
  async function loadAddPasskey() {
    vi.resetModules();
    return (await import('./passkeyApi')).addPasskey;
  }

  // PL: Dodawanie zaczyna się od pobrania opcji z serwera. Gdy sesja jest za stara, serwer odpowiada 403 SESSION_NOT_FRESH i prosimy o kod z maila, zanim cokolwiek pokażemy z WebAuthn.
  // EN: Adding starts with fetching the options from the server. When the session is stale, the server answers 403 SESSION_NOT_FRESH and we ask for the e-mail code before anything from WebAuthn is shown.
  it('przy 403 SESSION_NOT_FRESH prosi o kod z maila / asks for the e-mail code on 403 SESSION_NOT_FRESH', async () => {
    stubFetch(jsonResponse(403, { code: 'SESSION_NOT_FRESH', message: 'Session is not fresh' }));
    const addPasskeyFresh = await loadAddPasskey();
    expect(await addPasskeyFresh()).toEqual({ ok: false, message: NEEDS_LOGIN });
  });

  // PL: Brak sieci przy dodawaniu daje komunikat o połączeniu.
  // EN: No network when adding gives the connection message.
  it('przy braku sieci daje komunikat o połączeniu / gives the connection message when there is no network', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));
    const addPasskeyFresh = await loadAddPasskey();
    expect(await addPasskeyFresh()).toEqual({ ok: false, message: OFFLINE });
  });
});
