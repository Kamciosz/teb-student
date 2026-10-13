/**
 * PL: Test ekranów ankiet w panelu (podtor 5b) na atrapie serwera: lista z liczbą odpowiedzi, tworzenie ankiety (błędy pól, limity od 2 do 5 odpowiedzi, czas trwania, wysłanie, błąd zapisu), wyniki poniżej progu (tylko liczba) i od progu (udziały), brak roli (bramka podtoru 8), widok bez internetu i szerokość 320 px.
 *     Ekrany sprawdzamy na atrapie (page.route), bo prawdziwa sesja z rolą wymaga logowania kodem z maila. Jeden test odpytuje prawdziwy serwer i sprawdza, że bez sesji odpowiada 401 i nic nie zdradza. Próg 5 odpowiedzi, role i walidację sprawdzają testy serwera na prawdziwej D1 (worker/surveys/admin/routes.test.ts).
 * EN: Test of the survey panel screens (subtrack 5b) against a mock server: the list with the response count, creating a survey (field errors, the 2 to 5 option limits, the duration, sending, a write error), results below the threshold (the count only) and from it (shares), no role (the subtrack 8 gate), the offline view and the 320 px width.
 *     The screens are checked against a mock (page.route), because a real session with a role needs signing in with an e-mail code. One test queries the real server and checks that without a session it answers 401 and reveals nothing. The 5-response threshold, the roles and the validation are checked by the server tests on a real D1 (worker/surveys/admin/routes.test.ts).
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/SurveysAdminScreen.tsx::SurveysAdminScreen
 * @used_by playwright.config.ts::testDir
 */

import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

// PL: Lista z makiety 6.5a: ankieta z 3 odpowiedziami (wyniki jeszcze ukryte), ankieta z 12 i zakończona z 21.
// EN: The list from mockup 6.5a: a survey with 3 responses (results still hidden), one with 12 and an ended one with 21.
// PL: Pierwsza ankieta ma termin zamknięcia 15.10 o 12:00 (czas polski), a „wybor-klasy” zamknięta przez termin przed końcem dnia.
// EN: The first survey has a closing time of 15.10 at 12:00 (Polish time), and "wybor-klasy" was closed by its time before the last day.
const LIST = {
  active: [
    { id: 'dodatkowe', title: 'Zajęcia dodatkowe w II semestrze', questionCount: 3, endsOn: '2026-10-15', responseCount: 3, closesAt: Date.parse('2026-10-15T10:00:00Z') },
    { id: 'stolowka', title: 'Obiad w stołówce', questionCount: 1, endsOn: '2026-10-18', responseCount: 12, closesAt: null },
  ],
  ended: [
    { id: 'wybor-klasy', title: 'Wybór klasy na wycieczkę', questionCount: 2, endsOn: '2026-10-20', responseCount: 9, closesAt: Date.parse('2026-10-10T08:00:00Z') },
    { id: 'dzwonki', title: 'Plan dzwonków', questionCount: 1, endsOn: '2026-09-30', responseCount: 21, closesAt: null },
  ],
};

// PL: Termin zamknięcia za dwa dni o 12:00 czasu polskiego: zawsze w przyszłości i w 7-dniowym oknie ankiety.
// EN: A closing time two days from now at 12:00 Polish time: always in the future and inside the 7-day window of the survey.
function closingSoonWarsaw(): string {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.now() + 2 * 86_400_000));
  return `${day}T12:00`;
}

// PL: Wyniki z makiety 6.5d: dwa pytania, pierwsze z udziałami 42, 33, 17 i 8 procent.
// EN: The results from mockup 6.5d: two questions, the first with shares of 42, 33, 17 and 8 percent.
const FULL_RESULTS = {
  id: 'stolowka', title: 'Obiad w stołówce', endsOn: '2026-10-18', questionCount: 2, responseCount: 12, minResponses: 5,
  questions: [
    { prompt: 'Jak oceniasz obiady w stołówce?', type: 'single_choice', options: [{ label: 'Dobrze', votes: 5, percent: 42 }, { label: 'Różnie', votes: 4, percent: 33 }, { label: 'Słabo', votes: 2, percent: 17 }, { label: 'Nie jadam w stołówce', votes: 1, percent: 8 }] },
    { prompt: 'Co poprawić?', type: 'single_choice', options: [{ label: 'Porcje', votes: 7, percent: 58 }, { label: 'Smak', votes: 5, percent: 42 }] },
  ],
};

