/**
 * PL: Test ekranu panelu Samorządu (podtor 3c). Otwiera adres głęboki i sprawdza „W budowie” oraz menu panelu z czterema wpisami.
 * EN: Test of the Student Council panel screen (subtrack 3c). Opens the deep address and checks "W budowie" and the panel menu with four entries.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/admin/AdminLayout.tsx::AdminLayout
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright.
// EN: Playwright test functions.
import { expect, test } from '@playwright/test';

// PL: Jeden przypadek: adres /news/admin leży w ramie panelu z menu.
// EN: One case: the /news/admin address lives in the panel frame with the menu.
test('adres /news/admin pokazuje „W budowie” w ramie panelu / the /news/admin address shows "W budowie" in the panel frame', async ({ page }) => {
  // PL: Otwórz adres głęboki.
  // EN: Open the deep address.
  await page.goto('/news/admin');

  // PL: Napis o budowie i znacznik podtoru 3c muszą być widoczne.
  // EN: The under-construction label and the subtrack 3c marker must be visible.
  await expect(page.getByText('W budowie').first()).toBeVisible();
  await expect(page.locator('[data-subtrack="3c"]')).toBeVisible();
  // PL: Menu panelu ma cztery wpisy.
  // EN: The panel menu has four entries.
  await expect(page.getByRole('navigation', { name: 'Panel Samorządu' }).getByRole('link')).toHaveCount(4);
});
