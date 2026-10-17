/**
 * PL: Testy ekranu /bell w przeglądarce. Licznik do dzwonka: test z pustym podstawionym planem sprawdza, że licznik się nie pokazuje, a jest napis; testy z podstawionym planem PRZYKŁADOWYM (page.route na moduł planu) i ustawionym zegarem sprawdzają minuty w czasie lekcji i przerwy; jeden test używa prawdziwego planu szkoły. Sieć jest zastąpiona atrapami API.
 * EN: Tests of the /bell screen in the browser. The bell countdown: a test with an empty stubbed plan checks that the countdown is hidden and the text is shown; tests with a stubbed EXAMPLE plan (page.route on the plan module) and a fixed clock check the minutes during a lesson and a break; one test uses the school's real plan. The network is replaced by API stubs.
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

// PL: PUSTY plan podstawiony w miejscu modułu: ekran nie pokazuje licznika.
// EN: An EMPTY plan stubbed in place of the module: the screen shows no countdown.
const EMPTY_PLAN_JS = `export const BELL_PLAN = [];`;

// PL: Podstawia plan przykładowy w miejsce modułu planu (domyślnie zwykły przykład).
// EN: Stubs the example plan in place of the plan module (the regular example by default).
async function useExamplePlan(page: Page, body: string = EXAMPLE_PLAN_JS): Promise<void> {
  await page.route(PLAN_MODULE, (route) => route.fulfill({ contentType: 'text/javascript', body }));
}

/**
 * PL: Podstawia zalogowaną osobę (sesję), żeby ekran nie przekierował na logowanie.
 * EN: Stubs a signed-in person (the session), so the screen does not redirect to the sign-in page.
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function stubSession(page: Page): Promise<void> {
  await page.route('**/api/auth/email/get-session', (route) => {
    const now = new Date().toISOString();
    const session = { id: 's1', userId: 'u1', token: 't1', createdAt: now, updatedAt: now, expiresAt: new Date(Date.now() + 86_400_000).toISOString() };
    const user = { id: 'u1', email: 'uczen.testowy@teb.edu.pl', name: '', emailVerified: true, createdAt: now, updatedAt: now };
    return route.fulfill({ json: { session, user } });
  });
}

// PL: Domyślnie w każdym teście jest zalogowana osoba; test może to nadpisać.
// EN: By default each test has a signed-in person; a test can override it.
test.beforeEach(async ({ page }) => {
  await stubSession(page);
});

// PL: Pusty plan: ekran pokazuje tylko napis, bez licznika (nawet w godzinach lekcji).
// EN: An empty plan: the screen shows only the text, no countdown (even during lesson hours).
test('bez planu dzwonków licznik się nie pokazuje, a jest napis', async ({ page }) => {
  await useExamplePlan(page, EMPTY_PLAN_JS);
  // PL: Poniedziałek 19.10.2026 09:10 w Warszawie (czas letni: 07:10 UTC), pora drugiej lekcji.
  // EN: Monday 19.10.2026 09:10 in Warsaw (summer time: 07:10 UTC), the time of the second lesson.
  await page.clock.setFixedTime(new Date('2026-10-19T07:10:00Z'));
  await page.goto('/bell');
  await expect(page.getByLabel('Licznik do dzwonka')).toHaveCount(0);
  // PL: Zamiast pustego ekranu pokazujemy krótki napis (taki sam jak na pulpicie).
  // EN: Instead of an empty screen we show a short text (the same as on the dashboard).
  await expect(page.getByText('Brak planu dzwonków')).toBeVisible();
});

// PL: W czasie lekcji licznik pokazuje minuty do dzwonka i etykietę „do dzwonka”.
// EN: During a lesson the countdown shows the minutes to the bell and the label "do dzwonka".
test('w czasie lekcji pokazuje minuty do dzwonka', async ({ page }) => {
  await useExamplePlan(page);
  // PL: 09:10 w Warszawie: druga lekcja z przykładu (lekcja 1), zostało 30 minut.
  // EN: 09:10 in Warsaw: the second lesson of the example (lesson 1), 30 minutes left.
  await page.clock.setFixedTime(new Date('2026-10-19T07:10:00Z'));
  await page.goto('/bell');
  const countdown = page.getByLabel('Licznik do dzwonka');
  // PL: Z planem napis „Brak planu dzwonków” nie pokazuje się.
  // EN: With a plan the "Brak planu dzwonków" text is not shown.
  await expect(page.getByText('Brak planu dzwonków')).toHaveCount(0);
  await expect(countdown).toContainText('30');
  await expect(countdown).toContainText('min');
  await expect(countdown).toContainText('do dzwonka');
  await expect(countdown).toContainText('Następna: lekcja 2 o 9:50');
});

// PL: Prawdziwy plan szkoły: 07:30 w poniedziałek to lekcja 0 (07:10–07:55), zostaje 25 minut do dzwonka.
// EN: The real school plan: 07:30 on Monday is lesson 0 (07:10–07:55), 25 minutes left to the bell.
test('z prawdziwym planem szkoły liczy lekcję 0 od 7:10', async ({ page }) => {
  // PL: Poniedziałek 19.10.2026 07:30 w Warszawie (czas letni: 05:30 UTC). Bez podstawienia planu.
  // EN: Monday 19.10.2026 07:30 in Warsaw (summer time: 05:30 UTC). No plan stub.
  await page.clock.setFixedTime(new Date('2026-10-19T05:30:00Z'));
  await page.goto('/bell');
  const countdown = page.getByLabel('Licznik do dzwonka');
  await expect(countdown).toContainText('25');
  await expect(countdown).toContainText('do dzwonka');
  await expect(countdown).toContainText('Następna: lekcja 1 o 8:00');
});

// PL: W przerwie licznik pokazuje minuty do następnej lekcji i etykietę „do lekcji”.
// EN: During a break the countdown shows the minutes to the next lesson and the label "do lekcji".
test('w przerwie pokazuje minuty do lekcji', async ({ page }) => {
  await useExamplePlan(page);
  // PL: 08:50 w Warszawie: przerwa między lekcją 0 a lekcją 1, do 08:55 zostało 5 minut.
  // EN: 08:50 in Warsaw: the break between lesson 0 and lesson 1, 5 minutes to 08:55.
  await page.clock.setFixedTime(new Date('2026-10-19T06:50:00Z'));
  await page.goto('/bell');
  const countdown = page.getByLabel('Licznik do dzwonka');
  await expect(countdown).toContainText('5');
  await expect(countdown).toContainText('Przerwa, do lekcji 1');
});
