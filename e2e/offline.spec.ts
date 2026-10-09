/**
 * PL: Test paska braku internetu (podtor 0). Otwiera aplikację, wyłącza sieć w przeglądarce i sprawdza, że pojawia się „Brak internetu”, a po powrocie sieci znika.
 * EN: Test of the no-internet bar (subtrack 0). Opens the app, turns the browser network off and checks that "Brak internetu" appears and disappears when the network returns.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/ui/OfflineBanner.tsx::OfflineBanner
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright.
// EN: Playwright test functions.
import { expect, test } from '@playwright/test';

// PL: Jeden przypadek: pasek zależy od stanu sieci.
// EN: One case: the bar follows the network state.
test('pasek „Brak internetu” pojawia się bez sieci i znika po jej powrocie / the "Brak internetu" bar appears offline and disappears when the network returns', async ({ page, context }) => {
  // PL: Z siecią paska nie ma.
  // EN: With the network there is no bar.
  await page.goto('/');
  await expect(page.getByText('Brak internetu')).toHaveCount(0);

  // PL: Bez sieci pasek jest widoczny.
  // EN: Without the network the bar is visible.
  await context.setOffline(true);
  await expect(page.getByRole('status').getByText('Brak internetu')).toBeVisible();

  // PL: Po powrocie sieci pasek znika.
  // EN: When the network returns the bar disappears.
  await context.setOffline(false);
  await expect(page.getByText('Brak internetu')).toHaveCount(0);
});
