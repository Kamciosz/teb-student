/**
 * PL: Test ścieżek podtoru 7 (profil i ustawienia, wiersz panelu z rolą): zmiana imienia, klasy i szkoły z akcentem niebieskim albo czerwonym, wybór palety i większego tekstu, które zostają po ponownym uruchomieniu, pobranie moich danych jako pliku JSON, usunięcie konta, polityka prywatności bez logowania, szerokość 320 px i brak internetu. Serwer profilu jest podstawiony z pamięcią (prawdziwy wymaga logowania, a kod trafia tylko do terminala serwera), jego sprawdzają testy Vitest (worker/profile/profile.test.ts). Polityka prywatności idzie bez żadnych podstawek.
 * EN: Test of the subtrack 7 paths (profile and settings): changing the name, class and school with the blue or red accent, choosing a palette and the larger text that stay after a restart, downloading my data as a JSON file, deleting the account, the privacy policy without signing in, 320 px width and no internet. The profile server is stubbed with memory (the real one requires signing in, and the code goes only to the server terminal), the Vitest tests cover it (worker/profile/profile.test.ts). The privacy policy runs with no stubs at all.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/ProfileScreen.tsx::ProfileScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page } from '@playwright/test';
// PL: Odczyt pobranego pliku z dysku.
// EN: Reading the downloaded file from the disk.
import { readFile } from 'node:fs/promises';

/** PL: Adres wymyślonego ucznia z sesji testowej. EN: The address of the invented student from the test session. */
const EMAIL = 'ola.testowa@teb.edu.pl';

/** PL: Profil, który ma uczeń na początku testu. EN: The profile the student has at the start of a test. */
const START_PROFILE = { name: '', className: '', school: 'L', palette: 'CE', textSize: 'normalny' };

/** PL: Stan podstawionego serwera: profil, sesja i liczba wywołań usunięcia konta. EN: The state of the stubbed server: the profile, the session and the number of account deletion calls. */
type StubState = { profile: Record<string, string>; signedIn: boolean; deleteCalls: number; panelLevel: string | null };

/**
 * PL: Podstawia sesję i serwer profilu z pamięcią: GET oddaje profil, PUT go zapisuje, DELETE kasuje konto i kończy sesję.
 * EN: Stubs the session and the profile server with memory: GET returns the profile, PUT saves it, DELETE deletes the account and ends the session.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param signedIn - PL: czy uczeń ma sesję na starcie. EN: whether the student has a session at the start.
 * @param panelLevel - PL: rola w panelu albo null, gdy uczeń jej nie ma. EN: the panel role or null when the student has none.
 * @returns PL: stan serwera, który test może odczytać. EN: the server state the test can read.
 */
async function stubServer(page: Page, signedIn = true, panelLevel: string | null = null): Promise<StubState> {
  // PL: Stan zmieniany przez podstawione adresy.
  // EN: The state changed by the stubbed routes.
  const state: StubState = { profile: { ...START_PROFILE }, signedIn, deleteCalls: 0, panelLevel };

  // PL: Sesja ucznia: z danymi albo pusta (null), gdy ucznia nie ma.
  // EN: The student session: with data or empty (null) when there is no student.
  await page.route('**/api/auth/email/get-session', (route) => {
    const now = new Date().toISOString();
    const session = { id: 's1', userId: 'u1', token: 't1', createdAt: now, updatedAt: now, expiresAt: new Date(Date.now() + 86_400_000).toISOString() };
    const user = { id: 'u1', email: EMAIL, name: '', emailVerified: true, createdAt: now, updatedAt: now };
    return route.fulfill({ json: state.signedIn ? { session, user } : null });
  });

  // PL: Rola w panelu (wiersz 6.1a w profilu): null, gdy uczeń nie ma roli.
  // EN: The panel role (the row 6.1a in the profile): null when the student has no role.
  await page.route('**/api/admin/me', (route) => route.fulfill({ json: { level: state.panelLevel } }));

  // PL: Profil: GET, PUT i DELETE.
  // EN: The profile: GET, PUT and DELETE.
  await page.route('**/api/profile', (route) => {
    const method = route.request().method();
    if (method === 'PUT') state.profile = route.request().postDataJSON() as Record<string, string>;
    if (method === 'DELETE') {
      state.deleteCalls += 1;
      state.signedIn = false;
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ json: state.profile });
  });
  return state;
}

