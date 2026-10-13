/**
 * PL: Test ścieżki Samorządu w podtorze 3c: lista wpisów ze szkicami w ramie panelu, publikacja szkicu, usuwanie z potwierdzeniem i anulowaniem, pusty stan, odmowa serwera, błąd publikacji, przejście do kreatora „Nowy wpis”, szerokość 320 px i brak internetu. API jest podstawione (prawdziwe wymaga roli z podtoru 8 i zalogowania); serwer sprawdzają testy Vitest (worker/news/admin/routes.test.ts), także to, że uczeń nie widzi szkiców.
 * EN: Test of the Student Council path in subtrack 3c: the entry list with drafts in the panel frame, publishing a draft, deleting with a confirmation and a cancel, the empty state, a server refusal, a publish error, the way to the "Nowy wpis" wizard, 320 px width and no internet. The API is stubbed (the real one requires a role from subtrack 8 and a sign-in); the server is covered by the Vitest tests (worker/news/admin/routes.test.ts), including that a student does not see drafts.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/admin/NewsAdminScreen.tsx::NewsAdminScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page } from '@playwright/test';

/** PL: Wpis podstawionego API. EN: An entry of the stubbed API. */
type StubEntry = { id: string; type: string; status: 'draft' | 'published'; title: string; source: string; publishedAt: string | null };

/**
 * PL: Kafle listy wpisów. Menu panelu też jest listą, więc szukamy po nazwie listy.
 * EN: The entry list tiles. The panel menu is a list too, so we look up by the list name.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @returns PL: lokalizator kafli. EN: the tile locator.
 */
function tiles(page: Page) {
  // PL: Lista ma nazwę „Wpisy”, a menu panelu ma inną.
  // EN: The list is named "Wpisy", the panel menu has another name.
  return page.getByRole('list', { name: 'Wpisy' }).getByRole('listitem');
}

/** PL: Dwa wpisy: szkic i opublikowany, szkic pierwszy jak na serwerze. EN: Two entries: a draft and a published one, the draft first like on the server. */
function sampleEntries(): StubEntry[] {
  return [
    { id: 'e-szkic', type: 'news', status: 'draft', title: 'Turniej e-sportowy klas', source: 'Samorząd', publishedAt: null },
    { id: 'e-pub', type: 'event', status: 'published', title: 'Dzień sportu', source: 'Samorząd', publishedAt: '2026-10-09T10:00:00.000Z' },
  ];
}

/**
 * PL: Podstawia sesję zalogowanej redaktorki i jej rolę w panelu (editor), jak w e2e/admin.spec.ts.
 * EN: Stubs a signed-in editor session and her panel role (editor), as in e2e/admin.spec.ts.
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function stubSession(page: Page): Promise<void> {
  // PL: Sesja: zalogowana osoba.
  // EN: The session: a signed-in person.
  await page.route('**/api/auth/email/get-session', (route) => {
    const now = new Date().toISOString();
    const session = { id: 's1', userId: 'u1', token: 't1', createdAt: now, updatedAt: now, expiresAt: new Date(Date.now() + 86_400_000).toISOString() };
    const user = { id: 'u1', email: 'ola.testowa@teb.edu.pl', name: '', emailVerified: true, createdAt: now, updatedAt: now };
    return route.fulfill({ json: { session, user } });
  });
  // PL: Rola w panelu: redaktorka.
  // EN: The panel role: an editor.
  await page.route('**/api/admin/me', (route) => route.fulfill({ json: { level: 'editor' } }));
}

/**
 * PL: Podstawia API panelu z pamięcią: GET oddaje listę, POST /:id/publish zmienia szkic w opublikowany, DELETE /:id usuwa wpis.
 * EN: Stubs the panel API with memory: GET returns the list, POST /:id/publish turns a draft into a published entry, DELETE /:id removes the entry.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param entries - PL: wpisy na start. EN: the entries to start with.
 */
async function stubAdminApi(page: Page, entries: StubEntry[] = sampleEntries()): Promise<void> {
  await stubSession(page);
  await page.route(/\/api\/news\/admin(\/.*)?$/, async (route) => {
    const request = route.request();
    const [, , , , id, action] = new URL(request.url()).pathname.split('/');
    // PL: Lista.
    // EN: The list.
    if (!id) return route.fulfill({ json: { entries } });
    const index = entries.findIndex((item) => item.id === id);
    if (index < 0) return route.fulfill({ status: 404, json: { error: 'not_found' } });
    // PL: Publikacja zmienia stan, usunięcie wyrzuca wpis z pamięci.
    // EN: Publishing changes the status, deleting removes the entry from memory.
    if (action === 'publish') Object.assign(entries[index] as StubEntry, { status: 'published', publishedAt: '2026-10-12T08:00:00.000Z' });
    if (request.method() === 'DELETE') entries.splice(index, 1);
    return route.fulfill({ json: { id } });
  });
}

