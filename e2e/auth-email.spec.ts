/**
 * PL: Testy logowania kodem z maila (podtor 1a). Serwer jest podstawiony (page.route), bo prawdziwy kod trafia tylko do terminala serwera deweloperskiego. Sprawdzają adres spoza szkoły, ścieżkę udaną, zły kod, ekran 320 px, odliczanie ponownego wysłania oraz ekran „Moje urządzenia”.
 * EN: Tests of sign-in with an e-mail code (subtrack 1a). The server is stubbed (page.route), because the real code goes only to the dev server terminal. They check an address outside the school, the happy path, a wrong code, the 320 px screen, the resend countdown and the "My devices" screen.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/AuthEmailScreen.tsx::AuthEmailScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page } from '@playwright/test';

// PL: Wymyślony adres ucznia. Nie jest prawdziwy.
// EN: An invented student address. It is not real.
const EMAIL = 'ola.testowa@teb.edu.pl';

// PL: Kod, który podstawiony serwer uznaje za dobry.
// EN: The code that the stubbed server accepts as correct.
const GOOD_CODE = '123456';

// PL: Podstawiony serwer: zapisuje, ile razy poproszono o kod, a sesję tworzy dopiero dobry kod.
// EN: The stubbed server: records how many times a code was requested, and only the correct code creates a session.
type StubServer = { sendCount: () => number };

/**
 * PL: Podstawia cztery adresy API logowania. Sesja jest stanowa: get-session oddaje null do chwili wpisania dobrego kodu.
 * EN: Stubs the four sign-in API addresses. The session is stateful: get-session returns null until the correct code is entered.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @returns PL: licznik wysłanych próśb o kod. EN: the counter of code requests.
 */
async function stubAuthApi(page: Page): Promise<StubServer> {
  let sent = 0;
  let signedIn = false;
  const user = { id: 'stub-1', email: EMAIL, emailVerified: true, name: 'Ola', createdAt: new Date(), updatedAt: new Date() };
  await page.route('**/api/auth/email/get-session', (route) =>
    route.fulfill({ json: signedIn ? { session: { id: 's1', userId: user.id, token: 't', expiresAt: new Date(Date.now() + 1e9) }, user } : null }),
  );
  await page.route('**/api/auth/email/email-otp/send-verification-otp', (route) => {
    sent += 1;
    return route.fulfill({ json: { success: true } });
  });
  await page.route('**/api/auth/email/sign-in/email-otp', (route) => {
    const body = route.request().postDataJSON() as { otp: string };
    if (body.otp !== GOOD_CODE) return route.fulfill({ status: 400, json: { code: 'INVALID_OTP', message: 'Invalid OTP' } });
    signedIn = true;
    return route.fulfill({ json: { token: 't', user } });
  });
  return { sendCount: () => sent };
}

