/**
 * PL: Test ścieżek podtoru 8 (panel Samorządu i administratora): ekran główny dla Samorządu, redakcji i administratora, ekran 6.1d dla ucznia bez roli, wydawanie kodu zaproszenia z kopiowaniem, błąd wydania, brak internetu, role (wyszukiwanie, nadanie, odebranie z arkuszem), dane z pilotażu i szerokość 320 px. Serwer panelu i sesja są podstawione (prawdziwa sesja wymaga kodu z terminala serwera), działanie serwera sprawdzają testy Vitest (worker/admin/routes.test.ts, roles.test.ts, pilot.test.ts).
 * EN: Test of the subtrack 8 paths (the Student Council and administrator panel): the main screen for the Council, the editorial team and the administrator, screen 6.1d for a student without a role, issuing an invitation code with copying, the issue error, no internet, roles (search, granting, revoking with the sheet), the pilot data and 320 px width. The panel server and the session are stubbed (a real session needs a code from the server terminal), the Vitest tests cover the server (worker/admin/routes.test.ts, roles.test.ts, pilot.test.ts).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/AdminScreen.tsx::AdminScreen
 * @uses src/features/admin/AdminLayout.tsx::AdminLayout
 * @uses src/features/admin/RoleScreen.tsx::RoleScreen
 * @uses src/features/admin/RoleCardScreen.tsx::RoleCardScreen
 * @uses src/features/admin/PilotScreen.tsx::PilotScreen
 * @used_by playwright.config.ts::testDir
 */

import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/** PL: Rola, jaką podstawiony serwer oddaje uczniowi. EN: The role the stubbed server gives the student. */
type Level = 'editor' | 'council' | 'admin' | null;

/** PL: Kod, który podstawiony serwer wydaje. Wymyślony. EN: The code the stubbed server issues. Invented. */
const ISSUED_CODE = 'TEB-7K4Q-92';

/** PL: Uczeń, którego podstawiony serwer znajduje w wyszukiwaniu. Wymyślony. EN: The student the stubbed server finds in the search. Invented. */
const STUDENT_ID = 'st-7';
const STUDENT_EMAIL = 'adam.nowak@teb.edu.pl';
const STUDENT_NAME = 'Adam';
const STUDENT_MASKED = 'a***@teb.edu.pl';

/** PL: Plik z pilotażu, jaki podstawiony serwer oddaje. Same liczby, bez imion i adresów. EN: The pilot file the stubbed server returns. Only numbers, no names and no addresses. */
const PILOT_CSV = 'zalogowania,zgloszenia,odpowiedzi\n12,3,40\n';

/** PL: Opcje podstawionego serwera. EN: The options of the stubbed server. */
type StubOptions = {
  /** PL: Kod odpowiedzi na wydanie kodu (201 albo błąd). EN: The answer code for issuing a code (201 or an error). */
  inviteStatus?: number;
  /** PL: Role ucznia z wyszukiwania na starcie. EN: The student's roles from the search at the start. */
  roles?: { council: boolean; editor: boolean };
  /** PL: Kod odpowiedzi na zapis ról, gdy ma być błąd. EN: The answer code for saving roles when it should fail. */
  roleSaveStatus?: number;
};

/**
 * PL: Podstawia sesję ucznia i serwer panelu: /me oddaje podaną rolę, /invites wydaje kod albo odpowiada błędem, /roles szuka i zapisuje role ucznia, /pilot oddaje plik CSV.
 * EN: Stubs the student session and the panel server: /me returns the given role, /invites issues a code or answers with an error, /roles searches and saves the student's roles, /pilot returns the CSV file.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param level - PL: rola ucznia. EN: the student's role.
 * @param options - PL: opcje odpowiedzi serwera. EN: the options of the server answers.
 */
async function stubServer(page: Page, level: Level, options: StubOptions = {}): Promise<void> {
  await stubSession(page);
  // PL: Rola ucznia w panelu.
  // EN: The student's panel role.
  await page.route('**/api/admin/me', (route) => route.fulfill({ json: { level } }));
  await stubInvites(page, options);
  await stubRoles(page, options);
  // PL: Plik z pilotażu jako CSV do pobrania.
  // EN: The pilot file as a CSV to download.
  await page.route('**/api/admin/pilot', (route) =>
    route.fulfill({ status: 200, contentType: 'text/csv', headers: { 'content-disposition': 'attachment; filename="pilotaz.csv"' }, body: PILOT_CSV }),
  );
}

