/**
 * PL: Test ekranów aktualności (podtor 3a) w przeglądarce: lista z filtrem, wpis z linkami i filmem, wpis nieistniejący, błąd serwera i szerokość 320 px. Odpowiedzi serwera są podstawione (page.route), bo prawdziwy D1 w teście czeka na zgłoszenie #43. Test oblewa na gałęzi bez zmiany, bo tam adres /news/feed pokazuje tylko „W budowie”.
 * EN: Test of the news screens (subtrack 3a) in the browser: the list with the filter, an entry with links and a video, a missing entry, a server error and the 320 px width. The server answers are stubbed (page.route), because a real D1 in the test waits for issue #43. The test fails on a branch without the change, because there the /news/feed address shows only "W budowie".
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/NewsFeedScreen.tsx::NewsFeedScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page, type Route } from '@playwright/test';

// PL: Chwila publikacji wpisów testowych (świeża, żeby czas względny był stabilny).
// EN: The publication moment of the test entries (fresh, so the relative time is stable).
const PUBLISHED_AT = new Date(Date.now() - 20 * 60_000).toISOString();

// PL: Wpisy na liście: po jednym z czterech typów.
// EN: The entries on the list: one of each of the four types.
const ENTRIES = [
  { id: 'e-important', type: 'important', source: 'Sekretariat', title: 'Jutro 3TA zaczyna o 9:50', excerpt: 'Dwie pierwsze lekcje przeniesione.' },
  { id: 'e-event', type: 'event', source: 'Samorząd', title: 'Turniej e-sportowy klas', excerpt: 'Zapisy drużyn do piątku.' },
  { id: 'e-news', type: 'news', source: 'Biblioteka', title: 'Nowe godziny otwarcia biblioteki', excerpt: 'Od poniedziałku do 17:00.' },
  { id: 'e-sport', type: 'sport', source: 'WF', title: 'Mecz koszykówki', excerpt: 'Piątek, godzina 15:00.' },
].map((entry) => ({ ...entry, publishedAt: PUBLISHED_AT }));

// PL: Słowo bez spacji, które sprawdza zawijanie przy 320 px.
// EN: A word without spaces that checks wrapping at 320 px.
const LONG_WORD = 'bardzodlugieslowobezspacjiktorenichcezmiescicsienaekranie'.repeat(2);

// PL: Treść wpisu z turniejem: tekst, dobry link, groźny link, nieznany element, film i długie słowo.
// EN: The tournament entry content: text, a good link, a dangerous link, an unknown element, a video and a long word.
const EVENT_BODY = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Zapisy do piątku.' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'dobry link', marks: [{ type: 'link', attrs: { href: 'https://example.com/dobry' } }] }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'zly link', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] },
    { type: 'script', content: [{ type: 'text', text: 'alert(1)' }] },
    { type: 'youtube', attrs: { videoId: 'dQw4w9WgXcQ' } },
    { type: 'paragraph', content: [{ type: 'text', text: LONG_WORD }] },
  ],
};

// PL: Piksel PNG 1×1, który zastępuje miniaturę z YouTube.
// EN: A 1×1 PNG pixel that stands in for the YouTube thumbnail.
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

/**
 * PL: Odpowiada na zapytanie o aktualności podstawionymi danymi: lista, wpis turnieju i 404 dla reszty.
 * EN: Answers a news request with stubbed data: the list, the tournament entry and 404 for the rest.
 *
 * @param route - PL: przechwycone zapytanie. EN: the intercepted request.
 * @returns PL: obietnica zakończona po odpowiedzi. EN: a promise finished after the answer.
 */
async function answerNews(route: Route): Promise<void> {
  const path = new URL(route.request().url()).pathname.replace(/\/+$/, '');
  if (path === '/api/news/feed') return route.fulfill({ json: { entries: ENTRIES } });
  if (path === '/api/news/feed/e-event') {
    const summary = ENTRIES.find((entry) => entry.id === 'e-event');
    return route.fulfill({ json: { entry: { ...summary, body: EVENT_BODY, linkUrl: 'https://example.com/regulamin', linkLabel: 'Zobacz regulamin turnieju' } } });
  }
  return route.fulfill({ status: 404, json: { error: 'not_found' } });
}

/**
 * PL: Podstawia serwer aktualności oraz miniaturę i odtwarzacz YouTube.
 * EN: Stubs the news server and the YouTube thumbnail and player.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @returns PL: obietnica zakończona po ustawieniu. EN: a promise finished after setup.
 */
async function stubNetwork(page: Page): Promise<void> {
  await page.route('**/api/news/feed**', answerNews);
  await page.route('https://i.ytimg.com/**', (route) => route.fulfill({ body: PIXEL, contentType: 'image/png' }));
  await page.route('https://www.youtube-nocookie.com/**', (route) => route.fulfill({ body: '<p>odtwarzacz</p>', contentType: 'text/html' }));
}