/**
 * PL: Wpisuje adres i przechodzi do drugiego kroku (pola na kod).
 * EN: Enters the address and moves to the second step (the code fields).
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function requestCodeFor(page: Page): Promise<void> {
  await page.goto('/auth/email');
  await page.getByLabel('Szkolny e-mail').fill(EMAIL);
  await page.getByRole('button', { name: 'Wyślij kod' }).click();
  await expect(page.getByRole('heading', { name: 'Wpisz kod' })).toBeVisible();
}

// PL: Grupa testów pierwszego kroku (adres).
// EN: A group of first step tests (the address).
test.describe('krok adresu / address step', () => {
  // PL: Adres spoza szkoły dostaje błąd, a prośba o kod nie jest wysyłana.
  // EN: An address outside the school gets an error, and the code request is not sent.
  test('obcy adres nie wysyła kodu / a foreign address does not send a code', async ({ page }) => {
    const server = await stubAuthApi(page);
    await page.goto('/auth/email');
    await page.getByLabel('Szkolny e-mail').fill('ola@gmail.com');
    await page.getByRole('button', { name: 'Wyślij kod' }).click();
    await expect(page.getByRole('alert')).toContainText('@teb.edu.pl');
    expect(server.sendCount()).toBe(0);
  });

  // PL: Na 320 px nie ma przewijania w poziomie, a cel dotyku ma co najmniej 44 px.
  // EN: At 320 px there is no horizontal scroll, and the touch target is at least 44 px.
  test('ekran 320 px mieści się bez przewijania / the 320 px screen fits without scrolling', async ({ page }) => {
    await stubAuthApi(page);
    await page.setViewportSize({ width: 320, height: 640 });
    await requestCodeFor(page);
    const scrolls = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(scrolls).toBe(false);
    const box = await page.getByLabel('Cyfra 1 z 6').boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

// PL: Grupa testów drugiego kroku (kod).
// EN: A group of second step tests (the code).
test.describe('krok kodu / code step', () => {
  // PL: Ścieżka udana: zamaskowany adres, wklejenie kodu do pierwszego pola i przejście na stronę główną.
  // EN: The happy path: the masked address, pasting the code into the first field and moving to the home page.
  test('dobry kod loguje i przenosi na / the correct code signs in and goes to /', async ({ page }) => {
    await stubAuthApi(page);
    await requestCodeFor(page);
    await expect(page.getByText('o***@teb.edu.pl')).toBeVisible();
    await page.getByLabel('Cyfra 1 z 6').fill(GOOD_CODE);
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  // PL: Zły kod pokazuje błąd i czyści pola, a uczeń zostaje na ekranie kodu.
  // EN: A wrong code shows an error and clears the fields, and the student stays on the code screen.
  test('zły kod pokazuje błąd i czyści pola / a wrong code shows an error and clears the fields', async ({ page }) => {
    await stubAuthApi(page);
    await requestCodeFor(page);
    await page.getByLabel('Cyfra 1 z 6').fill('999999');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByRole('alert')).toContainText('Kod jest nieprawidłowy');
    await expect(page.getByLabel('Cyfra 1 z 6')).toHaveValue('');
    await expect(page.getByRole('heading', { name: 'Wpisz kod' })).toBeVisible();
  });

  // PL: Odliczanie blokuje ponowne wysłanie, a przycisk „Wyślij kod ponownie” jest dostępny dopiero po nim, więc na starcie widać licznik.
  // EN: The countdown blocks resending, and the "Wyślij kod ponownie" button is available only after it, so the counter shows at the start.
  test('po wysłaniu działa odliczanie / the countdown runs after sending', async ({ page }) => {
    await stubAuthApi(page);
    await requestCodeFor(page);
    await expect(page.getByText(/Nie dotarł\? Wyślij ponownie za 0:\d\d/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Wyślij kod ponownie' })).toHaveCount(0);
  });
});

// PL: Jedno urządzenie z listy tak, jak zwraca je serwer (bez tokenu i adresu IP).
// EN: One device from the list, as the server returns it (no token and no IP address).
type StubDevice = { id: string; browser: string; system: string; lastActiveAt: string; current: boolean };

/**
 * PL: Podstawia API urządzeń. Uczeń jest zalogowany; lista zmienia się, gdy wylogowano urządzenie. Gdy `freshness` to false, lista zwraca 403 session_not_fresh.
 * EN: Stubs the device API. The student is signed in; the list changes when a device is signed out. When `freshness` is false, the list returns 403 session_not_fresh.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param options - PL: początkowa lista i czy sesja jest świeża. EN: the starting list and whether the session is fresh.
 */
async function stubDevicesApi(page: Page, options: { devices: StubDevice[]; freshness: boolean; signedIn?: boolean }): Promise<void> {
  let devices = options.devices;
  const user = { id: 'stub-1', email: EMAIL, emailVerified: true, name: 'Ola', createdAt: new Date(), updatedAt: new Date() };
  await page.route('**/api/auth/email/get-session', (route) =>
    route.fulfill({ json: options.signedIn === false ? null : { session: { id: 's1', userId: user.id, token: 't', expiresAt: new Date(Date.now() + 1e9) }, user } }),
  );
  await page.route('**/api/auth/email/devices', (route) => {
    if (!options.freshness) return route.fulfill({ status: 403, json: { error: 'session_not_fresh', code: 'SESSION_NOT_FRESH' } });
    return route.fulfill({ json: { devices } });
  });
  await page.route('**/api/auth/email/devices/revoke', (route) => {
    const body = route.request().postDataJSON() as { id: string };
    devices = devices.filter((device) => device.id !== body.id);
    return route.fulfill({ json: { ok: true } });
  });
  await page.route('**/api/auth/email/devices/revoke-others', (route) => {
    devices = devices.filter((device) => device.current);
    return route.fulfill({ json: { ok: true } });
  });
}

// PL: Dwa urządzenia: to, z którego idzie test (Chrome na Androidzie), i drugie (Safari na iPhonie).
// EN: Two devices: the one the test runs on (Chrome on Android), and a second one (Safari on iPhone).
const TWO_DEVICES: StubDevice[] = [
  { id: 'd1', browser: 'Chrome', system: 'Android', lastActiveAt: '2026-10-13T08:00:00.000Z', current: true },
  { id: 'd2', browser: 'Safari', system: 'iPhone', lastActiveAt: '2026-10-12T18:30:00.000Z', current: false },
];

