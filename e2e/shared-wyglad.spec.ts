/**
 * PL: Test wspólnego wyglądu (podtor 0) w przeglądarce: dolny pasek na pulpicie dostaje fokus z klawiatury z widoczną obwódką, każdy jego link ma co najmniej 44 px wysokości i na szerokości 320 px strona nie wychodzi poza ekran. Serwer pulpitu jest podstawiony (page.route), żeby test nie zależał od danych ani od logowania.
 * EN: Test of the shared look (subtrack 0) in the browser: the bottom bar on the dashboard gets keyboard focus with a visible outline, each of its links is at least 44 px high, and at 320 px width the page does not go past the screen. The dashboard server is stubbed (page.route), so the test does not depend on data or sign-in.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/Dock.tsx::Dock
 * @uses src/shared/ui/Dock.css::.ui-dock
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page } from '@playwright/test';

// PL: Pusta odpowiedź pulpitu: żaden kafelek nie ma danych, a dolny pasek i tak się pokazuje.
// EN: An empty dashboard answer: no tile has data, and the bottom bar shows anyway.
const EMPTY = { important: null, announcements: [], survey: null, report: null };

// PL: Najwyżej tyle klawiszy Tab, zanim uznamy, że fokus nie trafił do paska.
// EN: At most this many Tab presses before we decide the focus did not reach the bar.
const MAX_TABS = 40;

/**
 * PL: Podstawia odpowiedź serwera pulpitu.
 * EN: Stubs the dashboard server answer.
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function mockDashboard(page: Page): Promise<void> {
  await page.route('**/api/dashboard', (route) => route.fulfill({ json: EMPTY }));
}

// PL: Klawiatura dochodzi do dolnego paska, a fokus ma widoczną obwódkę (base.css nie wyłącza jej).
// EN: The keyboard reaches the bottom bar, and the focus has a visible outline (base.css does not turn it off).
test('dolny pasek dostaje fokus z klawiatury z widoczną obwódką / the bottom bar gets keyboard focus with a visible outline', async ({ page }) => {
  await mockDashboard(page);
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Menu główne' });
  await expect(nav).toBeVisible();

  // PL: Naciskaj Tab, aż fokus będzie w pasku. EN: Press Tab until the focus is in the bar.
  let reached = false;
  for (let i = 0; i < MAX_TABS && !reached; i += 1) {
    await page.keyboard.press('Tab');
    reached = await nav.evaluate((element) => element.contains(document.activeElement));
  }
  expect(reached, 'fokus z klawiatury trafia do dolnego paska / keyboard focus reaches the bottom bar').toBe(true);

  // PL: Obwódka aktywnego elementu jest pełna, nie przerywana i nie zerowa.
  // EN: The active element's outline is solid, not dashed and not zero.
  const outline = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement as Element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(outline.style, 'obwódka fokusa / focus outline').toBe('solid');
  expect(parseFloat(outline.width), 'grubość obwódki fokusa / focus outline width').toBeGreaterThan(0);
});

// PL: Każdy link paska ma wysokość dotyku co najmniej 44 px (Dock.css: min-height).
// EN: Each bar link is at least 44 px high (Dock.css: min-height).
test('linki dolnego paska mają wysokość dotyku co najmniej 44 px / the bottom bar links are at least 44 px high', async ({ page }) => {
  await mockDashboard(page);
  await page.goto('/');
  const links = page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link');

  await expect(links).toHaveCount(3);
  const count = await links.count();
  for (let i = 0; i < count; i += 1) {
    const box = await links.nth(i).boundingBox();
    expect(box?.height ?? 0, `link ${i + 1} w pasku / bar link ${i + 1}`).toBeGreaterThanOrEqual(44);
  }
});

// PL: Na szerokości 320 px (najmniejszy telefon) strona nie jest szersza od ekranu.
// EN: At 320 px width (the smallest phone) the page is not wider than the screen.
test('na 320 px strona nie wychodzi poza ekran / at 320 px the page does not go past the screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await mockDashboard(page);
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Menu główne' })).toBeVisible();

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, 'szerokość przewijania / scroll width').toBeLessThanOrEqual(320);
});
