/**
 * PL: Test licznika do dzwonka w przeglądarce (ekran /bell). Plan w main jest pusty, więc licznik się nie pokazuje. Dwa testy z podstawionym planem PRZYKŁADOWYM (page.route na moduł planu) i ustawionym zegarem sprawdzają, że licznik pokazuje minuty w czasie lekcji i przerwy.
 * EN: Test of the bell countdown in the browser (the /bell screen). The plan in main is empty, so the countdown does not show. Two tests with a stubbed EXAMPLE plan (page.route on the plan module) and a fixed clock check that the countdown shows minutes during a lesson and a break.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/BellScreen.tsx::BellScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright.
// EN: Playwright test functions.
import { expect, test, type Page } from '@playwright/test';

// PL: Adres modułu planu, tak jak Vite podaje go w przeglądarce.
// EN: The address of the plan module, as Vite serves it in the browser.
const PLAN_MODULE = '**/src/features/bell/bellPlan.ts*';

// PL: Treść modułu z PRZYKŁADOWYM planem (nie prawdziwy plan szkoły): trzy lekcje po 45 minut z przerwami 10 minut.
// EN: The module body with an EXAMPLE plan (not the school's real plan): three 45-minute lessons with 10-minute breaks.
const EXAMPLE_PLAN_JS = `export const BELL_PLAN = [
  { start: '08:00', end: '08:45' },
  { start: '08:55', end: '09:40' },
  { start: '09:50', end: '10:35' },
];`;

// PL: Podstawia plan przykładowy w miejsce modułu planu.
// EN: Stubs the example plan in place of the plan module.
async function useExamplePlan(page: Page): Promise<void> {
  await page.route(PLAN_MODULE, (route) => route.fulfill({ contentType: 'text/javascript', body: EXAMPLE_PLAN_JS }));
}

// PL: Plan w main jest pusty: ekran pokazuje tylko siebie, bez licznika (nawet w godzinach lekcji).
// EN: The plan in main is empty: the screen shows no countdown (even during lesson hours).
test('bez planu dzwonków licznik się nie pokazuje', async ({ page }) => {
  // PL: Poniedziałek 19.10.2026 09:10 w Warszawie (czas letni: 07:10 UTC), pora drugiej lekcji.
  // EN: Monday 19.10.2026 09:10 in Warsaw (summer time: 07:10 UTC), the time of the second lesson.
  await page.clock.setFixedTime(new Date('2026-10-19T07:10:00Z'));
  await page.goto('/bell');
  await expect(page.getByLabel('Licznik do dzwonka')).toHaveCount(0);
});

// PL: W czasie lekcji licznik pokazuje minuty do dzwonka i etykietę „do dzwonka”.
// EN: During a lesson the countdown shows the minutes to the bell and the label "do dzwonka".
test('w czasie lekcji pokazuje minuty do dzwonka', async ({ page }) => {
  await useExamplePlan(page);
  // PL: 09:10 w Warszawie: druga lekcja z przykładu, zostało 30 minut.
  // EN: 09:10 in Warsaw: the second lesson of the example, 30 minutes left.
  await page.clock.setFixedTime(new Date('2026-10-19T07:10:00Z'));
  await page.goto('/bell');
  const countdown = page.getByLabel('Licznik do dzwonka');
  await expect(countdown).toContainText('30');
  await expect(countdown).toContainText('min');
  await expect(countdown).toContainText('do dzwonka');
  await expect(countdown).toContainText('Następna: lekcja 3 o 9:50');
});

// PL: W przerwie licznik pokazuje minuty do następnej lekcji i etykietę „do lekcji”.
// EN: During a break the countdown shows the minutes to the next lesson and the label "do lekcji".
test('w przerwie pokazuje minuty do lekcji', async ({ page }) => {
  await useExamplePlan(page);
  // PL: 08:50 w Warszawie: przerwa między pierwszą a drugą lekcją, do 08:55 zostało 5 minut.
  // EN: 08:50 in Warsaw: the break between the first and second lesson, 5 minutes to 08:55.
  await page.clock.setFixedTime(new Date('2026-10-19T06:50:00Z'));
  await page.goto('/bell');
  const countdown = page.getByLabel('Licznik do dzwonka');
  await expect(countdown).toContainText('5');
  await expect(countdown).toContainText('Przerwa, do lekcji 2');
});
