/**
 * PL: Test pulpitu (podtor 9). Otwiera adres główny i sprawdza napis „W budowie”, znacznik podtoru oraz dolny pasek z trzema wpisami.
 * EN: Test of the dashboard (subtrack 9). Opens the root address and checks the "W budowie" label, the subtrack marker and the bottom bar with three entries.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright.
// EN: Playwright test functions.
import { expect, test } from '@playwright/test';

// PL: Jeden przypadek: pulpit jest pod adresem głównym i ma dolny pasek.
// EN: One case: the dashboard is at the root address and has the bottom bar.
test('pulpit pod adresem głównym pokazuje „W budowie” i dolny pasek / dashboard at the root shows "W budowie" and the bottom bar', async ({ page }) => {
  // PL: Otwórz adres główny.
  // EN: Open the root address.
  await page.goto('/');

  // PL: Napis o budowie i znacznik podtoru 9 muszą być widoczne.
  // EN: The under-construction label and the subtrack 9 marker must be visible.
  await expect(page.getByText('W budowie').first()).toBeVisible();
  await expect(page.locator('[data-subtrack="9"]')).toBeVisible();
  // PL: Dolny pasek ma trzy wpisy.
  // EN: The bottom bar has three entries.
  await expect(page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link')).toHaveCount(3);
});