// PL: Przed każdym testem podstaw sieć.
// EN: Stub the network before every test.
test.beforeEach(async ({ page }) => {
  await stubNetwork(page);
});

// PL: Lista pokazuje wszystkie wpisy, a chip typu zostawia tylko jego wpisy.
// EN: The list shows all entries, and a type chip keeps only its entries.
test('lista aktualności i filtr po typie / the news list and the type filter', async ({ page }) => {
  await page.goto('/news/feed');

  // PL: Cztery kafle i wybrany chip „Wszystkie”.
  // EN: Four tiles and the "Wszystkie" chip chosen.
  await expect(page.getByRole('heading', { name: 'Aktualności', level: 1 })).toBeVisible();
  await expect(page.locator('.news-card')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Wszystkie' })).toHaveAttribute('aria-pressed', 'true');

  // PL: Filtr „Sport” zostawia jeden kafel.
  // EN: The "Sport" filter keeps one tile.
  await page.getByRole('button', { name: 'Sport' }).click();
  await expect(page.locator('.news-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Mecz koszykówki' })).toBeVisible();

  // PL: Filtr „Wszystkie” wraca do czterech.
  // EN: The "Wszystkie" filter returns to four.
  await page.getByRole('button', { name: 'Wszystkie' }).click();
  await expect(page.locator('.news-card')).toHaveCount(4);
});

// PL: Wpis ma bezpieczne linki, nie wykonuje groźnego linku i pokazuje film dopiero po kliknięciu.
// EN: An entry has safe links, does not run a dangerous link and shows the video only after a click.
test('wpis: linki https, miniatura filmu i ramka po kliknięciu / entry: https links, the video thumbnail and the frame after a click', async ({ page }) => {
  await page.goto('/news/feed');
  await page.getByRole('link', { name: /Turniej e-sportowy klas/ }).click();

  // PL: Adres i tytuł wpisu.
  // EN: The entry address and title.
  await expect(page).toHaveURL(/\/news\/feed\/e-event$/);
  await expect(page.getByRole('heading', { name: 'Turniej e-sportowy klas', level: 1 })).toBeVisible();

  // PL: Dobry link i przycisk z linkiem mają target i rel.
  // EN: The good link and the link button have target and rel.
  for (const name of ['dobry link', 'Zobacz regulamin turnieju']) {
    const link = page.getByRole('link', { name });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAttribute('href', /^https:\/\/example\.com\//);
  }

  // PL: Groźny link jest zwykłym tekstem, a nieznany element nie istnieje.
  // EN: The dangerous link is plain text, and the unknown element does not exist.
  await expect(page.getByText('zly link')).toBeVisible();
  await expect(page.getByRole('link', { name: 'zly link' })).toHaveCount(0);
  await expect(page.locator('a[href^="javascript:"], script:not([src])').filter({ hasText: 'alert' })).toHaveCount(0);

  // PL: Przed kliknięciem jest miniatura i nie ma ramki.
  // EN: Before a click there is the thumbnail and no frame.
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Odtwórz film' }).click();

  // PL: Po kliknięciu jest ramka z domeny youtube-nocookie.com.
  // EN: After a click there is the frame from the youtube-nocookie.com domain.
  await expect(page.locator('iframe')).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
});

// PL: Nieistniejący wpis (albo szkic, który serwer ukrywa) pokazuje komunikat.
// EN: A missing entry (or a draft the server hides) shows a message.
test('nieistniejący wpis pokazuje komunikat / a missing entry shows a message', async ({ page }) => {
  await page.goto('/news/feed/szkic-ktorego-nie-ma');

  await expect(page.getByText('Nie znaleziono wpisu.')).toBeVisible();
});

// PL: Błąd serwera pokazuje komunikat i przycisk, który ponawia pobranie.
// EN: A server error shows a message and a button that retries the fetch.
test('błąd serwera i ponowienie / a server error and the retry', async ({ page }) => {
  // PL: Pierwsza odpowiedź to błąd 500, kolejne są poprawne.
  // EN: The first answer is a 500 error, the following are correct.
  let failures = 2;
  await page.route('**/api/news/feed**', (route) => {
    if (failures-- > 0) return route.fulfill({ status: 500, json: { error: 'database_error' } });
    return answerNews(route);
  });

  await page.goto('/news/feed');
  await expect(page.getByText('Nie udało się pobrać wpisów.')).toBeVisible();

  await page.getByRole('button', { name: 'Spróbuj ponownie' }).click();
  await expect(page.locator('.news-card')).toHaveCount(4);
});

// PL: Przy szerokości 320 px lista i wpis nie wychodzą poza ekran.
// EN: At a width of 320 px the list and the entry do not go off the screen.
test('szerokość 320 px bez poziomego przewijania / 320 px width without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });

  await page.goto('/news/feed');
  await expect(page.locator('.news-card')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  await page.getByRole('link', { name: /Turniej e-sportowy klas/ }).click();
  await expect(page.getByText(LONG_WORD.slice(0, 20))).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
