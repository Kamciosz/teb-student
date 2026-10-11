/**
 * PL: Testy kodu zaproszenia oraz loginu i hasła (podtor 1b). Serwer jest podstawiony (page.route), bo kod zaproszenia i sekret logowania są tylko na komputerze z .dev.vars. Sprawdzają ekran 1.3, założenie konta, zły kod, zajęty login, logowanie loginem, zły login lub hasło, ponowne otwarcie aplikacji, brak internetu i ekran 320 px. Działanie serwera sprawdzają testy Vitest na prawdziwej bazie (worker/auth/invite/routes.test.ts).
 * EN: Tests of the invitation code and the login and password (subtrack 1b). The server is stubbed (page.route), because the invitation code and the sign-in secret exist only on a computer with .dev.vars. They check screen 1.3, creating an account, a wrong code, a taken login, sign-in with a login, a wrong login or password, reopening the app, no internet and the 320 px screen. The server behavior is checked by the Vitest tests on the real database (worker/auth/invite/routes.test.ts).
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses src/features/auth/invite/AuthInviteScreen.tsx::AuthInviteScreen
 * @used_by playwright.config.ts::testDir
 */

import { expect, test, type Page } from '@playwright/test';

/** PL: Kod zaproszenia, który stub uznaje za dobry. EN: The invitation code the stub treats as good. */
const GOOD_CODE = 'TEB-7K4Q-92';
/** PL: Wymyślony login i hasło konta, które stub zna. EN: The invented login and password of the account the stub knows. */
const LOGIN = 'ola3ta';
const PASSWORD = 'haslo1234';

