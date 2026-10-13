/**
 * PL: Test pulpitu (podtor 9) w przeglądarce: cztery kafelki z danymi i adresy, do których prowadzą, pusty stan każdego kafelka, błąd serwera, widok bez internetu (zapisane dane), szerokość 320 px oraz jeden test na prawdziwym serwerze i lokalnej bazie D1. Większość odpowiedzi serwera jest podstawiona (page.route), bo atrapa nie zależy od dnia uruchomienia i od logowania. Test oblewa na gałęzi bez zmiany, bo tam adres główny pokazuje tylko „W budowie”.
 * EN: Test of the dashboard (subtrack 9) in the browser: the four tiles with data and the addresses they lead to, the empty state of every tile, a server error, the view without internet (saved data), the 320 px width and one test against the real server and the local D1 database. Most server answers are stubbed (page.route), because a stub does not depend on the day of the run or on signing in. The test fails on a branch without the change, because there the root address shows only "W budowie".
 *
 * @author Kacper
 * @since 2026-10-09
 * @uses src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page } from '@playwright/test';

// PL: Dane pulpitu z makiety 2.1 (docs/projekt/EKRANY.md). Wymyślone, bez prawdziwych osób.
// EN: The dashboard data from mockup 2.1 (docs/projekt/EKRANY.md). Made up, no real people.
const FULL = {
  important: { id: 'wazne-3ta', title: 'Jutro 3TA zaczyna o 9:50', excerpt: 'Dwie pierwsze lekcje przeniesione na piątek.', source: 'Sekretariat', publishedAt: new Date(Date.now() - 20 * 60_000).toISOString() },
  announcements: [
    { id: 'biblioteka', title: 'Biblioteka: nowe godziny otwarcia', publishedAt: '2026-10-12T08:00:00Z' },
    { id: 'egzamin', title: 'Próbny egzamin zawodowy INF.04', publishedAt: '2026-10-22T08:00:00Z' },
    { id: 'otwarty', title: 'Dzień otwarty: szukamy 20 osób', publishedAt: '2026-11-14T08:00:00Z' },
  ],
  survey: { id: 'dodatkowe', title: 'Zajęcia dodatkowe w II semestrze', daysLeft: 3 },
  report: { description: 'Nie działa projektor w sali 204', stage: 2, openCount: 1 },
};

// PL: Pusta odpowiedź: żaden kafelek nie ma danych.
// EN: An empty answer: no tile has data.
const EMPTY = { important: null, announcements: [], survey: null, report: null };

/**
 * PL: Podstawia odpowiedź serwera pulpitu pod /api/dashboard.
 * EN: Stubs the dashboard server answer under /api/dashboard.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param body - PL: odpowiedź do oddania. EN: the answer to return.
 */
async function mockDashboard(page: Page, body: unknown): Promise<void> {
  await page.route('**/api/dashboard', (route) => route.fulfill({ json: body }));
}