/**
 * PL: Odczytuje kolor akcentu ze strony i mówi, czy jest bardziej czerwony, czy bardziej niebieski.
 * EN: Reads the accent color from the page and says whether it is redder or bluer.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @returns PL: „red” albo „blue”. EN: "red" or "blue".
 */
async function accentHue(page: Page): Promise<'red' | 'blue'> {
  // PL: Wartość zmiennej --accent to kolor zapisany jako #rrggbb.
  // EN: The value of the --accent variable is a color written as #rrggbb.
  const hex = (await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent'))).trim();
  const red = parseInt(hex.slice(1, 3), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return red > blue ? 'red' : 'blue';
}

/**
 * PL: Wpisuje dane w ustawieniach i zapisuje.
 * EN: Types the data into the settings and saves.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param values - PL: imię, klasa, nazwa szkoły i nazwa palety do wybrania. EN: the name, class, school name and palette name to choose.
 */
async function saveSettings(page: Page, values: { name: string; className: string; school: string; palette: string }): Promise<void> {
  // PL: Wejdź w ustawienia i wypełnij pola.
  // EN: Open the settings and fill in the fields.
  await page.goto('/profile/ustawienia');
  await page.getByLabel('Imię').fill(values.name);
  await page.getByLabel('Klasa').fill(values.className);
  await page.getByRole('radio', { name: values.school }).check();
  await page.getByRole('radio', { name: values.palette }).check();
  // PL: Zapisz i poczekaj na potwierdzenie.
  // EN: Save and wait for the confirmation.
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByRole('status')).toHaveText('Zapisano.');
}

// PL: Zmiana imienia, klasy i szkoły: profil pokazuje nowe dane, a akcent zmienia się z niebieskiego na czerwony i z powrotem.
// EN: Changing the name, class and school: the profile shows the new data, and the accent changes from blue to red and back.
test('zmiana imienia, klasy i szkoły zmienia profil i akcent / changing name, class and school changes the profile and the accent', async ({ page }) => {
  await stubServer(page);

  // PL: Start: liceum, akcent niebieski. Profil pokazuje zasłonięty adres jak na ekranie 2.4.
  // EN: Start: lyceum, blue accent. The profile shows the masked address as on screen 2.4.
  await page.goto('/profile');
  await expect(page.getByText('o***@teb.edu.pl')).toBeVisible();
  expect(await accentHue(page)).toBe('blue');

  // PL: Zapisz dane z technikum: akcent staje się czerwony od razu, na tej samej stronie.
  // EN: Save data with the technical school: the accent turns red at once, on the same page.
  await saveSettings(page, { name: 'Ola', className: '3TA', school: 'Technikum', palette: 'CE Grafit' });
  expect(await accentHue(page)).toBe('red');

  // PL: Profil pokazuje imię i klasę z zasłoniętym adresem, a „Moje zgłoszenia” prowadzą do zgłoszeń.
  // EN: The profile shows the name and class with the masked address, and "Moje zgłoszenia" leads to the reports.
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Ola' })).toBeVisible();
  await expect(page.getByText('3TA · o***@teb.edu.pl')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Moje zgłoszenia' })).toHaveAttribute('href', '/reports/student/moje');

  // PL: Wróć do liceum: akcent znów niebieski.
  // EN: Go back to the lyceum: the accent is blue again.
  await saveSettings(page, { name: 'Ola', className: '3TA', school: 'Liceum', palette: 'CE Grafit' });
  expect(await accentHue(page)).toBe('blue');
});

// PL: Wiersz „Panel Samorządu” widzi tylko osoba z rolą: Samorząd dostaje go z znacznikiem „Samorząd” i prowadzi do /admin.
// EN: The "Panel Samorządu" row is seen only by a person with a role: the Council gets it with the badge "Samorząd" and it leads to /admin.
test('wiersz panelu z rolą prowadzi do /admin / the panel row with a role leads to /admin', async ({ page }) => {
  await stubServer(page, true, 'council');
  await page.goto('/profile');

  const row = page.getByRole('link', { name: /Panel Samorządu/ });
  await expect(row).toHaveAttribute('href', '/admin');
  await expect(row).toContainText('Samorząd');
});

// PL: Redakcja widzi wiersz „Panel redakcji” ze znacznikiem „Redakcja”, a administrator „Panel Samorządu” ze znacznikiem „Administrator”.
// EN: The editorial team sees the row "Panel redakcji" with the badge "Redakcja", and the administrator "Panel Samorządu" with the badge "Administrator".
for (const [level, label, badge] of [['editor', 'Panel redakcji', 'Redakcja'], ['admin', 'Panel Samorządu', 'Administrator']] as const) {
  test(`rola ${level} widzi wiersz „${label}” / the role ${level} sees the row "${label}"`, async ({ page }) => {
    await stubServer(page, true, level);
    await page.goto('/profile');

    const row = page.getByRole('link', { name: new RegExp(label) });
    await expect(row).toHaveAttribute('href', '/admin');
    await expect(row).toContainText(badge);
  });
}

// PL: Uczeń bez roli nie ma wiersza panelu. Najpierw czekamy, aż profil się wczyta, żeby brak wiersza nie był przypadkiem.
// EN: A student without a role has no panel row. First we wait for the profile to load, so that the missing row is not a fluke.
test('uczeń bez roli nie widzi wiersza panelu / a student without a role does not see the panel row', async ({ page }) => {
  await stubServer(page, true, null);
  await page.goto('/profile');
  await expect(page.getByRole('link', { name: 'Moje zgłoszenia' })).toBeVisible();

  await expect(page.getByRole('link', { name: /Panel/ })).toHaveCount(0);
});

// PL: Wiersz „Moje urządzenia” w ustawieniach ma cel dotyku co najmniej 44 px i prowadzi pod adres /auth/email/urzadzenia. Sprawdzamy adres, nie treść ekranu, bo ekran urządzeń powstaje w osobnym podtorze.
// EN: The row "Moje urządzenia" in the settings has a touch target of at least 44 px and leads to /auth/email/urzadzenia. We check the address, not the screen content, because the devices screen is made in a separate subtrack.
test('wiersz „Moje urządzenia” prowadzi do /auth/email/urzadzenia / the row "Moje urządzenia" leads to /auth/email/urzadzenia', async ({ page }) => {
  await stubServer(page);
  await page.goto('/profile/ustawienia');

  const row = page.getByRole('link', { name: 'Moje urządzenia' });
  await expect(row).toBeVisible();
  const box = await row.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

  // PL: Czekamy na adres, który kliknięcie wpisuje do historii. Nie patrzymy na adres końcowy, bo na main zalogowanego ucznia przekierowuje AuthEmailScreen na „/”.
  // EN: We wait for the address the click puts into the history. We do not look at the final address, because on main AuthEmailScreen redirects a signed-in student to "/".
  await Promise.all([page.waitForURL(/\/auth\/email\/urzadzenia$/, { waitUntil: 'commit' }), row.click()]);
});

// PL: Wybrana paleta zostaje po ponownym uruchomieniu: na innym ekranie, po przeładowaniu i gdy serwer profilu nie odpowiada.
// EN: The chosen palette stays after a restart: on another screen, after a reload and when the profile server does not answer.
test('wybrana paleta zostaje po ponownym uruchomieniu / the chosen palette stays after a restart', async ({ page }) => {
  await stubServer(page);

  // PL: Wybierz paletę CG Biel i zapisz.
  // EN: Choose the CG Biel palette and save.
  await saveSettings(page, { name: 'Ola', className: '3TA', school: 'Liceum', palette: 'CG Biel' });
  await expect(page.locator('html')).toHaveAttribute('data-paleta', 'CG');

  // PL: Inny ekran (pulpit, bez zapytań o profil) po przeładowaniu ma tę samą paletę.
  // EN: Another screen (the dashboard, with no profile queries) after a reload has the same palette.
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-paleta', 'CG');

  // PL: Po „ponownym uruchomieniu” z niedziałającym serwerem profilu paleta nadal jest ta sama.
  // EN: After a "restart" with a dead profile server the palette is still the same.
  await page.route('**/api/profile', (route) => route.fulfill({ status: 503, json: { error: 'server_error' } }));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-paleta', 'CG');
});

// PL: Przełącznik „Większy tekst” zapisuje rozmiar, powiększa tekst w całej aplikacji i zostaje po przeładowaniu, także gdy serwer profilu nie odpowiada.
// EN: The "Większy tekst" switch saves the size, enlarges the text in the whole app and stays after a reload, also when the profile server does not answer.
test('większy tekst zostaje po ponownym uruchomieniu / the larger text stays after a restart', async ({ page }) => {
  const state = await stubServer(page);

  // PL: Na starcie tekst jest normalny, a przełącznik wyłączony.
  // EN: At the start the text is normal and the switch is off.
  await page.goto('/profile/ustawienia');
  await expect(page.getByRole('checkbox', { name: 'Większy tekst' })).not.toBeChecked();

  // PL: Włącz przełącznik i zapisz: tekst się powiększa, a serwer dostaje rozmiar „duzy”.
  // EN: Turn the switch on and save: the text gets larger, and the server gets the size "duzy".
  await page.getByRole('checkbox', { name: 'Większy tekst' }).check();
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByRole('status')).toHaveText('Zapisano.');
  await expect(page.locator('html')).toHaveAttribute('data-tekst', 'duzy');
  expect(state.profile.textSize).toBe('duzy');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--t-md').trim())).toBe('20px');

  // PL: Inny ekran po przeładowaniu ma ten sam większy tekst.
  // EN: Another screen after a reload has the same larger text.
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-tekst', 'duzy');

  // PL: Po „ponownym uruchomieniu” z niedziałającym serwerem profilu tekst nadal jest większy.
  // EN: After a "restart" with a dead profile server the text is still larger.
  await page.route('**/api/profile', (route) => route.fulfill({ status: 503, json: { error: 'server_error' } }));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-tekst', 'duzy');
});

// PL: „Pobierz moje dane” zapisuje plik moje-dane-teb.json z kontem i profilem z serwera.
// EN: "Pobierz moje dane" saves the file moje-dane-teb.json with the account and the profile from the server.
test('pobranie moich danych zapisuje plik JSON / downloading my data saves a JSON file', async ({ page }) => {
  await stubServer(page);
  const exported = { version: 1, exportedAt: new Date().toISOString(), account: { id: 'u1', email: EMAIL, name: '' }, profile: { ...START_PROFILE, name: 'Ola' }, missing: ['Zgłoszenia ucznia'] };
  await page.route('**/api/profile/export', (route) => route.fulfill({ json: exported }));
  await page.goto('/profile/ustawienia');

  // PL: Kliknięcie w przycisk uruchamia pobieranie, a plik ma nazwę moje-dane-teb.json.
  // EN: The click starts the download, and the file is named moje-dane-teb.json.
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Pobierz moje dane' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('moje-dane-teb.json');

  // PL: Zawartość pliku to konto i profil ucznia z serwera.
  // EN: The file content is the student's account and profile from the server.
  const data = JSON.parse(await readFile((await download.path()) as string, 'utf-8')) as typeof exported;
  expect(data.account.email).toBe(EMAIL);
  expect(data.profile.name).toBe('Ola');
  expect(data.missing).toEqual(['Zgłoszenia ucznia']);
});

// PL: Gdy serwer nie odda danych, pokazuje się komunikat o błędzie i nic się nie pobiera.
// EN: When the server does not return the data, an error message shows and nothing is downloaded.
test('błąd pobierania pokazuje komunikat / a download error shows a message', async ({ page }) => {
  await stubServer(page);
  let exportCalls = 0;
  await page.route('**/api/profile/export', (route) => {
    exportCalls += 1;
    return route.fulfill({ status: 500, json: { error: 'server_error' } });
  });
  await page.goto('/profile/ustawienia');

  // PL: Komunikat ma rolę alert, żeby czytnik ekranu go ogłosił.
  // EN: The message has the role alert, so a screen reader announces it.
  await page.getByRole('button', { name: 'Pobierz moje dane' }).click();
  await expect(page.getByRole('alert')).toHaveText('Nie udało się pobrać danych.');
  expect(exportCalls).toBe(1);
});

// PL: Każda z ośmiu palet daje się wybrać i ustawia swój kod na stronie.
// EN: Each of the eight palettes can be chosen and sets its code on the page.
test('osiem palet do wyboru / eight palettes to choose from', async ({ page }) => {
  await stubServer(page);
  await page.goto('/profile/ustawienia');

  // PL: Jest dokładnie osiem przycisków palet i osiem nazw kodów (szkoły są w osobnej grupie).
  // EN: There are exactly eight palette buttons and eight code names (the schools are in a separate group).
  const palettes = page.getByRole('group', { name: 'Paleta kolorów' }).getByRole('radio');
  await expect(palettes).toHaveCount(8);

  // PL: Zapisz każdą po kolei i sprawdź kod na stronie.
  // EN: Save each one in turn and check the code on the page.
  for (const code of ['CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH']) {
    await page.getByRole('radio', { name: new RegExp(`^${code} `) }).check();
    await page.getByRole('button', { name: 'Zapisz' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-paleta', code);
  }
});

// PL: Usunięcie konta: potwierdzenie, jedno wywołanie serwera, ekran logowania, wygląd domyślny, a profil bez sesji odsyła na logowanie.
// EN: Deleting the account: the confirmation, one server call, the sign-in screen, the default look, and the profile without a session sends to sign-in.
test('usunięcie konta kończy się ekranem logowania / deleting the account ends at the sign-in screen', async ({ page }) => {
  const state = await stubServer(page);
  await saveSettings(page, { name: 'Ola', className: '3TA', school: 'Technikum', palette: 'CH Granat' });

  // PL: Z profilu przejdź do potwierdzenia. Anulowanie niczego nie usuwa.
  // EN: Go from the profile to the confirmation. Cancelling deletes nothing.
  await page.goto('/profile');
  await page.getByRole('link', { name: /Usuń konto i dane/ }).click();
  await expect(page.getByRole('heading', { name: 'Usunąć konto?' })).toBeVisible();
  await page.getByRole('link', { name: 'Anuluj' }).click();
  expect(state.deleteCalls).toBe(0);

  // PL: Potwierdź usunięcie: ekran logowania, jedno wywołanie, wygląd wrócił do domyślnego.
  // EN: Confirm the deletion: the sign-in screen, one call, the look went back to the default.
  await page.getByRole('link', { name: /Usuń konto i dane/ }).click();
  await page.getByRole('button', { name: 'Usuń konto i dane' }).click();
  await expect(page).toHaveURL(/\/auth\/email/);
  expect(state.deleteCalls).toBe(1);
  await expect(page.locator('html')).toHaveAttribute('data-paleta', 'CE');
  await expect(page.locator('html')).toHaveAttribute('data-szkola', 'L');

  // PL: Po usunięciu profil odsyła na logowanie.
  // EN: After the deletion the profile sends to sign-in.
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/auth\/email/);
});

// PL: Błąd serwera przy usuwaniu konta zostawia konto i pokazuje komunikat.
// EN: A server error during the account deletion leaves the account and shows a message.
test('błąd serwera przy usuwaniu konta zostawia konto / a server error on deletion leaves the account', async ({ page }) => {
  const state = await stubServer(page);
  await page.route('**/api/profile', (route) => (route.request().method() === 'DELETE' ? route.fulfill({ status: 500, json: { error: 'server_error' } }) : route.fallback()));

  await page.goto('/profile/usun');
  await page.getByRole('button', { name: 'Usuń konto i dane' }).click();

  await expect(page.getByRole('alert')).toContainText('Nie udało się usunąć konta');
  await expect(page).toHaveURL(/\/profile\/usun/);
  expect(state.signedIn).toBe(true);
});

// PL: Polityka prywatności otwiera się bez logowania i bez żadnych podstawek: prawdziwa sesja jest pusta, a adres zostaje.
// EN: The privacy policy opens without signing in and with no stubs: the real session is empty, and the address stays.
test('polityka prywatności otwiera się bez logowania / the privacy policy opens without signing in', async ({ page }) => {
  await page.goto('/profile/prywatnosc');

  await expect(page.getByText('Polityka prywatności', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Co zbieramy' })).toBeVisible();
  await expect(page).toHaveURL(/\/profile\/prywatnosc$/);
});

// PL: Profil bez sesji odsyła na logowanie, a nie pokazuje danych.
// EN: The profile without a session sends to sign-in instead of showing data.
test('profil bez sesji odsyła na logowanie / the profile without a session sends to sign-in', async ({ page }) => {
  await stubServer(page, false);
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/auth\/email/);
});

// PL: Przy 320 px żaden ekran profilu nie przewija się w poziomie, także z bardzo długim imieniem.
// EN: At 320 px no profile screen scrolls horizontally, also with a very long name.
test('przy szerokości 320 px nic się nie przewija w poziomie / nothing scrolls horizontally at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const state = await stubServer(page);
  state.profile = { ...START_PROFILE, name: 'Wyjątkowodługieimiebezżadnychspacjiaaaaaaaaaaaaaaaa', className: '3TA' };

  // PL: Sprawdź każdy ekran: strona nie jest szersza niż okno.
  // EN: Check every screen: the page is not wider than the window.
  for (const path of ['/profile', '/profile/ustawienia', '/profile/usun', '/profile/prywatnosc']) {
    await page.goto(path);
    await expect(page.locator('main[data-subtrack="7"] b').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }

  // PL: Przycisk zapisu mieści się w oknie.
  // EN: The save button fits in the window.
  await page.goto('/profile/ustawienia');
  const box = await page.getByRole('button', { name: 'Zapisz' }).boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 320).toBe(true);
});

// PL: Bez internetu profil zostaje z ostatnio pobranymi danymi pod wspólnym paskiem, zapis kończy się błędem, a polityka działa.
// EN: Without internet the profile keeps the last fetched data under the shared bar, saving fails, and the policy works.
test('bez internetu: zachowany profil, błąd zapisu i działająca polityka / offline: a kept profile, a save error and a working policy', async ({ page, context }) => {
  const state = await stubServer(page);
  state.profile = { ...START_PROFILE, name: 'Ola', className: '3TA' };

  // PL: Wejdź online: widać imię. Potem odetnij internet.
  // EN: Go in online: the name is visible. Then cut the internet.
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Ola' })).toBeVisible();
  await context.setOffline(true);
  // PL: Podstawka odpowiada nawet przy odciętej sieci, więc zapis bez internetu odtwarzamy, zrywając połączenie.
  // EN: The stub answers even with the network cut, so we reproduce saving without internet by dropping the connection.
  await page.route('**/api/profile', (route) => (route.request().method() === 'PUT' ? route.abort('internetdisconnected') : route.fallback()));
  await expect(page.locator('[data-offline-notice]')).toContainText('Brak internetu');
  await expect(page.getByRole('heading', { name: 'Ola' })).toBeVisible();

  // PL: Zapis bez internetu kończy się błędem, a wpisane dane zostają.
  // EN: Saving without internet fails and the typed data stays.
  await page.getByRole('link', { name: 'Ustawienia' }).click();
  await page.getByLabel('Imię').fill('Ola Nowa');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByRole('alert')).toContainText('Nie udało się zapisać');
  await expect(page.getByLabel('Imię')).toHaveValue('Ola Nowa');

  // PL: Polityka prywatności jest w aplikacji, więc otwiera się także bez internetu.
  // EN: The privacy policy is in the app, so it opens also without internet.
  await page.getByRole('link', { name: 'Wróć do profilu' }).click();
  await page.getByRole('link', { name: 'Polityka prywatności' }).click();
  await expect(page.getByRole('heading', { name: 'Co zbieramy' })).toBeVisible();
});
