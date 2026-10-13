/**
 * PL: Test ekranów aktualności (podtor 3a) w przeglądarce: lista z filtrem, wpis z linkami i filmem, wpis nieistniejący, błąd serwera, widok bez internetu i szerokość 320 px. Większość odpowiedzi serwera jest podstawiona (page.route), a jeden test czyta lokalną bazę D1. Test oblewa na gałęzi bez zmiany, bo tam adres /news/feed pokazuje tylko „W budowie”.
 * EN: Test of the news screens (subtrack 3a) in the browser: the list with the filter, an entry with links and a video, a missing entry, a server error, the view without internet and the 320 px width. Most server answers are stubbed (page.route), and one test reads the local D1 database. The test fails on a branch without the change, because there the /news/feed address shows only "W budowie".
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

// PL: Wpisy na liście: po jednym z czterech typów. Pierwszy jest przypięty, więc serwer (tu: podstawiony) daje go na górze.
// EN: The entries on the list: one of each of the four types. The first one is pinned, so the server (here: the stub) puts it on top.
const ENTRIES = [
  { id: 'e-important', type: 'important', source: 'Sekretariat', title: 'Jutro 3TA zaczyna o 9:50', excerpt: 'Dwie pierwsze lekcje przeniesione.', pinned: true },
  { id: 'e-event', type: 'event', source: 'Samorząd', title: 'Turniej e-sportowy klas', excerpt: 'Zapisy drużyn do piątku.', pinned: false },
  { id: 'e-news', type: 'news', source: 'Biblioteka', title: 'Nowe godziny otwarcia biblioteki', excerpt: 'Od poniedziałku do 17:00.', pinned: false },
  { id: 'e-sport', type: 'sport', source: 'WF', title: 'Mecz koszykówki', excerpt: 'Piątek, godzina 15:00.', pinned: false },
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
 * PL: Odpowiada na zapytanie o aktualności podstawionymi danymi: lista (z filtrem po q, jak serwer), wpis turnieju i 404 dla reszty.
 * EN: Answers a news request with stubbed data: the list (filtered by q, like the server), the tournament entry and 404 for the rest.
 *
 * @param route - PL: przechwycone zapytanie. EN: the intercepted request.
 * @returns PL: obietnica zakończona po odpowiedzi. EN: a promise finished after the answer.
 */