/**
 * PL: Podstawia zalogowanego ucznia: sesję i użytkownika.
 * EN: Stubs the signed-in student: the session and the user.
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function stubSession(page: Page): Promise<void> {
  // PL: Sesja ucznia: zalogowany uczeń.
  // EN: The student session: a signed-in student.
  await page.route('**/api/auth/email/get-session', (route) => {
    const now = new Date().toISOString();
    const session = { id: 's1', userId: 'u1', token: 't1', createdAt: now, updatedAt: now, expiresAt: new Date(Date.now() + 86_400_000).toISOString() };
    const user = { id: 'u1', email: 'ola.testowa@teb.edu.pl', name: '', emailVerified: true, createdAt: now, updatedAt: now };
    return route.fulfill({ json: { session, user } });
  });
}

/**
 * PL: Podstawia kody zaproszeń: lista zaczyna się pusta, a wydanie daje kod ważny 14 dni od teraz albo błąd z opcji.
 * EN: Stubs the invitation codes: the list starts empty, and issuing gives a code valid for 14 days from now, or the error from the options.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param options - PL: opcje odpowiedzi serwera. EN: the options of the server answers.
 */
async function stubInvites(page: Page, options: StubOptions): Promise<void> {
  // PL: Kody: lista zaczyna się pusta, a wydanie daje kod ważny 14 dni od teraz.
  // EN: Codes: the list starts empty, and issuing gives a code valid for 14 days from now.
  await page.route('**/api/admin/invites', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { codes: [] } });
    if (options.inviteStatus && options.inviteStatus !== 201) return route.fulfill({ status: options.inviteStatus, json: { error: 'server_error' } });
    return route.fulfill({ status: 201, json: { code: ISSUED_CODE, expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString() } });
  });
}

/**
 * PL: Podstawia role ucznia: wyszukiwanie, kartę, zapis i listę osób z rolą. Stan trzyma się w pamięci testu, więc zapis zmienia to, co pokazuje lista i karta.
 * EN: Stubs the student's roles: search, card, save and the list of people with a role. The state is kept in the test's memory, so a save changes what the list and the card show.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param options - PL: role na starcie i opcja błędu zapisu. EN: the roles at the start and the save error option.
 */