/**
 * PL: Podstawia adresy serwera: sesję z podtoru 1a oraz rejestrację i logowanie z podtoru 1b. Sesja jest stanowa: get-session oddaje null do chwili udanej rejestracji albo logowania, a stan przeżywa przeładowanie strony, tak jak ciasteczko.
 * EN: Stubs the server addresses: the session from subtrack 1a and the sign-up and sign-in from subtrack 1b. The session is stateful: get-session returns null until a successful sign-up or sign-in, and the state survives a page reload, like a cookie.
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function stubServer(page: Page): Promise<void> {
  let isSignedIn = false;
  const user = { id: 'stub-1', email: `${LOGIN}@login.invalid`, emailVerified: true, name: LOGIN, createdAt: new Date(), updatedAt: new Date() };
  await page.route('**/api/auth/email/get-session', (route) =>
    route.fulfill({ json: isSignedIn ? { session: { id: 's1', userId: user.id, token: 't', expiresAt: new Date(Date.now() + 1e9) }, user } : null }),
  );
  await page.route('**/api/auth/invite/sign-up', (route) => {
    const body = route.request().postDataJSON() as { code: string; login: string };
    if (body.code !== GOOD_CODE) return route.fulfill({ status: 400, json: { code: 'INVITE_INVALID', message: 'Invalid invitation code' } });
    if (body.login === 'zajety') return route.fulfill({ status: 422, json: { code: 'LOGIN_TAKEN', message: 'Login already taken' } });
    isSignedIn = true;
    return route.fulfill({ json: { token: 't', user } });
  });
  await page.route('**/api/auth/invite/sign-in', (route) => {
    const body = route.request().postDataJSON() as { login: string; password: string };
    if (body.login !== LOGIN || body.password !== PASSWORD) return route.fulfill({ status: 401, json: { code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Invalid' } });
    isSignedIn = true;
    return route.fulfill({ json: { token: 't', user } });
  });
}

/**
 * PL: Wypełnia formularz zakładania konta (ekran 1.3).
 * EN: Fills in the account creation form (screen 1.3).
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param fields - PL: kod, login i hasło. EN: the code, the login and the password.
 */
async function fillSignUp(page: Page, fields: { code: string; login: string; password: string }): Promise<void> {
  await page.getByLabel('Kod zaproszenia', { exact: true }).fill(fields.code);
  await page.getByLabel('Login').fill(fields.login);
  await page.getByLabel('Hasło').fill(fields.password);
}

test.describe('ekran 1.3 / screen 1.3', () => {
  test('pokazuje teksty z projektu i blokuje przycisk do wypełnienia pól / shows the texts from the design and blocks the button until the fields are filled', async ({ page }) => {
    await stubServer(page);
    await page.goto('/auth/invite');
    await expect(page.getByRole('heading', { name: 'Masz kod od Samorządu?' })).toBeVisible();
    await expect(page.getByText('Użyj go, jeśli nie masz szkolnej skrzynki. Ustawisz własny login i hasło.')).toBeVisible();
    await expect(page.getByText('Kod zaproszenia działa tylko jeden raz.')).toBeVisible();
    await expect(page.getByLabel('Kod zaproszenia', { exact: true })).toHaveAttribute('placeholder', GOOD_CODE);
    await expect(page.getByLabel('Login')).toHaveAttribute('placeholder', 'np. ola3ta');

    const submit = page.getByRole('button', { name: 'Załóż konto' });
    await expect(submit).toBeDisabled();
    await fillSignUp(page, { code: GOOD_CODE, login: LOGIN, password: PASSWORD });
    await expect(submit).toBeEnabled();
  });

  test('strzałka wraca do logowania szkolnym adresem / the arrow goes back to the school address sign-in', async ({ page }) => {
    await stubServer(page);
    await page.goto('/auth/invite');
    await page.getByRole('link', { name: 'Wróć do logowania szkolnym adresem e-mail' }).click();
    await expect(page).toHaveURL(/\/auth\/email$/);
  });

  test('ekran 320 px mieści się bez przewijania, a pola i przyciski mają co najmniej 44 px / the 320 px screen fits without scrolling and fields and buttons are at least 44 px', async ({ page }) => {
    await stubServer(page);
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/auth/invite');
    await expect(page.getByRole('heading', { name: 'Masz kod od Samorządu?' })).toBeVisible();
    const scrolls = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(scrolls).toBe(false);

    for (const target of [page.getByLabel('Login'), page.getByRole('button', { name: 'Załóż konto' }), page.getByRole('button', { name: 'Mam już konto' })]) {
      const box = await target.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
    }
  });
});

test.describe('zakładanie konta / creating an account', () => {
  test('dobry kod zakłada konto i przenosi na pulpit / a good code creates the account and goes to the dashboard', async ({ page }) => {
    await stubServer(page);
    await page.goto('/auth/invite');
    await fillSignUp(page, { code: GOOD_CODE, login: LOGIN, password: PASSWORD });
    await page.getByRole('button', { name: 'Załóż konto' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('po ponownym otwarciu aplikacji uczeń nadal jest zalogowany / after reopening the app the student is still signed in', async ({ page }) => {
    await stubServer(page);
    await page.goto('/auth/invite');
    await fillSignUp(page, { code: GOOD_CODE, login: LOGIN, password: PASSWORD });
    await page.getByRole('button', { name: 'Załóż konto' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/auth/invite');
    await expect(page).toHaveURL(/\/$/);
  });

  test('zły kod pokazuje błąd i zostawia pola / a wrong code shows an error and keeps the fields', async ({ page }) => {
    await stubServer(page);
    await page.goto('/auth/invite');
    await fillSignUp(page, { code: 'TEB-AAAA-AA', login: LOGIN, password: PASSWORD });
    await page.getByRole('button', { name: 'Załóż konto' }).click();
    await expect(page.getByRole('alert')).toContainText('Kod zaproszenia jest nieprawidłowy');
    await expect(page.getByLabel('Login')).toHaveValue(LOGIN);
    await expect(page).toHaveURL(/\/auth\/invite$/);
  });

  test('zajęty login pokazuje błąd / a taken login shows an error', async ({ page }) => {
    await stubServer(page);
    await page.goto('/auth/invite');
    await fillSignUp(page, { code: GOOD_CODE, login: 'zajety', password: PASSWORD });
    await page.getByRole('button', { name: 'Załóż konto' }).click();
    await expect(page.getByRole('alert')).toContainText('Ten login jest już zajęty');
  });

  test('bez internetu pokazuje komunikat, a nie biały ekran / without internet shows a message, not a blank screen', async ({ page, context }) => {
    await stubServer(page);
    await page.goto('/auth/invite');
    await fillSignUp(page, { code: GOOD_CODE, login: LOGIN, password: PASSWORD });
    await page.unroute('**/api/auth/invite/sign-up');
    await context.setOffline(true);
    await page.getByRole('button', { name: 'Załóż konto' }).click();
    await expect(page.getByRole('alert')).toContainText('Brak połączenia z serwerem');
    await expect(page.getByRole('heading', { name: 'Masz kod od Samorządu?' })).toBeVisible();
  });
});

test.describe('logowanie loginem i hasłem / sign-in with a login and a password', () => {
  /**
   * PL: Przechodzi z ekranu 1.3 do logowania loginem.
   * EN: Goes from screen 1.3 to the login sign-in.
   *
   * @param page - PL: strona testu. EN: the test page.
   */
  async function openSignIn(page: Page): Promise<void> {
    await stubServer(page);
    await page.goto('/auth/invite');
    await page.getByRole('button', { name: 'Mam już konto' }).click();
    await expect(page.getByRole('heading', { name: 'Zaloguj się' })).toBeVisible();
  }

  test('dobry login i hasło logują i przenoszą na pulpit / a good login and password sign in and go to the dashboard', async ({ page }) => {
    await openSignIn(page);
    await page.getByLabel('Login').fill(LOGIN);
    await page.getByLabel('Hasło').fill(PASSWORD);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('złe hasło pokazuje błąd i nie loguje / a wrong password shows an error and does not sign in', async ({ page }) => {
    await openSignIn(page);
    await page.getByLabel('Login').fill(LOGIN);
    await page.getByLabel('Hasło').fill('inne-haslo');
    await page.getByRole('button', { name: 'Zaloguj się' }).click();
    await expect(page.getByRole('alert')).toContainText('Login lub hasło są nieprawidłowe');
    await expect(page).toHaveURL(/\/auth\/invite$/);
  });

  test('można wrócić do kodu zaproszenia / the student can go back to the invitation code', async ({ page }) => {
    await openSignIn(page);
    await page.getByRole('button', { name: 'Mam kod zaproszenia' }).click();
    await expect(page.getByRole('heading', { name: 'Masz kod od Samorządu?' })).toBeVisible();
  });
});
