/**
 * PL: Test pulpitu (podtor 9) w przeglądarce: góra z licznikiem do dzwonka i blokiem „Ważne”, sekcja „Do zrobienia” z ankietą i zgłoszeniem, sekcja „Informacje” z ogłoszeniami, adresy, do których prowadzą, pusty stan, błąd serwera, widok bez internetu (zapisane dane), szerokość 320 px, układanie sekcji oraz jeden test na prawdziwym serwerze i lokalnej bazie D1. Większość odpowiedzi serwera jest podstawiona (page.route), bo atrapa nie zależy od dnia uruchomienia i od logowania. Test oblewa na gałęzi bez zmiany, bo tam adres główny pokazuje tylko „W budowie”.
 * EN: Test of the dashboard (subtrack 9) in the browser: the top with the bell countdown and the "Ważne" block, the "Do zrobienia" section with the survey and the report, the "Informacje" section with the announcements, the addresses they lead to, the empty state, a server error, the view without internet (saved data), the 320 px width, arranging the sections and one test against the real server and the local D1 database. Most server answers are stubbed (page.route), because a stub does not depend on the day of the run or on signing in. The test fails on a branch without the change, because there the root address shows only "W budowie".
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

// PL: Adres modułu planu dzwonków, tak jak Vite podaje go w przeglądarce (ten sam co w e2e/bell.spec.ts).
// EN: The address of the bell plan module, as Vite serves it in the browser (the same as in e2e/bell.spec.ts).
const PLAN_MODULE = '**/src/features/bell/bellPlan.ts*';

// PL: Treść modułu z PRZYKŁADOWYM planem (nie prawdziwy plan szkoły): lekcje 08:00–08:45, 08:55–09:40, 09:50–10:35.
// EN: The module body with an EXAMPLE plan (not the school's real plan): lessons 08:00–08:45, 08:55–09:40, 09:50–10:35.
const EXAMPLE_PLAN_JS = `export const BELL_PLAN = [
  { start: '08:00', end: '08:45' },
  { start: '08:55', end: '09:40' },
  { start: '09:50', end: '10:35' },
];`;

/**
 * PL: Podstawia plan przykładowy w miejsce modułu planu, żeby pulpit widział niepusty plan.
 * EN: Stubs the example plan in place of the plan module, so the dashboard sees a non-empty plan.
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function useExamplePlan(page: Page): Promise<void> {
  await page.route(PLAN_MODULE, (route) => route.fulfill({ contentType: 'text/javascript', body: EXAMPLE_PLAN_JS }));
}

/**
 * PL: Podstawia pusty plan w miejsce modułu planu, żeby sprawdzić stan bez planu dzwonków.
 * EN: Stubs an empty plan in place of the plan module, to check the state without a bell plan.
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function useEmptyPlan(page: Page): Promise<void> {
  await page.route(PLAN_MODULE, (route) =>
    route.fulfill({ contentType: 'text/javascript', body: 'export const BELL_PLAN = [];' }),
  );
}

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

/**
 * PL: Znajduje grupę wierszy (sekcję) po nagłówku, np. „Do zrobienia” albo „Informacje”.
 * EN: Finds the group of rows (the section) by its header, e.g. "Do zrobienia" or "Informacje".
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param name - PL: tekst nagłówka sekcji. EN: the text of the section header.
 * @returns PL: lokalizator grupy. EN: the locator of the group.
 */
function sectionGroup(page: Page, name: string) {
  return page.locator('section.ui-list-group').filter({ has: page.getByRole('heading', { name, exact: true }) });
}

