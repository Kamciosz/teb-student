/**
 * PL: Test ścieżek podtoru 8 (panel Samorządu): ekran główny dla Samorządu i redakcji, ekran 6.1d dla ucznia bez roli, wydawanie kodu zaproszenia z kopiowaniem, błąd wydania, brak internetu i szerokość 320 px. Serwer panelu i sesja są podstawione (prawdziwa sesja wymaga kodu z terminala serwera), działanie serwera sprawdzają testy Vitest (worker/admin/routes.test.ts).
 * EN: Test of the subtrack 8 paths (Student Council panel): the main screen for the Council and the editorial team, screen 6.1d for a student without a role, issuing an invitation code with copying, the issue error, no internet and 320 px width. The panel server and the session are stubbed (a real session needs a code from the server terminal), the Vitest tests cover the server (worker/admin/routes.test.ts).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/AdminScreen.tsx::AdminScreen
 * @uses src/features/admin/AdminLayout.tsx::AdminLayout
 * @used_by playwright.config.ts::testDir
 */

import { expect, test, type Page } from '@playwright/test';

/** PL: Rola, jaką podstawiony serwer oddaje uczniowi. EN: The role the stubbed server gives the student. */
type Level = 'editor' | 'council' | 'admin' | null;

/** PL: Kod, który podstawiony serwer wydaje. Wymyślony. EN: The code the stubbed server issues. Invented. */
const ISSUED_CODE = 'TEB-7K4Q-92';

/**
 * PL: Podstawia sesję ucznia i serwer panelu: /me oddaje podaną rolę, /invites wydaje kod albo odpowiada błędem.
 * EN: Stubs the student session and the panel server: /me returns the given role, /invites issues a code or answers with an error.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param level - PL: rola ucznia. EN: the student's role.
 * @param inviteStatus - PL: kod odpowiedzi na wydanie kodu (201 albo błąd). EN: the answer code for issuing a code (201 or an error).
 */
async function stubServer(page: Page, level: Level, inviteStatus = 201): Promise<void> {
  // PL: Sesja ucznia: zalogowany uczeń.
  // EN: The student session: a signed-in student.
  await page.route('**/api/auth/email/get-session', (route) => {
    const now = new Date().toISOString();
    const session = { id: 's1', userId: 'u1', token: 't1', createdAt: now, updatedAt: now, expiresAt: new Date(Date.now() + 86_400_000).toISOString() };
    const user = { id: 'u1', email: 'ola.testowa@teb.edu.pl', name: '', emailVerified: true, createdAt: now, updatedAt: now };
    return route.fulfill({ json: { session, user } });
  });
  // PL: Rola ucznia w panelu.
  // EN: The student's panel role.
  await page.route('**/api/admin/me', (route) => route.fulfill({ json: { level } }));
  // PL: Wydanie kodu: ważny 14 dni od teraz.
  // EN: Issuing a code: valid for 14 days from now.
  await page.route('**/api/admin/invites', (route) => {
    if (inviteStatus !== 201) return route.fulfill({ status: inviteStatus, json: { error: 'server_error' } });
    return route.fulfill({ status: 201, json: { code: ISSUED_CODE, expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString() } });
  });
}

/**
 * PL: Sprawdza, że strona nie jest szersza niż okno.
 * EN: Checks that the page is not wider than the window.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param label - PL: opis miejsca w komunikacie błędu. EN: the place description in the error message.
 */
async function expectNoHorizontalScroll(page: Page, label: string): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, label).toBeLessThanOrEqual(0);
}

