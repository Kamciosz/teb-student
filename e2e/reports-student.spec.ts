/**
 * PL: Test ścieżki ucznia w podtorze 4a: zgłoszenie w trzech krokach, krok „Ktoś już to zgłosił?” z dołączeniem „Mnie też”, potwierdzenie i „Moje zgłoszenia” z etapem i odpowiedzią Samorządu na osi historii. Do tego blokady przycisków, szerokość 320 px, brak internetu i błąd serwera. Główna ścieżka używa podstawionego API z pamięcią (prawdziwe wymaga logowania).
 * EN: Test of the student path in subtrack 4a: a report in three steps, the "Ktoś już to zgłosił?" step with the "Mnie też" join, the confirmation and "Moje zgłoszenia" with the stage and the Student Council answer on the history axis. Plus the button guards, 320 px width, no internet and a server error. The main path uses a stubbed API with memory (the real one requires sign-in).
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/ReportsStudentScreen.tsx::ReportsStudentScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page } from '@playwright/test';

/** PL: Podobne zgłoszenie w pamięci testu; licznik i „joinedByMe” zmieniają się po kliknięciu „Mnie też”. EN: A similar report in the test memory; the counter and "joinedByMe" change after clicking "Mnie też". */
type SimilarStub = { id: string; description: string; stage: string; joinCount: number; joinedByMe: boolean };

/**
 * PL: Podstawia listę podobnych zgłoszeń i dołączanie z pamięcią: GET oddaje stan, POST „Mnie też” zwiększa licznik. Kod inny niż 200 zwraca błąd listy.
 * EN: Stubs the similar list and joining with memory: GET returns the state, POST "Mnie też" raises the counter. A code other than 200 returns a list error.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param reports - PL: zgłoszenia podobne do nowego. EN: the reports similar to the new one.
 * @param status - PL: kod odpowiedzi listy. EN: the list response code.
 */
async function stubSimilar(page: Page, reports: SimilarStub[], status = 200): Promise<void> {
  // PL: Lista; zapytanie ma parametry w adresie, więc maska kończy się gwiazdką.
  // EN: The list; the query has parameters in the address, so the pattern ends with a star.
  await page.route('**/api/reports/student/similar*', (route) => {
    if (status !== 200) return route.fulfill({ status, json: { error: 'server_error' } });
    return route.fulfill({ json: { reports: reports.map((item) => ({ ...item, category: 'room_equipment', place: 'classroom', placeDetail: null, createdAt: 0 })) } });
  });
  // PL: Dołączenie szuka zgłoszenia po numerze z adresu i zwiększa jego licznik.
  // EN: Joining finds the report by the id in the address and raises its counter.
  await page.route('**/api/reports/student/*/join', (route) => {
    const parts = route.request().url().split('/');
    const item = reports.find((report) => report.id === parts[parts.length - 2]);
    if (!item) return route.fulfill({ status: 404, json: { error: 'not_found' } });
    item.joinCount += 1;
    item.joinedByMe = true;
    return route.fulfill({ json: { joinCount: item.joinCount, joinedByMe: true } });
  });
}

/**
 * PL: Przechodzi dwa pierwsze kroki (kategoria, miejsce) i klika „Dalej”. Zatrzymuje się na kroku podobnych zgłoszeń albo przechodzi dalej, gdy lista jest pusta lub się nie udała.
 * EN: Goes through the first two steps (category, place) and clicks "Dalej". Stops at the similar-reports step, or moves on when the list is empty or failed.
 *
 * @param page - PL: strona testowa. EN: the test page.
 * @param similar - PL: zgłoszenia podobne do nowego. EN: the reports similar to the new one.
 * @param status - PL: kod odpowiedzi listy podobnych. EN: the response code of the similar list.
 */
