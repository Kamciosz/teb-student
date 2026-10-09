/**
 * PL: Test ekranów ankiet dla ucznia (podtor 5a) na atrapie serwera: lista z dniami do końca, jedno pytanie na ekranie, „Dalej” po wyborze, wysłanie głosu, brak drugiego wypełnienia, błąd bez internetu i szerokość 320 px.
 *     Serwer jest atrapą (page.route), bo CI nie ma bazy D1 (zgłoszenie #41). Zasadę „jeden głos na ucznia” w bazie sprawdza worker/surveys/vote/schema.test.ts.
 * EN: Test of the survey screens for the student (subtrack 5a) against a mock server: the list with the days left, one question per screen, "Dalej" after a choice, sending the vote, no second filling, the offline error and the 320 px width.
 *     The server is a mock (page.route), because CI has no D1 database (issue #41). The "one vote per student" rule in the database is checked by worker/surveys/vote/schema.test.ts.
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
  questions: [
    { id: 'q1', prompt: 'Jakie zajęcia dodatkowe chcesz w drugim semestrze?', options: ['Koło programowania gier', 'Siatkówka', 'Przygotowanie do matury z matematyki', 'Fotografia'] },
    { id: 'q2', prompt: 'Ile razy w tygodniu możesz zostać po lekcjach?', options: ['Raz', 'Dwa razy', 'Trzy razy lub więcej', 'Nie mogę zostawać'] },
    { id: 'q3', prompt: 'Który dzień tygodnia pasuje Ci najlepiej?', options: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek'] },
  ].map((question) => ({ ...question, options: question.options.map((label, index) => ({ id: `${question.id}-${index}`, label })) })),
};

// PL: Stan atrapy serwera: czy uczeń już zagłosował i jakie odpowiedzi wysłał.
// EN: The state of the mock server: whether the student has voted and which answers were sent.
type MockServer = { voted: boolean; received: unknown[]; headers: string[] };

/**
 * PL: Podłącza atrapę serwera ankiet pod /api/surveys/vote. Po pierwszym głosie odpowiada 409, jak prawdziwy serwer.
 * EN: Attaches the mock survey server under /api/surveys/vote. After the first vote it answers 409, like the real server.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @returns PL: stan atrapy do sprawdzenia w teście. EN: the mock state to check in the test.
 */
async function mockSurveyServer(page: Page): Promise<MockServer> {
  const server: MockServer = { voted: false, received: [], headers: [] };
  await page.route('**/api/surveys/vote/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/surveys/vote', '');
    server.headers.push(request.headers()['x-temporary-student-id'] ?? '');
    if (request.method() === 'POST') {
      if (server.voted) return route.fulfill({ status: 409, json: { error: 'already_voted' } });
      server.voted = true;
      server.received.push(request.postDataJSON());
      return route.fulfill({ status: 201, json: { status: 'ok' } });
    }
    if (path === '/' || path === '') {
      const filled = { id: 'stolowka', label: null, title: 'Obiad w stołówce', questionCount: 1, daysLeft: 9, hasVoted: true };
      const open = { id: SURVEY.id, label: SURVEY.label, title: SURVEY.title, questionCount: 3, daysLeft: 3, hasVoted: server.voted };
      const ended = [{ id: 'dzwonki', title: 'Plan dzwonków', endsOn: '2026-09-30' }];
      return route.fulfill({ json: { active: [open, filled], ended } });
    }
    return route.fulfill({ json: { ...SURVEY, hasVoted: server.voted } });
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
  await expect(page.getByText('Zakończona 30.09')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Menu główne' })).toBeVisible();
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
  expect(server.received).toEqual([{ answers: [{ questionId: 'q1', optionId: 'q1-1' }, { questionId: 'q2', optionId: 'q2-1' }, { questionId: 'q3', optionId: 'q3-1' }] }]);

  // PL: Ankieta jest teraz oznaczona jako wypełniona, a jej adres pokazuje komunikat zamiast pytań.
  // EN: The survey is now marked as filled, and its address shows a message instead of the questions.
  await page.goto('/surveys/vote');
  await expect(page.getByText('Wypełniona', { exact: true })).toHaveCount(2);
  await page.goto('/surveys/vote/dodatkowe');
  await expect(page.getByRole('heading', { name: 'Już wypełniona' })).toBeVisible();
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

// PL: Ten sam tymczasowy numer ucznia po odświeżeniu strony (inaczej można by głosować przez odświeżenie).
// EN: The same temporary student id after a page reload (otherwise one could vote by reloading).
test('telefon wysyła ten sam numer ucznia po odświeżeniu / the phone sends the same student id after a reload', async ({ page }) => {
  const server = await mockSurveyServer(page);
  await page.goto('/surveys/vote');
  await expect(page.getByText('Obiad w stołówce')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Obiad w stołówce')).toBeVisible();

  expect(server.headers.length).toBeGreaterThanOrEqual(2);
  expect(server.headers[0]).toMatch(/^[0-9a-f]{32}$/);
  expect(new Set(server.headers).size).toBe(1);
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
