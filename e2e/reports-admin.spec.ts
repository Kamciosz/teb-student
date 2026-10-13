/**
 * PL: Test ścieżki Samorządu w podtorze 4b: lista zgłoszeń z filtrem po etapie, stany puste, szczegół (anonimowe i z autorem), zmiana etapu z odpowiedzią dla autora (licznik i limit 500 znaków) i historią, błąd zapisu, błąd pobrania, szerokość 320 px i brak internetu. API jest podstawione (prawdziwe wymaga zalogowania i roli Samorządu), także rola ucznia z bramki PanelGate; serwer sprawdzają testy Vitest (worker/reports/admin/routes.test.ts), także to, że odpowiedź nie zawiera autora.
 * EN: Test of the Student Council path in subtrack 4b: the report list with the stage filter, the empty states, the detail (anonymous and with an author), the stage change with the answer for the author (counter and 500-character limit) and history, the save error, the fetch error, 320 px width and no internet. The API is stubbed (the real one requires a role from subtrack 8 and a sign-in); the server is covered by the Vitest tests (worker/reports/admin/routes.test.ts), including that the response contains no author.
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
type StubReport = { id: string; isAnonymous: boolean; category: string; place: string; placeDetail: string | null; description: string; stage: string; createdAt: number; updatedAt: number; joinCount: number };

/**
 * PL: Kafle listy zgłoszeń. Menu panelu też jest listą, więc szukamy po nazwie listy.
 * EN: The report list tiles. The panel menu is a list too, so we look up by the list name.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @returns PL: lokalizator kafli. EN: the tile locator.
 */
function items(page: Page) {
  // PL: Lista ma nazwę „Zgłoszenia”, a menu panelu nie.
  // EN: The list is named "Zgłoszenia", the panel menu is not.
  return page.getByRole('list', { name: 'Zgłoszenia' }).getByRole('listitem');
}

/** PL: Trzy zgłoszenia jak na ekranie 6.4a, od najnowszego. EN: Three reports as on screen 6.4a, newest first. */
function sampleReports(): StubReport[] {
  // PL: Pierwsze zgłoszenie ma autora, dwa pozostałe są anonimowe.
  // EN: The first report has an author, the other two are anonymous.
  return [
    { id: 'r1', isAnonymous: false, category: 'safety', place: 'corridor', placeDetail: null, description: 'Na schodach przy szatni jest mokro i ślisko.', stage: 'received', createdAt: Date.UTC(2026, 9, 11, 8), updatedAt: Date.UTC(2026, 9, 11, 8), joinCount: 3 },
    { id: 'r2', isAnonymous: true, category: 'idea', place: 'field', placeDetail: null, description: 'Można by postawić kosz do koszykówki przy boisku.', stage: 'received', createdAt: Date.UTC(2026, 9, 9, 8), updatedAt: Date.UTC(2026, 9, 9, 8), joinCount: 0 },
    { id: 'r3', isAnonymous: true, category: 'room_equipment', place: 'classroom', placeDetail: 'Sala 204', description: 'Nie działa projektor w sali 204.', stage: 'in_progress', createdAt: Date.UTC(2026, 9, 6, 8), updatedAt: Date.UTC(2026, 9, 7, 8), joinCount: 1 },
  ];
}

/**
 * PL: Podstawia rolę ucznia w panelu, którą czyta bramka PanelGate.
 * EN: Stubs the student's panel role, which the PanelGate gate reads.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param level - PL: rola albo null (uczeń bez roli). EN: the role or null (a student without a role).
 */
async function stubPanelLevel(page: Page, level: 'editor' | 'council' | 'admin' | null): Promise<void> {
  // PL: Serwer panelu oddaje rolę w polu level.
  // EN: The panel server returns the role in the level field.
  await page.route('**/api/admin/me', (route) => route.fulfill({ json: { level } }));
}

/**
 * PL: Podstawia API Samorządu z pamięcią: GET oddaje listę, GET /:id szczegół z historią i imieniem z klasą autora (tylko przy zgłoszeniu nieanonimowym), PATCH /:id zmienia etap i dopisuje historię. Tak jak serwer, nie wysyła numeru autora.
 * EN: Stubs the Student Council API with memory: GET returns the list, GET /:id the detail with history and the author's name and class (only for a signed report), PATCH /:id changes the stage and appends the history. Like the server, it sends no author id.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param reports - PL: zgłoszenia na start. EN: the reports to start with.
 */
