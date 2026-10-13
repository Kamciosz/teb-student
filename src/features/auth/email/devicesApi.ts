/**
 * PL: Rozmowa telefonu z listą urządzeń ucznia: pobranie listy, wylogowanie jednego urządzenia i wylogowanie wszystkich innych. Każda funkcja oddaje wynik z komunikatem po polsku i nigdy nie rzuca błędu sieci.
 * EN: The phone's conversation about the student's device list: fetching the list, signing out one device and signing out all other devices. Every function returns a result with a message in Polish and never throws a network error.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/auth/email/routes.ts::createAuthEmailApp
 * @uses src/features/auth/email/authMessages.ts::describeDeviceError
 * @used_by src/features/auth/email/DevicesScreen.tsx::DevicesScreen
 */

// PL: Komunikaty i kształt błędu z serwera, wspólne z resztą logowania.
// EN: The messages and the server error shape, shared with the rest of sign-in.
import { describeDeviceError, MESSAGES, type ClientError } from './authMessages';

// PL: Adres listy urządzeń. Ścieżka jest ta sama co w worker/auth/email/routes.ts.
// EN: The address of the device list. The path is the same as in worker/auth/email/routes.ts.
const DEVICES_URL = '/api/auth/email/devices';

/**
 * PL: Urządzenie tak, jak zwraca je serwer. Bez tokenu i adresu IP.
 * EN: A device as the server returns it. No token and no IP address.
 */
export type Device = {
  /** PL: Id sesji, po nim wylogowujemy to urządzenie. EN: The session id, used to sign this device out. */
  id: string;
  /** PL: Przeglądarka, na przykład Chrome. EN: The browser, for example Chrome. */
  browser: string;
  /** PL: System, na przykład Android. EN: The system, for example Android. */
  system: string;
  /** PL: Ostatnia aktywność w formacie ISO. EN: The last activity in ISO format. */
  lastActiveAt: string;
  /** PL: Prawda dla urządzenia, na którym jest ten ekran. EN: True for the device this screen is on. */
  current: boolean;
};

/**
 * PL: Wynik rozmowy z serwerem: dane albo błąd z kodem i komunikatem dla ucznia.
 * EN: The result of a server conversation: data, or an error with a code and a message for the student.
 */
export type DevicesResult<T> =
  | { ok: true; value: T }
  | { ok: false; status?: number; error?: string; message: string };

/**
 * PL: Wysyła zapytanie i zamienia odpowiedź na wynik. Brak sieci i błąd fetch to offline; błędy serwera dostają komunikat z authMessages.
 * EN: Sends a request and turns the answer into a result. No network and a fetch error are offline; server errors get a message from authMessages.
 *
 * @param url - PL: adres zapytania. EN: the request address.
 * @param init - PL: metoda i ciało zapytania. EN: the request method and body.
 * @returns PL: wynik z danymi albo błędem. EN: the result with data or an error.
 */
async function send<T>(url: string, init: RequestInit): Promise<DevicesResult<T>> {
  try {
    const response = await fetch(url, init);
    if (response.ok) return { ok: true, value: (await response.json()) as T };

    // PL: Serwer odsyła { error: kod }. Bez ciała (np. błąd proxy) zostaje sam status.
    // EN: The server sends { error: code }. Without a body (for example a proxy error) only the status stays.
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    const error: ClientError = { status: response.status, error: body.error };
    return { ok: false, status: response.status, error: body.error, message: describeDeviceError(error) };
  } catch {
    // PL: Wyjątek z fetch to brak sieci.
    // EN: An exception from fetch means no network.
    return { ok: false, message: MESSAGES.offline };
  }
}

/**
 * PL: Pobiera listę aktywnych urządzeń ucznia.
 * EN: Fetches the list of the student's active devices.
 *
 * @returns PL: lista urządzeń albo błąd. EN: the device list or an error.
 */
export async function fetchDevices(): Promise<DevicesResult<Device[]>> {
  const result = await send<{ devices: Device[] }>(DEVICES_URL, { method: 'GET' });
  return result.ok ? { ok: true, value: result.value.devices } : result;
}

/**
 * PL: Wylogowuje jedno urządzenie po jego id z listy.
 * EN: Signs out one device by its id from the list.
 *
 * @param id - PL: id sesji z listy. EN: the session id from the list.
 * @returns PL: pusty sukces albo błąd. EN: an empty success or an error.
 */
export function revokeDevice(id: string): Promise<DevicesResult<null>> {
  return send<null>(`${DEVICES_URL}/revoke`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id }),
  });
}

/**
 * PL: Wylogowuje wszystkie urządzenia ucznia poza tym, na którym jest.
 * EN: Signs out all of the student's devices except the one this is on.
 *
 * @returns PL: pusty sukces albo błąd. EN: an empty success or an error.
 */
export function revokeOtherDevices(): Promise<DevicesResult<null>> {
  return send<null>(`${DEVICES_URL}/revoke-others`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
}