// PL: Lista pokazuje szkic i wpis opublikowany; „Opublikuj” ma tylko szkic.
// EN: The list shows the draft and the published entry; only the draft has "Opublikuj".
test('lista pokazuje szkic i wpis opublikowany w ramie panelu / the list shows a draft and a published entry in the panel frame', async ({ page }) => {
  await stubAdminApi(page);
  await page.goto('/news/admin');

  await expect(page.locator('[data-subtrack="3c"]')).toBeVisible();
  await expect(tiles(page)).toHaveCount(2);
  await expect(tiles(page).first()).toContainText('Turniej e-sportowy klas');
  await expect(tiles(page).first()).toContainText('Szkic');
  await expect(tiles(page).last()).toContainText('Opublikowany');
  await expect(tiles(page).last()).toContainText('Samorząd · 9.10');
  await expect(page.getByRole('button', { name: /^Opublikuj/ })).toHaveCount(1);
});

// PL: Publikacja szkicu zmienia go w wpis opublikowany, a przycisk „Opublikuj” znika.
// EN: Publishing a draft turns it into a published entry, and the "Opublikuj" button disappears.
test('Samorząd publikuje szkic / the Student Council publishes a draft', async ({ page }) => {
  await stubAdminApi(page);
  await page.goto('/news/admin');

  await page.getByRole('button', { name: /^Opublikuj/ }).click();

  await expect(tiles(page).first()).toContainText('Opublikowany');
  await expect(page.getByRole('button', { name: /^Opublikuj/ })).toHaveCount(0);
});

// PL: Usunięcie pyta o potwierdzenie: „Anuluj” nic nie usuwa, „Usuń wpis” usuwa.
// EN: Deleting asks for a confirmation: "Anuluj" deletes nothing, "Usuń wpis" deletes.
test('usunięcie wymaga potwierdzenia / deleting needs a confirmation', async ({ page }) => {
  await stubAdminApi(page);
  await page.goto('/news/admin');

  // PL: Anulowanie zamyka arkusz i zostawia oba wpisy.
  // EN: Cancelling closes the sheet and leaves both entries.
  await page.getByRole('button', { name: /^Usuń: Dzień sportu/ }).click();
  const sheet = page.getByRole('dialog', { name: 'Usunąć wpis?' });
  await expect(sheet).toContainText('Uczniowie przestaną widzieć wpis „Dzień sportu”.');
  await sheet.getByRole('button', { name: 'Anuluj' }).click();
  await expect(sheet).toHaveCount(0);
  await expect(tiles(page)).toHaveCount(2);

  // PL: Potwierdzenie usuwa wpis i zamyka arkusz.
  // EN: Confirming deletes the entry and closes the sheet.
  await page.getByRole('button', { name: /^Usuń: Dzień sportu/ }).click();
  await sheet.getByRole('button', { name: 'Usuń wpis' }).click();
  await expect(sheet).toHaveCount(0);
  await expect(tiles(page)).toHaveCount(1);
  await expect(tiles(page).first()).toContainText('Turniej e-sportowy klas');
});

// PL: Bez wpisów lista pokazuje pusty stan, a przycisk „Nowy wpis” prowadzi do kreatora z podtoru 3b.
// EN: With no entries the list shows the empty state, and the "Nowy wpis" button leads to the wizard from subtrack 3b.
test('pusta lista i przejście do kreatora / the empty list and the way to the wizard', async ({ page }) => {
  await stubAdminApi(page, []);
  await page.goto('/news/admin');
  await expect(page.getByRole('heading', { name: 'Nie ma jeszcze wpisów' })).toBeVisible();

  await page.getByRole('link', { name: 'Nowy wpis' }).click();

  await expect(page).toHaveURL(/\/news\/editor$/);
  await expect(page.getByRole('heading', { name: 'Jaki to wpis?' })).toBeVisible();
});

// PL: Odmowa serwera (403 bez roli) pokazuje komunikat błędu pobrania, a nie dane.
// EN: A server refusal (403 without a role) shows the fetch error message, not data.
test('odmowa serwera pokazuje błąd pobrania / a server refusal shows the fetch error', async ({ page }) => {
  await stubSession(page);
  await page.route(/\/api\/news\/admin$/, (route) => route.fulfill({ status: 403, json: { error: 'role_required' } }));
  await page.goto('/news/admin');

  await expect(page.getByRole('alert')).toContainText('Nie udało się pobrać wpisów. Spróbuj ponownie za chwilę.');
  await expect(tiles(page)).toHaveCount(0);
});