async function stubAdminApi(page: Page, reports: StubReport[] = sampleReports()): Promise<void> {
  // PL: Uczeń jest w Samorządzie, więc bramka roli przepuszcza ekran.
  // EN: The student is in the Council, so the role gate lets the screen through.
  await stubPanelLevel(page, 'council');
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
      found.stage = (request.postDataJSON() as { stage: string; note: string | null }).stage;
      found.updatedAt = Date.UTC(2026, 9, 12, 8);
      history.get(id)?.unshift({ stage: found.stage, changedAt: found.updatedAt });
    }
    // PL: Imię i klasa autora tylko przy zgłoszeniu nieanonimowym, jak na serwerze.
    // EN: The author's name and class only for a signed report, as on the server.
    const student = found.isAnonymous ? null : { name: 'Ola', className: '3TA' };
    return route.fulfill({ json: { report: found, history: history.get(id), student } });
  });
}

// PL: Liczba osób „Mnie też” jest na kaflu i w szczególe, a zero nie pokazuje plusa (tekst do uzgodnienia).
// EN: The number of people "Me too" is on the tile and in the detail, and zero shows no plus (text to be agreed).
test('liczba osób „Mnie też” na kaflu i w szczególe / the "Me too" count on the tile and in the detail', async ({ page }) => {
  // PL: Zgłoszenie r1 ma trzy osoby, r2 żadnej.
  // EN: Report r1 has three people, r2 has none.
  await stubAdminApi(page);
  await page.goto('/reports/admin');
  await expect(page.getByRole('link', { name: /Na schodach/ })).toContainText('+3 osoby');
  await expect(page.getByRole('link', { name: /kosz do koszykówki/ })).not.toContainText(/\+\d/);

  // PL: Szczegół pokazuje tę samą liczbę; przy zerze nie ma żadnego napisu z plusem.
  // EN: The detail shows the same number; with zero there is no label with a plus.
  await page.goto('/reports/admin/r1');
  await expect(page.getByText('+3 osoby')).toBeVisible();
  await page.goto('/reports/admin/r2');
  await expect(page.getByText(/^\+\d/)).toHaveCount(0);
});

