/**
 * PL: Testy logowania kodem z maila (podtor 1a). Serwer jest podstawiony (page.route), bo prawdziwy kod trafia tylko do terminala serwera deweloperskiego. Sprawdzają adres spoza szkoły, ścieżkę udaną, zły kod, ekran 320 px i odliczanie ponownego wysłania.
 * EN: Tests of sign-in with an e-mail code (subtrack 1a). The server is stubbed (page.route), because the real code goes only to the dev server terminal. They check an address outside the school, the happy path, a wrong code, the 320 px screen and the resend countdown.
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