// PL: Wyniki ankiety z wielokrotnym wyborem: 5 odpowiedzi i 4 zaznaczenia (3 i 1), udziały liczone od zaznaczeń.
// EN: The results of a multiple choice survey: 5 responses and 4 checked boxes (3 and 1), the shares counted from the checks.
const MULTI_RESULTS = {
  id: 'wielokrotna', title: 'Wybory klasowe', endsOn: '2026-10-18', questionCount: 1, responseCount: 5, minResponses: 5,
  questions: [
    { prompt: 'Co lubisz jeść?', type: 'multiple_choice', options: [{ label: 'Pizzę', votes: 3, percent: 75 }, { label: 'Sałatkę', votes: 1, percent: 25 }] },
  ],
};

// PL: Plik CSV z wynikami ankiety „stolowka”: nagłówek, wiersz na każdą odpowiedź, BOM na początku i CRLF na końcu wierszy.
// EN: The CSV file with the results of the "stolowka" survey: the header, a row for every option, the BOM at the start and CRLF at the end of rows.
const FULL_CSV = '\uFEFFPytanie,Odpowiedź,Liczba głosów,Procent,Średnia\r\n' + [
  'Jak oceniasz obiady w stołówce?,Dobrze,5,42,',
  'Jak oceniasz obiady w stołówce?,Różnie,4,33,',
  'Jak oceniasz obiady w stołówce?,Słabo,2,17,',
  'Jak oceniasz obiady w stołówce?,Nie jadam w stołówce,1,8,',
  'Co poprawić?,Porcje,7,58,',
  'Co poprawić?,Smak,5,42,',
].join('\r\n') + '\r\n';

// PL: Wyniki ankiety z 3 odpowiedziami: serwer nie wysyła rozkładu (makieta 6.5c).
// EN: The results of a survey with 3 responses: the server sends no distribution (mockup 6.5c).
const FEW_RESULTS = { id: 'dodatkowe', title: 'Zajęcia dodatkowe w II semestrze', endsOn: '2026-10-15', questionCount: 3, responseCount: 3, minResponses: 5 };

// PL: Ustawienia atrapy: rola ucznia (odpowiedź bramki panelu), kod odpowiedzi serwera dla listy i dla zapisu oraz treści wysłane przez telefon.
// EN: The mock settings: the student's role (the panel gate answer), the server response status for the list and for the write, and the bodies the phone sent.
type Mock = { level: 'editor' | 'council' | null; listStatus: number; publishStatus: number; posted: unknown[] };

/**
 * PL: Podłącza atrapę serwera ankiet w panelu pod /api/surveys/admin.
 * EN: Attaches the mock survey panel server under /api/surveys/admin.
 *
 * @param page - PL: strona testu. EN: the test page.
 * @param overrides - PL: zmienione ustawienia atrapy. EN: the changed mock settings.
 * @returns PL: stan atrapy do sprawdzenia w teście. EN: the mock state to check in the test.
 */
// PL: Wyniki krótkiej odpowiedzi: 5 odpowiedzi, treści w kolejności alfabetycznej (tak wysyła serwer), bez autorów.
// EN: The results of a short answer: 5 responses, the texts in alphabetical order (as the server sends them), without authors.
const SHORT_RESULTS = {
  id: 'krotka', title: 'Co zjadłeś?', endsOn: '2026-10-18', questionCount: 1, responseCount: 5, minResponses: 5,
  questions: [{ prompt: 'Co zjadłeś?', type: 'short_text', options: [], texts: ['Arbuz', 'Lody', 'Łosoś', 'Mleko', 'Zupa'] }],
};

