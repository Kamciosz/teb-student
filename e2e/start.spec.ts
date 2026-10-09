/**
 * PL: Test ekranu startowego. Otwiera aplikację w przeglądarce i sprawdza, że widać nazwę oraz napis „W budowie”.
 * EN: Test of the start screen. Opens the app in a browser and checks that the name and the "W budowie" label are visible.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/App.tsx::App
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright.
// EN: Playwright test functions.
import { expect, test } from '@playwright/test';

// PL: Jedyny przypadek: ekran startowy pokazuje to, co ma pokazywać.
// EN: The only case: the start screen shows what it should show.
test('ekran startowy pokazuje nazwę i „W budowie” / start screen shows the name and "W budowie"', async ({ page }) => {
  // PL: Otwórz stronę główną aplikacji.
  // EN: Open the app's home page.
  await page.goto('/');

  // PL: Nagłówek z nazwą aplikacji musi być widoczny.
  // EN: The heading with the app name must be visible.
  await expect(page.getByRole('heading', { name: 'TEB Student' })).toBeVisible();
  // PL: Napis o budowie musi być widoczny.
  // EN: The under-construction label must be visible.
  await expect(page.getByText('W budowie')).toBeVisible();
});