async function fillToPlace(page: Page, similar: SimilarStub[] = [], status = 200): Promise<void> {
  // PL: Podstaw listę przed kliknięciem „Dalej”, żeby krok nie czekał na prawdziwy serwer.
  // EN: Stub the list before clicking "Dalej", so the step does not wait for the real server.
  await stubSimilar(page, similar, status);
  // PL: Krok 1: wybierz kategorię i idź dalej.
  // EN: Step 1: choose the category and move on.
  await page.goto('/reports/student');
  await page.getByRole('radio', { name: 'Sala lub sprzęt' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  // PL: Krok 2: wybierz miejsce, dopisz dokładne miejsce i idź dalej.
  // EN: Step 2: choose the place, add the exact place and move on.
  await page.getByRole('radio', { name: 'Sala', exact: true }).click();
  await page.getByLabel('Dokładne miejsce').fill('Sala 112');
  await page.getByRole('button', { name: 'Dalej' }).click();
}

/**
 * PL: Przechodzi trzy kroki formularza aż do pola opisu (bez wysyłania).
 * EN: Goes through the three form steps up to the description field (without sending).
 *
 * @param page - PL: strona testowa. EN: the test page.
 * @param description - PL: opis do wpisania. EN: the description to type.
 * @param similar - PL: zgłoszenia podobne do nowego (pusta lista przepuszcza od razu). EN: the reports similar to the new one (an empty list moves on at once).
 */
async function fillToDescription(page: Page, description: string, similar: SimilarStub[] = []): Promise<void> {
  await fillToPlace(page, similar);
  // PL: Krok 3: wpisz opis.
  // EN: Step 3: type the description.
  await page.getByLabel('Opis').fill(description);
}

/**
 * PL: Podstawia API zgłoszeń z pamięcią: POST dopisuje zgłoszenie do listy, GET ją oddaje (najnowsze pierwsze). Prawdziwy serwer wymaga zalogowanego ucznia, a kod logowania trafia tylko do terminala serwera deweloperskiego, więc test ekranu go nie użyje. Serwer sprawdzają testy Vitest (worker/reports/student/routes.test.ts).
 * EN: Stubs the reports API with memory: POST appends a report to the list, GET returns it (newest first). The real server requires a signed-in student, and the sign-in code goes only to the dev server terminal, so the screen test cannot use it. The server is covered by the Vitest tests (worker/reports/student/routes.test.ts).
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function stubReportsApi(page: Page): Promise<void> {
  // PL: Zgłoszenia „zapisane” do tej pory, najnowsze pierwsze.
  // EN: The reports "saved" so far, newest first.
  const saved: Record<string, unknown>[] = [];
  await page.route('**/api/reports/student', (route) => {
    // PL: GET oddaje listę.
    // EN: GET returns the list.
    if (route.request().method() === 'GET') return route.fulfill({ json: { reports: saved } });

    // PL: POST dopisuje zgłoszenie z etapem „przyjęte” i oddaje numer.
    // EN: POST appends a report at the "received" stage and returns the id.
    const body = route.request().postDataJSON() as { category: string; place: string; placeDetail?: string; description: string };
    const now = Date.now();
    saved.unshift({ id: `e2e-${now}`, category: body.category, place: body.place, placeDetail: body.placeDetail ?? null, description: body.description, stage: 'received', createdAt: now, updatedAt: now, history: [{ stage: 'received', note: null, changedAt: now }] });
    return route.fulfill({ status: 201, json: { id: `e2e-${now}` } });
  });
}

// PL: Cała ścieżka: formularz, potwierdzenie, lista z etapem „Przyjęte”.
// EN: The whole path: the form, the confirmation, the list with the "Przyjęte" stage.
test('uczeń wysyła zgłoszenie i widzi je w „Moich zgłoszeniach” / student sends a report and sees it in "Moje zgłoszenia"', async ({ page }) => {
  // PL: Unikalny opis, żeby odróżnić zgłoszenie od danych z poprzednich uruchomień.
  // EN: A unique description, to tell the report from data of earlier runs.
  const description = `Okno się nie domyka ${Date.now()}`;
  await stubReportsApi(page);
  await fillToDescription(page, description);

  // PL: Przełącznik anonimowości jest domyślnie włączony.
  // EN: The anonymity switch is on by default.
  await expect(page.getByRole('switch', { name: /Wyślij anonimowo/ })).toBeChecked();

  // PL: Wyślij i sprawdź potwierdzenie.
  // EN: Send and check the confirmation.
  await page.getByRole('button', { name: 'Wyślij zgłoszenie' }).click();
  await expect(page.getByRole('heading', { name: 'Wysłane' })).toBeVisible();

  // PL: Przejdź do listy; nowe zgłoszenie jest na górze, z kategorią i etapem „Przyjęte”.
  // EN: Go to the list; the new report is on top, with its category and the "Przyjęte" stage.
  await page.getByRole('link', { name: 'Moje zgłoszenia' }).click();
  const tile = page.getByRole('listitem').filter({ hasText: description });
  await expect(tile).toBeVisible();
  await expect(tile.getByText('Sala lub sprzęt')).toBeVisible();
  await expect(tile.locator('[aria-current="step"]')).toHaveText('Przyjęte');
  // PL: Oś historii ma pierwszy wpis z etapem „Przyjęte” i bez odpowiedzi.
  // EN: The history axis has the first entry with the "Przyjęte" stage and no answer.
  await expect(tile.getByRole('list', { name: 'Historia zgłoszenia' }).getByText('Przyjęte')).toBeVisible();
  await expect(tile.getByText('Odpowiedź Samorządu')).toHaveCount(0);
});