// PL: Filtr po etapie, oba stany puste i oznaczenie anonimowych zgłoszeń na liście.
// EN: The stage filter, both empty states and the marking of anonymous reports in the list.
test('lista pokazuje zgłoszenia i filtruje po etapie / the list shows reports and filters by stage', async ({ page }) => {
  // PL: Podstaw API i otwórz listę.
  // EN: Stub the API and open the list.
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

// PL: Przełącznik kolejności: domyślnie „Najnowsze”, a „Najwięcej osób” zamienia drugi i trzeci kafel.
// EN: The order switch: "Najnowsze" by default, and "Najwięcej osób" swaps the second and the third tile.
test('przełącznik kolejności zmienia układ listy / the order switch changes the list layout', async ({ page }) => {
  // PL: Podstaw API i otwórz listę; domyślnie wybrane „Najnowsze”.
  // EN: Stub the API and open the list; "Najnowsze" is chosen by default.
  await stubAdminApi(page);
  await page.goto('/reports/admin');
  await expect(page.getByRole('radio', { name: 'Najnowsze' })).toHaveAttribute('aria-checked', 'true');
  await expect(items(page).nth(1)).toContainText('kosz do koszykówki');
  await expect(items(page).nth(2)).toContainText('Nie działa projektor');

  // PL: „Najwięcej osób” stawia zgłoszenie z jedną osobą przed tym bez nikogo; pierwsze (3 osoby) zostaje na górze.
  // EN: "Najwięcej osób" puts the report with one person before the one with nobody; the first one (3 people) stays on top.
  await page.getByRole('radio', { name: 'Najwięcej osób' }).click();
  await expect(page.getByRole('radio', { name: 'Najwięcej osób' })).toHaveAttribute('aria-checked', 'true');
  await expect(items(page).nth(0)).toContainText('Na schodach');
  await expect(items(page).nth(1)).toContainText('Nie działa projektor');
  await expect(items(page).nth(2)).toContainText('kosz do koszykówki');
});

// PL: Bez żadnych zgłoszeń tekst jest inny niż przy pustym etapie.
// EN: With no reports at all the text differs from the empty stage.
test('pusta lista mówi, że nikt nic nie zgłosił / the empty list says nobody reported anything', async ({ page }) => {
  // PL: Serwer oddaje pustą listę; bez filtra tekst mówi, że nikt nic nie zgłosił.
  // EN: The server returns an empty list; without a filter the text says nobody reported anything.
  await stubAdminApi(page, []);
  await page.goto('/reports/admin');
  await expect(page.getByRole('heading', { name: 'Nikt jeszcze nic nie zgłosił' })).toBeVisible();
  await expect(page.getByText('Zgłoszenia uczniów pojawią się tutaj.')).toBeVisible();
});

// PL: Zgłoszenie anonimowe nie ma autora, a podpisane pokazuje imię i klasę (ekran 6.4c).
// EN: An anonymous report has no author, a signed one shows the name and class (screen 6.4c).
test('szczegół: anonimowe i z autorem / detail: anonymous and with an author', async ({ page }) => {
  // PL: Zgłoszenie anonimowe: napis o anonimowości.
  // EN: An anonymous report: the anonymity label.
  await stubAdminApi(page);
  await page.goto('/reports/admin/r3');
  await expect(page.getByText('Zgłoszenie anonimowe')).toBeVisible();
  await expect(page.getByText('Samorząd nie widzi, kto je wysłał.')).toBeVisible();

  // PL: Zgłoszenie z autorem: imię i klasa z profilu oraz informacja o rezygnacji z anonimowości.
  // EN: A report with an author: the name and class from the profile and the information that anonymity was turned off.
  await page.goto('/reports/admin/r1');
  await expect(page.getByText('Ola · 3TA')).toBeVisible();
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

// PL: Odpowiedź dla autora ma licznik i limit 500 znaków; pole nie przyjmie więcej.
// EN: The answer for the author has a counter and a 500-character limit; the field takes no more.
test('odpowiedź dla autora: licznik i limit 500 znaków / answer for the author: counter and the 500-character limit', async ({ page }) => {
  await stubAdminApi(page);
  await page.goto('/reports/admin/r3');
  const note = page.getByRole('textbox', { name: 'Odpowiedź dla autora' });
  await expect(page.getByText('0/500')).toBeVisible();

  // PL: Wpisz 500 znaków i jeszcze jeden; pole ma `maxLength`, więc dodatkowy znak nie wchodzi.
  // EN: Type 500 characters and one more; the field has `maxLength`, so the extra character does not go in.
  await note.fill('ą'.repeat(500));
  await note.pressSequentially('x');
  await expect(note).toHaveValue('ą'.repeat(500));
  await expect(page.getByText('500/500')).toBeVisible();
});

// PL: Odpowiedź wysyła się razem z etapem, a po zapisie pole się czyści.
// EN: The answer is sent together with the stage, and the field clears after saving.
test('odpowiedź dla autora trafia do zapisu i znika po zapisie / the answer for the author goes to the save and clears after it', async ({ page }) => {
  await stubAdminApi(page);
  await page.goto('/reports/admin/r3');
  const note = page.getByRole('textbox', { name: 'Odpowiedź dla autora' });
  const text = 'Projektor naprawiony, dziękujemy.';

  // PL: Wybierz etap i wpisz odpowiedź; licznik pokazuje długość tekstu.
  // EN: Choose the stage and type the answer; the counter shows the length of the text.
  await page.getByRole('radio', { name: 'Załatwione' }).click();
  await note.fill(text);
  await expect(page.getByText(`${text.length}/500`)).toBeVisible();

  // PL: Zapis wysyła etap i tekst; po udanym zapisie pole jest puste.
  // EN: Saving sends the stage and the text; after a successful save the field is empty.
  const patch = page.waitForRequest((request) => request.method() === 'PATCH' && request.url().endsWith('/r3'));
  await page.getByRole('button', { name: 'Zapisz etap' }).click();
  expect((await patch).postDataJSON()).toEqual({ stage: 'resolved', note: text });
  await expect(note).toHaveValue('');
  await expect(page.getByText('0/500')).toBeVisible();
});

// PL: Błąd zapisu pokazuje komunikat, a przycisk zostaje aktywny, żeby ponowić.
// EN: A save error shows a message and the button stays active, to retry.
test('błąd zapisu zostawia przycisk aktywny / a save error leaves the button active', async ({ page }) => {
  await stubAdminApi(page);
  // PL: Zapis kończy się błędem serwera, reszta API działa jak zwykle.
  // EN: Saving ends with a server error, the rest of the API works as usual.
  await page.route(/\/api\/reports\/admin\/r3$/, (route) => (route.request().method() === 'PATCH' ? route.fulfill({ status: 503, json: { error: 'server_error' } }) : route.fallback()));
  // PL: Wybierz inny etap i spróbuj zapisać.
  // EN: Choose another stage and try to save.
  await page.goto('/reports/admin/r3');
  await page.getByRole('radio', { name: 'Załatwione' }).click();
  await page.getByRole('button', { name: 'Zapisz etap' }).click();

  // PL: Komunikat błędu jest widoczny, a przycisk można dotknąć jeszcze raz.
  // EN: The error message is visible and the button can be tapped again.
  await expect(page.getByRole('alert')).toContainText('Nie udało się zapisać etapu. Spróbuj ponownie za chwilę.');
  await expect(page.getByRole('button', { name: 'Zapisz etap' })).toBeEnabled();
});

// PL: Odmowa serwera (403 bez roli) pokazuje komunikat błędu pobrania, a nie dane.
// EN: A server refusal (403 without a role) shows the fetch error message, not data.
test('odmowa serwera pokazuje błąd pobrania / a server refusal shows the fetch error', async ({ page }) => {
  // PL: Bramka przepuszcza (rola w telefonie), ale serwer odmawia dostępu.
  // EN: The gate lets through (the role on the phone), but the server refuses access.
  await stubPanelLevel(page, 'council');
  await page.route(/\/api\/reports\/admin$/, (route) => route.fulfill({ status: 403, json: { error: 'forbidden' } }));
  await page.goto('/reports/admin');
  await expect(page.getByRole('alert')).toContainText('Nie udało się pobrać zgłoszeń. Spróbuj ponownie za chwilę.');
  await expect(items(page)).toHaveCount(0);
});

// PL: Uczeń bez roli i członek redakcji widzą „Tylko dla Samorządu”, a zgłoszenia nie są nawet pobierane.
// EN: A student without a role and an editorial team member see "Tylko dla Samorządu", and the reports are not even fetched.
for (const level of [null, 'editor'] as const) {
  test(`rola ${level ?? 'brak'}: bramka pokazuje „Tylko dla Samorządu” / role ${level ?? 'none'}: the gate shows "Tylko dla Samorządu"`, async ({ page }) => {
    // PL: Zlicz zapytania o zgłoszenia i podstaw rolę ucznia.
    // EN: Count the report requests and stub the student's role.
    let reportRequests = 0;
    await page.route(/\/api\/reports\/admin(\/.*)?$/, (route) => {
      reportRequests += 1;
      return route.fulfill({ status: 403, json: { error: 'forbidden' } });
    });
    await stubPanelLevel(page, level);

    // PL: Ekran odmowy jest widoczny, a lista i zapytanie o zgłoszenia nie.
    // EN: The refusal screen is visible, and the list and the report request are not.
    await page.goto('/reports/admin');
    await expect(page.getByRole('heading', { name: 'Tylko dla Samorządu' })).toBeVisible();
    await expect(items(page)).toHaveCount(0);
    expect(reportRequests).toBe(0);
  });
}

// PL: Przy 320 px lista i szczegół nie przewijają się w poziomie, a dolny przycisk mieści się w oknie.
// EN: At 320 px the list and the detail do not scroll horizontally, and the bottom button fits in the window.
test('przy szerokości 320 px nic się nie przewija w poziomie / nothing scrolls horizontally at 320 px', async ({ page }) => {
  // PL: Wąski ekran jak w małym telefonie; `overflow` to nadwyżka szerokości strony ponad okno.
  // EN: A narrow screen like a small phone; `overflow` is the page width beyond the window.
  await page.setViewportSize({ width: 320, height: 640 });
  await stubAdminApi(page);
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  // PL: Lista: trzy kafle i brak przewijania w poziomie.
  // EN: The list: three tiles and no horizontal scrolling.
  await page.goto('/reports/admin');
  await expect(items(page)).toHaveCount(3);
  expect(await overflow()).toBeLessThanOrEqual(0);

  // PL: Szczegół: brak przewijania w poziomie, a dolny przycisk mieści się w oknie.
  // EN: The detail: no horizontal scrolling, and the bottom button fits in the window.
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
  // PL: Z internetem otwórz szczegół, żeby trafił do pamięci, i wróć na listę.
  // EN: With internet open the detail so it reaches the cache, and go back to the list.
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
