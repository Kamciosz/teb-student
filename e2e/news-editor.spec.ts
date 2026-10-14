/**
 * PL: Test kreatora „Nowy wpis” (podtor 3b) w przeglądarce: trzy kroki z ekranów 5.1–5.3, formatowanie, link, film z YouTube, wklejanie z Worda, zapis szkicu, zdjęcie z przycisku „Zdjęcie” (wysyłka ze stubem /api/media/upload, stan wysyłania i błędy), wysyłka do korekty, zatwierdzenie wpisu w korekcie przez redaktora, który nie jest autorem, publikacja i zaplanowana publikacja o wybranej godzinie (w Warszawie, także w dniu zmiany czasu, i bez dnia), błędy serwera, brak internetu (wpis zostaje w edytorze), szerokość 320 px i zamknięty zapis bez sesji na prawdziwym serwerze. Odpowiedzi serwera są podstawione (page.route), bo logowanie na porcie podtoru nie działa lokalnie (403). Test oblewa na gałęzi bez zmiany, bo tam adres /news/editor pokazuje tylko „W budowie”.
 * EN: Test of the "Nowy wpis" wizard (subtrack 3b) in the browser: three steps from screens 5.1–5.3, formatting, a link, a YouTube video, pasting from Word, saving a draft, a photo from the "Zdjęcie" button (upload stubbed at /api/media/upload, the sending state and errors), and a publication, server errors, no internet (the entry stays in the editor), the 320 px width and writing closed without a session on the real server. The server answers are stubbed (page.route), because sign-in on the subtrack port does not work locally (403). The test fails on a branch without the change, because there the /news/editor address shows only "W budowie".
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/NewsEditorScreen.tsx::NewsEditorScreen
 * @used_by playwright.config.ts::testDir
 */