async function mockPanelServer(page: Page, overrides: Partial<Mock> = {}): Promise<Mock> {
  const mock: Mock = { level: 'council', listStatus: 200, publishStatus: 201, posted: [], ...overrides };
  // PL: Bramka roli podtoru 8 pyta o rolę ucznia pod /api/admin/me.
  // EN: The role gate of subtrack 8 asks for the student's role under /api/admin/me.
  await page.route('**/api/admin/me', (route) => route.fulfill({ json: { level: mock.level } }));
  await page.route('**/api/surveys/admin/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api/surveys/admin', '');
    if (request.method() === 'POST') {
      mock.posted.push(request.postDataJSON());
      return route.fulfill({ status: mock.publishStatus, json: { id: 'nowa' } });
    }
    if (mock.listStatus !== 200) return route.fulfill({ status: mock.listStatus, json: { error: 'server_error' } });
    if (path === '/stolowka/results') return route.fulfill({ json: FULL_RESULTS });
    if (path === '/stolowka/results/csv') return route.fulfill({ headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="ankieta-stolowka-wyniki.csv"' }, body: FULL_CSV });
    if (path === '/dodatkowe/results') return route.fulfill({ json: FEW_RESULTS });
    if (path === '/wielokrotna/results') return route.fulfill({ json: MULTI_RESULTS });
    if (path === '/krotka/results') return route.fulfill({ json: SHORT_RESULTS });
    return route.fulfill({ json: LIST });
  });
  return mock;
}

// PL: Lista z makiety 6.5a.
// EN: The list from mockup 6.5a.
test('lista pokazuje ankiety z liczbą odpowiedzi i przycisk „Nowa ankieta” / the list shows surveys with the response count and the "Nowa ankieta" button', async ({ page }) => {
  await mockPanelServer(page);
  await page.goto('/surveys/admin');

  await expect(page.getByRole('heading', { name: 'Ankiety', level: 1 })).toBeVisible();
  await expect(page.getByText('3 pytania · do 15.10, 12:00')).toBeVisible();
  await expect(page.getByText('Wyniki zobaczysz od 5 odpowiedzi. Teraz: 3.')).toBeVisible();
  await expect(page.getByText('1 pytanie · do 18.10')).toBeVisible();
  await expect(page.getByText('12 odpowiedzi', { exact: true })).toBeVisible();
  await expect(page.getByText('Zamknięta · 9 odpowiedzi')).toBeVisible();
  await expect(page.getByText('Zakończona 30.09 · 21 odpowiedzi')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Nowa ankieta' })).toBeVisible();
});

// PL: Pusta lista z makiety 6.5a.
// EN: The empty list from mockup 6.5a.
test('pusta lista pokazuje podpowiedź / an empty list shows the hint', async ({ page }) => {
  // PL: Bramka roli podtoru 8 najpierw pyta o rolę ucznia, więc atrapa odpowiada także na /api/admin/me.
  // EN: The role gate of subtrack 8 asks for the student's role first, so the mock answers /api/admin/me too.
  await page.route('**/api/admin/me', (route) => route.fulfill({ json: { level: 'council' } }));
  await page.route('**/api/surveys/admin/**', (route) => route.fulfill({ json: { active: [], ended: [] } }));
  await page.goto('/surveys/admin');

  await expect(page.getByRole('heading', { name: 'Nie ma jeszcze ankiet' })).toBeVisible();
  await expect(page.getByText('Dotknij „Nowa ankieta”, żeby zadać pierwsze pytanie.')).toBeVisible();
});

// PL: Bez internetu: lista zostaje, przycisk jest nieaktywny, a nad nim notatka z EKRANY.md.
// EN: Without internet: the list stays, the button is inactive, and the note from EKRANY.md sits above it.
test('bez internetu lista zostaje, a „Nowa ankieta” jest nieaktywna / without internet the list stays and "Nowa ankieta" is inactive', async ({ page, context }) => {
  await mockPanelServer(page);
  await page.goto('/surveys/admin');
  await expect(page.getByText('Obiad w stołówce')).toBeVisible();
  // PL: Lista naprawdę trafia do localStorage telefonu (klucz z src/shared/query/queryClient.ts), więc jest z czego ją pokazać bez sieci.
  // EN: The list really lands in the phone's localStorage (the key from src/shared/query/queryClient.ts), so there is something to show it from without a network.
  await expect.poll(() => page.evaluate(() => localStorage.getItem('teb-student-query-cache') ?? '')).toContain('Obiad w stołówce');

  await context.setOffline(true);

  await expect(page.getByText('Nowa ankieta wymaga internetu.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nowa ankieta' })).toBeDisabled();
  await expect(page.getByText('Obiad w stołówce')).toBeVisible();
  await context.setOffline(false);
  await expect(page.getByRole('link', { name: 'Nowa ankieta' })).toBeVisible();
});

