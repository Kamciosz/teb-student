/**
 * PL: Testy listy urządzeń i wylogowywania innych urządzeń: lista bez tokenu i IP, oznaczenie bieżącego urządzenia, wylogowanie jednego i wszystkich innych, odmowa bez Origin, 401 bez sesji, 403 dla sesji starszej niż 24 h oraz nazwy urządzeń z user-agenta. Działają na prawdziwej bazie D1 testów.
 * EN: Tests of the device list and signing out other devices: the list without the token and the IP, marking the current device, signing out one and all other devices, refusal without Origin, 401 without a session, 403 for a session older than 24 h, and device names from the user-agent. They run on the real test D1 database.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/auth/email/devices.ts::describeUserAgent
 * @uses worker/auth/email/testRuntime.ts::createTestRuntime
 * @used_by vitest.config.ts::include
 */

// PL: Vitest daje testy i sztuczny zegar, a env z Workera pozwala wysłać zapytanie bez nagłówka Origin.
// EN: Vitest gives the tests and a fake clock, and the Worker env lets a request go out without an Origin header.
import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { describeUserAgent } from './devices';
import { call, createTestRuntime, sessionCookie, signIn, type TestRuntime } from './testRuntime';

/** PL: Wymyślony adres ucznia do testów. EN: An invented student address for tests. */
const EMAIL = 'ola.urzadzenia@teb.edu.pl';
/** PL: Lista urządzeń. EN: The device list. */
const LIST = '/devices';
/** PL: Wylogowanie jednego urządzenia. EN: Signing out one device. */
const REVOKE = '/devices/revoke';
/** PL: Wylogowanie wszystkich innych urządzeń. EN: Signing out all other devices. */
const REVOKE_OTHERS = '/devices/revoke-others';

/** PL: Jedno urządzenie z listy, tak jak je zwraca serwer. EN: One device from the list, as the server returns it. */
type Listed = { id: string; browser: string; system: string; lastActiveAt: string; current: boolean };

// PL: Po każdym teście zegar wraca do prawdziwego.
// EN: After every test the clock goes back to the real one.
afterEach(() => {
  vi.useRealTimers();
});

/**
 * PL: Pobiera listę urządzeń z danym ciasteczkiem.
 * EN: Fetches the device list with the given cookie.
 *
 * @param test - PL: logowanie testowe. EN: the test sign-in.
 * @param cookie - PL: ciasteczko sesji. EN: the session cookie.
 * @returns PL: kod odpowiedzi i ciało jako tekst. EN: the response status and the body as text.
 */
async function listWith(test: TestRuntime, cookie: string): Promise<{ status: number; text: string }> {
  const response = await call(test.app, LIST, { cookie });
  return { status: response.status, text: await response.text() };
}

let nextStudent = 0;

/**
 * PL: Zakłada dwa urządzenia nowego ucznia i zwraca ciasteczka oraz ich id z listy. Każde wywołanie to osobne konto, więc sesje z innych testów nie mieszają się w listach.
 * EN: Sets up two devices of a new student and returns their cookies and the ids from the list. Each call is a separate account, so sessions from other tests do not mix into the lists.
 *
 * @returns PL: logowanie, ciasteczka i id obu urządzeń. EN: the sign-in, the cookies and the ids of both devices.
 */
async function twoDevices(): Promise<{ test: TestRuntime; email: string; mine: string; other: string; myId: string; otherId: string }> {
  nextStudent += 1;
  const test = createTestRuntime();
  const email = `ola.urzadzenia.${nextStudent}@teb.edu.pl`;
  const mine = await signIn(test, email);
  const other = await signIn(test, email);
  // PL: Id każdego urządzenia bierzemy z jego własnej listy, gdzie jest oznaczone jako bieżące.
  // EN: Each device's id is taken from its own list, where it is marked as current.
  const myId = currentDeviceId(await listWith(test, mine));
  const otherId = currentDeviceId(await listWith(test, other));
  return { test, email, mine, other, myId, otherId };
}

/**
 * PL: Id urządzenia oznaczonego jako bieżące w odpowiedzi listy.
 * EN: The id of the device marked as current in a list response.
 *
 * @param listed - PL: odpowiedź listy urządzeń. EN: the device list response.
 * @returns PL: id bieżącego urządzenia albo pusty tekst. EN: the id of the current device, or an empty string.
 */
function currentDeviceId(listed: { text: string }): string {
  const devices = (JSON.parse(listed.text) as { devices: Listed[] }).devices;
  return devices.find((device) => device.current)?.id ?? '';
}