// PL: Wszystkie kafelki z danymi i dolny pasek.
// EN: All tiles with data and the bottom bar.
test('kafelki pokazują ważny wpis, ankietę, zgłoszenie i trzy ogłoszenia / the tiles show the important entry, the survey, the report and three announcements', async ({ page }) => {
  await mockDashboard(page, FULL);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Cześć', level: 1 })).toBeVisible();
  await expect(page.getByText('Ważne · Sekretariat')).toBeVisible();
  await expect(page.getByText('20 min', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Jutro 3TA zaczyna o 9:50' })).toBeVisible();
  await expect(page.getByText('Dwie pierwsze lekcje przeniesione na piątek.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Ankieta' })).toContainText('dni do końca');
  await expect(page.getByText('Zajęcia dodatkowe w II semestrze')).toBeVisible();
  await expect(page.getByText('Nie działa projektor w sali 204')).toBeVisible();
  await expect(page.getByText('Etap 2 z 3')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Ogłoszenia' }).getByRole('listitem')).toHaveCount(3);
  await expect(page.getByText('12.10', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link')).toHaveCount(3);
  await expect(page.locator('[data-subtrack="9"]')).toBeVisible();
});

// PL: Plan dzwonków jest pusty, więc w godzinie lekcji nagłówek nie pokazuje minut, tylko kreskę i napis o braku planu. Zegar jest ustawiony na lekcję, żeby test nie zależał od pory dnia.
// EN: The bell plan is empty, so during a lesson hour the header shows no minutes, only the dash and the no-plan text. The clock is set to a lesson, so the test does not depend on the time of day.
test('pusty plan: nagłówek bez licznika w godzinie lekcji / empty plan: the header without a countdown during a lesson hour', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-19T07:10:00Z'));
  await mockDashboard(page, FULL);
  await page.goto('/');

  const bell = page.getByLabel('Licznik do dzwonka');
  await expect(bell).toContainText('Brak planu dzwonków');
  await expect(bell).not.toContainText(/\d+\s*min/);
});

// PL: Każdy kafelek prowadzi do właściwego ekranu.
// EN: Every tile leads to the right screen.
test('kafelki prowadzą do właściwych ekranów / the tiles lead to the right screens', async ({ page }) => {
  await mockDashboard(page, FULL);
  // PL: Ekrany docelowe pytają swoje moduły. Bez sesji dostałyby 401 i wspólna bramka przeniosłaby na logowanie, więc podstawiamy puste odpowiedzi 200: sprawdzamy tylko adres.
  // EN: The target screens ask their modules. Without a session they would get 401 and the shared gate would move to sign-in, so we stub empty 200 answers: we only check the address.
  await page.route(/\/api\/(news|surveys|reports)\//, (route) => route.fulfill({ json: {} }));
  const cases: { name: string; open: () => Promise<void>; path: string }[] = [
    { name: 'Ważne', open: () => page.getByRole('link', { name: /Jutro 3TA/ }).click(), path: '/news/feed/wazne-3ta' },
    { name: 'Wypełnij', open: () => page.getByRole('link', { name: 'Wypełnij' }).click(), path: '/surveys/vote/dodatkowe' },
    { name: 'Zgłoszenia', open: () => page.getByRole('link', { name: /Nie działa projektor/ }).click(), path: '/reports/student/moje' },
    { name: 'wiersz ogłoszenia', open: () => page.getByRole('link', { name: /Próbny egzamin/ }).click(), path: '/news/feed/egzamin' },
    { name: 'nagłówek Ogłoszenia', open: () => page.getByRole('link', { name: 'Ogłoszenia', exact: true }).click(), path: '/news/feed' },
    { name: 'licznik do dzwonka', open: () => page.getByLabel('Licznik do dzwonka').click(), path: '/bell' },
  ];

  for (const item of cases) {
    await page.goto('/');
    await item.open();
    await expect(page, item.name).toHaveURL(new RegExp(`${item.path}$`));
  }
});

// PL: Pusty kafelek mówi, że nic nie ma, zamiast znikać.
// EN: An empty tile says there is nothing instead of disappearing.
test('bez danych każdy kafelek mówi, że nic nie ma / without data every tile says there is nothing', async ({ page }) => {
  await mockDashboard(page, EMPTY);
  await page.goto('/');

  await expect(page.getByRole('region', { name: 'Ważne' })).toContainText('Nie ma jeszcze wpisów.');
  await expect(page.getByRole('region', { name: 'Ankieta' })).toContainText('Nie ma ankiet do wypełnienia.');
  await expect(page.getByRole('region', { name: 'Zgłoszenia' })).toContainText('Nie masz jeszcze żadnych zgłoszeń.');
  await expect(page.getByRole('region', { name: 'Ogłoszenia' })).toContainText('Nie ma jeszcze wpisów.');
  await expect(page.getByLabel('Licznik do dzwonka')).toBeVisible();
});

// PL: Błąd serwera bez zapisanych danych daje komunikat i przycisk ponowienia, a po ponowieniu pulpit się wczytuje.
// EN: A server error without saved data gives a message and a retry button, and after the retry the dashboard loads.
test('błąd serwera daje komunikat i ponowienie / a server error gives a message and a retry', async ({ page }) => {
  await page.route('**/api/dashboard', (route) => route.fulfill({ status: 500, json: { error: 'database_error' } }));
  await page.goto('/');

  await expect(page.getByText('Nie udało się pobrać pulpitu.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Zgłoszenia' })).toContainText('Nie masz jeszcze żadnych zgłoszeń.');

  await page.unroute('**/api/dashboard');
  await mockDashboard(page, FULL);
  await page.getByRole('button', { name: 'Spróbuj ponownie' }).click();

  await expect(page.getByRole('heading', { name: 'Jutro 3TA zaczyna o 9:50' })).toBeVisible();
});

// PL: Bez internetu wspólny pasek mówi o braku internetu, a kafelki zostają na ekranie.
// EN: Without internet the shared bar says there is no internet, and the tiles stay on screen.
test('bez internetu pasek i kafelki z zapisu / without internet the bar and the tiles from the saved copy', async ({ page, context }) => {
  await mockDashboard(page, FULL);
  await page.goto('/');
  await expect(page.getByText('Etap 2 z 3')).toBeVisible();

  await context.setOffline(true);

  await expect(page.locator('[data-offline-notice]')).toContainText('Brak internetu');
  await expect(page.getByText('Etap 2 z 3')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Jutro 3TA zaczyna o 9:50' })).toBeVisible();
});

// PL: Po ponownym otwarciu, gdy serwer nie odpowiada, pulpit pokazuje zapisane dane i napis o nieudanym odświeżeniu, a nie biały ekran.
// EN: After reopening, when the server does not answer, the dashboard shows the saved data and a note about the failed refresh, not a white screen.
test('po ponownym otwarciu bez serwera pulpit z zapisu / after reopening without the server the dashboard from the saved copy', async ({ page }) => {
  await mockDashboard(page, FULL);
  await page.goto('/');
  await expect(page.getByText('Etap 2 z 3')).toBeVisible();
  // PL: Poczekaj, aż dane trafią do localStorage (zapis jest opóźniony o około sekundę).
  // EN: Wait until the data reaches localStorage (the save is delayed by about a second).
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('teb-student-query-cache')?.includes('wazne-3ta') ?? false)).toBe(true);

  await page.unroute('**/api/dashboard');
  await page.route('**/api/dashboard', (route) => route.abort());
  await page.reload();

  await expect(page.getByRole('heading', { name: 'Jutro 3TA zaczyna o 9:50' })).toBeVisible();
  await expect(page.getByText('Etap 2 z 3')).toBeVisible();
  await expect(page.getByText('Nie udało się odświeżyć pulpitu. Pokazujemy zapisane dane.')).toBeVisible();
});

// PL: Przy 320 px nic nie wychodzi poza ekran, także przy bardzo długich tekstach i słowach bez spacji.
// EN: At 320 px nothing goes off the screen, even with very long texts and words without spaces.
test('szerokość 320 px bez poziomego przewijania / 320 px width without horizontal scrolling', async ({ page }) => {
  const long = 'Superdługiesłowobezspacjiktóremogłobyrozepchaćkafelek'.repeat(2);
  await mockDashboard(page, {
    ...FULL,
    important: { ...FULL.important, title: long, excerpt: long },
    survey: { ...FULL.survey, title: long },
    report: { ...FULL.report, description: `${long} ${'Bardzo długi opis zgłoszenia. '.repeat(20)}` },
    announcements: FULL.announcements.map((row) => ({ ...row, title: long })),
  });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/');
  await expect(page.getByText('Etap 2 z 3')).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

// PL: Test bez podstawionego serwera: pulpit czyta wpisy z lokalnej bazy D1 po `npm run db:reset` i `npm run db:seed` (robi to `npm run test:e2e`). Bez zalogowania ankieta i zgłoszenia są puste, bo ich moduły odpowiadają 401.
// EN: A test without a stubbed server: the dashboard reads entries from the local D1 database after `npm run db:reset` and `npm run db:seed` (`npm run test:e2e` does both). Without signing in the survey and reports are empty, because their modules answer 401.
test('na lokalnej bazie: wpisy z bazy, ankieta i zgłoszenia puste bez sesji / on the local database: entries from the database, the survey and reports empty without a session', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Jutro 3TA zaczyna o 9:50' })).toBeVisible();
  await expect(page.getByText('Ważne · Sekretariat')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Ogłoszenia' }).getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('region', { name: 'Ankieta' })).toContainText('Nie ma ankiet do wypełnienia.');
  await expect(page.getByRole('region', { name: 'Zgłoszenia' })).toContainText('Nie masz jeszcze żadnych zgłoszeń.');
});

// PL: Zmiana kolejności kafelków w trybie edycji przetrwa przeładowanie strony, a tryb edycji po przeładowaniu jest wyłączony.
// EN: A change of the tile order in edit mode survives a page reload, and the edit mode is off after the reload.
test('zmiana kolejności kafelków przetrwa przeładowanie / a tile order change survives a reload', async ({ page }) => {
  await mockDashboard(page, FULL);
  await page.goto('/');

  // PL: Domyślnie „Ważne” stoi nad „Ankietą”.
  // EN: By default "Ważne" stands above the "Ankieta".
  const importantBox = page.getByText('Jutro 3TA zaczyna o 9:50');
  await expect(importantBox).toBeVisible();

  await page.getByRole('button', { name: 'Zmień układ' }).click();
  // PL: Przycisk „Wyżej” ma pole dotyku co najmniej 44×44 px.
  // EN: The "Wyżej" button has a touch area of at least 44×44 px.
  const up = page.getByRole('button', { name: 'Wyżej: Ankieta' });
  const box = await up.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await up.click();
  await page.getByRole('button', { name: 'Gotowe' }).click();

  const survey = await page.getByRole('region', { name: 'Ankieta' }).boundingBox();
  expect(survey!.y).toBeLessThan((await importantBox.boundingBox())!.y);

  await page.reload();

  // PL: Po przeładowaniu kolejność nadal jest ta sama, a tryb edycji wrócił wyłączony.
  // EN: After the reload the order is still the same, and the edit mode is off again.
  await expect(page.getByRole('button', { name: 'Zmień układ' })).toBeVisible();
  const surveyAfter = await page.getByRole('region', { name: 'Ankieta' }).boundingBox();
  expect(surveyAfter!.y).toBeLessThan((await importantBox.boundingBox())!.y);
});
