/**
 * PL: Test ścieżki Samorządu w podtorze 4b: lista zgłoszeń z filtrem po etapie, stany puste, szczegół (anonimowe i z autorem), zmiana etapu z historią, błąd zapisu, błąd pobrania, szerokość 320 px i brak internetu. API jest podstawione (prawdziwe wymaga roli z podtoru 8 i zalogowania); serwer sprawdzają testy Vitest (worker/reports/admin/routes.test.ts), także to, że odpowiedź nie zawiera autora.
 * EN: Test of the Student Council path in subtrack 4b: the report list with the stage filter, the empty states, the detail (anonymous and with an author), the stage change with history, the save error, the fetch error, 320 px width and no internet. The API is stubbed (the real one requires a role from subtrack 8 and a sign-in); the server is covered by the Vitest tests (worker/reports/admin/routes.test.ts), including that the response contains no author.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/ReportsAdminScreen.tsx::ReportsAdminScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page } from '@playwright/test';

/** PL: Zgłoszenie podstawionego API. EN: A report of the stubbed API. */
type StubReport = { id: string; isAnonymous: boolean; category: string; place: string; placeDetail: string | null; description: string; stage: string; createdAt: number; updatedAt: number };

/**
 * PL: Kafle listy zgłoszeń. Menu panelu też jest listą, więc szukamy po nazwie listy.
 * EN: The report list tiles. The panel menu is a list too, so we look up by the list name.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @returns PL: lokalizator kafli. EN: the tile locator.
 */
function items(page: Page) {
  return page.getByRole('list', { name: 'Zgłoszenia' }).getByRole('listitem');
}

/** PL: Trzy zgłoszenia jak na ekranie 6.4a, od najnowszego. EN: Three reports as on screen 6.4a, newest first. */
function sampleReports(): StubReport[] {
  return [
    { id: 'r1', isAnonymous: false, category: 'safety', place: 'corridor', placeDetail: null, description: 'Na schodach przy szatni jest mokro i ślisko.', stage: 'received', createdAt: Date.UTC(2026, 9, 11, 8), updatedAt: Date.UTC(2026, 9, 11, 8) },
    { id: 'r2', isAnonymous: true, category: 'idea', place: 'field', placeDetail: null, description: 'Można by postawić kosz do koszykówki przy boisku.', stage: 'received', createdAt: Date.UTC(2026, 9, 9, 8), updatedAt: Date.UTC(2026, 9, 9, 8) },
    { id: 'r3', isAnonymous: true, category: 'room_equipment', place: 'classroom', placeDetail: 'Sala 204', description: 'Nie działa projektor w sali 204.', stage: 'in_progress', createdAt: Date.UTC(2026, 9, 6, 8), updatedAt: Date.UTC(2026, 9, 7, 8) },
  ];
}

/**
 * PL: Podstawia API Samorządu z pamięcią: GET oddaje listę, GET /:id szczegół z historią, PATCH /:id zmienia etap i dopisuje historię. Tak jak serwer, nie wysyła numeru autora.
 * EN: Stubs the Student Council API with memory: GET returns the list, GET /:id the detail with history, PATCH /:id changes the stage and appends the history. Like the server, it sends no author id.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param reports - PL: zgłoszenia na start. EN: the reports to start with.
 */
async function stubAdminApi(page: Page, reports: StubReport[] = sampleReports()): Promise<void> {
  // PL: Historia każdego zgłoszenia, najnowszy etap pierwszy.
  // EN: The history of every report, newest stage first.
  const history = new Map(reports.map((item) => [item.id, [{ stage: item.stage, changedAt: item.updatedAt }]]));
  await page.route(/\/api\/reports\/admin(\/.*)?$/, async (route) => {
    const request = route.request();
    const id = new URL(request.url()).pathname.split('/')[4];
    // PL: Lista.
    // EN: The list.
    if (!id) return route.fulfill({ json: { reports } });
    const found = reports.find((item) => item.id === id);
    if (!found) return route.fulfill({ status: 404, json: { error: 'not_found' } });
    // PL: Zmiana etapu dopisuje wiersz historii.
    // EN: A stage change appends a history row.
    if (request.method() === 'PATCH') {
      found.stage = (request.postDataJSON() as { stage: string }).stage;
      found.updatedAt = Date.UTC(2026, 9, 12, 8);
      history.get(id)?.unshift({ stage: found.stage, changedAt: found.updatedAt });
    }
    return route.fulfill({ json: { report: found, history: history.get(id) } });
  });
}