// PL: Grupa testów listy urządzeń.
// EN: A group of device list tests.
describe('lista urządzeń / device list', () => {
  // PL: Dwa logowania to dwa urządzenia, a bieżące jest oznaczone tylko jedno i zależy od ciasteczka.
  // EN: Two sign-ins are two devices, and only one is marked as current, depending on the cookie.
  it('pokazuje dwa urządzenia i oznacza bieżące / shows two devices and marks the current one', async () => {
    const { test, mine, other, myId, otherId } = await twoDevices();

    const fromMine = await listWith(test, mine);
    expect(fromMine.status).toBe(200);
    const devices = (JSON.parse(fromMine.text) as { devices: Listed[] }).devices;
    expect(devices).toHaveLength(2);
    expect(devices.filter((device) => device.current).map((device) => device.id)).toEqual([myId]);

    const fromOther = JSON.parse((await listWith(test, other)).text) as { devices: Listed[] };
    expect(fromOther.devices.filter((device) => device.current).map((device) => device.id)).toEqual([otherId]);
  });

  // PL: Token sesji i adres IP nie mogą wyjść do przeglądarki, nawet gdy Better Auth je zwraca.
  // EN: The session token and the IP address must not leave for the browser, even when Better Auth returns them.
  it('nie zwraca tokenu ani adresu IP / does not return the token or the IP address', async () => {
    const test = createTestRuntime();
    const ip = '203.0.113.77';
    await call(test.app, '/email-otp/send-verification-otp', { body: { email: EMAIL }, ip });
    const code = test.sent[test.sent.length - 1]?.code ?? '';
    const cookie = sessionCookie(await call(test.app, '/sign-in/email-otp', { body: { email: EMAIL, otp: code }, ip }));
    const token = decodeURIComponent(cookie.split('=')[1] ?? '').split('.')[0] ?? '';
    expect(token.length).toBeGreaterThan(10);

    const listed = await listWith(test, cookie);
    expect(listed.status).toBe(200);
    expect(listed.text).not.toContain(token);
    expect(listed.text).not.toContain(ip);
    expect(listed.text).not.toContain('"token"');
    expect(listed.text).not.toContain('ipAddress');
  });

  // PL: Bez sesji lista jest niedostępna, a odpowiedź ma nasz kod błędu.
  // EN: Without a session the list is unavailable, and the answer has our error code.
  it('bez sesji 401 / without a session 401', async () => {
    const test = createTestRuntime();
    const response = await call(test.app, LIST);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'unauthorized' });
  });

  // PL: Sesja starsza niż 24 h nie pokazuje listy: dostaje 403 z kodem, który UI zamieni na „zaloguj się ponownie”.
  // EN: A session older than 24 h does not show the list: it gets 403 with the code the UI turns into "sign in again".
  it('stara sesja dostaje 403 po 24 h / an old session gets 403 after 24 h', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-09T10:00:00Z'));
    const test = createTestRuntime();
    const cookie = await signIn(test, EMAIL);

    vi.setSystemTime(new Date('2026-10-10T09:59:00Z'));
    expect((await call(test.app, LIST, { cookie })).status).toBe(200);

    vi.setSystemTime(new Date('2026-10-10T10:00:01Z'));
    const response = await call(test.app, LIST, { cookie });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'session_not_fresh' });
  });
});