// PL: Cała góra i obie sekcje z danymi oraz dolny pasek.
// EN: The whole top and both sections with data, and the bottom bar.
test('góra i sekcje pokazują ważny wpis, ankietę, zgłoszenie i trzy ogłoszenia / the top and the sections show the important entry, the survey, the report and three announcements', async ({ page }) => {
  await mockDashboard(page, FULL);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Dzisiaj', level: 1 })).toBeVisible();
  await expect(page.getByText('Ważne · Sekretariat')).toBeVisible();
  await expect(page.getByText('20 min', { exact: true })).toBeVisible();
  await expect(page.getByText('Jutro 3TA zaczyna o 9:50')).toBeVisible();
  await expect(page.getByText('Dwie pierwsze lekcje przeniesione na piątek.')).toBeVisible();
  await expect(sectionGroup(page, 'Do zrobienia')).toContainText('jeszcze 3 dni');
  await expect(page.getByText('Zajęcia dodatkowe w II semestrze')).toBeVisible();
  await expect(page.getByText('Nie działa projektor w sali 204')).toBeVisible();
  await expect(page.getByText('W trakcie', { exact: true })).toBeVisible();
  // PL: Trzy wiersze ogłoszeń i wiersz „Wszystkie aktualności”.
  // EN: Three announcement rows and the "Wszystkie aktualności" row.
  await expect(sectionGroup(page, 'Informacje').getByRole('link')).toHaveCount(4);
  await expect(page.getByText('12.10', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link')).toHaveCount(5);
  await expect(page.locator('[data-subtrack="9"]')).toBeVisible();
});

// PL: Z podstawionym pustym planem w godzinie lekcji nagłówek nie pokazuje minut, tylko kreskę i napis o braku planu. Zegar jest ustawiony na lekcję, żeby test nie zależał od pory dnia.
// EN: With a stubbed empty plan, during a lesson hour the header shows no minutes, only the dash and the no-plan text. The clock is set to a lesson, so the test does not depend on the time of day.
test('pusty plan: nagłówek bez licznika w godzinie lekcji / empty plan: the header without a countdown during a lesson hour', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-19T07:10:00Z'));
  await useEmptyPlan(page);
  await mockDashboard(page, FULL);
  await page.goto('/');

  const bell = page.getByLabel('Licznik do dzwonka');
  await expect(bell).toContainText('Brak planu dzwonków');
  await expect(bell).not.toContainText(/\d+\s*min/);
});

// PL: Z podstawionym planem w godzinie lekcji (09:10 w Warszawie, lekcja do 09:40) licznik pokazuje 30 minut. To też dowodzi, że podstawienie planu działa.
// EN: With the stubbed plan during a lesson hour (09:10 in Warsaw, the lesson ends at 09:40) the countdown shows 30 minutes. This also proves that the plan stub works.
test('z planem w lekcji licznik pokazuje minuty / with a plan during a lesson the countdown shows the minutes', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-19T07:10:00Z'));
  await useExamplePlan(page);
  await mockDashboard(page, FULL);
  await page.goto('/');

  const bell = page.getByLabel('Licznik do dzwonka');
  await expect(bell).toContainText('30');
  await expect(bell).toContainText('do dzwonka');
  await expect(bell).not.toContainText('Brak planu dzwonków');
});

// PL: Z podstawionym planem po ostatniej lekcji (14:00 w Warszawie) licznik nie ma stanu, więc pokazuje „Po lekcjach”, a nie „Brak planu dzwonków”.
// EN: With the stubbed plan after the last lesson (14:00 in Warsaw) the countdown has no state, so it shows "Po lekcjach", not "Brak planu dzwonków".
test('z planem po lekcjach nagłówek mówi „Po lekcjach” / with a plan after the lessons the header says "Po lekcjach"', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-19T12:00:00Z'));
  await useExamplePlan(page);
  await mockDashboard(page, FULL);
  await page.goto('/');

  const bell = page.getByLabel('Licznik do dzwonka');
  await expect(bell).toContainText('Po lekcjach');
  await expect(bell).not.toContainText('Brak planu dzwonków');
});

// PL: W sobotę z przykładowym planem nagłówek mówi „Dziś nie ma lekcji”, a nie „Po lekcjach”, bo dzień wolny ma pierwszeństwo przed planem.
// EN: On a Saturday with the example plan the header says "Dziś nie ma lekcji", not "Po lekcjach", because a day off comes before the plan.
test('w dzień wolny z planem nagłówek mówi „Dziś nie ma lekcji” / on a day off with a plan the header says "Dziś nie ma lekcji"', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-17T08:00:00Z'));
  await useExamplePlan(page);
  await mockDashboard(page, FULL);
  await page.goto('/');

  const bell = page.getByLabel('Licznik do dzwonka');
  await expect(bell).toContainText('Dziś nie ma lekcji');
  await expect(bell).not.toContainText('Po lekcjach');
});

// PL: Przed pierwszą lekcją (07:00 w Warszawie, lekcja od 08:00) z planem nagłówek mówi „Lekcje jeszcze się nie zaczęły”, a nie „Po lekcjach”.
// EN: Before the first lesson (07:00 in Warsaw, the lesson starts at 08:00) with a plan the header says "Lekcje jeszcze się nie zaczęły", not "Po lekcjach".
test('przed lekcjami z planem nagłówek mówi „Lekcje jeszcze się nie zaczęły” / before the lessons with a plan the header says "Lekcje jeszcze się nie zaczęły"', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-19T05:00:00Z'));
  await useExamplePlan(page);
  await mockDashboard(page, FULL);
  await page.goto('/');

  const bell = page.getByLabel('Licznik do dzwonka');
  await expect(bell).toContainText('Lekcje jeszcze się nie zaczęły');
  await expect(bell).not.toContainText('Po lekcjach');
});

