/**
 * PL: Test ekranu głosowania (podtor 5a). Otwiera adres głęboki bez przechodzenia przez pulpit i sprawdza „W budowie” oraz dolny pasek.
 * EN: Test of the voting screen (subtrack 5a). Opens the deep address without going through the dashboard and checks "W budowie" and the bottom bar.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/surveys/vote/SurveysVoteScreen.tsx::SurveysVoteScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright.
// EN: Playwright test functions.
import { expect, test } from '@playwright/test';

// PL: Jeden przypadek: adres /surveys/vote prowadzi do ekranu podtoru 5a.
// EN: One case: the /surveys/vote address leads to the screen of subtrack 5a.
test('adres /surveys/vote pokazuje „W budowie” / the /surveys/vote address shows "W budowie"', async ({ page }) => {
  // PL: Otwórz adres głęboki.
  // EN: Open the deep address.
  await page.goto('/surveys/vote');

  // PL: Napis o budowie i znacznik podtoru 5a muszą być widoczne.
  // EN: The under-construction label and the subtrack 5a marker must be visible.
  await expect(page.getByText('W budowie').first()).toBeVisible();
  await expect(page.locator('[data-subtrack="5a"]')).toBeVisible();
  // PL: Dolny pasek jest na tym ekranie.
  // EN: The bottom bar is on this screen.
  await expect(page.getByRole('navigation', { name: 'Menu główne' })).toBeVisible();
});