async function answerNews(route: Route): Promise<void> {
  const url = new URL(route.request().url());
  const path = url.pathname.replace(/\/+$/, '');
  if (path === '/api/news/feed') {
    const term = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    return route.fulfill({ json: { entries: ENTRIES.filter((entry) => `${entry.title} ${entry.excerpt}`.toLowerCase().includes(term)) } });
  }
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

// PL: Testy z podstawionym serwerem.
// EN: Tests with a stubbed server.
test.describe('z podstawionym serwerem', () => {
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

  // PL: Przypięty wpis jest pierwszy i ma znacznik „Przypięte”, a pozostałe go nie mają.
  // EN: The pinned entry is first and has the "Przypięte" tag, and the others do not.
  test('przypięty wpis na górze z odznaką / the pinned entry on top with a badge', async ({ page }) => {
    await page.goto('/news/feed');

    // PL: Jeden znacznik, na pierwszym kaflu.
    // EN: One tag, on the first tile.
    await expect(page.locator('.news-card')).toHaveCount(4);
    await expect(page.locator('.news-card').first()).toContainText('Przypięte');
    await expect(page.locator('.news-tag--pinned')).toHaveCount(1);
  });

  // PL: Szukanie wysyła jedno zapytanie po przerwie w pisaniu (nie po każdej literze), zostawia pasujący kafel.
  // EN: Searching sends one request after a pause in typing (not after every letter) and leaves the matching tile.
  test('szukanie: jedno zapytanie po przerwie i pasujący kafel / search: one request after a pause and the matching tile', async ({ page }) => {
    await page.goto('/news/feed');
    await expect(page.locator('.news-card')).toHaveCount(4);

    // PL: Od tej chwili zapisujemy zapytania o listę z parametrem q.
    // EN: From this moment we record the list requests with the q parameter.
    const searched: (string | null)[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.pathname.replace(/\/+$/, '') === '/api/news/feed') searched.push(url.searchParams.get('q'));
    });

    // PL: Pisanie „zapisy” z przerwami 50 ms, krótszymi od opóźnienia 300 ms.
    // EN: Typing "zapisy" with 50 ms gaps, shorter than the 300 ms delay.
    await page.getByRole('searchbox', { name: 'Szukaj wpisów' }).pressSequentially('zapisy', { delay: 50 });

    await expect(page.locator('.news-card')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Turniej e-sportowy klas' })).toBeVisible();
    expect(searched).toEqual(['zapisy']);
  });

  // PL: Brak pasujących wpisów pokazuje komunikat z szukanym tekstem, a przycisk „Wyczyść” czyści pole i przywraca całą listę.
  // EN: No matching entries show a message with the searched text, and the "Wyczyść" button clears the field and brings back the whole list.
  test('pusty wynik szukania i czyszczenie pola / an empty search result and clearing the field', async ({ page }) => {
    await page.goto('/news/feed');
    await expect(page.locator('.news-card')).toHaveCount(4);

    const search = page.getByRole('searchbox', { name: 'Szukaj wpisów' });
    await search.fill('xyzabc');

    await expect(page.getByText('Nic nie znaleziono dla „xyzabc”.')).toBeVisible();
    await expect(page.locator('.news-card')).toHaveCount(0);

    await page.getByRole('button', { name: 'Wyczyść szukanie' }).click();

    await expect(search).toHaveValue('');
    await expect(page.locator('.news-card')).toHaveCount(4);
    await expect(page.getByText('Nic nie znaleziono dla')).toHaveCount(0);
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

  // PL: Gdy telefon traci internet, wspólny pasek mówi o braku internetu, a lista zostaje na ekranie.
  // EN: When the phone loses internet, the shared bar says there is no internet, and the list stays on screen.
  test('bez internetu pasek i zapisana lista / without internet the bar and the saved list', async ({ page, context }) => {
    await page.goto('/news/feed');
    await expect(page.locator('.news-card')).toHaveCount(4);

    await context.setOffline(true);

    await expect(page.locator('[data-offline-notice]')).toContainText('Brak internetu');
    await expect(page.locator('.news-card')).toHaveCount(4);
  });

  // PL: Gdy po zapisaniu listy serwer przestaje odpowiadać, a ekran otwiera się od nowa, pokazuje zapisane wpisy i napis o nieudanym odświeżeniu, a nie biały ekran.
  // EN: When the server stops answering after the list was saved and the screen opens anew, it shows the saved entries and a note about the failed refresh, not a white screen.
  test('po ponownym otwarciu bez serwera lista z zapisu / after reopening without the server the list from the saved copy', async ({ page }) => {
    await page.goto('/news/feed');
    await expect(page.locator('.news-card')).toHaveCount(4);
    // PL: Poczekaj, aż lista trafi do localStorage (zapis jest opóźniony o około sekundę).
    // EN: Wait until the list reaches localStorage (the save is delayed by about a second).
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('teb-student-query-cache')?.includes('e-sport') ?? false)).toBe(true);

    // PL: Odetnij serwer aktualności i otwórz ekran od nowa.
    // EN: Cut off the news server and open the screen anew.
    await page.unroute('**/api/news/feed**');
    await page.route('**/api/news/feed**', (route) => route.abort());
    await page.reload();

    await expect(page.locator('.news-card')).toHaveCount(4);
    await expect(page.getByText('Nie udało się odświeżyć wpisów. Pokazujemy zapisane.')).toBeVisible();
  });

  // PL: Bez internetu film w otwartym wpisie zmienia się w napis z linkiem do YouTube, bez miniatury i ramki.
  // EN: Without internet the video in the open entry turns into a note with a link to YouTube, without the thumbnail and the frame.
  test('film bez internetu to napis z linkiem / the video without internet is a note with a link', async ({ page, context }) => {
    await page.goto('/news/feed/e-event');
    await expect(page.getByRole('button', { name: 'Odtwórz film' })).toBeVisible();

    await context.setOffline(true);

    await expect(page.getByRole('button', { name: 'Odtwórz film' })).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
    const link = page.getByRole('link', { name: 'Obejrzyj na YouTube' });
    await expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

// PL: Test bez podstawionego serwera: ekran czyta wpisy z lokalnej bazy D1 po `npm run db:reset` i `npm run db:seed` (robi to `npm run test:e2e`). Szkic z danych testowych nie może być widoczny ani pod własnym adresem.
// EN: A test without a stubbed server: the screen reads entries from the local D1 database after `npm run db:reset` and `npm run db:seed` (`npm run test:e2e` does both). The draft from the test data must be visible neither on the list nor at its own address.
test.describe('na lokalnej bazie', () => {
  test('lista z bazy bez szkiców i szkic pod własnym adresem to 404 / the list from the database without drafts and a draft at its own address is 404', async ({ page }) => {
    await page.goto('/news/feed');

    await expect(page.getByRole('heading', { name: 'Turniej e-sportowy klas' })).toBeVisible();
    await expect(page.locator('.news-card')).toHaveCount(8);
    await expect(page.getByText('Szkic:')).toHaveCount(0);

    await page.goto('/news/feed/seed-szkic-sport');
    await expect(page.getByText('Nie znaleziono wpisu.')).toBeVisible();

    await page.goto('/news/feed/seed-gazetka');
    await expect(page.getByRole('heading', { name: 'Gazetka szkolna szuka autorów', level: 1 })).toBeVisible();
  });
});