// PL: Każdy link na pulpicie prowadzi do właściwego ekranu.
// EN: Every link on the dashboard leads to the right screen.
test('linki prowadzą do właściwych ekranów / the links lead to the right screens', async ({ page }) => {
  await mockDashboard(page, FULL);
  // PL: Ekrany docelowe pytają swoje moduły. Bez sesji dostałyby 401 i wspólna bramka przeniosłaby na logowanie, więc podstawiamy puste odpowiedzi 200: sprawdzamy tylko adres.
  // EN: The target screens ask their modules. Without a session they would get 401 and the shared gate would move to sign-in, so we stub empty 200 answers: we only check the address.
  await page.route(/\/api\/(news|surveys|reports)\//, (route) => route.fulfill({ json: {} }));
  const cases: { name: string; open: () => Promise<void>; path: string }[] = [
    { name: 'Ważne', open: () => page.getByRole('link', { name: /Jutro 3TA/ }).click(), path: '/news/feed/wazne-3ta' },
    { name: 'ankieta', open: () => page.getByRole('link', { name: /Zajęcia dodatkowe/ }).click(), path: '/surveys/vote/dodatkowe' },
    { name: 'zgłoszenie', open: () => page.getByRole('link', { name: /Nie działa projektor/ }).click(), path: '/reports/student/moje' },
    { name: 'wiersz ogłoszenia', open: () => page.getByRole('link', { name: /Próbny egzamin/ }).click(), path: '/news/feed/egzamin' },
    { name: 'Wszystkie aktualności', open: () => page.getByRole('link', { name: 'Wszystkie aktualności', exact: true }).click(), path: '/news/feed' },
    { name: 'licznik do dzwonka', open: () => page.getByLabel('Licznik do dzwonka').click(), path: '/bell' },
  ];

  for (const item of cases) {
    await page.goto('/');
    await item.open();
    await expect(page, item.name).toHaveURL(new RegExp(`${item.path}$`));
  }
});

// PL: Bez danych góra zostaje, „Ważne” znika, „Do zrobienia” się nie pokazuje, a „Informacje” mówi, że nic nie ma.
// EN: Without data the top stays, "Ważne" disappears, "Do zrobienia" is not shown, and "Informacje" says there is nothing.
test('bez danych góra zostaje, a sekcje mówią, że nic nie ma / without data the top stays and the sections say there is nothing', async ({ page }) => {
  await mockDashboard(page, EMPTY);
  await page.goto('/');

  await expect(page.getByLabel('Licznik do dzwonka')).toBeVisible();
  await expect(page.getByText('Jutro 3TA zaczyna o 9:50')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Do zrobienia', exact: true })).toHaveCount(0);
  await expect(sectionGroup(page, 'Informacje')).toContainText('Nie ma jeszcze wpisów.');
});

// PL: Błąd serwera bez zapisanych danych daje komunikat i przycisk ponowienia, a po ponowieniu pulpit się wczytuje.
// EN: A server error without saved data gives a message and a retry button, and after the retry the dashboard loads.
test('błąd serwera daje komunikat i ponowienie / a server error gives a message and a retry', async ({ page }) => {
  await page.route('**/api/dashboard', (route) => route.fulfill({ status: 500, json: { error: 'database_error' } }));
  await page.goto('/');

  await expect(page.getByText('Nie udało się pobrać pulpitu.')).toBeVisible();

  await page.unroute('**/api/dashboard');
  await mockDashboard(page, FULL);
  await page.getByRole('button', { name: 'Spróbuj ponownie' }).click();

  await expect(page.getByText('Jutro 3TA zaczyna o 9:50')).toBeVisible();
});

// PL: Bez internetu wspólny pasek mówi o braku internetu, a sekcje i góra zostają na ekranie.
// EN: Without internet the shared bar says there is no internet, and the tiles stay on screen.
test('bez internetu pasek i sekcje z zapisu / without internet the bar and the sections from the saved copy', async ({ page, context }) => {
  await mockDashboard(page, FULL);
  await page.goto('/');
  await expect(page.getByText('W trakcie', { exact: true })).toBeVisible();

  await context.setOffline(true);

  await expect(page.locator('[data-offline-notice]')).toContainText('Brak internetu');
  await expect(page.getByText('W trakcie', { exact: true })).toBeVisible();
  await expect(page.getByText('Jutro 3TA zaczyna o 9:50')).toBeVisible();
});

// PL: Po ponownym otwarciu, gdy serwer nie odpowiada, pulpit pokazuje zapisane dane i napis o nieudanym odświeżeniu, a nie biały ekran.
// EN: After reopening, when the server does not answer, the dashboard shows the saved data and a note about the failed refresh, not a white screen.
test('po ponownym otwarciu bez serwera pulpit z zapisu / after reopening without the server the dashboard from the saved copy', async ({ page }) => {
  await mockDashboard(page, FULL);
  await page.goto('/');
  await expect(page.getByText('W trakcie', { exact: true })).toBeVisible();
  // PL: Poczekaj, aż dane trafią do localStorage (zapis jest opóźniony o około sekundę).
  // EN: Wait until the data reaches localStorage (the save is delayed by about a second).
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('teb-student-query-cache')?.includes('wazne-3ta') ?? false)).toBe(true);

  await page.unroute('**/api/dashboard');
  await page.route('**/api/dashboard', (route) => route.abort());
  await page.reload();

  await expect(page.getByText('Jutro 3TA zaczyna o 9:50')).toBeVisible();
  await expect(page.getByText('W trakcie', { exact: true })).toBeVisible();
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
  await expect(page.getByText('W trakcie', { exact: true })).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

// PL: Test bez podstawionego serwera: pulpit czyta wpisy z lokalnej bazy D1 po `npm run db:reset` i `npm run db:seed` (robi to `npm run test:e2e`). Bez zalogowania ankieta i zgłoszenia są puste, bo ich moduły odpowiadają 401.
// EN: A test without a stubbed server: the dashboard reads entries from the local D1 database after `npm run db:reset` and `npm run db:seed` (`npm run test:e2e` does both). Without signing in the survey and reports are empty, because their modules answer 401.
test('na lokalnej bazie: wpisy z bazy, ankieta i zgłoszenia puste bez sesji / on the local database: entries from the database, the survey and reports empty without a session', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: /Ważne · Sekretariat/ }).getByText('Jutro 3TA zaczyna o 9:50')).toBeVisible();
  await expect(page.getByText('Ważne · Sekretariat')).toBeVisible();
  // PL: Trzy wpisy z bazy i wiersz „Wszystkie aktualności”; bez sesji „Do zrobienia” się nie pokazuje.
  // EN: Three entries from the database and the "Wszystkie aktualności" row; without a session "Do zrobienia" is not shown.
  await expect(sectionGroup(page, 'Informacje').getByRole('link')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Do zrobienia', exact: true })).toHaveCount(0);
});