// PL: Samorząd widzi cztery części z opisami z projektu, podpis roli i brak wierszy, których jeszcze nie ma.
// EN: The Council sees four sections with the descriptions from the design, the role caption and none of the rows that do not exist yet.
test('Samorząd widzi ekran główny panelu / the Council sees the panel main screen', async ({ page }) => {
  await stubServer(page, 'council');
  await page.goto('/admin');

  // PL: Tytuł, podpis roli i wiersze.
  // EN: The title, the role caption and the rows.
  await expect(page.getByText('Panel Samorządu', { exact: true })).toBeVisible();
  await expect(page.getByText('Twoja rola: Samorząd')).toBeVisible();
  await expect(page.getByRole('link', { name: /Wpisy Pisz i publikuj aktualności\./ })).toHaveAttribute('href', '/news/admin');
  await expect(page.getByRole('link', { name: /Zgłoszenia Zmieniaj etap zgłoszeń\./ })).toHaveAttribute('href', '/reports/admin');
  await expect(page.getByRole('link', { name: /Ankiety Twórz ankiety i czytaj wyniki\./ })).toHaveAttribute('href', '/surveys/admin');
  await expect(page.getByRole('link', { name: /Kody zaproszeń Wydaj kod osobie bez szkolnej skrzynki\./ })).toHaveAttribute('href', '/admin/kody');
  await expect(page.locator('.ad-tile li')).toHaveCount(4);
});

// PL: Redakcja widzi tylko Wpisy z notatką, a adres kodów kończy się ekranem 6.1d.
// EN: The editorial team sees only Entries with a note, and the codes address ends with screen 6.1d.
test('redakcja widzi tylko Wpisy / the editorial team sees only Entries', async ({ page }) => {
  await stubServer(page, 'editor');
  await page.goto('/admin');

  await expect(page.getByText('Panel redakcji', { exact: true })).toBeVisible();
  await expect(page.getByText('Twoja rola: redakcja gazetki')).toBeVisible();
  await expect(page.locator('.ad-tile li')).toHaveCount(1);
  await expect(page.getByText('Redakcja publikuje tylko wpisy. Resztę panelu widzi Samorząd.')).toBeVisible();

  // PL: Ręcznie wpisany adres kodów: redakcja dostaje 6.1d.
  // EN: A hand-typed codes address: the editorial team gets 6.1d.
  await page.goto('/admin/kody');
  await expect(page.getByRole('heading', { name: 'Tylko dla Samorządu' })).toBeVisible();
});

// PL: Uczeń bez roli widzi tylko ekran 6.1d i wraca na pulpit przyciskiem.
// EN: A student without a role sees only screen 6.1d and goes back to the dashboard with the button.
test('uczeń bez roli widzi brak dostępu / a student without a role sees no access', async ({ page }) => {
  await stubServer(page, null);
  await page.goto('/admin');

  await expect(page.getByRole('heading', { name: 'Tylko dla Samorządu' })).toBeVisible();
  await expect(page.getByText('Ten panel jest dla Samorządu i redakcji gazetki. Jeśli to pomyłka, zgłoś ją Samorządowi.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wróć na pulpit', exact: true })).toHaveAttribute('href', '/');
});

// PL: Rama panelu bramkuje też ekrany innych części: uczeń bez roli nie widzi wpisów (3c) i dostaje ekran 6.1d.
// EN: The panel frame gates the screens of the other sections too: a student without a role does not see entries (3c) and gets screen 6.1d.
test('uczeń bez roli nie widzi części panelu w ramie / a student without a role does not see a section in the frame', async ({ page }) => {
  await stubServer(page, null);
  await page.route(/\/api\/news\/admin$/, (route) => route.fulfill({ json: { entries: [] } }));
  await page.goto('/news/admin');

  await expect(page.getByRole('heading', { name: 'Tylko dla Samorządu' })).toBeVisible();
  await expect(page.locator('[data-subtrack="3c"]')).toHaveCount(0);
});

