/**
 * PL: Test ekranów ankiet dla ucznia (podtor 5a) na atrapie serwera: lista z dniami do końca, jedno pytanie na ekranie, „Dalej” po wyborze, wysłanie głosu, brak drugiego wypełnienia, błąd bez internetu, lista z zapisu w telefonie, skala 1–5 jako przyciski, krótka odpowiedź z licznikiem znaków i szerokość 320 px.
 *     Ekrany sprawdzamy na atrapie serwera (page.route), bo atrapa nie zależy od dnia uruchomienia (termin ankiety). Jeden test odpytuje prawdziwy serwer i sprawdza, że bez sesji ucznia odpowiada 401. Zasadę „jeden głos na ucznia” sprawdzają testy serwera na prawdziwej D1 (worker/surveys/vote/vote.test.ts).
 * EN: Test of the survey screens for the student (subtrack 5a) against a mock server: the list with the days left, one question per screen, "Dalej" after a choice, sending the vote, no second filling, the offline error, the list from the phone's saved data, the 1–5 scale as buttons, a short answer with a character counter and the 320 px width.
 *     The screens are checked against a mock server (page.route), because a mock does not depend on the day of the run (the survey deadline). One test queries the real server and checks that it answers 401 without a student session. The "one vote per student" rule is checked by the server tests on a real D1 (worker/surveys/vote/vote.test.ts).
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/SurveysVoteScreen.tsx::SurveysVoteScreen
 * @used_by playwright.config.ts::testDir
 */

// PL: Funkcje testowe Playwright i typ strony.
// EN: Playwright test functions and the page type.
import { expect, test, type Page } from '@playwright/test';

// PL: Ankieta z makiety 4.2–4.4 (docs/projekt/EKRANY.md). Trzecie pytanie jest przykładowe.
// EN: The survey from mockups 4.2–4.4 (docs/projekt/EKRANY.md). The third question is an example.
const SURVEY = {
  id: 'dodatkowe',
  label: 'Zajęcia dodatkowe',
  title: 'Zajęcia dodatkowe w II semestrze',
  isActive: true,
  hasVoted: false,
  closesAt: null,
  questions: [
    { id: 'q1', type: 'single_choice', prompt: 'Jakie zajęcia dodatkowe chcesz w drugim semestrze?', options: ['Koło programowania gier', 'Siatkówka', 'Przygotowanie do matury z matematyki', 'Fotografia'] },
    { id: 'q2', type: 'single_choice', prompt: 'Ile razy w tygodniu możesz zostać po lekcjach?', options: ['Raz', 'Dwa razy', 'Trzy razy lub więcej', 'Nie mogę zostawać'] },
    { id: 'q3', type: 'single_choice', prompt: 'Który dzień tygodnia pasuje Ci najlepiej?', options: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek'] },
  ].map((question) => ({ ...question, options: question.options.map((label, index) => ({ id: `${question.id}-${index}`, label })) })),
};

// PL: Ankieta z jednym pytaniem wielokrotnego wyboru: można zaznaczyć kilka odpowiedzi naraz.
// EN: A survey with one multiple-choice question: several options can be picked at once.
const MULTI_SURVEY = {
  ...SURVEY,
  id: 'wybor',
  title: 'Dni po lekcjach (kilka odpowiedzi)',
  questions: [
    { id: 'm1', type: 'multiple_choice', prompt: 'Które dni tygodnia pasują Ci do zostania po lekcjach?', options: ['Poniedziałek', 'Wtorek', 'Środa'] },
  ].map((question) => ({ ...question, options: question.options.map((label, index) => ({ id: `${question.id}-${index}`, label })) })),
};

// PL: Ankieta z pytaniem skali 1–5: pięć zwykłych odpowiedzi „1”…„5”, wybiera się jedną, z opisami skrajnych wartości.
// EN: A survey with a 1–5 scale question: five ordinary options "1"…"5", one is picked, with captions for the extreme values.
const SCALE_SURVEY = {
  ...SURVEY,
  id: 'skala',
  title: 'Ocena zajęć dodatkowych',
  questions: [
    { id: 's1', type: 'scale_1_5', prompt: 'Jak oceniasz zajęcia dodatkowe?', options: ['1', '2', '3', '4', '5'] },
  ].map((question) => ({ ...question, options: question.options.map((label, index) => ({ id: `${question.id}-${index}`, label })) })),
};

// PL: Ankieta z pytaniem krótkiej odpowiedzi: pole tekstowe bez wyborów, odpowiedź to tekst od 1 do 200 znaków.
// EN: A survey with a short-answer question: a text field with no choices, the answer is a text of 1 to 200 characters.
const SHORT_SURVEY = {
  ...SURVEY,
  id: 'krotka',
  title: 'Uwagi do zajęć dodatkowych',
  questions: [{ id: 'k1', type: 'short_text', prompt: 'Co chcesz zmienić w zajęciach dodatkowych?', options: [] }],
};

// PL: Stan atrapy serwera: czy uczeń już zagłosował i jakie odpowiedzi wysłał.
// EN: The state of the mock server: whether the student has voted and which answers were sent.
type MockServer = { voted: boolean; received: unknown[] };

/**
 * PL: Podłącza atrapę serwera ankiet pod /api/surveys/vote. Po pierwszym głosie odpowiada 409, jak prawdziwy serwer.
 * EN: Attaches the mock survey server under /api/surveys/vote. After the first vote it answers 409, like the real server.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param options - PL: godzina zamknięcia (ISO) albo null, czy ankieta jest już zamknięta i którą ankietę pokazać. EN: the closing hour (ISO) or null, whether the survey is already closed, and which survey to show.
 * @returns PL: stan atrapy do sprawdzenia w teście. EN: the mock state to check in the test.
 */
async function mockSurveyServer(page: Page, options: { closesAt?: string | null; closed?: boolean; survey?: typeof SURVEY | typeof MULTI_SURVEY | typeof SCALE_SURVEY | typeof SHORT_SURVEY } = {}): Promise<MockServer> {
  const { closesAt = null, closed = false, survey = SURVEY } = options;
  const server: MockServer = { voted: false, received: [] };
  await page.route('**/api/surveys/vote/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/surveys/vote', '');
    if (request.method() === 'POST') {
      if (server.voted) return route.fulfill({ status: 409, json: { error: 'already_voted' } });
      server.voted = true;
      server.received.push(request.postDataJSON());
      return route.fulfill({ status: 201, json: { status: 'ok' } });
    }
    if (path === '/' || path === '') {
      const filled = { id: 'stolowka', label: null, title: 'Obiad w stołówce', questionCount: 1, daysLeft: 9, hasVoted: true, closesAt: null };
      const open = { id: SURVEY.id, label: SURVEY.label, title: SURVEY.title, questionCount: 3, daysLeft: 3, hasVoted: server.voted, closesAt };
      const ended = [{ id: 'dzwonki', title: 'Plan dzwonków', endsOn: '2026-09-30', endedOn: '2026-09-30' }];
      return route.fulfill({ json: { active: [open, filled], ended } });
    }
    return route.fulfill({ json: { ...survey, hasVoted: server.voted, closesAt, isActive: !closed } });
  });
  return server;
}

