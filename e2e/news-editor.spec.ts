/**
 * PL: Test kreatora „Nowy wpis” (podtor 3b) w przeglądarce: trzy kroki z ekranów 5.1–5.3, formatowanie, link, film z YouTube, wklejanie z Worda, zapis szkicu i publikacji, błędy serwera, brak internetu (wpis zostaje w edytorze), szerokość 320 px i zamknięty zapis bez sesji na prawdziwym serwerze. Odpowiedzi serwera są podstawione (page.route), bo logowanie na porcie podtoru nie działa lokalnie (403). Test oblewa na gałęzi bez zmiany, bo tam adres /news/editor pokazuje tylko „W budowie”.
 * EN: Test of the "Nowy wpis" wizard (subtrack 3b) in the browser: three steps from screens 5.1–5.3, formatting, a link, a YouTube video, pasting from Word, saving a draft and a publication, server errors, no internet (the entry stays in the editor), the 320 px width and writing closed without a session on the real server. The server answers are stubbed (page.route), because sign-in on the subtrack port does not work locally (403). The test fails on a branch without the change, because there the /news/editor address shows only "W budowie".
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/NewsEditorScreen.tsx::NewsEditorScreen
 * @used_by playwright.config.ts::testDir
 */

import { expect, test, type Page } from '@playwright/test';

// PL: Adres zapisu wpisu na serwerze edytora.
// EN: The entry save address on the editor server.
const ENTRIES = '**/api/news/editor/entries';

/**
 * PL: Przechodzi przez kroki 1 i 2: wybiera typ, wpisuje tytuł i tekst. Zostawia otwarty krok 2 z kursorem w polu tekstu.
 * EN: Goes through steps 1 and 2: picks the type, types the title and the text. Leaves step 2 open with the cursor in the text field.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param text - PL: tekst treści. EN: the content text.
 */