async function stubRoles(page: Page, options: StubOptions): Promise<void> {
  const student = { council: options.roles?.council ?? false, editor: options.roles?.editor ?? false };
  const card = () => ({ studentId: STUDENT_ID, firstName: STUDENT_NAME, maskedEmail: STUDENT_MASKED, ...student });
  await page.route('**/api/admin/roles**', (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === 'PUT') {
      if (options.roleSaveStatus) return route.fulfill({ status: options.roleSaveStatus, json: { error: 'server_error' } });
      Object.assign(student, request.postDataJSON());
      return route.fulfill({ json: card() });
    }
    // PL: Wyszukiwanie: znany adres daje kartę, a inny adres 404 (nie ma konta).
    // EN: Search: the known address gives the card, and any other address gives 404 (no account).
    if (url.pathname.endsWith('/roles/search')) {
      if (url.searchParams.get('email') !== STUDENT_EMAIL) return route.fulfill({ status: 404, json: { error: 'not_found' } });
      return route.fulfill({ json: card() });
    }
    if (url.pathname.endsWith(`/roles/${STUDENT_ID}`)) return route.fulfill({ json: card() });
    // PL: Lista osób z rolą: tylko ten uczeń, gdy ma jakąś rolę.
    // EN: The list of people with a role: only this student, when they have any role.
    return route.fulfill({ json: { holders: student.council || student.editor ? [card()] : [] } });
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

// PL: Administrator widzi wiersze „Role” i „Dane z pilotażu”: pierwszy z podpisem Administrator, drugi pod etykietą „Pilotaż”.
// EN: The administrator sees the "Role" and "Dane z pilotażu" rows: the first with the Administrator badge, the second under the "Pilotaż" label.
test('administrator widzi role i pilotaż na ekranie głównym / the administrator sees roles and the pilot on the main screen', async ({ page }) => {
  await stubServer(page, 'admin');
  await page.goto('/admin');

  await expect(page.getByText('Twoja rola: administrator')).toBeVisible();
  await expect(page.locator('.ad-tile').first().locator('li')).toHaveCount(5);
  await expect(page.getByRole('link', { name: /Role Administrator Nadaj albo odbierz rolę Samorządu i redakcji\./ })).toHaveAttribute('href', '/admin/role');
  await expect(page.getByText('Pilotaż', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Dane z pilotażu Pobierz liczby bez imion, nazwisk i adresów\./ })).toHaveAttribute('href', '/admin/pilotaz');
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
  await page.getByRole('button', { name: 'Kopiuj kod', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Skopiowano' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(ISSUED_CODE);
  await expect(page.getByRole('button', { name: 'Kopiuj kod', exact: true })).toBeVisible({ timeout: 6000 });
});

// PL: Błąd serwera przy wydaniu: komunikat nad przyciskiem, a przycisk zostaje aktywny, żeby ponowić.
// EN: A server error when issuing: the message above the button, and the button stays active so the student can retry.
test('błąd wydania kodu zostawia aktywny przycisk / an issue error leaves the button active', async ({ page }) => {
  await stubServer(page, 'council', { inviteStatus: 500 });
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

// PL: Administrator wpisuje adres spoza szkoły: pod polem widać komunikat, a zmiana adresu go zdejmuje. Samo „@teb.edu.pl” też jest odrzucane.
// EN: The administrator types an address outside the school: a message shows under the field, and changing the address removes it. "@teb.edu.pl" alone is rejected too.
test('adres spoza szkoły dostaje komunikat / an address outside the school gets a message', async ({ page }) => {
  await stubServer(page, 'admin');
  await page.goto('/admin/role');

  await page.getByLabel('Szkolny e-mail').fill('adam@gmail.com');
  await page.getByRole('button', { name: 'Znajdź ucznia' }).click();
  await expect(page.getByText('Wpisz adres, który kończy się na @teb.edu.pl.')).toBeVisible();

  await page.getByLabel('Szkolny e-mail').fill('@teb.edu.pl');
  await page.getByRole('button', { name: 'Znajdź ucznia' }).click();
  await expect(page.getByText('Wpisz adres, który kończy się na @teb.edu.pl.')).toBeVisible();

  await page.getByLabel('Szkolny e-mail').fill('adam');
  await expect(page.getByText('Wpisz adres, który kończy się na @teb.edu.pl.')).toHaveCount(0);
});

// PL: Szkolny adres bez konta: pod polem komunikat „Nie ma konta z tym adresem.” i brak przejścia do karty.
// EN: A school address without an account: the message "Nie ma konta z tym adresem." under the field and no move to the card.
test('adres bez konta dostaje komunikat / an address without an account gets a message', async ({ page }) => {
  await stubServer(page, 'admin');
  await page.goto('/admin/role');

  await page.getByLabel('Szkolny e-mail').fill('nikt@teb.edu.pl');
  await page.getByRole('button', { name: 'Znajdź ucznia' }).click();
  await expect(page.getByText('Nie ma konta z tym adresem.')).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/role$/);
});

// PL: Lista osób z rolą pod polem pokazuje imię, znaczniki ról i zamaskowany adres, a pełnego adresu nie ma.
// EN: The list of people with a role under the field shows the first name, the role badges and the masked address, and there is no full address.
test('lista osób z rolą pokazuje zamaskowany adres / the list of role holders shows the masked address', async ({ page }) => {
  await stubServer(page, 'admin', { roles: { council: true, editor: false } });
  await page.goto('/admin/role');

  await expect(page.getByText('Osoby z rolą', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Adam Samorząd a\*\*\*@teb\.edu\.pl/ })).toHaveAttribute('href', `/admin/role/${STUDENT_ID}`);
  await expect(page.getByText(STUDENT_EMAIL)).toHaveCount(0);
});

// PL: Administrator szuka ucznia (adres wpisany dużymi literami), otwiera kartę i nadaje Samorząd: przełącznik się zmienia, pokazuje się „Zmiana”, a zapis wysyła tylko dwa pola ról.
// EN: The administrator searches for a student (the address typed in capitals), opens the card and grants the Council role: the switch changes, "Zmiana" shows, and the save sends only the two role fields.
test('administrator nadaje rolę Samorządu i zapisuje / the administrator grants the Council role and saves', async ({ page }) => {
  await stubServer(page, 'admin');
  await page.goto('/admin/role');

  await page.getByLabel('Szkolny e-mail').fill(STUDENT_EMAIL.toUpperCase());
  await page.getByRole('button', { name: 'Znajdź ucznia' }).click();
  await expect(page.getByRole('heading', { name: STUDENT_NAME })).toBeVisible();
  await expect(page.getByLabel('Szkolny e-mail')).toHaveValue(STUDENT_EMAIL);

  const council = page.getByRole('switch', { name: /^Samorząd/ });
  await expect(council).toHaveAttribute('aria-checked', 'false');
  await council.click();
  await expect(council).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('Zmiana', { exact: true })).toBeVisible();

  const saving = page.waitForRequest((request) => request.method() === 'PUT' && request.url().endsWith(`/api/admin/roles/${STUDENT_ID}`));
  await page.getByRole('button', { name: 'Zapisz role' }).click();
  expect((await saving).postDataJSON()).toEqual({ council: true, editor: false });
  await expect(page.getByText('Zmiana', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Zapisz role' })).toBeDisabled();
});

// PL: Nadanie roli redakcji nie pyta o potwierdzenie: arkusz pojawia się tylko przy odbieraniu Samorządu.
// EN: Granting the editorial role asks for no confirmation: the sheet appears only when taking away the Council role.
test('nadanie redakcji nie pyta o potwierdzenie / granting the editorial role asks for no confirmation', async ({ page }) => {
  await stubServer(page, 'admin');
  await page.goto(`/admin/role/${STUDENT_ID}`);

  const editor = page.getByRole('switch', { name: /^Redakcja gazetki/ });
  await editor.click();
  await expect(editor).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

// PL: Odebranie Samorządu otwiera arkusz z imieniem: „Anuluj” zamyka go bez zmiany, „Odbierz rolę” tylko zmienia wybór, a zapis dopiero przyciskiem na dole.
// EN: Taking away the Council role opens the sheet with the first name: "Anuluj" closes it without a change, "Odbierz rolę" only changes the choice, and saving happens only with the button at the bottom.
test('odebranie roli Samorządu pyta o potwierdzenie / taking away the Council role asks for confirmation', async ({ page }) => {
  await stubServer(page, 'admin', { roles: { council: true, editor: false } });
  await page.goto(`/admin/role/${STUDENT_ID}`);

  const council = page.getByRole('switch', { name: /^Samorząd/ });
  await expect(council).toHaveAttribute('aria-checked', 'true');
  await council.click();
  const sheet = page.getByRole('dialog');
  await expect(sheet.getByRole('heading', { name: 'Odebrać rolę Samorządu?' })).toBeVisible();
  await expect(sheet.getByText(`${STUDENT_NAME} straci dostęp do zgłoszeń, ankiet i kodów zaproszeń.`)).toBeVisible();

  await sheet.getByRole('button', { name: 'Anuluj', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(council).toHaveAttribute('aria-checked', 'true');

  await council.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Odbierz rolę', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(council).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByText('Zmiana', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zapisz role' })).toBeEnabled();
});

// PL: Zapis ról, który się nie udaje: komunikat nad przyciskiem, a przycisk zostaje aktywny, żeby ponowić.
// EN: A role save that fails: the message above the button, and the button stays active so the administrator can retry.
test('błąd zapisu ról zostawia aktywny przycisk / a role save error leaves the button active', async ({ page }) => {
  await stubServer(page, 'admin', { roleSaveStatus: 500 });
  await page.goto(`/admin/role/${STUDENT_ID}`);

  await page.getByRole('switch', { name: /^Samorząd/ }).click();
  await page.getByRole('button', { name: 'Zapisz role' }).click();
  await expect(page.getByText('Nie udało się zapisać ról. Spróbuj ponownie za chwilę.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zapisz role' })).toBeEnabled();
});

// PL: Bez internetu zapis ról jest nieaktywny (6.3b nie ma tu osobnego napisu), a po powrocie działa.
// EN: Without internet saving the roles is disabled (6.3b has no separate text here), and it works again after the return.
test('bez internetu zapis ról jest nieaktywny / offline saving the roles is disabled', async ({ page, context }) => {
  await stubServer(page, 'admin');
  await page.goto(`/admin/role/${STUDENT_ID}`);

  await page.getByRole('switch', { name: /^Redakcja gazetki/ }).click();
  await context.setOffline(true);
  await expect(page.getByRole('button', { name: 'Zapisz role' })).toBeDisabled();
  await context.setOffline(false);
  await expect(page.getByRole('button', { name: 'Zapisz role' })).toBeEnabled();
});

// PL: Samorząd nie wchodzi do ról ani do pilotażu: formularz wyszukiwania i pobranie nie są mu pokazane.
// EN: The Council does not get into the roles or the pilot: the search form and the download are not shown to them.
test('Samorząd nie widzi ról ani pilotażu / the Council sees neither roles nor the pilot', async ({ page }) => {
  await stubServer(page, 'council');

  await page.goto('/admin/role');
  await expect(page.getByLabel('Szkolny e-mail')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Znajdź ucznia' })).toHaveCount(0);

  await page.goto('/admin/pilotaz');
  await expect(page.getByRole('button', { name: 'Pobierz plik' })).toHaveCount(0);
});

// PL: Administrator pobiera plik z pilotażu: plik nazywa się pilotaz.csv i nie ma w nim adresów e-mail ani imion.
// EN: The administrator downloads the pilot file: the file is named pilotaz.csv and has no e-mail addresses and no first names.
test('administrator pobiera plik z pilotażu bez adresów i imion / the administrator downloads the pilot file without addresses and names', async ({ page }) => {
  await stubServer(page, 'admin');
  await page.goto('/admin/pilotaz');

  await expect(page.getByRole('heading', { name: 'Liczby z pilotażu' })).toBeVisible();
  await expect(page.getByText('Plik z trzema liczbami do wniosków. Nie ma w nim imion, nazwisk ani adresów.')).toBeVisible();

  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Pobierz plik' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('pilotaz.csv');
  const text = readFileSync(await download.path(), 'utf8');
  expect(text).not.toContain('@');
  expect(text).not.toContain(STUDENT_NAME);
});

// PL: Bez internetu pobranie pilotażu jest nieaktywne z napisem o internecie, a po powrocie działa.
// EN: Without internet the pilot download is disabled with the internet text, and it works again after the return.
test('bez internetu pobranie pilotażu jest nieaktywne / offline the pilot download is disabled', async ({ page, context }) => {
  await stubServer(page, 'admin');
  await page.goto('/admin/pilotaz');
  await expect(page.getByRole('button', { name: 'Pobierz plik' })).toBeVisible();

  await context.setOffline(true);
  await expect(page.getByText('Pobranie wymaga internetu.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pobierz plik' })).toBeDisabled();

  await context.setOffline(false);
  await expect(page.getByText('Pobranie wymaga internetu.')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Pobierz plik' })).toBeEnabled();
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
  const box = await page.getByRole('button', { name: 'Kopiuj kod', exact: true }).boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 320 && box.height >= 44).toBe(true);

  // PL: Ekran braku dostępu (inna rola, ten sam adres).
  // EN: The no-access screen (another role, the same address).
  await page.unroute('**/api/admin/me');
  await page.route('**/api/admin/me', (route) => route.fulfill({ json: { level: null } }));
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Tylko dla Samorządu' })).toBeVisible();
  await expectNoHorizontalScroll(page, '/admin bez roli');
});

// PL: Przy 320 px ekrany ról i pilotażu mieszczą się w oknie, także z otwartym arkuszem potwierdzenia, a przycisk „Odbierz rolę” ma co najmniej 44 px wysokości.
// EN: At 320 px the role and pilot screens fit the window, also with the confirmation sheet open, and the "Odbierz rolę" button is at least 44 px tall.
test('przy szerokości 320 px ekrany ról i pilotażu się mieszczą / at 320 px the role and pilot screens fit', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await stubServer(page, 'admin', { roles: { council: true, editor: false } });

  await page.goto('/admin/role');
  await expect(page.getByRole('button', { name: 'Znajdź ucznia' })).toBeVisible();
  await expectNoHorizontalScroll(page, '/admin/role');
  await page.getByLabel('Szkolny e-mail').fill(STUDENT_EMAIL);
  await page.getByRole('button', { name: 'Znajdź ucznia' }).click();
  await expect(page.getByRole('heading', { name: STUDENT_NAME })).toBeVisible();

  await page.getByRole('switch', { name: /^Samorząd/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoHorizontalScroll(page, '/admin/role/:id z arkuszem');
  const confirm = await page.getByRole('dialog').getByRole('button', { name: 'Odbierz rolę', exact: true }).boundingBox();
  expect(confirm && confirm.x >= 0 && confirm.x + confirm.width <= 320 && confirm.height >= 44).toBe(true);

  await page.goto('/admin/pilotaz');
  await expect(page.getByRole('button', { name: 'Pobierz plik' })).toBeVisible();
  await expectNoHorizontalScroll(page, '/admin/pilotaz');
});
