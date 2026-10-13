/**
 * PL: Test bramki logowania (podtor 0): uczeń bez sesji, który otwiera zgłoszenia albo ankiety, dostaje od prawdziwego serwera 401 i ląduje na /auth/email zamiast zwykłego błędu. Do tego 401 z atrapy serwera na ekranie ankiet oraz brak przeniesienia, gdy serwer odpowiada błędem innym niż 401.
 * EN: Test of the sign-in gate (subtrack 0): a student without a session who opens reports or surveys gets a 401 from the real server and lands on /auth/email instead of a plain error. Plus a 401 from a mock server on the surveys screen, and no move when the server answers with an error other than 401.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses src/shared/auth/signInGate.ts::installSignInGate
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright.
// EN: Playwright test functions.
import { expect, test } from '@playwright/test';

// PL: Ekran logowania pokazuje pole adresu szkolnego.
// EN: The sign-in screen shows the school address field.
const SIGN_IN_URL = /\/auth\/email$/;

// PL: Prawdziwy serwer bez sesji odpowiada 401 (podtory 4a i 5a), więc bramka przenosi na logowanie.
// EN: The real server without a session answers 401 (subtracks 4a and 5a), so the gate moves to sign-in.
for (const address of ['/reports/student/moje', '/surveys/vote']) {
  test(`${address} bez sesji przenosi na /auth/email / without a session moves to /auth/email`, async ({ page }) => {
    await page.goto(address);

    await expect(page).toHaveURL(SIGN_IN_URL);
  });
}

// PL: 401 przy wysyłaniu zgłoszenia (zapytanie zmieniające dane, nie odczyt): też przenosi na logowanie.
// EN: A 401 when sending a report (a request that changes data, not a read): also moves to sign-in.
test('401 przy wysyłaniu zgłoszenia przenosi na /auth/email / a 401 when sending a report moves to /auth/email', async ({ page }) => {
  await page.route('**/api/reports/student', (route) => route.fulfill({ status: 401, json: { error: 'unauthorized' } }));
  // PL: Lista podobnych zgłoszeń (krok „Mnie też”, podtor 4a) jest pusta, żeby pierwsze 401 przyszło dopiero z wysyłki.
  // EN: The similar reports list ("Me too" step, subtrack 4a) is empty, so the first 401 comes only from sending.
  await page.route('**/api/reports/student/similar*', (route) => route.fulfill({ json: { reports: [] } }));

  await page.goto('/reports/student');
  await page.getByRole('radio', { name: 'Sala lub sprzęt' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByRole('radio', { name: 'Sala', exact: true }).click();
  await page.getByLabel('Dokładne miejsce').fill('Sala 112');
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Opis').fill('Projektor w sali nie działa od tygodnia.');
  await page.getByRole('button', { name: 'Wyślij zgłoszenie' }).click();

  await expect(page).toHaveURL(SIGN_IN_URL);
});

// PL: 401 z atrapy: bramka działa niezależnie od tego, który moduł zapytał.
// EN: A 401 from a mock: the gate works regardless of which module asked.
test('401 z listy ankiet przenosi na /auth/email / a 401 from the survey list moves to /auth/email', async ({ page }) => {
  await page.route('**/api/surveys/vote/', (route) => route.fulfill({ status: 401, json: { error: 'unauthorized' } }));

  await page.goto('/surveys/vote');

  await expect(page).toHaveURL(SIGN_IN_URL);
});

// PL: Inny błąd serwera (500) to zwykły błąd na ekranie, bez przeniesienia.
// EN: Another server error (500) is a plain error on the screen, with no move.
test('500 nie przenosi na logowanie / a 500 does not move to sign-in', async ({ page }) => {
  await page.route('**/api/surveys/vote/', (route) => route.fulfill({ status: 500, json: { error: 'server' } }));

  await page.goto('/surveys/vote');
  await page.waitForTimeout(500);

  await expect(page).toHaveURL(/\/surveys\/vote/);
});