// PL: Błąd publikacji pokazuje komunikat, a przycisk zostaje aktywny, żeby ponowić.
// EN: A publish error shows a message and the button stays active, to retry.
test('błąd publikacji zostawia przycisk aktywny / a publish error leaves the button active', async ({ page }) => {
  await stubAdminApi(page);
  await page.route(/\/api\/news\/admin\/e-szkic\/publish$/, (route) => route.fulfill({ status: 503, json: { error: 'database_error' } }));
  await page.goto('/news/admin');

  await page.getByRole('button', { name: /^Opublikuj/ }).click();

  await expect(page.getByRole('alert')).toContainText('Nie udało się opublikować wpisu. Spróbuj ponownie za chwilę.');
  await expect(page.getByRole('button', { name: /^Opublikuj/ })).toBeEnabled();
});

// PL: Przycisk „Edytuj” jest tylko przy szkicu i prowadzi do kreatora z jego numerem, a kreator wczytuje szkic z serwera.
// EN: The "Edytuj" button is only on a draft and leads to the wizard with its id, and the wizard loads the draft from the server.
test('szkic ma przycisk „Edytuj” prowadzący do kreatora / a draft has an "Edytuj" button leading to the wizard', async ({ page }) => {
  await stubAdminApi(page);
  await page.route('**/api/news/editor/entries/e-szkic', (route) =>
    route.fulfill({ status: 200, json: { id: 'e-szkic', type: 'news', title: 'Turniej e-sportowy klas', status: 'draft', body: { type: 'doc', content: [] } } }),
  );
  await page.goto('/news/admin');

  // PL: Tylko szkic ma „Edytuj”, wpis opublikowany go nie ma.
  // EN: Only the draft has "Edytuj", the published entry does not.
  const edit = page.getByRole('link', { name: 'Edytuj: Turniej e-sportowy klas' });
  await expect(page.getByRole('link', { name: /^Edytuj/ })).toHaveCount(1);
  await expect(edit).toHaveAttribute('href', '/news/editor/e-szkic');

  await edit.click();

  await expect(page).toHaveURL(/\/news\/editor\/e-szkic$/);
  await page.getByRole('button', { name: 'Dalej' }).click();
  await expect(page.getByLabel('Tytuł')).toHaveValue('Turniej e-sportowy klas');
});

// PL: Przy 320 px lista i arkusz nie przewijają się w poziomie, a przyciski mieszczą się w oknie i mają co najmniej 44 px.
// EN: At 320 px the list and the sheet do not scroll horizontally, and the buttons fit in the window and are at least 44 px tall.
test('przy szerokości 320 px nic się nie przewija w poziomie / nothing scrolls horizontally at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await stubAdminApi(page, [{ ...sampleEntries()[0], title: 'Bardzo długi tytuł wpisu o turnieju wszystkich klas, który musi się zawinąć' } as StubEntry, ...sampleEntries().slice(1)]);
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const fits = (box: { x: number; y: number; width: number; height: number } | null) => box !== null && box.x >= 0 && box.x + box.width <= 320 && box.y + box.height <= 640 && box.height >= 44;

  await page.goto('/news/admin');
  await expect(tiles(page)).toHaveCount(2);
  expect(await overflow()).toBeLessThanOrEqual(0);
  expect(fits(await page.getByRole('link', { name: 'Nowy wpis' }).boundingBox())).toBe(true);

  // PL: Arkusz usuwania: oba przyciski mieszczą się w oknie.
  // EN: The delete sheet: both buttons fit in the window.
  await page.getByRole('button', { name: /^Usuń: Dzień sportu/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
  expect(fits(await page.getByRole('button', { name: 'Usuń wpis' }).boundingBox())).toBe(true);
  expect(fits(await page.getByRole('button', { name: 'Anuluj' }).boundingBox())).toBe(true);
});

// PL: Bez internetu lista zostaje z ostatnich danych, a publikacja i usuwanie są wyłączone z objaśnieniem.
// EN: Offline the list stays with the last data, and publishing and deleting are off with an explanation.
test('bez internetu: lista zostaje, a zapis jest zablokowany / offline: the list stays and writing is blocked', async ({ page, context }) => {
  await stubAdminApi(page);
  await page.goto('/news/admin');
  await expect(tiles(page)).toHaveCount(2);

  await context.setOffline(true);

  await expect(page.getByText('Publikacja i usuwanie wymagają internetu.')).toBeVisible();
  await expect(tiles(page)).toHaveCount(2);
  await expect(page.getByRole('button', { name: /^Opublikuj/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /^Usuń: Dzień sportu/ })).toBeDisabled();
});