async function fillEntry(page: Page, text: string): Promise<void> {
  await page.goto('/news/editor');
  await page.getByRole('button', { name: 'Wydarzenie' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Tytuł').fill('Turniej e-sportowy klas');
  await page.getByRole('textbox', { name: 'Opis' }).click();
  await page.keyboard.type(text);
}

/**
 * PL: Przechodzi do kroku 3 (podgląd).
 * EN: Moves to step 3 (the preview).
 *
 * @param page - PL: strona testu. EN: the test page.
 */
async function openPreview(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Dalej' }).click();
  await expect(page.getByRole('heading', { name: 'Podgląd' })).toBeVisible();
}

// PL: Krok 1: typ wpisu i znacznik podtoru.
// EN: Step 1: the entry type and the subtrack marker.
test('krok 1 pokazuje typy wpisu i pasek postępu / step 1 shows the entry types and the progress bar', async ({ page }) => {
  await page.goto('/news/editor');
  await expect(page.locator('[data-subtrack="3b"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Jaki to wpis?' })).toBeVisible();
  for (const name of ['Ważne', 'News', 'Wydarzenie', 'Sport']) await expect(page.getByRole('button', { name })).toBeVisible();
  await expect(page.getByRole('button', { name: 'News' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('progressbar', { name: 'Krok 1 z 3' })).toBeVisible();
  await expect(page.getByText('1/3')).toBeVisible();
});

// PL: Cała ścieżka: trzy kroki, formatowanie, podgląd i publikacja. Sprawdzamy to, co idzie na serwer.
// EN: The whole path: three steps, formatting, the preview and publishing. We check what goes to the server.
test('trzy kroki kończą się publikacją z treścią w JSON / three steps end with a publication with JSON content', async ({ page }) => {
  let sent: Record<string, unknown> | null = null;
  await page.route(ENTRIES, (route) => {
    sent = route.request().postDataJSON();
    return route.fulfill({ status: 201, json: { id: 'abc' } });
  });
  await fillEntry(page, 'Zapisy drużyn trwają do piątku.');
  // PL: „Dalej” w kroku 2 czeka na tytuł i tekst, a pogrubienie włączamy na zaznaczonym tekście.
  // EN: "Dalej" in step 2 waits for the title and the text, and we turn bold on for the selected text.
  await page.keyboard.press('ControlOrMeta+a');
  await page.getByRole('button', { name: 'Pogrubienie' }).click();
  await expect(page.getByText(/\d+ \/ 20000 znaków/)).toBeVisible();
  await openPreview(page);

  // PL: Podgląd: znacznik typu, źródło, tytuł i pogrubiony tekst.
  // EN: The preview: the type tag, the source, the title and the bold text.
  await expect(page.getByText('Samorząd · teraz')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Turniej e-sportowy klas' })).toBeVisible();
  await expect(page.locator('.editor-preview strong')).toHaveText('Zapisy drużyn trwają do piątku.');

  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByText('Wpis opublikowany.')).toBeVisible();
  expect(sent).toMatchObject({
    type: 'event',
    status: 'published',
    title: 'Turniej e-sportowy klas',
    body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Zapisy drużyn trwają do piątku.', marks: [{ type: 'bold' }] }] }] },
  });
});

// PL: Szkic idzie z innym stanem, a powrót do kroku 2 nie gubi treści.
// EN: A draft goes with another status, and going back to step 2 loses no content.
test('zapis szkicu wysyła stan draft, a powrót zachowuje treść / saving a draft sends the draft status and going back keeps the content', async ({ page }) => {
  let status: unknown;
  await page.route(ENTRIES, (route) => {
    status = route.request().postDataJSON().status;
    return route.fulfill({ status: 201, json: { id: 'abc' } });
  });
  await fillEntry(page, 'Szkic do dokończenia.');
  await openPreview(page);
  await page.getByRole('button', { name: 'Wróć' }).click();
  await expect(page.getByRole('textbox', { name: 'Opis' })).toContainText('Szkic do dokończenia.');
  await openPreview(page);
  await page.getByRole('button', { name: 'Zapisz szkic i dokończ później' }).click();
  await expect(page.getByText('Szkic zapisany.')).toBeVisible();
  expect(status).toBe('draft');
});

// PL: „Dalej” w kroku 2 jest wyłączone bez tytułu i tekstu.
// EN: "Dalej" in step 2 is off without a title and text.
test('krok 2 nie pozwala przejść dalej bez tytułu i tekstu / step 2 does not let you continue without a title and text', async ({ page }) => {
  await page.goto('/news/editor');
  await page.getByRole('button', { name: 'Dalej' }).click();
  const next = page.getByRole('button', { name: 'Dalej' });
  await expect(next).toBeDisabled();
  await page.getByLabel('Tytuł').fill('Tytuł');
  await expect(next).toBeDisabled();
  await page.getByRole('textbox', { name: 'Opis' }).click();
  await page.keyboard.type('x');
  await expect(next).toBeEnabled();
});

// PL: Link: zły adres dostaje błąd po polsku, dobry trafia do podglądu z rel i target.
// EN: A link: a bad address gets an error in Polish, a good one reaches the preview with rel and target.
test('link javascript: jest odrzucany, a link https dostaje rel i target / a javascript: link is rejected and an https link gets rel and target', async ({ page }) => {
  await fillEntry(page, 'Regulamin');
  await page.keyboard.press('ControlOrMeta+a');
  await page.getByRole('button', { name: 'Link', exact: true }).click();
  await page.getByLabel('Adres linku (https://)').fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Zapisz link' }).click();
  await expect(page.getByRole('alert')).toContainText('https://');
  await page.getByLabel('Adres linku (https://)').fill('https://teb.edu.pl/regulamin');
  await page.getByRole('button', { name: 'Zapisz link' }).click();
  await openPreview(page);
  const link = page.locator('.editor-preview a');
  await expect(link).toHaveAttribute('href', 'https://teb.edu.pl/regulamin');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

// PL: Film z YouTube: adres z parametrami daje węzeł z samym identyfikatorem, bez ramki.
// EN: A YouTube video: an address with parameters gives a node with the id only, without a frame.
test('film z YouTube zapisuje sam identyfikator i nie wstawia ramki / a YouTube video stores only the id and inserts no frame', async ({ page }) => {
  let body: { content: { type: string; attrs?: { videoId: string } }[] } | null = null;
  await page.route(ENTRIES, (route) => {
    body = route.request().postDataJSON().body;
    return route.fulfill({ status: 201, json: { id: 'abc' } });
  });
  await fillEntry(page, 'Zobacz film.');
  await page.getByRole('button', { name: 'Film' }).click();
  await page.getByLabel('Adres filmu z YouTube').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5');
  await page.getByRole('button', { name: 'Dodaj film' }).click();
  await expect(page.locator('.editor-video')).toBeVisible();
  await openPreview(page);
  await expect(page.locator('.editor-preview iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByText('Wpis opublikowany.')).toBeVisible();
  expect(body?.content.find((node) => node.type === 'youtube')?.attrs).toEqual({ videoId: 'dQw4w9WgXcQ' });
});

// PL: Lista z Worda (akapity z mso-list) staje się prawdziwą listą po wklejeniu.
// EN: A Word list (paragraphs with mso-list) becomes a real list after pasting.
test('wklejona lista z Worda staje się listą / a pasted Word list becomes a list', async ({ page }) => {
  await page.goto('/news/editor');
  await page.getByRole('button', { name: 'Dalej' }).click();
  const field = page.getByRole('textbox', { name: 'Opis' });
  await field.click();
  await page.evaluate(() => {
    const item = (marker: string, text: string) => `<p class="MsoListParagraph" style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">${marker}<span>&nbsp;</span></span>${text}<o:p></o:p></p>`;
    const data = new DataTransfer();
    data.setData('text/html', `<html><body>${item('·', 'Pierwsza')}${item('·', 'Druga')}</body></html>`);
    document.querySelector('.editor-surface')?.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  });
  await expect(field.locator('ul > li')).toHaveCount(2);
  await expect(field.locator('ul > li').first()).toHaveText('Pierwsza');
});

// PL: Odpowiedzi serwera z błędem dają polskie komunikaty, a wpis zostaje w edytorze.
// EN: Server error answers give Polish messages, and the entry stays in the editor.
for (const [status, json, message] of [
  [403, { error: 'role_required' }, 'Wpisy mogą dodawać tylko Samorząd i redakcja gazetki.'],
  [422, { error: 'invalid_entry', reason: 'bad_link' }, 'Link w treści musi zaczynać się od https://.'],
  [500, { error: 'database_error' }, 'Nie udało się zapisać wpisu. Spróbuj ponownie.'],
] as const) {
  test(`odpowiedź ${status} pokazuje komunikat / the ${status} answer shows a message`, async ({ page }) => {
    await page.route(ENTRIES, (route) => route.fulfill({ status, json }));
    await fillEntry(page, 'Treść');
    await openPreview(page);
    await page.getByRole('button', { name: 'Opublikuj' }).click();
    await expect(page.getByRole('alert')).toHaveText(message);
    await expect(page.getByRole('heading', { name: 'Podgląd' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Opublikuj' })).toBeEnabled();
  });
}

// PL: Bez internetu: komunikat o braku sieci, a wpis zostaje i po powrocie sieci da się go wysłać.
// EN: Without internet: a no-network message, and the entry stays and can be sent after the network returns.
test('bez internetu wpis zostaje w edytorze i da się go wysłać później / without internet the entry stays in the editor and can be sent later', async ({ page }) => {
  await page.route(ENTRIES, (route) => route.abort('internetdisconnected'));
  await fillEntry(page, 'Tekst napisany bez sieci.');
  await openPreview(page);
  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByRole('alert')).toHaveText('Brak internetu. Wpis został w edytorze, wyślesz go, gdy internet wróci.');
  await expect(page.locator('.editor-preview')).toContainText('Tekst napisany bez sieci.');

  // PL: Sieć wraca: ten sam wpis wysyłamy ponownie.
  // EN: The network returns: we send the same entry again.
  await page.unroute(ENTRIES);
  await page.route(ENTRIES, (route) => route.fulfill({ status: 201, json: { id: 'abc' } }));
  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByText('Wpis opublikowany.')).toBeVisible();
});

// PL: Prawdziwy brak sieci (przeglądarka offline, bez podstawionej odpowiedzi): pasek „Brak internetu”, komunikat przy wysyłce, a po powrocie sieci ten sam wpis się wysyła.
// EN: A real lack of network (the browser offline, no stubbed answer): the "Brak internetu" bar, the message on sending, and after the network returns the same entry is sent.
test('przy wyłączonej sieci wysyłka daje komunikat, a po jej powrocie działa / with the network off sending gives a message and works after it returns', async ({ page, context }) => {
  await fillEntry(page, 'Wpis pisany w pociągu.');
  await openPreview(page);
  await context.setOffline(true);
  await expect(page.getByRole('status').getByText('Brak internetu')).toBeVisible();
  await page.getByRole('button', { name: 'Zapisz szkic i dokończ później' }).click();
  await expect(page.getByRole('alert')).toHaveText('Brak internetu. Wpis został w edytorze, wyślesz go, gdy internet wróci.');
  await context.setOffline(false);
  await page.route(ENTRIES, (route) => route.fulfill({ status: 201, json: { id: 'abc' } }));
  await page.getByRole('button', { name: 'Zapisz szkic i dokończ później' }).click();
  await expect(page.getByText('Szkic zapisany.')).toBeVisible();
});

// PL: Zbudowana aplikacja z service workerem (serwer podglądu na porcie PORT + 1000): po zapisaniu aplikacji w telefonie edytor otwiera się i działa bez sieci, razem z leniwie ładowaną paczką Tiptapa.
// EN: The built app with the service worker (the preview server on the PORT + 1000 port): after the app is stored in the phone, the editor opens and works without a network, together with the lazily loaded Tiptap bundle.
test.describe('edytor w zbudowanej aplikacji / the editor in the built app', () => {
  test.use({ baseURL: `http://localhost:${Number(process.env.PORT ?? 5173) + 1000}` });

  test('edytor otwiera się i działa bez internetu / the editor opens and works without internet', async ({ page, context }) => {
    await page.goto('/news/editor');
    // PL: Czekamy, aż service worker zapisze paczkę edytora w pamięci telefonu.
    // EN: We wait until the service worker stores the editor bundle in the phone memory.
    await expect
      .poll(() => page.evaluate(async () => {
        await navigator.serviceWorker.ready;
        const keys = await Promise.all((await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).map((request) => request.url)));
        return keys.flat().some((url) => url.includes('/RichEditor-'));
      }), { timeout: 30_000 })
      .toBe(true);
    await context.setOffline(true);
    await page.reload();
    await page.getByRole('button', { name: 'Dalej' }).click();
    await page.getByRole('textbox', { name: 'Opis' }).click();
    await page.keyboard.type('Pisze bez sieci.');
    await expect(page.getByRole('textbox', { name: 'Opis' })).toContainText('Pisze bez sieci.');
  });
});

// PL: Szerokość 320 px: żaden krok nie jest szerszy niż ekran, nawet z długim tytułem, filmem i listą.
// EN: The 320 px width: no step is wider than the screen, even with a long title, a video and a list.
test('przy 320 px nic nie wychodzi poza ekran / at 320 px nothing goes off the screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const hasOverflow = () => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await page.goto('/news/editor');
  expect(await hasOverflow()).toBe(false);
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByLabel('Tytuł').fill('Bardzo długi tytuł wpisu o turnieju e-sportowym wszystkich klas technikum');
  await page.getByRole('textbox', { name: 'Opis' }).click();
  await page.keyboard.type('Dłuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuugie słowo.');
  await page.getByRole('button', { name: 'Film' }).click();
  await page.getByLabel('Adres filmu z YouTube').fill('https://youtu.be/dQw4w9WgXcQ');
  await page.getByRole('button', { name: 'Dodaj film' }).click();
  await page.getByRole('button', { name: 'Źródła' }).click();
  expect(await hasOverflow()).toBe(false);
  // PL: Każdy przycisk paska ma co najmniej 44 px wysokości i szerokości.
  // EN: Every toolbar button is at least 44 px tall and wide.
  const sizes = await page.locator('.editor-tool').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).map((rect) => Math.min(rect.width, rect.height)));
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(44);
  await page.getByRole('button', { name: 'Anuluj' }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  expect(await hasOverflow()).toBe(false);
});

// PL: Na prawdziwym serwerze zapis jest zamknięty bez sesji i nic nie wpada do bazy.
// EN: On the real server writing is closed without a session and nothing reaches the database.
test('prawdziwy serwer nie przyjmuje wpisu bez sesji / the real server does not accept an entry without a session', async ({ request }) => {
  const response = await request.post('/api/news/editor/entries', { data: { type: 'news', title: 'T', status: 'published', body: { type: 'doc', content: [] } } });
  expect([401, 503]).toContain(response.status());
});