// PL: Grupa testów ekranu urządzeń (adres /auth/email/urzadzenia).
// EN: A group of tests of the devices screen (the /auth/email/urzadzenia address).
test.describe('moje urządzenia / my devices', () => {
  // PL: Lista pokazuje urządzenia; bieżące ma znacznik, a inne przycisk wylogowania.
  // EN: The list shows the devices; the current one has a mark, and the others have a sign-out button.
  test('lista pokazuje bieżące urządzenie i przycisk dla innych / the list shows the current device and a button for the others', async ({ page }) => {
    await stubDevicesApi(page, { devices: TWO_DEVICES, freshness: true });
    await page.goto('/auth/email/urzadzenia');
    await expect(page.getByRole('heading', { name: 'Moje urządzenia' })).toBeVisible();
    await expect(page.getByText('Chrome na Android')).toBeVisible();
    await expect(page.getByText('To urządzenie')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Wyloguj: Safari na iPhone' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Wyloguj: Chrome na Android' })).toHaveCount(0);
  });

  // PL: Wylogowanie jednego urządzenia usuwa je z listy i pokazuje potwierdzenie.
  // EN: Signing out one device removes it from the list and shows a confirmation.
  test('wylogowanie jednego urządzenia / signing out one device', async ({ page }) => {
    await stubDevicesApi(page, { devices: TWO_DEVICES, freshness: true });
    await page.goto('/auth/email/urzadzenia');
    await page.getByRole('button', { name: 'Wyloguj: Safari na iPhone' }).click();
    await expect(page.getByRole('status')).toContainText('Urządzenie zostało wylogowane.');
    await expect(page.getByRole('button', { name: 'Wyloguj: Safari na iPhone' })).toHaveCount(0);
  });

  // PL: „Wyloguj z innych urządzeń” zostawia tylko bieżące urządzenie.
  // EN: "Wyloguj z innych urządzeń" leaves only the current device.
  test('wylogowanie innych urządzeń / signing out the other devices', async ({ page }) => {
    await stubDevicesApi(page, { devices: TWO_DEVICES, freshness: true });
    await page.goto('/auth/email/urzadzenia');
    await page.getByRole('button', { name: 'Wyloguj z innych urządzeń' }).click();
    await expect(page.getByRole('status')).toContainText('Wylogowano wszystkie inne urządzenia.');
    await expect(page.getByRole('button', { name: /^Wyloguj: / })).toHaveCount(0);
  });

  // PL: Stara sesja: lista nie działa i pokazuje prośbę o ponowne logowanie, ale „Wyloguj z innych urządzeń” zostaje.
  // EN: An old session: the list does not work and asks to sign in again, but "Wyloguj z innych urządzeń" stays.
  test('stara sesja prosi o ponowne logowanie / an old session asks to sign in again', async ({ page }) => {
    await stubDevicesApi(page, { devices: TWO_DEVICES, freshness: false });
    await page.goto('/auth/email/urzadzenia');
    await expect(page.getByRole('alert')).toContainText('wyloguj się i zaloguj ponownie');
    await expect(page.getByRole('button', { name: 'Wyloguj z innych urządzeń' })).toBeEnabled();
  });

  // PL: Na 320 px lista urządzeń nie przewija się w poziomie, a przycisk „Wyloguj” ma co najmniej 44 px wysokości.
  // EN: At 320 px the device list does not scroll horizontally, and the "Wyloguj" button is at least 44 px tall.
  test('lista urządzeń 320 px mieści się bez przewijania / the device list at 320 px fits without scrolling', async ({ page }) => {
    await stubDevicesApi(page, { devices: TWO_DEVICES, freshness: true });
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/auth/email/urzadzenia');
    const button = page.getByRole('button', { name: 'Wyloguj: Safari na iPhone' });
    await expect(button).toBeVisible();
    const scrolls = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(scrolls).toBe(false);
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  // PL: Niezalogowany uczeń trafia z listy urządzeń na ekran logowania.
  // EN: A signed-out student is sent from the device list to the sign-in screen.
  test('niezalogowany wraca do logowania / a signed-out student goes back to sign-in', async ({ page }) => {
    await stubDevicesApi(page, { devices: TWO_DEVICES, freshness: true, signedIn: false });
    await page.goto('/auth/email/urzadzenia');
    await expect(page.getByLabel('Szkolny e-mail')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/email$/);
  });
});