// PL: Filtr po etapie, oba stany puste i oznaczenie anonimowych zgłoszeń na liście.
// EN: The stage filter, both empty states and the marking of anonymous reports in the list.
test('lista pokazuje zgłoszenia i filtruje po etapie / the list shows reports and filters by stage', async ({ page }) => {
  await stubAdminApi(page);
  await page.goto('/reports/admin');

  // PL: Trzy kafle, dwa anonimowe.
  // EN: Three tiles, two anonymous.
  await expect(page.getByRole('link', { name: /Nie działa projektor/ })).toBeVisible();
  await expect(items(page)).toHaveCount(3);
  await expect(page.getByText('Zgłoszenie anonimowe')).toHaveCount(2);

  // PL: „W trakcie” zostawia jeden kafel, „Załatwione” daje stan pusty z etapem.
  // EN: "W trakcie" keeps one tile, "Załatwione" gives the empty state with a stage.
  await page.getByRole('button', { name: 'W trakcie' }).click();
  await expect(items(page)).toHaveCount(1);
  await page.getByRole('button', { name: 'Załatwione' }).click();
  await expect(page.getByRole('heading', { name: 'Brak zgłoszeń w tym etapie' })).toBeVisible();
  await expect(page.getByText('Gdy zgłoszenie zmieni etap, pojawi się tutaj.')).toBeVisible();
});

// PL: Bez żadnych zgłoszeń tekst jest inny niż przy pustym etapie.
// EN: With no reports at all the text differs from the empty stage.
test('pusta lista mówi, że nikt nic nie zgłosił / the empty list says nobody reported anything', async ({ page }) => {
  await stubAdminApi(page, []);
  await page.goto('/reports/admin');
  await expect(page.getByRole('heading', { name: 'Nikt jeszcze nic nie zgłosił' })).toBeVisible();
  await expect(page.getByText('Zgłoszenia uczniów pojawią się tutaj.')).toBeVisible();
});

// PL: Zgłoszenie anonimowe nie ma autora, z autorem mówi tylko, że anonimowość wyłączono.
// EN: An anonymous report has no author, a signed one says only that anonymity was turned off.
test('szczegół: anonimowe i z autorem / detail: anonymous and with an author', async ({ page }) => {
  await stubAdminApi(page);
  await page.goto('/reports/admin/r3');
  await expect(page.getByText('Zgłoszenie anonimowe')).toBeVisible();
  await expect(page.getByText('Samorząd nie widzi, kto je wysłał.')).toBeVisible();

  await page.goto('/reports/admin/r1');
  await expect(page.getByText('Autor zgłosił bez anonimowości.')).toBeVisible();
  await expect(page.getByText('Samorząd nie widzi, kto je wysłał.')).toHaveCount(0);
});