// PL: Zdjęcie nieobowiązkowe: wybrany plik dochodzi do zgłoszenia jako photoId, a „Usuń zdjęcie” go zdejmuje.
// EN: The optional photo: the chosen file reaches the report as photoId, and "Usuń zdjęcie" removes it.
test('zdjęcie do zgłoszenia trafia jako photoId / the photo goes to the report as photoId', async ({ page }) => {
  // PL: Jednopikselowy PNG wystarcza, żeby przeglądarka uznała plik za obraz.
  // EN: A one-pixel PNG is enough for the browser to take the file as an image.
  const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  let sent: { photoId?: string } = {};
  await page.route('**/api/media/report-photo', (route) => route.fulfill({ status: 201, json: { id: 'e2e-photo-1' } }));
  await page.route('**/api/reports/student', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { reports: [] } });
    sent = route.request().postDataJSON() as { photoId?: string };
    return route.fulfill({ status: 201, json: { id: 'e2e-photo-report' } });
  });
  await fillToDescription(page, `Zdjęcie ściany ${Date.now()}`);

  // PL: Wybierz plik, sprawdź nazwę, usuń i wybierz ponownie.
  // EN: Choose a file, check its name, remove it and choose again.
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({ name: 'sciana.png', mimeType: 'image/png', buffer: tinyPng });
  await expect(page.getByText('Zdjęcie dołączone:')).toBeVisible();
  await page.getByRole('button', { name: 'Usuń zdjęcie' }).click();
  await expect(page.getByText('Zdjęcie dołączone:')).toHaveCount(0);
  await fileInput.setInputFiles({ name: 'sciana.png', mimeType: 'image/png', buffer: tinyPng });
  await expect(page.getByText('sciana.png')).toBeVisible();

  // PL: Wyślij; numer zdjęcia musi być w treści zgłoszenia.
  // EN: Send; the photo id must be in the report body.
  await page.getByRole('button', { name: 'Wyślij zgłoszenie' }).click();
  await expect(page.getByRole('heading', { name: 'Wysłane' })).toBeVisible();
  expect(sent.photoId).toBe('e2e-photo-1');
});

// PL: Odpowiedź Samorządu przy zmianie etapu widzi uczeń na osi historii przy swoim zgłoszeniu.
// EN: The student sees the Student Council answer given with a stage change on the history axis of their report.
test('uczeń widzi odpowiedź Samorządu przy etapie / student sees the Student Council answer next to the stage', async ({ page }) => {
  // PL: Serwer zwraca zgłoszenie z dwoma wpisami historii; drugi ma odpowiedź.
  // EN: The server returns a report with two history entries; the second one has an answer.
  const report = {
    id: 'e2e-odpowiedz',
    category: 'room_equipment',
    place: 'classroom',
    placeDetail: null,
    description: 'Projektor nie włącza się',
    stage: 'in_progress',
    createdAt: Date.UTC(2026, 9, 6, 8, 0),
    updatedAt: Date.UTC(2026, 9, 7, 8, 0),
    history: [
      { stage: 'received', note: null, changedAt: Date.UTC(2026, 9, 6, 8, 0) },
      { stage: 'in_progress', note: 'Sprawdzimy projektor na przerwie obiadowej.', changedAt: Date.UTC(2026, 9, 7, 8, 0) },
    ],
  };
  await page.route('**/api/reports/student', (route) => route.fulfill({ json: { reports: [report] } }));

  // PL: Otwórz listę: odpowiedź Samorządu stoi przy etapie „W trakcie”.
  // EN: Open the list: the Student Council answer stands next to the "W trakcie" stage.
  await page.goto('/reports/student/moje');
  const tile = page.getByRole('listitem').filter({ hasText: 'Projektor nie włącza się' });
  const history = tile.getByRole('list', { name: 'Historia zgłoszenia' });
  await expect(history.getByRole('listitem')).toHaveCount(2);
  await expect(history.getByText('Odpowiedź Samorządu')).toBeVisible();
  await expect(history.getByText('Sprawdzimy projektor na przerwie obiadowej.')).toBeVisible();
});