// PL: Błąd serwera daje komunikat, a nie biały ekran (część 7 planu).
// EN: A server error gives a message, not a blank screen (plan part 7).
test('błąd pobrania pokazuje komunikat na liście i w wynikach / a fetch error shows a message on the list and in the results', async ({ page }) => {
  await mockPanelServer(page, { listStatus: 500 });

  await page.goto('/surveys/admin');
  await expect(page.getByText('Nie udało się pobrać ankiet. Spróbuj ponownie za chwilę.')).toBeVisible();
  await page.goto('/surveys/admin/stolowka');
  await expect(page.getByText('Nie udało się pobrać wyników. Spróbuj ponownie za chwilę.')).toBeVisible();
});

// PL: Uczeń bez roli i redakcja (rola „editor”) widzą ekran 6.1d z bramki podtoru 8, a nie listę ankiet.
// EN: A student without a role and the editorial team ("editor" role) see screen 6.1d from the subtrack 8 gate, not the survey list.
for (const level of [null, 'editor'] as const) {
  test(`rola ${String(level)} widzi „Tylko dla Samorządu” / role ${String(level)} sees "Tylko dla Samorządu"`, async ({ page }) => {
    await mockPanelServer(page, { level });
    await page.goto('/surveys/admin');

    await expect(page.getByRole('heading', { name: 'Tylko dla Samorządu' })).toBeVisible();
    await expect(page.getByText('Ten panel jest dla Samorządu i redakcji gazetki. Jeśli to pomyłka, zgłoś ją Samorządowi.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ankiety', level: 1 })).toHaveCount(0);
  });
}

// PL: Formularz: błędy pól, limity odpowiedzi, czas trwania i wysłanie.
// EN: The form: field errors, option limits, the duration and sending.
test('nowa ankieta: błędy, limity od 2 do 5 odpowiedzi i wysłanie / a new survey: errors, 2 to 5 option limits and sending', async ({ page }) => {
  const mock = await mockPanelServer(page);
  await page.goto('/surveys/admin/new');

  // PL: Pusty formularz: trzy błędy z EKRANY.md, nic nie idzie na serwer.
  // EN: The empty form: three errors from EKRANY.md, nothing goes to the server.
  await page.getByRole('button', { name: 'Opublikuj ankietę' }).click();
  await expect(page.getByText('Wpisz tytuł ankiety.')).toBeVisible();
  await expect(page.getByText('Wpisz pytanie.')).toBeVisible();
  await expect(page.getByText('Dodaj co najmniej dwie odpowiedzi.')).toBeVisible();
  expect(mock.posted).toHaveLength(0);

  // PL: Przy dwóch odpowiedziach „x” jest nieaktywny, a przy pięciu nieaktywny jest „Dodaj odpowiedź”.
  // EN: With two options "x" is inactive, and with five "Dodaj odpowiedź" is inactive.
  await expect(page.getByRole('button', { name: 'Usuń odpowiedź A' })).toBeDisabled();
  for (let count = 0; count < 3; count += 1) await page.getByRole('button', { name: 'Dodaj odpowiedź' }).click();
  await expect(page.getByRole('button', { name: 'Dodaj odpowiedź' })).toBeDisabled();
  await page.getByRole('button', { name: 'Usuń odpowiedź E' }).click();
  await expect(page.getByLabel('Odpowiedź E', { exact: true })).toHaveCount(0);

  // PL: Wypełnij, wybierz 14 dni (podpis z ostatnim dniem) i opublikuj. Pusta odpowiedź D nie idzie na serwer.
  // EN: Fill in, choose 14 days (the caption with the last day) and publish. The blank option D does not go to the server.
  await page.getByLabel('Tytuł ankiety', { exact: true }).fill('Dzień sportu');
  await page.getByLabel('Pytanie 1', { exact: true }).fill('W co chcesz zagrać na dniu sportu?');
  await page.getByLabel('Odpowiedź A', { exact: true }).fill('Siatkówka');
  await page.getByLabel('Odpowiedź B', { exact: true }).fill('Koszykówka');
  await page.getByLabel('Odpowiedź C', { exact: true }).fill('Piłka nożna');
  await page.getByText('14 dni').click();
  await expect(page.getByText(/^Ostatni dzień: \d{1,2}\.\d{2}\.\d{4}\. Po publikacji pytań nie zmienisz\.$/)).toBeVisible();
  await page.getByRole('button', { name: 'Opublikuj ankietę' }).click();

  await expect(page).toHaveURL(/\/surveys\/admin$/);
  expect(mock.posted).toEqual([{ title: 'Dzień sportu', durationDays: 14, questions: [{ prompt: 'W co chcesz zagrać na dniu sportu?', type: 'single_choice', options: ['Siatkówka', 'Koszykówka', 'Piłka nożna'] }], closesAt: null }]);
});