import { expect, test, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';

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

// PL: Kafelek „dodaj” w sekcji „Zdjęcia i wideo” jest tylko wyglądem: nie otwiera wyboru plików, nic nie wysyła i nie przenosi do kroku 2.
// EN: The "add" tile in the "Zdjęcia i wideo" section is only a look: it does not open the file picker, sends nothing and does not move to step 2.
test('kafelek dodaj nic nie robi w kroku 1 / the add tile does nothing in step 1', async ({ page }) => {
  const requests: string[] = [];
  let fileChooser = false;
  page.on('request', (request) => {
    if (request.url().includes('/api/')) requests.push(request.url());
  });
  page.on('filechooser', () => {
    fileChooser = true;
  });
  await page.goto('/news/editor');
  await expect(page.getByText('Zdjęcia i wideo')).toBeVisible();
  await expect(page.getByText('Pliki są zmniejszane przed wysłaniem. Zdjęcie przytniesz klikając ikonę kadrowania.')).toBeVisible();
  const add = page.getByRole('button', { name: 'Dodaj zdjęcie albo wideo' });
  await expect(add).toHaveAttribute('aria-disabled', 'true');
  // PL: force omija tylko sprawdzenie „czy włączony”: aria-disabled="true" zatrzymałoby klik, a klik ma dojść i nic nie zrobić.
  // EN: force skips only the "is enabled" check: aria-disabled="true" would stop the click, and the click must reach the tile and do nothing.
  await add.click({ force: true });
  await expect(page.getByRole('heading', { name: 'Jaki to wpis?' })).toBeVisible();
  expect(fileChooser).toBe(false);
  expect(requests).toEqual([]);
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

  // PL: Podgląd: kafel z listy (znacznik typu, źródło, tytuł) i treść z pogrubionym tekstem.
  // EN: The preview: the list tile (the type tag, the source, the title) and the content with the bold text.
  await expect(page.getByText('Samorząd · przed chwilą')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Turniej e-sportowy klas' })).toBeVisible();
  await expect(page.locator('.news-content strong')).toHaveText('Zapisy drużyn trwają do piątku.');

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
  const link = page.locator('.news-content a');
  await expect(link).toHaveAttribute('href', 'https://teb.edu.pl/regulamin');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

// PL: Kafel w podglądzie wygląda jak na liście (style z feed.css), ale kliknięcie go nie otwiera wpisu: adres zostaje ten sam, a podgląd na ekranie.
// EN: The tile in the preview looks like the list (styles from feed.css), but clicking it does not open the entry: the address stays the same, and the preview stays on screen.
test('kafel w podglądzie wygląda jak na liście i kliknięcie go nie nawiguje / the preview tile looks like the list and clicking it does not navigate', async ({ page }) => {
  await fillEntry(page, 'Zapisy drużyn trwają do piątku.');
  await openPreview(page);
  const card = page.locator('.news-card');
  await expect(card).toHaveCSS('display', 'flex');
  await expect(card.locator('h2')).toHaveText('Turniej e-sportowy klas');
  await expect(card.locator('.news-card__excerpt')).toHaveText('Zapisy drużyn trwają do piątku.');
  await card.click();
  await expect(page.getByRole('heading', { name: 'Podgląd' })).toBeVisible();
  await expect(page).toHaveURL(/\/news\/editor$/);
});

// PL: Film z YouTube: adres z parametrami daje węzeł z samym identyfikatorem, bez ramki.
// EN: A YouTube video: an address with parameters gives a node with the id only, without a frame.
test('film z YouTube zapisuje sam identyfikator i nie wstawia ramki / a YouTube video stores only the id and inserts no frame', async ({ page }) => {
  const sent: { body?: { content: { type: string; attrs?: { videoId: string } }[] } } = {};
  await page.route(ENTRIES, (route) => {
    sent.body = route.request().postDataJSON().body;
    return route.fulfill({ status: 201, json: { id: 'abc' } });
  });
  await fillEntry(page, 'Zobacz film.');
  await page.getByRole('button', { name: 'Film' }).click();
  await page.getByLabel('Adres filmu z YouTube').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5');
  await page.getByRole('button', { name: 'Dodaj film' }).click();
  await expect(page.locator('.editor-video')).toBeVisible();
  await openPreview(page);
  await expect(page.locator('.news-content iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByText('Wpis opublikowany.')).toBeVisible();
  expect(sent.body?.content.find((node) => node.type === 'youtube')?.attrs).toEqual({ videoId: 'dQw4w9WgXcQ' });
});

// PL: Miniatura w edytorze ma widoczny napis „Film z YouTube”, a w edytorze nie ma żadnej ramki.
// EN: The thumbnail in the editor has the visible label "Film z YouTube", and the editor has no frame at all.
test('miniatura filmu ma napis i w edytorze nie ma ramki / the video thumbnail has a label and the editor has no frame', async ({ page }) => {
  await fillEntry(page, 'Zobacz film.');
  await page.getByRole('button', { name: 'Film' }).click();
  await page.getByLabel('Adres filmu z YouTube').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await page.getByRole('button', { name: 'Dodaj film' }).click();
  await expect(page.locator('.editor-video')).toContainText('Film z YouTube');
  await expect(page.locator('.editor-video img')).toHaveAttribute('alt', '');
  await expect(page.locator('.editor-surface iframe')).toHaveCount(0);
});

// PL: Zły adres filmu pokazuje komunikat w formularzu i nie wstawia węzła.
// EN: A bad video address shows a message in the form and inserts no node.
test('zły adres filmu pokazuje komunikat i nic nie wstawia / a bad video address shows a message and inserts nothing', async ({ page }) => {
  await fillEntry(page, 'Zobacz film.');
  await page.getByRole('button', { name: 'Film' }).click();
  await page.getByLabel('Adres filmu z YouTube').fill('https://evil.example/watch?v=dQw4w9WgXcQ');
  await page.getByRole('button', { name: 'Dodaj film' }).click();
  await expect(page.getByRole('alert')).toHaveText('To nie jest adres filmu z YouTube.');
  await expect(page.locator('.editor-video')).toHaveCount(0);
});

// PL: Skrócony adres „shorts” z parametrem udostępniania też daje sam identyfikator.
// EN: A "shorts" address with the share parameter also gives the id only.
test('adres shorts z parametrem udostępniania zapisuje identyfikator / a shorts address with the share parameter stores the id', async ({ page }) => {
  const sent: { body?: { content: { type: string; attrs?: { videoId: string } }[] } } = {};
  await page.route(ENTRIES, (route) => {
    sent.body = route.request().postDataJSON().body;
    return route.fulfill({ status: 201, json: { id: 'abc' } });
  });
  await fillEntry(page, 'Zobacz krótki film.');
  await page.getByRole('button', { name: 'Film' }).click();
  await page.getByLabel('Adres filmu z YouTube').fill('https://youtube.com/shorts/dQw4w9WgXcQ?feature=share');
  await page.getByRole('button', { name: 'Dodaj film' }).click();
  await openPreview(page);
  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByText('Wpis opublikowany.')).toBeVisible();
  expect(sent.body?.content.find((node) => node.type === 'youtube')?.attrs).toEqual({ videoId: 'dQw4w9WgXcQ' });
});

// PL: Wklejony HTML z obcym adresem w miejscu identyfikatora nie tworzy filmu i adres nie trafia do treści. Poprawny identyfikator w tym samym HTML zostaje.
// EN: Pasted HTML with a foreign address in place of the id creates no video, and the address never reaches the content. A valid id in the same HTML stays.
test('wklejony HTML z obcym adresem filmu nie trafia do treści / pasted HTML with a foreign video address does not reach the content', async ({ page }) => {
  const sent: { body?: { content: { type: string; attrs?: { videoId: string } }[] } } = {};
  await page.route(ENTRIES, (route) => {
    sent.body = route.request().postDataJSON().body;
    return route.fulfill({ status: 201, json: { id: 'abc' } });
  });
  await fillEntry(page, 'Zobacz film.');
  const html = '<p>Obok</p><div data-youtube-video="https://evil.example/x"></div><div data-youtube-video="dQw4w9WgXcQ"></div>';
  await page.getByRole('textbox', { name: 'Opis' }).evaluate((node, pasted) => {
    const data = new DataTransfer();
    data.setData('text/html', pasted);
    node.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  }, html);
  await expect(page.locator('.editor-video')).toHaveCount(1);
  await openPreview(page);
  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByText('Wpis opublikowany.')).toBeVisible();
  expect(JSON.stringify(sent.body)).not.toContain('evil.example');
  expect(sent.body?.content.find((node) => node.type === 'youtube')?.attrs).toEqual({ videoId: 'dQw4w9WgXcQ' });
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

// PL: Adres wysyłki zdjęcia z przycisku „Zdjęcie” na pasku edytora.
// EN: The address of the photo upload from the "Zdjęcie" button on the editor toolbar.
const UPLOAD = '**/api/media/upload*';

/**
 * PL: Rysuje w przeglądarce zdjęcie JPEG o podanym rozmiarze (jak w e2e/media.spec.ts).
 * EN: Draws a JPEG photo of the given size in the browser (as in e2e/media.spec.ts).
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param width - PL: szerokość w px. EN: the width in px.
 * @param height - PL: wysokość w px. EN: the height in px.
 * @returns PL: plik JPEG. EN: the JPEG file.
 */
async function makePhoto(page: Page, width: number, height: number): Promise<Buffer> {
  const dataUrl = await page.evaluate(
    ({ w, h }: { w: number; h: number }) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('brak kontekstu płótna / no canvas context');
      context.fillStyle = '#2060c0';
      context.fillRect(0, 0, w, h);
      return canvas.toDataURL('image/jpeg', 0.9);
    },
    { w: width, h: height },
  );
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

// PL: Zdjęcie z przycisku trafia do treści jako węzeł image. W trakcie wysyłki przycisk jest zablokowany i widać informację.
// EN: A photo from the button goes into the content as an image node. While it is sent the button is disabled and a note shows.
test('zdjęcie z przycisku wchodzi do treści wpisu / a photo from the button goes into the entry content', async ({ page }, testInfo) => {
  const sent: { body?: { content: { type: string; attrs?: object }[] } } = {};
  await page.route(ENTRIES, (route) => {
    sent.body = route.request().postDataJSON().body;
    return route.fulfill({ status: 201, json: { id: 'abc' } });
  });
  // PL: Wysyłkę wstrzymujemy, żeby sprawdzić stan wysyłania, a potem puszczamy.
  // EN: We hold the upload to check the sending state, then let it go.
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route(UPLOAD, async (route) => {
    await gate;
    await route.fulfill({ status: 201, json: { id: 'abc123' } });
  });
  await fillEntry(page, 'Zobacz zdjęcie.');
  const path = testInfo.outputPath('zdjecie.jpg');
  writeFileSync(path, await makePhoto(page, 2000, 1000));
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Zdjęcie', exact: true }).click();
  (await chooser).setFiles(path);

  const photoButton = page.getByRole('button', { name: 'Zdjęcie', exact: true });
  await expect(photoButton).toBeDisabled();
  await expect(page.getByText('Wysyłam zdjęcie…')).toBeVisible();
  release();
  // PL: Przycisk wraca dopiero po wstawieniu zdjęcia, więc po tym kroku węzeł jest już w treści.
  // EN: The button comes back only after the photo is inserted, so after this step the node is already in the content.
  await expect(photoButton).toBeEnabled();
  await expect(page.getByText('Wysyłam zdjęcie…')).toHaveCount(0);
  await openPreview(page);
  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByText('Wpis opublikowany.')).toBeVisible();
  expect(sent.body?.content.find((node) => node.type === 'image')?.attrs).toEqual({ src: '/api/media/abc123', width: 1600, height: 800, alt: '', caption: '' });
});

// PL: Odmowa serwera pokazuje komunikat po polsku pod paskiem, nic nie wstawia i przycisk znów działa.
// EN: A refusal from the server shows a Polish message under the toolbar, inserts nothing, and the button works again.
test('odmowa wysyłki pokazuje komunikat i nic nie wstawia / a refused upload shows a message and inserts nothing', async ({ page }, testInfo) => {
  const sent: { body?: { content: { type: string }[] } } = {};
  await page.route(ENTRIES, (route) => {
    sent.body = route.request().postDataJSON().body;
    return route.fulfill({ status: 201, json: { id: 'abc' } });
  });
  let uploads = 0;
  await page.route(UPLOAD, (route) => {
    uploads += 1;
    return route.fulfill({ status: 403, json: { error: 'role_required' } });
  });
  await fillEntry(page, 'Treść');
  const path = testInfo.outputPath('zdjecie.jpg');
  writeFileSync(path, await makePhoto(page, 800, 600));
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Zdjęcie', exact: true }).click();
  (await chooser).setFiles(path);
  await expect(page.getByRole('alert')).toHaveText('Nie masz uprawnień do wysyłania zdjęć i filmów.');
  await expect(page.getByRole('button', { name: 'Zdjęcie', exact: true })).toBeEnabled();
  expect(uploads).toBe(1);
  await openPreview(page);
  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByText('Wpis opublikowany.')).toBeVisible();
  expect(sent.body?.content.some((node) => node.type === 'image')).toBe(false);
});

// PL: Plik, którego przeglądarka nie czyta (np. HEIC), nie idzie na serwer, a użytkownik dostaje prośbę o JPG albo PNG.
// EN: A file the browser cannot read (e.g. HEIC) does not go to the server, and the user gets a request for JPG or PNG.
test('plik, którego przeglądarka nie czyta, pokazuje prośbę o JPG albo PNG / a file the browser cannot read asks for JPG or PNG', async ({ page }, testInfo) => {
  let uploads = 0;
  await page.route(UPLOAD, (route) => {
    uploads += 1;
    return route.fulfill({ status: 201, json: { id: 'nie-powinno-byc' } });
  });
  await fillEntry(page, 'Treść');
  const path = testInfo.outputPath('zdjecie.jpg');
  writeFileSync(path, 'to nie jest zdjęcie');
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Zdjęcie', exact: true }).click();
  (await chooser).setFiles(path);
  await expect(page.getByRole('alert')).toHaveText('Tego formatu zdjęcia nie da się wysłać. Wybierz zdjęcie w formacie JPG albo PNG.');
  expect(uploads).toBe(0);
});

// PL: Bez internetu: komunikat o braku sieci, a wpis zostaje i po powrocie sieci da się go wysłać.
// EN: Without internet: a no-network message, and the entry stays and can be sent after the network returns.
test('bez internetu wpis zostaje w edytorze i da się go wysłać później / without internet the entry stays in the editor and can be sent later', async ({ page }) => {
  await page.route(ENTRIES, (route) => route.abort('internetdisconnected'));
  await fillEntry(page, 'Tekst napisany bez sieci.');
  await openPreview(page);
  await page.getByRole('button', { name: 'Opublikuj' }).click();
  await expect(page.getByRole('alert')).toHaveText('Brak internetu. Wpis został w edytorze, wyślesz go, gdy internet wróci.');
  await expect(page.locator('.news-content')).toContainText('Tekst napisany bez sieci.');

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
    // PL: Czekamy, aż service worker przejmie stronę. Dopiero wtedy zapisuje paczki w pamięci telefonu.
    // EN: We wait until the service worker takes over the page. Only then does it store the bundles in the phone memory.
    await expect
      .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null), { timeout: 30_000 })
      .toBe(true);
    // PL: Paczki Tiptapa ładują się dopiero na kroku edytora, więc otwieramy go online.
    // EN: The Tiptap bundles load only on the editor step, so we open it while online.
    await page.getByRole('button', { name: 'Dalej' }).click();
    // PL: Czekamy, aż service worker zapisze paczkę edytora w pamięci telefonu.
    // EN: We wait until the service worker stores the editor bundle in the phone memory.
    await expect
      .poll(() => page.evaluate(async () => {
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

// PL: Zaplanowana publikacja: godzina z formularza idzie na serwer jako chwila w Warszawie, także w dniu zmiany czasu (25 października 2026). Przeglądarka jest w Nowym Jorku, więc wynik zależy tylko od strefy Warszawy.
// EN: A scheduled publication: the time from the form goes to the server as a Warsaw moment, also on the clock-change day (25 October 2026). The browser is in New York, so the result depends only on Warsaw's zone.
test.describe('zaplanowana publikacja / a scheduled publication', () => {
  test.use({ timezoneId: 'America/New_York' });

  // PL: Zimowy czas (UTC+1): 12:00 w Warszawie to 11:00 UTC.
  // EN: Winter time (UTC+1): 12:00 in Warsaw is 11:00 UTC.
  test('dzień po zmianie czasu idzie jako 11:00 UTC / the day after the clock change goes as 11:00 UTC', async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    await page.route(ENTRIES, (route) => {
      sent = route.request().postDataJSON();
      return route.fulfill({ status: 201, json: { id: 'abc' } });
    });
    await fillEntry(page, 'Zapisy drużyn trwają do piątku.');
    await openPreview(page);
    await page.getByLabel('Opublikuj o wybranej godzinie').check();
    await page.getByLabel('Dzień publikacji').fill('2026-10-26');
    await page.getByLabel('Godzina publikacji').fill('12:00');
    await page.getByRole('button', { name: 'Opublikuj' }).click();
    await expect(page.getByText('Wpis pojawi się poniedziałek, 26 października o 12:00.')).toBeVisible();
    expect(sent).toMatchObject({ status: 'published', publishAt: Date.UTC(2026, 9, 26, 11, 0) });
  });

  // PL: Letni czas, dzień przed zmianą (UTC+2): 12:00 w Warszawie to 10:00 UTC.
  // EN: Summer time, the day before the change (UTC+2): 12:00 in Warsaw is 10:00 UTC.
  test('dzień przed zmianą czasu idzie jako 10:00 UTC / the day before the clock change goes as 10:00 UTC', async ({ page }) => {
    let sent: Record<string, unknown> | null = null;
    await page.route(ENTRIES, (route) => {
      sent = route.request().postDataJSON();
      return route.fulfill({ status: 201, json: { id: 'abc' } });
    });
    await fillEntry(page, 'Zapisy drużyn trwają do piątku.');
    await openPreview(page);
    await page.getByLabel('Opublikuj o wybranej godzinie').check();
    await page.getByLabel('Dzień publikacji').fill('2026-10-24');
    await page.getByLabel('Godzina publikacji').fill('12:00');
    await page.getByRole('button', { name: 'Opublikuj' }).click();
    await expect(page.getByText('Wpis pojawi się sobota, 24 października o 12:00.')).toBeVisible();
    expect(sent).toMatchObject({ status: 'published', publishAt: Date.UTC(2026, 9, 24, 10, 0) });
  });

  // PL: Zaznaczona publikacja bez dnia nie wysyła nic: redaktor dostaje komunikat przy polu.
  // EN: A ticked publication without a day sends nothing: the editor gets a message at the field.
  test('bez dnia nic nie idzie na serwer / without a day nothing goes to the server', async ({ page }) => {
    const sends: string[] = [];
    await page.route(ENTRIES, (route) => {
      sends.push(route.request().url());
      return route.fulfill({ status: 201, json: { id: 'abc' } });
    });
    await fillEntry(page, 'Zapisy drużyn trwają do piątku.');
    await openPreview(page);
    await page.getByLabel('Opublikuj o wybranej godzinie').check();
    await page.getByLabel('Godzina publikacji').fill('12:00');
    await page.getByRole('button', { name: 'Opublikuj' }).click();
    await expect(page.getByRole('alert')).toHaveText('Wpisz dzień i godzinę publikacji.');
    expect(sends).toEqual([]);
  });
});

// PL: Adres jednego szkicu na serwerze edytora (GET i PUT /entries/:id).
// EN: The address of one draft on the editor server (GET and PUT /entries/:id).
const ENTRY_BY_ID = '**/api/news/editor/entries/*';

// PL: Edycja szkicu: kreator startuje z jego danymi, a zapis idzie przez PUT pod tym samym numerem, bez nowego POST.
// EN: Editing a draft: the wizard starts with its data, and saving goes by PUT under the same id, without a new POST.
test('edycja szkicu wczytuje dane i zapisuje ten sam wpis / editing a draft loads its data and saves the same entry', async ({ page }) => {
  const calls: string[] = [];
  let sent: Record<string, unknown> | null = null;
  await page.route(ENTRY_BY_ID, (route) => {
    const request = route.request();
    calls.push(`${request.method()} ${new URL(request.url()).pathname}`);
    if (request.method() === 'PUT') {
      sent = request.postDataJSON();
      return route.fulfill({ status: 200, json: { id: 'd1' } });
    }
    return route.fulfill({
      status: 200,
      json: { id: 'd1', type: 'event', title: 'Szkic turnieju', status: 'draft', body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Treść szkicu.' }] }] } },
    });
  });
  await page.route(ENTRIES, (route) => {
    calls.push(`${route.request().method()} /entries`);
    return route.fulfill({ status: 201, json: { id: 'nowy' } });
  });

  await page.goto('/news/editor/d1');
  await expect(page.getByRole('button', { name: 'Wydarzenie' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Dalej' }).click();
  await expect(page.getByLabel('Tytuł')).toHaveValue('Szkic turnieju');
  await expect(page.getByRole('textbox', { name: 'Opis' })).toContainText('Treść szkicu.');
  await page.getByRole('button', { name: 'Dalej' }).click();
  await expect(page.getByRole('heading', { name: 'Podgląd' })).toBeVisible();
  await page.getByRole('button', { name: 'Zapisz szkic i dokończ później' }).click();
  await expect(page.getByText('Szkic zapisany.')).toBeVisible();

  // PL: Odpowiedzi GET mogą przyjść podwójnie (tryb deweloperski), więc sprawdzamy, co poszło, a nie liczbę wywołań.
  // EN: GET answers may come twice (developer mode), so we check what was sent, not the number of calls.
  expect(calls).not.toContain('POST /entries');
  expect(calls).toContain('PUT /api/news/editor/entries/d1');
  expect(sent).toMatchObject({ type: 'event', title: 'Szkic turnieju', status: 'draft' });
});

// PL: Opublikowany wpis nie wraca do edycji: zamiast kreatora pojawia się komunikat i link do panelu.
// EN: A published entry does not come back for editing: a message and a link to the panel appear instead of the wizard.
test('opublikowany wpis nie otwiera się do edycji / a published entry does not open for editing', async ({ page }) => {
  await page.route(ENTRY_BY_ID, (route) => route.fulfill({ status: 409, json: { error: 'already_published' } }));
  await page.goto('/news/editor/d2');
  await expect(page.getByRole('alert')).toHaveText('Ten wpis jest już opublikowany, więc nie da się go edytować.');
  await expect(page.getByRole('link', { name: 'Przejdź do wpisów w panelu' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Jaki to wpis?' })).toHaveCount(0);
});

// PL: Nieistniejący szkic: komunikat o braku wpisu.
// EN: A missing draft: a message that the entry does not exist.
test('nieistniejący szkic pokazuje komunikat / a missing draft shows a message', async ({ page }) => {
  await page.route(ENTRY_BY_ID, (route) => route.fulfill({ status: 404, json: { error: 'not_found' } }));
  await page.goto('/news/editor/brak');
  await expect(page.getByRole('alert')).toHaveText('Nie ma takiego szkicu. Może został usunięty.');
});

// PL: Brak internetu przy wczytaniu szkicu: komunikat i link do panelu, bez pustego kreatora.
// EN: No internet while loading a draft: a message and a link to the panel, without an empty wizard.
test('brak internetu przy wczytaniu pokazuje komunikat / no internet while loading shows a message', async ({ page }) => {
  await page.route(ENTRY_BY_ID, (route) => route.abort('internetdisconnected'));
  await page.goto('/news/editor/d3');
  await expect(page.getByRole('alert')).toHaveText('Nie udało się wczytać szkicu. Spróbuj ponownie za chwilę.');
  await expect(page.getByRole('link', { name: 'Przejdź do wpisów w panelu' })).toBeVisible();
});

// PL: Wysyłka do korekty z nowego wpisu: serwer dostaje status in_review, a ekran potwierdza wysyłkę.
// EN: Sending to review from a new entry: the server gets the in_review status, and the screen confirms the sending.
test('wysyłka do korekty zapisuje wpis ze statusem in_review / sending to review saves the entry with in_review', async ({ page }) => {
  let sent: Record<string, unknown> | null = null;
  await page.route(ENTRIES, (route) => {
    sent = route.request().postDataJSON();
    return route.fulfill({ status: 201, json: { id: 'nowy' } });
  });
  await fillEntry(page, 'Zawody w szachach.');
  await openPreview(page);
  await page.getByRole('button', { name: 'Wyślij do korekty' }).click();
  await expect(page.getByText('Wpis wysłany do korekty. Zatwierdzi go inny redaktor.')).toBeVisible();
  expect(sent).toMatchObject({ status: 'in_review' });
});

// PL: Wpis w korekcie: redaktor, który nie jest autorem, widzi podgląd i zatwierdza go. Zatwierdzenie idzie pod adres /approve.
// EN: An entry in review: an editor who is not the author sees the preview and approves it. The approval goes to the /approve address.
test('redaktor zatwierdza wpis w korekcie / an editor approves an entry in review', async ({ page }) => {
  const calls: string[] = [];
  const body = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Treść do korekty.' }] }] };
  await page.route(ENTRY_BY_ID, (route) => {
    calls.push(`${route.request().method()} ${new URL(route.request().url()).pathname}`);
    return route.fulfill({ status: 200, json: { id: 'k1', type: 'news', title: 'Wpis do korekty', status: 'in_review', canApprove: true, body } });
  });
  await page.route('**/api/news/editor/entries/*/approve', (route) => {
    calls.push(`${route.request().method()} ${new URL(route.request().url()).pathname}`);
    return route.fulfill({ status: 200, json: { id: 'k1' } });
  });
  await page.goto('/news/editor/k1');
  await expect(page.getByRole('heading', { name: 'Wpis czeka na korektę' })).toBeVisible();
  await page.getByRole('button', { name: 'Zatwierdź i opublikuj' }).click();
  await expect(page.getByText('Wpis opublikowany.')).toBeVisible();
  expect(calls).toContain('POST /api/news/editor/entries/k1/approve');
});

// PL: Autor swojego wpisu w korekcie nie widzi przycisku zatwierdzenia, tylko komunikat, że czeka na innego redaktora.
// EN: The author of an entry in review does not see the approval button, only a message that it waits for another editor.
test('autor nie widzi przycisku zatwierdzenia / the author does not see the approval button', async ({ page }) => {
  const body = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mój tekst.' }] }] };
  await page.route(ENTRY_BY_ID, (route) => route.fulfill({ status: 200, json: { id: 'k2', type: 'news', title: 'Mój wpis', status: 'in_review', canApprove: false, body } }));
  await page.goto('/news/editor/k2');
  await expect(page.getByText('Ten wpis czeka na korektę. Zatwierdzi go inny redaktor, nie jego autor.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zatwierdź i opublikuj' })).toHaveCount(0);
});

// PL: Na prawdziwym serwerze odczyt szkicu jest zamknięty bez sesji.
// EN: On the real server reading a draft is closed without a session.
test('prawdziwy serwer nie oddaje szkicu bez sesji / the real server does not give a draft without a session', async ({ request }) => {
  const response = await request.get('/api/news/editor/entries/brak');
  expect([401, 503]).toContain(response.status());
});