// PL: Krok podobnych zgłoszeń: licznik „Mnie też”, dołączenie bez tworzenia duplikatu i brak autora na ekranie.
// EN: The similar-reports step: the "Mnie też" counter, joining without a duplicate, and no author on the screen.
test('podobne zgłoszenie: licznik, „Mnie też” i brak autora / a similar report: the counter, "Mnie też" and no author', async ({ page }) => {
  // PL: Jedno otwarte zgłoszenie tej samej kategorii i miejsca, z dwoma dołączeniami.
  // EN: One open report of the same category and place, with two joins.
  const similar: SimilarStub[] = [{ id: 'e2e-similar-1', description: 'Projektor nie działa', stage: 'in_progress', joinCount: 2, joinedByMe: false }];
  await fillToPlace(page, similar);

  // PL: Krok pokazuje listę, a w niej licznik bez nazwisk.
  // EN: The step shows the list, with the counter and no names.
  await expect(page.getByRole('heading', { name: 'Ktoś już to zgłosił?' })).toBeVisible();
  const list = page.getByRole('list', { name: 'Podobne zgłoszenia' });
  await expect(list).not.toContainText(/autor/i);
  const item = list.getByRole('listitem').filter({ hasText: 'Projektor nie działa' });
  await expect(item).toContainText('Liczba „Mnie też”: 2');

  // PL: „Mnie też” dodaje głos: przycisk zmienia się na „Dołączyłeś”, a licznik rośnie.
  // EN: "Mnie też" adds a vote: the button changes to "Dołączyłeś" and the counter goes up.
  await item.getByRole('button', { name: 'Mnie też' }).click();
  await expect(item.getByRole('button', { name: 'Dołączyłeś' })).toBeDisabled();
  await expect(item).toContainText('Liczba „Mnie też”: 3');

  // PL: „Wyślę nowe zgłoszenie” przechodzi do opisu, bo to inna sprawa.
  // EN: "Wyślę nowe zgłoszenie" moves to the description, because it is a different matter.
  await page.getByRole('button', { name: 'Wyślę nowe zgłoszenie' }).click();
  await expect(page.getByLabel('Opis')).toBeVisible();
});

// PL: „Wstecz” z kroku podobnych zgłoszeń wraca do miejsca i zachowuje wybór.
// EN: "Wstecz" from the similar-reports step goes back to the place and keeps the choice.
test('Wstecz z kroku podobnych wraca do miejsca / Wstecz from the similar step returns to the place', async ({ page }) => {
  await fillToPlace(page, [{ id: 'e2e-similar-2', description: 'Zepsuta klamka', stage: 'received', joinCount: 1, joinedByMe: false }]);
  await page.getByRole('button', { name: 'Wstecz' }).click();
  await expect(page.getByLabel('Dokładne miejsce')).toHaveValue('Sala 112');
});