// PL: Zmiana etapu: przycisk czeka na zmianę, zapis dopisuje historię, a lista pokazuje nowy etap.
// EN: A stage change: the button waits for a change, saving appends the history and the list shows the new stage.
test('Samorząd zmienia etap i widzi historię / the Student Council changes the stage and sees the history', async ({ page }) => {
  await stubAdminApi(page);
  await page.goto('/reports/admin');
  await page.getByRole('link', { name: /Nie działa projektor/ }).click();

  // PL: Wybrany jest „W trakcie”, a „Zapisz etap” nieaktywny.
  // EN: "W trakcie" is chosen and "Zapisz etap" is disabled.
  await expect(page.getByRole('radio', { name: 'W trakcie' })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Zapisz etap' })).toBeDisabled();

  // PL: Wybór innego etapu włącza przycisk, a zapis dopisuje wiersz do historii.
  // EN: Choosing another stage enables the button, and saving adds a row to the history.
  await page.getByRole('radio', { name: 'Załatwione' }).click();
  await page.getByRole('button', { name: 'Zapisz etap' }).click();
  const history = page.getByRole('list', { name: 'Historia' }).getByRole('listitem');
  await expect(history).toHaveCount(2);
  await expect(history.first()).toContainText('Załatwione');
  await expect(page.getByRole('button', { name: 'Zapisz etap' })).toBeDisabled();

  // PL: Po powrocie lista pokazuje nowy etap.
  // EN: After going back the list shows the new stage.
  await page.getByRole('link', { name: 'Wróć' }).click();
  await expect(page.getByRole('link', { name: /Nie działa projektor/ })).toContainText('Załatwione');
});

// PL: Błąd zapisu pokazuje komunikat, a przycisk zostaje aktywny, żeby ponowić.
// EN: A save error shows a message and the button stays active, to retry.
test('błąd zapisu zostawia przycisk aktywny / a save error leaves the button active', async ({ page }) => {
  await stubAdminApi(page);
  await page.route(/\/api\/reports\/admin\/r3$/, (route) => (route.request().method() === 'PATCH' ? route.fulfill({ status: 503, json: { error: 'server_error' } }) : route.fallback()));
  await page.goto('/reports/admin/r3');
  await page.getByRole('radio', { name: 'Załatwione' }).click();
  await page.getByRole('button', { name: 'Zapisz etap' }).click();

  await expect(page.getByRole('alert')).toContainText('Nie udało się zapisać etapu. Spróbuj ponownie za chwilę.');
  await expect(page.getByRole('button', { name: 'Zapisz etap' })).toBeEnabled();
});

// PL: Odmowa serwera (403 bez roli) pokazuje komunikat błędu pobrania, a nie dane.
// EN: A server refusal (403 without a role) shows the fetch error message, not data.
test('odmowa serwera pokazuje błąd pobrania / a server refusal shows the fetch error', async ({ page }) => {
  await page.route(/\/api\/reports\/admin$/, (route) => route.fulfill({ status: 403, json: { error: 'forbidden' } }));
  await page.goto('/reports/admin');
  await expect(page.getByRole('alert')).toContainText('Nie udało się pobrać zgłoszeń. Spróbuj ponownie za chwilę.');
  await expect(items(page)).toHaveCount(0);
});

// PL: Przy 320 px lista i szczegół nie przewijają się w poziomie, a dolny przycisk mieści się w oknie.
// EN: At 320 px the list and the detail do not scroll horizontally, and the bottom button fits in the window.
test('przy szerokości 320 px nic się nie przewija w poziomie / nothing scrolls horizontally at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await stubAdminApi(page);
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  await page.goto('/reports/admin');
  await expect(items(page)).toHaveCount(3);
  expect(await overflow()).toBeLessThanOrEqual(0);

  await page.goto('/reports/admin/r1');
  await expect(page.getByRole('button', { name: 'Zapisz etap' })).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(0);
  const box = await page.getByRole('button', { name: 'Zapisz etap' }).boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 320 && box.y + box.height <= 640).toBe(true);
  // PL: Każda opcja paska etapu mieści się w oknie i ma co najmniej 44 px wysokości.
  // EN: Every stage option fits in the window and is at least 44 px tall.
  for (const name of ['Przyjęte', 'W trakcie', 'Załatwione']) {
    const option = await page.getByRole('radio', { name }).boundingBox();
    expect(option && option.x >= 0 && option.x + option.width <= 320 && option.height >= 44).toBe(true);
  }
});

// PL: Bez internetu lista i szczegół zostają z ostatnich danych, filtr działa, a zapis czeka na sieć.
// EN: Offline the list and the detail stay with the last data, the filter works and saving waits for the network.
test('bez internetu: dane zostają, a zapis jest zablokowany / offline: the data stays and saving is blocked', async ({ page, context }) => {
  await stubAdminApi(page);
  await page.goto('/reports/admin');
  await page.getByRole('link', { name: /Nie działa projektor/ }).click();
  await expect(page.getByRole('radio', { name: 'W trakcie' })).toBeChecked();
  await page.getByRole('link', { name: 'Wróć' }).click();

  // PL: Wyłącz sieć: lista nadal jest, filtr działa.
  // EN: Turn the network off: the list is still there and the filter works.
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Przyjęte' }).click();
  await expect(items(page)).toHaveCount(2);
  await page.getByRole('button', { name: 'Wszystkie' }).click();

  // PL: Szczegół z pamięci pokazuje się, a zmiana etapu jest zablokowana z objaśnieniem.
  // EN: The detail from the cache shows, and the stage change is blocked with an explanation.
  await page.getByRole('link', { name: /Nie działa projektor/ }).click();
  await page.getByRole('radio', { name: 'Załatwione' }).click();
  await expect(page.getByText('Zmiana etapu wymaga internetu.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zapisz etap' })).toBeDisabled();
});