// PL: Wydanie kodu: pokazuje kod z datą końca i kopiuje go do schowka.
// EN: Issuing a code: shows the code with the end date and copies it to the clipboard.
test('Samorząd wydaje kod i go kopiuje / the Council issues a code and copies it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await stubServer(page, 'council');
  await page.goto('/admin/kody');

  // PL: Opis z projektu stoi na ekranie, a kodu jeszcze nie ma.
  // EN: The description from the design is on the screen and there is no code yet.
  await expect(page.getByText('Dla osób bez szkolnej skrzynki. Kod działa jeden raz i jest ważny 14 dni.')).toBeVisible();
  await expect(page.getByText(ISSUED_CODE)).toHaveCount(0);

  // PL: Wydaj kod: widać go z datą końca (14 dni od dziś).
  // EN: Issue a code: it shows with the end date (14 days from today).
  await page.getByRole('button', { name: 'Wydaj kod' }).click();
  await expect(page.getByText('Nowy kod', { exact: true })).toBeVisible();
  await expect(page.getByText(ISSUED_CODE)).toBeVisible();
  const end = new Date(Date.now() + 14 * 86_400_000);
  const endText = `${String(end.getDate()).padStart(2, '0')}.${String(end.getMonth() + 1).padStart(2, '0')}.${end.getFullYear()}`;
  await expect(page.getByText(`Ważny 14 dni, do ${endText}.`)).toBeVisible();

  // PL: Kopiowanie: schowek ma kod, przycisk mówi „Skopiowano”, a po 3 sekundach wraca „Kopiuj kod”.
  // EN: Copying: the clipboard has the code, the button says "Skopiowano", and after 3 seconds "Kopiuj kod" returns.
  await page.getByRole('button', { name: 'Kopiuj kod' }).click();
  await expect(page.getByRole('button', { name: 'Skopiowano' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ISSUED_CODE);
  await expect(page.getByRole('button', { name: 'Kopiuj kod' })).toBeVisible({ timeout: 6000 });
});

// PL: Błąd serwera przy wydaniu: komunikat nad przyciskiem, a przycisk zostaje aktywny, żeby ponowić.
// EN: A server error when issuing: the message above the button, and the button stays active so the student can retry.
test('błąd wydania kodu zostawia aktywny przycisk / an issue error leaves the button active', async ({ page }) => {
  await stubServer(page, 'council', 500);
  await page.goto('/admin/kody');
  await page.getByRole('button', { name: 'Wydaj kod' }).click();

  await expect(page.getByText('Nie udało się wydać kodu. Spróbuj ponownie za chwilę.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Wydaj kod' })).toBeEnabled();
});

// PL: Bez internetu panel dalej się otwiera z zapisaną rolą, a przycisk wydania jest nieaktywny z napisem o internecie.
// EN: Without internet the panel still opens with the saved role, and the issue button is disabled with the internet text.
test('bez internetu przycisk wydania jest nieaktywny / offline the issue button is disabled', async ({ page, context }) => {
  await stubServer(page, 'council');
  await page.goto('/admin');
  await expect(page.getByText('Twoja rola: Samorząd')).toBeVisible();

  // PL: Odetnij internet i przejdź na kody (ekran jest już w aplikacji).
  // EN: Cut the internet and go to the codes (the screen is already in the app).
  await context.setOffline(true);
  await page.getByRole('link', { name: /Kody zaproszeń/ }).click();

  await expect(page.getByText('Wydanie kodu wymaga internetu.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Wydaj kod' })).toBeDisabled();

  // PL: Po powrocie internetu napis znika, a przycisk działa.
  // EN: When the internet returns the text goes away and the button works.
  await context.setOffline(false);
  await expect(page.getByText('Wydanie kodu wymaga internetu.')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Wydaj kod' })).toBeEnabled();
});

// PL: Przy 320 px żaden ekran panelu nie przewija się w poziomie, a przycisk mieści się w oknie.
// EN: At 320 px no panel screen scrolls horizontally and the button fits in the window.
test('przy szerokości 320 px nic się nie przewija w poziomie / nothing scrolls horizontally at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await stubServer(page, 'council');

  // PL: Ekran główny i kody z wydanym kodem.
  // EN: The main screen and the codes with an issued code.
  await page.goto('/admin');
  await expect(page.getByText('Twoja rola: Samorząd')).toBeVisible();
  await expectNoHorizontalScroll(page, '/admin');
  await page.goto('/admin/kody');
  await page.getByRole('button', { name: 'Wydaj kod' }).click();
  await expect(page.getByText(ISSUED_CODE)).toBeVisible();
  await expectNoHorizontalScroll(page, '/admin/kody');
  const box = await page.getByRole('button', { name: 'Kopiuj kod' }).boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 320 && box.height >= 44).toBe(true);

  // PL: Ekran braku dostępu (inna rola, ten sam adres).
  // EN: The no-access screen (another role, the same address).
  await page.unroute('**/api/admin/me');
  await page.route('**/api/admin/me', (route) => route.fulfill({ json: { level: null } }));
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Tylko dla Samorządu' })).toBeVisible();
  await expectNoHorizontalScroll(page, '/admin bez roli');
});