// PL: Gdy nie ma podobnych zgłoszeń albo lista się nie udała, uczeń od razu trafia do opisu.
// EN: When there are no similar reports or the list failed, the student goes straight to the description.
test('pusta lista albo błąd listy przepuszcza do opisu / an empty list or a list error moves on to the description', async ({ page }) => {
  await fillToPlace(page, []);
  await expect(page.getByLabel('Opis')).toBeVisible();

  await page.goto('/reports/student');
  await stubSimilar(page, [], 500);
  await page.getByRole('radio', { name: 'Sala lub sprzęt' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('radio', { name: 'Sala', exact: true }).click();
  await page.getByLabel('Dokładne miejsce').fill('Sala 112');
  await page.getByRole('button', { name: 'Dalej' }).click();
  await expect(page.getByLabel('Opis')).toBeVisible();
});

// PL: „Dalej” i „Wyślij” czekają na dane; „Wstecz” zachowuje wpisane.
// EN: "Dalej" and "Wyślij" wait for data; "Wstecz" keeps what was typed.
test('przyciski czekają na dane, a Wstecz niczego nie kasuje / buttons wait for data and Wstecz erases nothing', async ({ page }) => {
  // PL: Na starcie nic nie jest wybrane, więc „Dalej” jest wyłączone.
  // EN: Nothing is chosen at the start, so "Dalej" is disabled.
  await page.goto('/reports/student');
  await expect(page.getByRole('button', { name: 'Dalej' })).toBeDisabled();

  // PL: Dojdź do opisu; pusty opis wyłącza „Wyślij zgłoszenie” i pokazuje podpowiedź.
  // EN: Reach the description; an empty description disables "Wyślij zgłoszenie" and shows the hint.
  await fillToDescription(page, '');
  await expect(page.getByRole('button', { name: 'Wyślij zgłoszenie' })).toBeDisabled();
  await expect(page.getByText('Wpisz opis, żeby wysłać zgłoszenie.')).toBeVisible();

  // PL: Wróć do kroku 2: dokładne miejsce jest nadal wpisane.
  // EN: Go back to step 2: the exact place is still typed.
  await page.getByRole('button', { name: 'Wstecz' }).click();
  await expect(page.getByLabel('Dokładne miejsce')).toHaveValue('Sala 112');
});

// PL: Przy 320 px żaden krok nie przewija się w poziomie, a dolny przycisk jest widoczny.
// EN: At 320 px no step scrolls horizontally and the bottom button is visible.
test('przy szerokości 320 px nic się nie przewija w poziomie / nothing scrolls horizontally at 320 px', async ({ page }) => {
  // PL: Wąski ekran jak w małym telefonie.
  // EN: A narrow screen like a small phone.
  await page.setViewportSize({ width: 320, height: 640 });
  await fillToDescription(page, 'Bardzo długi opis bez żadnych spacji aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

  // PL: Krok 3: strona nie jest szersza niż okno, a „Wyślij zgłoszenie” mieści się w oknie.
  // EN: Step 3: the page is not wider than the window, and "Wyślij zgłoszenie" fits in the window.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const box = await page.getByRole('button', { name: 'Wyślij zgłoszenie' }).boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 320).toBe(true);
});

// PL: Błąd serwera zostawia formularz na kroku 3 z wpisanym opisem i komunikatem.
// EN: A server error leaves the form on step 3 with the typed description and a message.
test('błąd serwera pokazuje komunikat i zachowuje opis / a server error shows a message and keeps the description', async ({ page }) => {
  // PL: Serwer odpowiada kodem 503 na wysłanie zgłoszenia.
  // EN: The server answers code 503 to sending a report.
  await page.route('**/api/reports/student', (route) => (route.request().method() === 'POST' ? route.fulfill({ status: 503, json: { error: 'server_error' } }) : route.continue()));
  await fillToDescription(page, 'Brak światła w korytarzu');
  await page.getByRole('button', { name: 'Wyślij zgłoszenie' }).click();

  // PL: Komunikat jest widoczny, a opis nie zniknął.
  // EN: The message is visible and the description did not disappear.
  await expect(page.getByRole('alert')).toContainText('Nie udało się wysłać zgłoszenia');
  await expect(page.getByLabel('Opis')).toHaveValue('Brak światła w korytarzu');
});

// PL: Bez internetu wysyłanie kończy się czytelnym błędem, a lista zachowuje dane pod wspólnym paskiem „Brak internetu”.
// EN: Without internet sending ends with a clear error, and the list keeps its data under the shared "Brak internetu" bar.
test('bez internetu: błąd przy wysyłaniu, pasek i zachowana lista / offline: a send error, the banner and a kept list', async ({ page, context }) => {
  // PL: Serwer zwraca jedno zgłoszenie, żeby test nie zależał od bazy.
  // EN: The server returns one report, so the test does not depend on the database.
  const report = { id: 'e2e-1', category: 'safety', place: 'gym', placeDetail: null, description: 'Luźna deska w sali', stage: 'in_progress', createdAt: Date.UTC(2026, 9, 6, 8, 0), updatedAt: Date.UTC(2026, 9, 7, 8, 0), history: [{ stage: 'received', note: null, changedAt: Date.UTC(2026, 9, 6, 8, 0) }, { stage: 'in_progress', note: null, changedAt: Date.UTC(2026, 9, 7, 8, 0) }] };
  await page.route('**/api/reports/student', (route) => (route.request().method() === 'GET' ? route.fulfill({ json: { reports: [report] } }) : route.continue()));

  // PL: Otwórz listę online: widać zgłoszenie z etapem „W trakcie”.
  // EN: Open the list online: the report with the "W trakcie" stage is visible.
  await page.goto('/reports/student/moje');
  const tile = page.getByRole('listitem').filter({ hasText: 'Luźna deska w sali' });
  await expect(tile.locator('[aria-current="step"]')).toHaveText('W trakcie');

  // PL: Odetnij internet: pojawia się wspólny pasek z App.tsx, a lista zostaje.
  // EN: Cut the internet: the shared bar from App.tsx appears and the list stays.
  await context.setOffline(true);
  await expect(page.locator('[data-offline-notice]')).toContainText('Brak internetu');
  await expect(tile).toBeVisible();

  // PL: Wysyłanie bez internetu pokazuje błąd i zachowuje opis.
  // EN: Sending without internet shows an error and keeps the description.
  await context.setOffline(false);
  await fillToDescription(page, 'Opis bez internetu');
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Wyślij zgłoszenie' }).click();
  await expect(page.getByRole('alert')).toContainText('Brak internetu');
  await expect(page.getByLabel('Opis')).toHaveValue('Opis bez internetu');
});