// PL: Termin zamknięcia: przeszłość daje błąd i nic nie idzie na serwer, a przyszły termin trafia do zapisu.
// EN: The closing time: the past gives an error and nothing goes to the server, and a future time goes into the write.
test('termin zamknięcia: przeszłość daje błąd, przyszłość idzie na serwer / closing time: the past gives an error, the future goes to the server', async ({ page }) => {
  const mock = await mockPanelServer(page);
  await page.goto('/surveys/admin/new');
  await page.getByLabel('Tytuł ankiety', { exact: true }).fill('Wycieczka');
  await page.getByLabel('Pytanie 1', { exact: true }).fill('Dokąd jedziemy?');
  await page.getByLabel('Odpowiedź A', { exact: true }).fill('Muzeum');
  await page.getByLabel('Odpowiedź B', { exact: true }).fill('Zoo');

  // PL: Termin z 2020 roku jest na pewno w przeszłości, więc test nie zależy od dzisiejszej daty.
  // EN: A time from 2020 is surely in the past, so the test does not depend on today's date.
  await page.getByLabel('Zamknij ankietę (data i godzina)', { exact: true }).fill('2020-01-01T09:00');
  await page.getByRole('button', { name: 'Opublikuj ankietę' }).click();
  await expect(page.getByText('Termin musi być w przyszłości.')).toBeVisible();
  expect(mock.posted).toHaveLength(0);

  const closing = closingSoonWarsaw();
  await page.getByLabel('Zamknij ankietę (data i godzina)', { exact: true }).fill(closing);
  await expect(page.getByText('Termin musi być w przyszłości.')).toHaveCount(0);
  await page.getByRole('button', { name: 'Opublikuj ankietę' }).click();

  await expect(page).toHaveURL(/\/surveys\/admin$/);
  expect(mock.posted).toEqual([{ title: 'Wycieczka', durationDays: 7, questions: [{ prompt: 'Dokąd jedziemy?', type: 'single_choice', options: ['Muzeum', 'Zoo'] }], closesAt: closing }]);
});