// PL: Grupa testów wylogowywania urządzeń.
// EN: A group of device sign-out tests.
describe('wylogowanie urządzeń / signing out devices', () => {
  // PL: Wylogowanie innego urządzenia kasuje jego sesję, więc jego ciasteczko przestaje działać.
  // EN: Signing out another device deletes its session, so its cookie stops working.
  it('wylogowuje inne urządzenie, jego ciasteczko przestaje działać / signs out another device, its cookie stops working', async () => {
    const { test, mine, other, otherId } = await twoDevices();

    const response = await call(test.app, REVOKE, { cookie: mine, body: { id: otherId } });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect((await listWith(test, other)).status).toBe(401);
  });

  // PL: Bieżącego urządzenia ta trasa nie wylogowuje: zostałoby ciasteczko bez sesji. Do tego jest wylogowanie zwykłe.
  // EN: This route does not sign out the current device: a cookie without a session would be left. Regular sign-out is for that.
  it('nie wylogowuje bieżącego urządzenia / does not sign out the current device', async () => {
    const { test, mine, myId } = await twoDevices();

    const response = await call(test.app, REVOKE, { cookie: mine, body: { id: myId } });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'current_session' });
    expect((await listWith(test, mine)).status).toBe(200);
  });

  // PL: Nieznane id to 404, a nie ciche „ok”, żeby UI wiedziało, że urządzenia już nie ma.
  // EN: An unknown id is 404, not a silent "ok", so the UI knows the device is already gone.
  it('nieznane id daje 404 / an unknown id gives 404', async () => {
    const { test, mine } = await twoDevices();

    const response = await call(test.app, REVOKE, { cookie: mine, body: { id: 'nie-ma-takiego' } });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });

  // PL: „Wyloguj z innych urządzeń” zostawia bieżące urządzenie i kasuje wszystkie pozostałe.
  // EN: "Sign out other devices" keeps the current device and deletes all the others.
  it('wylogowuje wszystkie inne, zostaje bieżące / signs out all others, keeps the current one', async () => {
    const { test, email, mine, other } = await twoDevices();
    const third = await signIn(test, email);

    const response = await call(test.app, REVOKE_OTHERS, { cookie: mine, body: {} });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    const left = JSON.parse((await listWith(test, mine)).text) as { devices: Listed[] };
    expect(left.devices).toHaveLength(1);
    expect(left.devices[0]?.current).toBe(true);
    expect((await listWith(test, other)).status).toBe(401);
    expect((await listWith(test, third)).status).toBe(401);
  });

  // PL: Bez nagłówka Origin Better Auth odrzuca zapytanie o wylogowanie. Test sprawdza, że trasa przekazuje to dalej i nie omija tej ochrony.
  // EN: Without an Origin header Better Auth rejects the sign-out request. The test checks that the route passes it on and does not skip this protection.
  it('bez nagłówka Origin nie wylogowuje innych / without an Origin header it does not sign out the others', async () => {
    const { test, mine, other } = await twoDevices();

    const response = await test.app.request(
      'http://localhost/api/auth/email/devices/revoke-others',
      {
        method: 'POST',
        headers: { cookie: mine, 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.9' },
        body: '{}',
      },
      env,
    );
    expect(response.status).toBe(403);
    expect((await listWith(test, other)).status).toBe(200);
  });

  // PL: Bez sesji wylogowanie innych nie ma do kogo się odnieść: 401.
  // EN: Without a session there is no one to act for: 401.
  it('bez sesji wylogowanie innych daje 401 / without a session signing out others gives 401', async () => {
    const test = createTestRuntime();
    const response = await call(test.app, REVOKE_OTHERS, { body: {} });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'unauthorized' });
  });
});

// PL: Grupa testów nazw urządzeń z user-agenta. Sprawdzamy kolejność dopasowań: Edge przed Chrome, Chrome przed Safari, Android przed Linux, iPhone przed macOS.
// EN: A group of device name tests from the user-agent. We check the order of matches: Edge before Chrome, Chrome before Safari, Android before Linux, iPhone before macOS.
describe('nazwy urządzeń / device names', () => {
  it.each([
    ['Chrome na Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Chrome', 'Windows'],
    ['Edge na Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0', 'Edge', 'Windows'],
    ['Safari na iPhonie', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1', 'Safari', 'iPhone'],
    ['Chrome na Androidzie', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', 'Chrome', 'Android'],
    ['Edge na Androidzie', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 EdgA/120.0.0.0', 'Edge', 'Android'],
    ['Safari na macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', 'Safari', 'macOS'],
    ['Firefox na Linuksie', 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0', 'Firefox', 'Linux'],
    ['Safari na iPadzie', 'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1', 'Safari', 'iPad'],
    ['Chrome na iPhonie (CriOS)', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1', 'Chrome', 'iPhone'],
  ])('%s / %s', (_name, userAgent, browser, system) => {
    expect(describeUserAgent(userAgent)).toEqual({ browser, system });
  });

  // PL: Brak user-agenta albo nieznany tekst daje ogólne napisy, a nie puste pole.
  // EN: A missing user-agent or an unknown text gives general labels, not an empty field.
  it('brak user-agenta daje ogólne napisy / a missing user-agent gives general labels', () => {
    expect(describeUserAgent(null)).toEqual({ browser: 'Nieznana przeglądarka', system: 'Nieznany system' });
    expect(describeUserAgent('curl/8.4.0')).toEqual({ browser: 'Nieznana przeglądarka', system: 'Nieznany system' });
  });
});