// PL: Lista ankiet z makiety 4.1.
// EN: The survey list from mockup 4.1.
test('lista pokazuje aktywne ankiety z dniami do końca, wypełnioną i zakończoną / the list shows running surveys with days left, a filled one and an ended one', async ({ page }) => {
  await mockSurveyServer(page);
  await page.goto('/surveys/vote');

  await expect(page.getByRole('heading', { name: 'Ankiety', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Zajęcia dodatkowe w II semestrze' })).toBeVisible();
  await expect(page.getByText('3 pytania · 1 minuta')).toBeVisible();
  await expect(page.getByText('dni', { exact: true })).toBeVisible();
  await expect(page.getByText('Wypełniona', { exact: true })).toBeVisible();
  await expect(page.getByText('Ankieta zamknięta · 30.09')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Menu główne' })).toBeVisible();
});

// PL: Ankieta z godziną zamknięcia: lista pokazuje „Do …” w czasie polskim, niezależnie od strefy telefonu.
// EN: A survey with a closing hour: the list shows "Do …" in Polish time, whatever the phone's zone.
test('ankieta z godziną zamknięcia pokazuje „Do …” w czasie polskim / a survey with a closing hour shows "Do …" in Polish time', async ({ page }) => {
  await mockSurveyServer(page, { closesAt: '2026-10-23T18:00:00.000Z' });
  await page.goto('/surveys/vote');
  await expect(page.getByText('Do 23.10, 20:00')).toBeVisible();
});

// PL: Ankieta po godzinie zamknięcia: szczegóły pokazują stan „Ankieta zamknięta”, bez pytań i bez „Dalej”.
// EN: A survey past its closing hour: the details show the "Ankieta zamknięta" state, without questions and without "Dalej".
test('po terminie szczegóły ankiety pokazują „Ankieta zamknięta” / after the deadline the survey details show "Ankieta zamknięta"', async ({ page }) => {
  await mockSurveyServer(page, { closesAt: '2026-10-23T18:00:00.000Z', closed: true });
  await page.goto('/surveys/vote/dodatkowe');
  await expect(page.getByRole('heading', { name: 'Ankieta zamknięta' })).toBeVisible();
  await expect(page.getByText('Ta ankieta jest już zamknięta, więc nie przyjmujemy odpowiedzi.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dalej' })).toHaveCount(0);
});

// PL: Cały przepływ: trzy pytania, „Dalej” po wyborze, wysłanie i brak drugiego wypełnienia.
// EN: The whole flow: three questions, "Dalej" after a choice, sending and no second filling.
test('jedno pytanie na ekranie, „Dalej” po wyborze, głos idzie raz / one question per screen, "Dalej" after a choice, the vote goes once', async ({ page }) => {
  const server = await mockSurveyServer(page);
  await page.goto('/surveys/vote');
  await page.getByRole('link', { name: 'Wypełnij' }).click();

  // PL: Pytanie 1: „Dalej” jest wyłączone, dopóki nie wybierzemy odpowiedzi.
  // EN: Question 1: "Dalej" is disabled until an option is chosen.
  await expect(page.getByText('Pytanie 1')).toBeVisible();
  await expect(page.getByText('Odpowiedzi są anonimowe. Wyniki widzi tylko Samorząd.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dalej' })).toBeDisabled();
  await page.getByText('Siatkówka').click();
  await page.getByRole('button', { name: 'Dalej' }).click();

  // PL: Pytanie 2 nie pokazuje wyboru z pytania 1, a „Wstecz” go zachowuje.
  // EN: Question 2 does not show the choice from question 1, and "Wstecz" keeps it.
  await expect(page.getByText('Pytanie 2')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dalej' })).toBeDisabled();
  await page.getByRole('button', { name: 'Wstecz, do poprzedniego pytania' }).click();
  await expect(page.getByLabel(/Siatkówka/)).toBeChecked();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByText('Dwa razy').click();
  await page.getByRole('button', { name: 'Dalej' }).click();

  // PL: Ostatnie pytanie wysyła głos i pokazuje potwierdzenie.
  // EN: The last question sends the vote and shows the confirmation.
  await page.getByText('Wtorek').click();
  await page.getByRole('button', { name: 'Wyślij odpowiedzi' }).click();
  await expect(page.getByRole('heading', { name: 'Odpowiedzi wysłane' })).toBeVisible();
  expect(server.received).toEqual([{ answers: [{ questionId: 'q1', optionIds: ['q1-1'] }, { questionId: 'q2', optionIds: ['q2-1'] }, { questionId: 'q3', optionIds: ['q3-1'] }] }]);

  // PL: Ankieta jest teraz oznaczona jako wypełniona, a jej adres pokazuje komunikat zamiast pytań.
  // EN: The survey is now marked as filled, and its address shows a message instead of the questions.
  await page.goto('/surveys/vote');
  await expect(page.getByText('Wypełniona', { exact: true })).toHaveCount(2);
  await page.goto('/surveys/vote/dodatkowe');
  await expect(page.getByRole('heading', { name: 'Już wypełniona' })).toBeVisible();
});

// PL: Pytanie wielokrotnego wyboru: pola wyboru zamiast radio, „Wyślij” dopiero po zaznaczeniu, odznaczenie wraca do zera, a wysłane są wszystkie zaznaczone.
// EN: A multiple-choice question: checkboxes instead of radios, "Wyślij" only after a pick, unpicking goes back to zero, and all picked options are sent.
test('pytanie wielokrotnego wyboru: kilka zaznaczeń i wysłanie wszystkich / a multiple-choice question: several picks and all of them are sent', async ({ page }) => {
  const server = await mockSurveyServer(page, { survey: MULTI_SURVEY });
  await page.goto('/surveys/vote/wybor');

  await expect(page.getByText('Możesz zaznaczyć kilka odpowiedzi.')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: /Poniedziałek/ })).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Wyślij odpowiedzi' })).toBeDisabled();

  await page.getByLabel(/Poniedziałek/).check();
  await page.getByLabel(/Środa/).check();
  await expect(page.getByLabel(/Poniedziałek/)).toBeChecked();
  await expect(page.getByLabel(/Środa/)).toBeChecked();
  await page.getByLabel(/Poniedziałek/).uncheck();
  await expect(page.getByRole('button', { name: 'Wyślij odpowiedzi' })).toBeEnabled();
  await page.getByLabel(/Poniedziałek/).check();

  await page.getByRole('button', { name: 'Wyślij odpowiedzi' }).click();
  await expect(page.getByRole('heading', { name: 'Odpowiedzi wysłane' })).toBeVisible();
  // PL: Kolejność wyboru zależy od kliknięć, więc porównujemy posortowane numery.
  // EN: The order of the picks depends on the clicks, so we compare the sorted ids.
  const [sent] = server.received as { answers: { questionId: string; optionIds: string[] }[] }[];
  expect(sent.answers.map((answer) => ({ questionId: answer.questionId, optionIds: [...answer.optionIds].sort() }))).toEqual([{ questionId: 'm1', optionIds: ['m1-0', 'm1-2'] }]);
});

// PL: Pytanie skali 1–5: pięć przycisków w jednym rzędzie z opisami „wcale” i „bardzo”, „Wyślij” dopiero po wyborze, wysłana jest jedna wartość. Telefon 320 px: przyciski mieszczą się bez przewijania.
// EN: A 1–5 scale question: five buttons in one row with the captions "wcale" and "bardzo", "Wyślij" only after a pick, and one value is sent. A 320 px phone: the buttons fit without scrolling.
test('skala 1–5: pięć przycisków, wybór „4” i wysłanie przy 320 px / the 1–5 scale: five buttons, pick "4" and send at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const server = await mockSurveyServer(page, { survey: SCALE_SURVEY });
  await page.goto('/surveys/vote/skala');

  await expect(page.getByRole('heading', { name: 'Jak oceniasz zajęcia dodatkowe?' })).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(5);
  await expect(page.getByText('wcale', { exact: true })).toBeVisible();
  await expect(page.getByText('bardzo', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Wyślij odpowiedzi' })).toBeDisabled();

  // PL: Przycisk to segment (pole radio jest ukryte), więc to jego wymiary liczymy: co najmniej 44 px na 44 px.
  // EN: The button is the segment (the radio is hidden), so its size is what counts: at least 44 px by 44 px.
  const segments = page.locator('.vote-scale__segment');
  await expect(segments).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    const box = await segments.nth(index).boundingBox();
    expect(box && box.width >= 44 && box.height >= 44).toBe(true);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);

  await page.getByLabel('4', { exact: true }).check();
  await expect(page.getByLabel('4', { exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Wyślij odpowiedzi' }).click();
  await expect(page.getByRole('heading', { name: 'Odpowiedzi wysłane' })).toBeVisible();
  expect(server.received).toEqual([{ answers: [{ questionId: 's1', optionIds: ['s1-3'] }] }]);
});

// PL: Zmiana ankiety w trakcie: serwer odmawia drugiego głosu i telefon pokazuje komunikat.
// EN: A change in the meantime: the server refuses a second vote and the phone shows a message.
test('serwer odmawia drugiego głosu (409) i ekran to pokazuje / the server refuses a second vote (409) and the screen shows it', async ({ page }) => {
  const server = await mockSurveyServer(page);
  await page.goto('/surveys/vote/dodatkowe');
  await page.getByText('Fotografia').click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByText('Raz', { exact: true }).click();
  await page.getByRole('button', { name: 'Dalej' }).click();
  await page.getByText('Środa').click();

  // PL: Głos z innego telefonu uczeń zdążył oddać, zanim stuknął „Wyślij”.
  // EN: A vote from another phone got in before the student tapped "Wyślij".
  server.voted = true;
  await page.getByRole('button', { name: 'Wyślij odpowiedzi' }).click();
  await expect(page.getByRole('heading', { name: 'Już wypełniona' })).toBeVisible();
  expect(server.received).toEqual([]);
});

// PL: Brak internetu: komunikat i ponowienie.
// EN: No internet: a message and a retry.
test('bez internetu lista pokazuje błąd i da się spróbować ponownie / without internet the list shows an error and a retry works', async ({ page }) => {
  await page.route('**/api/surveys/vote/**', (route) => route.abort('internetdisconnected'));
  await page.goto('/surveys/vote');
  await expect(page.getByRole('alert')).toContainText('Nie udało się pobrać ankiet');

  await page.unroute('**/api/surveys/vote/**');
  await mockSurveyServer(page);
  await page.getByRole('button', { name: 'Spróbuj ponownie' }).click();
  await expect(page.getByRole('heading', { name: 'Zajęcia dodatkowe w II semestrze' })).toBeVisible();
});

// PL: Zapis w telefonie: po powrocie na listę przy zerwanym połączeniu widać ostatnio pobraną listę, a nie błąd.
// EN: The saved data: on returning to the list with the connection down, the last fetched list is shown instead of an error.
test('po zerwaniu połączenia lista wraca z zapisu w telefonie / after the connection drops the list comes back from the saved data', async ({ page }) => {
  await mockSurveyServer(page);
  await page.goto('/surveys/vote');
  await expect(page.getByRole('heading', { name: 'Zajęcia dodatkowe w II semestrze' })).toBeVisible();
  // PL: Lista naprawdę trafia do localStorage telefonu (klucz z src/shared/query/queryClient.ts).
  // EN: The list really lands in the phone's localStorage (the key from src/shared/query/queryClient.ts).
  await expect.poll(() => page.evaluate(() => localStorage.getItem('teb-student-query-cache') ?? '')).toContain('Zajęcia dodatkowe w II semestrze');
  await page.getByRole('link', { name: 'Wypełnij' }).click();
  await expect(page.getByText('Pytanie 1')).toBeVisible();

  await page.unroute('**/api/surveys/vote/**');
  await page.route('**/api/surveys/vote/**', (route) => route.abort('internetdisconnected'));
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Zajęcia dodatkowe w II semestrze' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

// PL: Prawdziwy serwer z bazą D1: bez sesji ucznia każdy adres ankiet odpowiada 401 i nie oddaje żadnych danych.
// EN: The real server with the D1 database: without a student session every survey route answers 401 and returns no data.
test('prawdziwy serwer: bez sesji ucznia 401 na każdym adresie / the real server: 401 on every route without a student session', async ({ request }) => {
  for (const response of [await request.get('/api/surveys/vote'), await request.get('/api/surveys/vote/dodatkowe'), await request.post('/api/surveys/vote/dodatkowe/answers', { data: { answers: [] } })]) {
    expect(response.status()).toBe(401);
    expect(await response.text()).not.toContain('Zajęcia dodatkowe');
  }
});

// PL: Pytanie krótkiej odpowiedzi: podpowiedź o anonimowości pod polem połączona z nim, licznik „x / 200 znaków”, „Wyślij” zablokowane przy pustym, samych spacjach i za długim tekście, a wysłany jest tekst przycięty z obu stron.
// EN: A short-answer question: the anonymity hint under the field tied to it, the "x / 200 characters" counter, "Wyślij" blocked for an empty or spaces-only text and for a text that is too long, and the text sent is trimmed at both ends.
test('krótka odpowiedź: licznik, blokada przy pustym i za długim tekście, wysłany tekst przycięty / a short answer: counter, blocked when empty or too long, the trimmed text is sent', async ({ page }) => {
  const server = await mockSurveyServer(page, { survey: SHORT_SURVEY });
  await page.goto('/surveys/vote/krotka');

  const field = page.getByLabel('Twoja odpowiedź');
  const send = page.getByRole('button', { name: 'Wyślij odpowiedzi' });
  await expect(field).toBeVisible();
  await expect(page.getByText('Nie wpisuj imienia ani klasy. Odpowiedź jest anonimowa.')).toBeVisible();
  await expect(field).toHaveAccessibleDescription(/Nie wpisuj imienia ani klasy\. Odpowiedź jest anonimowa\./);
  await expect(page.getByText('0 / 200 znaków')).toBeVisible();
  await expect(send).toBeDisabled();

  await field.fill('   ');
  await expect(page.getByText('0 / 200 znaków')).toBeVisible();
  await expect(send).toBeDisabled();

  await field.fill('a'.repeat(201));
  await expect(page.getByText('201 / 200 znaków')).toBeVisible();
  await expect(page.getByText('Za dużo znaków. Skróć odpowiedź.')).toBeVisible();
  await expect(send).toBeDisabled();

  await field.fill('  Chcę więcej gier i robotyki  ');
  await expect(page.getByText('27 / 200 znaków')).toBeVisible();
  await expect(send).toBeEnabled();
  await send.click();

  await expect(page.getByRole('heading', { name: 'Odpowiedzi wysłane' })).toBeVisible();
  expect(server.received).toEqual([{ answers: [{ questionId: 'k1', optionIds: [], text: 'Chcę więcej gier i robotyki' }] }]);
});

// PL: Telefon o szerokości 320 px: bez przewijania w bok, przycisk „Dalej” w całości na ekranie.
// EN: A 320 px wide phone: no sideways scrolling, the "Dalej" button fully on screen.
test('przy 320 px nic nie wystaje poza ekran / at 320 px nothing sticks out of the screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await mockSurveyServer(page);
  for (const path of ['/surveys/vote', '/surveys/vote/dodatkowe']) {
    await page.goto(path);
    await expect(page.getByRole('main')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  }
  const button = page.getByRole('button', { name: 'Dalej' });
  const box = await button.boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 320).toBe(true);
});