// PL: Wybór „Wiele wyborów” przy pytaniu idzie na serwer jako multiple_choice, a domyślnie pytanie to „Jeden wybór”.
// EN: Choosing "Wiele wyborów" for a question sends multiple_choice to the server, and by default a question is "Jeden wybór".
test('rodzaj pytania „Wiele wyborów” idzie na serwer / the question type "Wiele wyborów" goes to the server', async ({ page }) => {
  const mock = await mockPanelServer(page);
  await page.goto('/surveys/admin/new');
  await page.getByLabel('Tytuł ankiety', { exact: true }).fill('Wybory klasowe');
  await page.getByLabel('Pytanie 1', { exact: true }).fill('Co lubisz jeść?');
  await page.getByLabel('Odpowiedź A', { exact: true }).fill('Pizzę');
  await page.getByLabel('Odpowiedź B', { exact: true }).fill('Sałatkę');
  await expect(page.getByRole('radio', { name: 'Jeden wybór' })).toBeChecked();

  await page.getByText('Wiele wyborów', { exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Wiele wyborów' })).toBeChecked();
  await page.getByRole('button', { name: 'Opublikuj ankietę' }).click();

  await expect(page).toHaveURL(/\/surveys\/admin$/);
  expect(mock.posted).toEqual([{ title: 'Wybory klasowe', durationDays: 7, questions: [{ prompt: 'Co lubisz jeść?', type: 'multiple_choice', options: ['Pizzę', 'Sałatkę'] }], closesAt: null }]);
});

// PL: Skala 1–5 nie pokazuje pól odpowiedzi, a panel sam wysyła odpowiedzi „1”…„5”.
// EN: The 1–5 scale shows no option fields, and the panel sends the options "1"…"5" itself.
test('skala 1–5 idzie na serwer z odpowiedziami 1…5 / the 1–5 scale goes to the server with the options 1…5', async ({ page }) => {
  const mock = await mockPanelServer(page);
  await page.goto('/surveys/admin/new');
  await page.getByLabel('Tytuł ankiety', { exact: true }).fill('Ocena stołówki');
  await page.getByLabel('Pytanie 1', { exact: true }).fill('Jak oceniasz obiady?');

  await page.getByText('Skala 1–5', { exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Skala 1–5' })).toBeChecked();
  await expect(page.getByLabel('Odpowiedź A', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Dodaj odpowiedź' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Opublikuj ankietę' }).click();

  await expect(page).toHaveURL(/\/surveys\/admin$/);
  expect(mock.posted).toEqual([{ title: 'Ocena stołówki', durationDays: 7, questions: [{ prompt: 'Jak oceniasz obiady?', type: 'scale_1_5', options: ['1', '2', '3', '4', '5'] }], closesAt: null }]);
});

// PL: Krótka odpowiedź nie pokazuje pól odpowiedzi, a panel wysyła pustą listę odpowiedzi.
// EN: The short answer shows no option fields, and the panel sends an empty list of options.
test('krótka odpowiedź idzie na serwer bez odpowiedzi / the short answer goes to the server without options', async ({ page }) => {
  const mock = await mockPanelServer(page);
  await page.goto('/surveys/admin/new');
  await page.getByLabel('Tytuł ankiety', { exact: true }).fill('Co zjadłeś?');
  await page.getByLabel('Pytanie 1', { exact: true }).fill('Co zjadłeś na obiad?');

  await page.getByText('Krótka odpowiedź', { exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Krótka odpowiedź' })).toBeChecked();
  await expect(page.getByLabel('Odpowiedź A', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Dodaj odpowiedź' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Opublikuj ankietę' }).click();

  await expect(page).toHaveURL(/\/surveys\/admin$/);
  expect(mock.posted).toEqual([{ title: 'Co zjadłeś?', durationDays: 7, questions: [{ prompt: 'Co zjadłeś na obiad?', type: 'short_text', options: [] }], closesAt: null }]);
});

// PL: Błąd zapisu: komunikat nad przyciskiem, a przycisk zostaje aktywny, żeby ponowić.
// EN: A write error: the message above the button, and the button stays active to retry.
test('błąd zapisu pokazuje komunikat, a przycisk zostaje aktywny / a write error shows the message and the button stays active', async ({ page }) => {
  await mockPanelServer(page, { publishStatus: 500 });
  await page.goto('/surveys/admin/new');
  await page.getByLabel('Tytuł ankiety', { exact: true }).fill('Dzień sportu');
  await page.getByLabel('Pytanie 1', { exact: true }).fill('W co zagrać?');
  await page.getByLabel('Odpowiedź A', { exact: true }).fill('Siatkówka');
  await page.getByLabel('Odpowiedź B', { exact: true }).fill('Koszykówka');
  await page.getByRole('button', { name: 'Opublikuj ankietę' }).click();

  await expect(page.getByText('Nie udało się opublikować ankiety. Spróbuj ponownie za chwilę.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Opublikuj ankietę' })).toBeEnabled();
});

// PL: Bez internetu przycisk publikacji jest nieaktywny.
// EN: Without internet the publish button is inactive.
test('bez internetu „Opublikuj ankietę” jest nieaktywne / without internet "Opublikuj ankietę" is inactive', async ({ page, context }) => {
  await mockPanelServer(page);
  await page.goto('/surveys/admin/new');
  // PL: Najpierw czekamy na formularz (rola ucznia wczytana), dopiero potem wyłączamy sieć.
  // EN: First we wait for the form (the student's role loaded), and only then switch the network off.
  await expect(page.getByRole('button', { name: 'Opublikuj ankietę' })).toBeEnabled();

  await context.setOffline(true);

  await expect(page.getByRole('button', { name: 'Opublikuj ankietę' })).toBeDisabled();
  await context.setOffline(false);
});

// PL: Wyniki poniżej progu z makiety 6.5c: tylko liczba, bez żadnej odpowiedzi.
// EN: The results below the threshold from mockup 6.5c: the count only, without any option.
test('wyniki poniżej 5 odpowiedzi pokazują tylko liczbę / results below 5 responses show only the count', async ({ page }) => {
  await mockPanelServer(page);
  await page.goto('/surveys/admin/dodatkowe');

  await expect(page.getByRole('heading', { name: 'Wyniki zobaczysz od 5 odpowiedzi. Teraz: 3.' })).toBeVisible();
  await expect(page.getByText('z 5 odpowiedzi', { exact: true })).toBeVisible();
  await expect(page.getByText('Przy mniejszej liczbie łatwo rozpoznać, kto głosował.')).toBeVisible();
  await expect(page.getByText('%')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Pobierz CSV' })).toHaveCount(0);
});

// PL: Wyniki od progu z makiety 6.5d i przełączanie pytań.
// EN: The results from the threshold from mockup 6.5d and switching questions.
test('wyniki od 5 odpowiedzi: udziały i „Następne pytanie” / results from 5 responses: shares and "Następne pytanie"', async ({ page }) => {
  await mockPanelServer(page);
  await page.goto('/surveys/admin/stolowka');

  await expect(page.getByText('12 odpowiedzi · do 18.10')).toBeVisible();
  await expect(page.getByText('Jak oceniasz obiady w stołówce?')).toBeVisible();
  for (const share of ['5 · 42%', '4 · 33%', '2 · 17%', '1 · 8%']) await expect(page.getByText(share, { exact: true })).toBeVisible();
  await expect(page.getByText('Wyniki są zbiorcze. Nie widać, kto co wybrał.')).toBeVisible();

  await page.getByRole('button', { name: 'Następne pytanie' }).click();
  await expect(page.getByText('Pytanie 2')).toBeVisible();
  await expect(page.getByText('7 · 58%', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Następne pytanie' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Wstecz' }).click();
  await expect(page.getByText('Pytanie 1')).toBeVisible();
});

// PL: Wyniki wielokrotnego wyboru: liczba zaznaczeń i dopisek, że uczeń mógł zaznaczyć kilka odpowiedzi.
// EN: The multiple choice results: the number of checked boxes and the note that the student could check several options.
test('wyniki wielokrotnego wyboru pokazują zaznaczenia i dopisek / multiple choice results show the checks and the note', async ({ page }) => {
  await mockPanelServer(page);
  await page.goto('/surveys/admin/wielokrotna');

  await expect(page.getByText('Co lubisz jeść?')).toBeVisible();
  await expect(page.getByText('Zaznaczeń: 4', { exact: true })).toBeVisible();
  await expect(page.getByText('Uczeń mógł zaznaczyć kilka odpowiedzi.')).toBeVisible();
  for (const share of ['3 · 75%', '1 · 25%']) await expect(page.getByText(share, { exact: true })).toBeVisible();
});

// PL: Krótka odpowiedź od progu pokazuje listę treści w porządku alfabetycznym, bez udziałów i z dopiskiem.
// EN: The short answer from the threshold shows the list of texts in alphabetical order, without shares, and with the note.
test('wyniki krótkiej odpowiedzi pokazują treści alfabetycznie / short answer results show the texts alphabetically', async ({ page }) => {
  await mockPanelServer(page);
  await page.goto('/surveys/admin/krotka');

  await expect(page.getByText('Co zjadłeś?').first()).toBeVisible();
  await expect(page.getByText('Odpowiedzi są w kolejności alfabetycznej. Nie widać, kto je napisał.')).toBeVisible();
  const items = await page.locator('ul.sa-results li').allTextContents();
  expect(items).toEqual(['Arbuz', 'Lody', 'Łosoś', 'Mleko', 'Zupa']);
  await expect(page.getByText('%')).toHaveCount(0);
});

// PL: „Pobierz CSV” zapisuje plik z nazwą z serwera i treścią z BOM-em.
// EN: "Pobierz CSV" saves the file with the name from the server and the content with the BOM.
test('„Pobierz CSV” zapisuje plik z wynikami / "Pobierz CSV" saves the file with the results', async ({ page }) => {
  await mockPanelServer(page);
  await page.goto('/surveys/admin/stolowka');
  await expect(page.getByText('Jak oceniasz obiady w stołówce?')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Pobierz CSV' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('ankieta-stolowka-wyniki.csv');
  expect(await readFile((await download.path())!, 'utf8')).toBe(FULL_CSV);
});

// PL: Bez internetu „Pobierz CSV” jest nieaktywne, a obok stoi notatka. Wyniki zostają na ekranie.
// EN: Without internet "Pobierz CSV" is inactive, with a note beside it. The results stay on the screen.
test('bez internetu „Pobierz CSV” jest nieaktywne / without internet "Pobierz CSV" is inactive', async ({ page, context }) => {
  await mockPanelServer(page);
  await page.goto('/surveys/admin/stolowka');
  await expect(page.getByRole('button', { name: 'Pobierz CSV' })).toBeEnabled();

  await context.setOffline(true);

  await expect(page.getByText('Pobranie wymaga internetu.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pobierz CSV' })).toBeDisabled();
  await expect(page.getByText('Jak oceniasz obiady w stołówce?')).toBeVisible();
  await context.setOffline(false);
});

// PL: Prawdziwy serwer z bazą D1: bez sesji każdy adres panelu ankiet odpowiada 401 i nie oddaje żadnych danych.
// EN: The real server with the D1 database: without a session every survey panel route answers 401 and returns no data.
test('prawdziwy serwer: bez sesji 401 na każdym adresie / the real server: 401 on every route without a session', async ({ request }) => {
  const responses = [await request.get('/api/surveys/admin'), await request.get('/api/surveys/admin/dodatkowe/results'), await request.get('/api/surveys/admin/dodatkowe/results/csv'), await request.post('/api/surveys/admin', { data: {} })];
  for (const response of responses) {
    expect(response.status()).toBe(401);
    expect(await response.text()).not.toContain('Zajęcia dodatkowe');
  }
});

// PL: Telefon o szerokości 320 px: żaden ekran nie przewija się w bok, a przycisk jest w całości na ekranie.
// EN: A 320 px wide phone: no screen scrolls sideways, and the button is fully on screen.
test('przy 320 px nic nie wystaje poza ekran / at 320 px nothing sticks out of the screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await mockPanelServer(page);
  const screens = [
    { path: '/surveys/admin', ready: 'Obiad w stołówce' },
    { path: '/surveys/admin/new', ready: 'Czas trwania' },
    { path: '/surveys/admin/dodatkowe', ready: 'z 5 odpowiedzi' },
    { path: '/surveys/admin/stolowka', ready: 'Jak oceniasz obiady w stołówce?' },
  ];
  for (const { path, ready } of screens) {
    await page.goto(path);
    await expect(page.getByText(ready, { exact: true })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBe(0);
  }
  await page.goto('/surveys/admin/new');
  const box = await page.getByRole('button', { name: 'Opublikuj ankietę' }).boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 320).toBe(true);
});