// PL: Zmiana kolejności sekcji w trybie edycji przetrwa przeładowanie strony, a tryb edycji po przeładowaniu jest wyłączony. Góra (licznik i „Ważne”) zawsze stoi nad sekcjami.
// EN: A change of the section order in edit mode survives a page reload, and the edit mode is off after the reload. The top (countdown and "Ważne") always stands above the sections.
test('zmiana kolejności sekcji przetrwa przeładowanie / a section order change survives a reload', async ({ page }) => {
  await mockDashboard(page, FULL);
  await page.goto('/');

  // PL: Domyślnie „Do zrobienia” stoi nad „Informacje”.
  // EN: By default "Do zrobienia" stands above "Informacje".
  const todo = sectionGroup(page, 'Do zrobienia');
  const info = sectionGroup(page, 'Informacje');
  expect((await todo.boundingBox())!.y).toBeLessThan((await info.boundingBox())!.y);

  await page.getByRole('button', { name: 'Edytuj' }).click();
  // PL: Przycisk „Wyżej” ma pole dotyku co najmniej 44×44 px.
  // EN: The "Wyżej" button has a touch area of at least 44×44 px.
  const up = page.getByRole('button', { name: 'Wyżej: Informacje' });
  const box = await up.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await up.click();
  await page.getByRole('button', { name: 'Gotowe' }).click();

  expect((await info.boundingBox())!.y).toBeLessThan((await todo.boundingBox())!.y);

  await page.reload();

  // PL: Po przeładowaniu kolejność nadal jest ta sama, a tryb edycji wrócił wyłączony.
  // EN: After the reload the order is still the same, and the edit mode is off again.
  await expect(page.getByRole('button', { name: 'Edytuj' })).toBeVisible();
  expect((await sectionGroup(page, 'Informacje').boundingBox())!.y).toBeLessThan((await sectionGroup(page, 'Do zrobienia').boundingBox())!.y);
});
