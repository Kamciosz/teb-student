/**
 * PL: Test adresów podtoru 5b na prawdziwej bazie D1. Sprawdza odpowiedzi HTTP: dostęp (bez sesji 401, uczeń bez roli 403 przez prawdziwe sprawdzanie roli, także dla POST, który niczego nie zapisuje), próg 5 odpowiedzi (poniżej progu JSON nie ma rozkładu głosów ani treści odpowiedzi, od progu ma udziały), listę z liczbą odpowiedzi, utworzenie ankiety i jej odrzucenie przy złych danych, plik CSV z wynikami (ten sam próg: poniżej 409, od progu poprawne escapowanie i BOM).
 *     Wszystko idzie przez prawdziwą sesję i prawdziwe sprawdzanie roli podtoru 8: osoba z rolą „council” dostaje wyniki, uczeń bez roli i redakcja („editor”) dostają 403.
 * EN: Test of the subtrack 5b routes on a real D1 database. It checks the HTTP responses: access (no session 401, a student without a role 403 through the real role check, also for POST, which writes nothing), the 5-response threshold (below it the JSON has no vote distribution and no option texts, from it it has the shares), the list with the response count, creating a survey and rejecting it on bad data, and the CSV file of the results (the same threshold: below it 409, from it correct escaping and the BOM).
 *     Everything goes through a real session and the real role check of subtrack 8: a person with the "council" role gets the results, a student without a role and the editorial team ("editor") get 403.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/surveys/admin/routes.ts::surveysAdminApp
 * @uses worker/auth/index.ts::authEmailApp
 * @used_by vitest.config.ts::include
 */

import { beforeAll, describe, expect, it, vi } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (binding DB, tabele ze schematu).
// EN: The Worker test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { panelRoles } from '../../db/schema/admin';
import { user } from '../../db/schema/auth';
import { surveyOptions, surveyParticipation, surveyQuestions, surveyTextAnswers, surveys } from '../../db/schema/surveys';
// PL: Router logowania kodem z drzwi modułu auth, żeby zalogować ucznia tak jak w aplikacji.
// EN: The code sign-in router from the auth module door, to sign a student in the way the app does.
import { authEmailApp } from '../../auth';
import type { Env } from '../../shared';
import { lastDayOf, warsawToday } from './dates';
import { surveysAdminApp } from './routes';

// PL: Klient bazy testowej.
// EN: The test database client.
const db = drizzle(env.DB);

// PL: Aplikacja z routerem logowania pod adresem, pod którym stoi w Workerze.
// EN: An app with the sign-in router under the address where it stands in the Worker.
const authApp = new Hono<{ Bindings: Env }>().route('/api/auth/email', authEmailApp);

/**
 * PL: Loguje ucznia kodem z maila i zwraca ciasteczko sesji. Kod, który serwer w teście tylko wypisuje w konsoli, odczytujemy z jej wywołania.
 * EN: Signs a student in with the e-mail code and returns the session cookie. The code, which the server only prints to the console in a test, is read from that call.
 *
 * @param name - PL: nazwa ucznia, część adresu szkolnego. EN: the student name, part of the school address.
 * @param ip - PL: własny adres IP ucznia, żeby limit zapytań nie zatrzymał testu. EN: the student's own IP address, so the request limit does not stop the test.
 * @returns PL: ciasteczko w formie gotowej do nagłówka Cookie. EN: the cookie ready for the Cookie header.
 */
async function createSession(name: string, ip: string): Promise<string> {
  // PL: Wyślij kod na adres ucznia z własnym adresem IP, żeby limit zapytań nie zatrzymał testu.
  // EN: Send the code to the student's address with its own IP address, so the request limit does not stop the test.
  const email = `${name}.test@teb.edu.pl`;
  const headers = { origin: 'http://localhost', 'cf-connecting-ip': ip, 'content-type': 'application/json' };
  const call = (path: string, body: unknown) => authApp.request(`http://localhost/api/auth/email${path}`, { method: 'POST', headers, body: JSON.stringify(body) }, env);
  const printed = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  await call('/email-otp/send-verification-otp', { email });

  // PL: Odczytaj kod z wypisanej linii i zaloguj się nim.
  // EN: Read the code from the printed line and sign in with it.
  const code = /: (\d{6})$/.exec(String(printed.mock.calls.at(-1)?.[0]))?.[1] ?? '';
  printed.mockRestore();
  const response = await call('/sign-in/email-otp', { email, otp: code });
  return (response.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
}

/**
 * PL: Nadaje uczniowi rolę w panelu: znajduje go po adresie szkolnym (zalogowanie go założyło) i wpisuje rolę do bazy.
 * EN: Gives a student a panel role: finds them by the school address (signing in created them) and writes the role to the database.
 *
 * @param name - PL: nazwa ucznia, część adresu szkolnego. EN: the student name, part of the school address.
 * @param role - PL: rola do nadania. EN: the role to give.
 */
async function grantRole(name: string, role: 'editor' | 'council'): Promise<void> {
  const [student] = await db.select().from(user).where(eq(user.email, `${name}.test@teb.edu.pl`));
  await db.insert(panelRoles).values({ userId: student!.id, role, grantedAt: 1 });
}

// PL: Ciasteczko sesji osoby z rolą Samorządu, założone raz przed testami.
// EN: The session cookie of a person with the Student Council role, created once before the tests.
let councilCookie = '';

/**
 * PL: Woła router jako Samorząd: z prawdziwą sesją i prawdziwą rolą „council” z bazy (to samo sprawdzanie roli co na serwerze).
 * EN: Calls the router as the Student Council: with a real session and the real "council" role from the database (the same role check as on the server).
 *
 * @param path - PL: adres w routerze. EN: the route address.
 * @param init - PL: ustawienia zapytania. EN: the request settings.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
const asStaff = async (path: string, init: RequestInit = {}): Promise<Response> =>
  surveysAdminApp.request(path, { ...init, headers: { ...(init.headers as Record<string, string> | undefined), cookie: councilCookie } }, env);

/**
 * PL: Wkłada ankietę z jednym pytaniem i podanymi licznikami głosów (ankieta trwa do 2099).
 * EN: Inserts a survey with one question and the given vote counters (the survey runs until 2099).
 *
 * @param id - PL: numer ankiety. EN: the survey id.
 * @param votes - PL: liczniki głosów odpowiedzi w kolejności. EN: the vote counters of the options in order.
 * @param endsOn - PL: ostatni dzień ankiety. EN: the last day of the survey.
 */
async function seedSurvey(id: string, votes: number[], endsOn = '2099-12-31'): Promise<void> {
  await db.insert(surveys).values({ id, title: `Ankieta ${id}`, endsOn });
  await db.insert(surveyQuestions).values({ id: `${id}-q`, surveyId: id, position: 1, prompt: `Pytanie ${id}` });
  await db.insert(surveyOptions).values(votes.map((count, index) => ({ id: `${id}-o${index}`, questionId: `${id}-q`, position: index + 1, label: `Odpowiedź-${id}-${index}`, votes: count })));
}

// PL: Ankieta „csv” z 5 odpowiedziami (próg): pytanie z przecinkiem, cudzysłowem i nową linią, a odpowiedzi z przecinkiem i cudzysłowem.
// EN: The "csv" survey with 5 responses (the threshold): a question with a comma, a quote and a new line, and options with a comma and a quote.
const CSV_PROMPT = 'Co, "naprawdę"?\nTak';
const CSV_LABELS = ['A, B', 'C "x"', 'D', 'Nie wiem'];

/**
 * PL: Wkłada ankietę „csv” z trudnymi znakami w pytaniu i odpowiedziach. Głosy: 3, 1, 1, 0 (razem 5).
 * EN: Inserts the "csv" survey with hard characters in the question and the options. Votes: 3, 1, 1, 0 (5 in total).
 */
async function seedCsvSurvey(): Promise<void> {
  await db.insert(surveys).values({ id: 'csv', title: 'Ankieta csv', endsOn: '2099-12-31' });
  await db.insert(surveyQuestions).values({ id: 'csv-q', surveyId: 'csv', position: 1, prompt: CSV_PROMPT });
  await db.insert(surveyOptions).values([3, 1, 1, 0].map((count, index) => ({ id: `csv-o${index}`, questionId: 'csv-q', position: index + 1, label: CSV_LABELS[index]!, votes: count })));
}

/**
 * PL: Wkłada ankietę z pytaniem krótkiej odpowiedzi (z teksami) i skalą 1–5. Liczba osób bierze się z tabeli „kto wypełnił”, bo ta ankieta nie ma pytania jednokrotnego wyboru.
 * EN: Inserts a survey with a short-answer question (with the texts) and a 1–5 scale. The number of people comes from the "who filled it in" table, because this survey has no single-choice question.
 *
 * @param id - PL: numer ankiety. EN: the survey id.
 * @param texts - PL: teksty krótkiej odpowiedzi w kolejności wstawiania. EN: the short-answer texts in the insert order.
 * @param people - PL: ile osób wypełniło ankietę. EN: how many people filled the survey in.
 */
async function seedShortTextSurvey(id: string, texts: string[], people: number): Promise<void> {
  await db.insert(surveys).values({ id, title: `Ankieta ${id}`, endsOn: '2099-12-31' });
  await db.insert(surveyQuestions).values([
    { id: `${id}-tekst`, surveyId: id, position: 1, prompt: 'Co zmienić?', type: 'short_text' },
    { id: `${id}-skala`, surveyId: id, position: 2, prompt: 'Jak oceniasz?', type: 'scale_1_5' },
  ]);
  await db.insert(surveyOptions).values([1, 0, 1, 2, 1].map((count, index) => ({ id: `${id}-s${index}`, questionId: `${id}-skala`, position: index + 1, label: String(index + 1), votes: count })));
  await db.insert(surveyTextAnswers).values(texts.map((text) => ({ questionId: `${id}-tekst`, text })));
  await db.insert(surveyParticipation).values(Array.from({ length: people }, (_, index) => ({ surveyId: id, userId: `${id}-u${index}` })));
}

/**
 * PL: Podaje chwilę w formacie pola formularza (RRRR-MM-DDTHH:mm, czas polski). Czas względny do zegara, bo ankieta trwa 7 dni od dziś.
 * EN: Gives a moment in the form field format (YYYY-MM-DDTHH:mm, Polish time). The time is relative to the clock, because the survey runs 7 days from today.
 *
 * @param ms - PL: chwila w milisekundach UTC. EN: the moment in UTC milliseconds.
 * @returns PL: tekst w formacie pola. EN: the text in the field format.
 */
const warsawIn = (ms: number): string => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(ms).replace(' ', 'T');

// PL: Cztery ankiety testowe: 4 odpowiedzi (poniżej progu), 5 (próg), 12 (przykład z ekranu 6.5d) i zakończona z 21. Do CSV dochodzą: 3 odpowiedzi (poniżej progu) i 5 ze znakami, które trzeba escapować.
// EN: Four test surveys: 4 responses (below the threshold), 5 (the threshold), 12 (the example of screen 6.5d) and an ended one with 21. For the CSV there are also: 3 responses (below the threshold) and 5 with characters that need escaping.
beforeAll(async () => {
  councilCookie = await createSession('samorzad', '10.6.0.2');
  await grantRole('samorzad', 'council');
  await seedSurvey('niska', [3, 1]);
  await seedSurvey('prog', [3, 2]);
  await seedSurvey('dwanascie', [5, 4, 2, 1]);
  await seedSurvey('stara', [12, 9], '2020-01-01');
  await seedSurvey('malo', [2, 1]);
  // PL: Ankieta, której termin zamknięcia minął, choć ostatni dzień jeszcze trwa.
  // EN: A survey whose closing time has passed, although its last day still runs.
  await db.insert(surveys).values({ id: 'zamknieta', title: 'Ankieta zamknieta', endsOn: '2099-12-31', closesAt: new Date('2020-01-01T09:00:00Z') });
  await seedCsvSurvey();
  await seedShortTextSurvey('krotka4', ['Zupa'], 4);
  await seedShortTextSurvey('krotka5', ['Zupa', 'Łyżwy', 'Lody', '=1+1', 'Za drogo, "bardzo"'], 5);
  // PL: Ankieta tylko z wielokrotnym wyborem: 7 zaznaczeń od 5 osób, więc liczba osób to 5, nie 7.
  // EN: A survey with multiple choice only: 7 checked boxes from 5 people, so the number of people is 5, not 7.
  await db.insert(surveys).values({ id: 'wielokrotna', title: 'Ankieta wielokrotna', endsOn: '2099-12-31' });
  await db.insert(surveyQuestions).values({ id: 'wielokrotna-q', surveyId: 'wielokrotna', position: 1, prompt: 'Co lubisz?', type: 'multiple_choice' });
  await db.insert(surveyOptions).values([
    { id: 'wielokrotna-o0', questionId: 'wielokrotna-q', position: 1, label: 'Ryby', votes: 4 },
    { id: 'wielokrotna-o1', questionId: 'wielokrotna-q', position: 2, label: 'Psy', votes: 3 },
  ]);
  await db.insert(surveyParticipation).values(['w1', 'w2', 'w3', 'w4', 'w5'].map((userId) => ({ surveyId: 'wielokrotna', userId })));
  // PL: Ankieta z pytaniem jednokrotnym (5 osób) i wielokrotnym (9 zaznaczeń): liczba osób to 5, z pytania jednokrotnego.
  // EN: A survey with a single-choice question (5 people) and a multiple-choice one (9 checked boxes): the number of people is 5, from the single-choice question.
  await db.insert(surveys).values({ id: 'mieszana', title: 'Ankieta mieszana', endsOn: '2099-12-31' });
  await db.insert(surveyQuestions).values([
    { id: 'mieszana-q1', surveyId: 'mieszana', position: 1, prompt: 'Jednokrotnie', type: 'single_choice' },
    { id: 'mieszana-q2', surveyId: 'mieszana', position: 2, prompt: 'Wielokrotnie', type: 'multiple_choice' },
  ]);
  await db.insert(surveyOptions).values([
    { id: 'mieszana-o1', questionId: 'mieszana-q1', position: 1, label: 'Tak', votes: 3 },
    { id: 'mieszana-o2', questionId: 'mieszana-q1', position: 2, label: 'Nie', votes: 2 },
    { id: 'mieszana-o3', questionId: 'mieszana-q2', position: 1, label: 'Kawa', votes: 6 },
    { id: 'mieszana-o4', questionId: 'mieszana-q2', position: 2, label: 'Herbata', votes: 3 },
  ]);
  // PL: Krótka odpowiedź: ankieta z 4 osobami (poniżej progu) i z 5 (od progu). Odpowiedzi wpisane w kolejności od najmniej alfabetycznej, żeby sortowanie było widać.
  // EN: A short answer: a survey with 4 people (below the threshold) and one with 5 (from the threshold). The answers are inserted in an order that is not alphabetical, so the sorting shows.
  await db.insert(surveys).values([
    { id: 'krotka-niska', title: 'Ankieta krótka niska', endsOn: '2099-12-31' },
    { id: 'krotka', title: 'Ankieta krótka', endsOn: '2099-12-31' },
  ]);
  await db.insert(surveyQuestions).values([
    { id: 'krotka-niska-q', surveyId: 'krotka-niska', position: 1, prompt: 'Co zjadłeś?', type: 'short_text' },
    { id: 'krotka-q', surveyId: 'krotka', position: 1, prompt: 'Co zjadłeś?', type: 'short_text' },
  ]);
  await db.insert(surveyTextAnswers).values([
    { questionId: 'krotka-niska-q', text: 'Tajna-odpowiedz-niska' },
    { questionId: 'krotka-q', text: 'Mleko' },
    { questionId: 'krotka-q', text: 'Zupa' },
    { questionId: 'krotka-q', text: 'Arbuz' },
    { questionId: 'krotka-q', text: 'Łosoś' },
    { questionId: 'krotka-q', text: 'Lody' },
  ]);
  await db.insert(surveyParticipation).values(['k1', 'k2', 'k3', 'k4'].map((userId) => ({ surveyId: 'krotka-niska', userId })));
  await db.insert(surveyParticipation).values(['k1', 'k2', 'k3', 'k4', 'k5'].map((userId) => ({ surveyId: 'krotka', userId })));
});

describe('dostęp / access', () => {
  it.each([
    { path: '/', method: 'GET' },
    { path: '/', method: 'POST' },
    { path: '/niska/results', method: 'GET' },
    { path: '/niska/results/csv', method: 'GET' },
  ])('$method $path bez sesji daje 401 / without a session gives 401', async ({ path, method }) => {
    expect((await surveysAdminApp.request(path, { method }, env)).status).toBe(401);
  });

  it('uczeń bez roli dostaje 403 na każdym adresie, a POST niczego nie zapisuje / a student without a role gets 403 on every route, and POST writes nothing', async () => {
    const headers = { cookie: await createSession('uczen', '10.6.0.1'), 'Content-Type': 'application/json' };
    const body = JSON.stringify({ title: 'Z ucznia', questions: [{ prompt: 'P', options: ['A', 'B'] }], durationDays: 7 });

    expect((await surveysAdminApp.request('/', { headers }, env)).status).toBe(403);
    expect((await surveysAdminApp.request('/niska/results', { headers }, env)).status).toBe(403);
    expect((await surveysAdminApp.request('/niska/results/csv', { headers }, env)).status).toBe(403);
    expect((await surveysAdminApp.request('/', { method: 'POST', headers, body }, env)).status).toBe(403);
    expect(await db.select().from(surveys).where(eq(surveys.title, 'Z ucznia'))).toEqual([]);
  });
});

describe('rola redakcji / the editorial role', () => {
  it('rola „editor” nie wystarcza na ankiety, wymagany jest Samorząd / the "editor" role is not enough for surveys, the Council is required', async () => {
    const cookie = await createSession('redakcja', '10.6.0.3');
    await grantRole('redakcja', 'editor');

    expect((await surveysAdminApp.request('/', { headers: { cookie } }, env)).status).toBe(403);
    expect((await surveysAdminApp.request('/csv/results/csv', { headers: { cookie } }, env)).status).toBe(403);
  });
});

describe('próg 5 odpowiedzi / the 5-response threshold', () => {
  it('poniżej progu odpowiedź ma tylko liczbę, bez rozkładu i bez treści odpowiedzi / below the threshold the response has only the count, without the distribution and option texts', async () => {
    const response = await asStaff('/niska/results', {});
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(Object.keys(JSON.parse(text)).sort()).toEqual(['endsOn', 'id', 'minResponses', 'questionCount', 'responseCount', 'title']);
    expect(JSON.parse(text)).toMatchObject({ responseCount: 4, minResponses: 5 });
    for (const forbidden of ['questions', 'votes', 'percent', 'Odpowiedź-niska', 'Pytanie niska']) expect(text).not.toContain(forbidden);
  });

  it('dokładnie od 5 odpowiedzi pojawia się rozkład / exactly from 5 responses the distribution appears', async () => {
    const body = (await (await asStaff('/prog/results', {})).json()) as { responseCount: number; questions: { options: { votes: number; percent: number }[] }[] };

    expect(body.responseCount).toBe(5);
    expect(body.questions[0]?.options.map((option) => [option.votes, option.percent])).toEqual([[3, 60], [2, 40]]);
  });

  it('dopisanie piątej odpowiedzi do ankiety z 4 odsłania wyniki / adding a fifth response to a survey with 4 reveals the results', async () => {
    await db.update(surveyOptions).set({ votes: 2 }).where(eq(surveyOptions.id, 'niska-o1'));

    const body = (await (await asStaff('/niska/results', {})).json()) as { responseCount: number; questions?: unknown[] };
    expect(body.responseCount).toBe(5);
    expect(body.questions).toHaveLength(1);
  });

  it('przykład z ekranu 6.5d: 12 odpowiedzi daje 42, 33, 17 i 8 procent / the screen 6.5d example: 12 responses give 42, 33, 17 and 8 percent', async () => {
    const body = (await (await asStaff('/dwanascie/results', {})).json()) as { responseCount: number; questions: { prompt: string; options: { label: string; percent: number }[] }[] };

    expect(body.responseCount).toBe(12);
    expect(body.questions[0]?.options.map((option) => option.percent)).toEqual([42, 33, 17, 8]);
    expect(body.questions[0]?.options[0]?.label).toBe('Odpowiedź-dwanascie-0');
  });

  it('nieznana ankieta daje 404 / an unknown survey gives 404', async () => {
    expect((await asStaff('/nie-ma/results', {})).status).toBe(404);
  });
});

describe('wielokrotny wybór / multiple choice', () => {
  it('liczy osoby z tabeli „kto głosował”, a nie zaznaczenia, i podaje rodzaj pytania / counts people from the "who voted" table, not the checked boxes, and gives the question type', async () => {
    const body = (await (await asStaff('/wielokrotna/results', {})).json()) as { responseCount: number; questions: { type: string; options: { percent: number }[] }[] };

    expect(body.responseCount).toBe(5);
    expect(body.questions[0]?.type).toBe('multiple_choice');
    // PL: Udziały liczymy od zaznaczeń: 4 z 7 to 57 procent, 3 z 7 to 43.
    // EN: The shares are counted from the checked boxes: 4 of 7 is 57 percent, 3 of 7 is 43.
    expect(body.questions[0]?.options.map((option) => option.percent)).toEqual([57, 43]);
  });

  it('w ankiecie z pytaniem jednokrotnym liczy osoby z tego pytania, a nie z zaznaczeń w wielokrotnym / in a survey with a single-choice question it counts people from that question, not from the checked boxes of the multiple-choice one', async () => {
    const body = (await (await asStaff('/mieszana/results', {})).json()) as { responseCount: number; questions: { type: string }[] };

    expect(body.responseCount).toBe(5);
    expect(body.questions.map((question) => question.type)).toEqual(['single_choice', 'multiple_choice']);
  });
});

describe('krótka odpowiedź / short answer', () => {
  it('poniżej progu nie ma żadnej treści odpowiedzi w odpowiedzi HTTP / below the threshold there is no answer text in the HTTP response', async () => {
    const response = await asStaff('/krotka-niska/results', {});
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(JSON.parse(text)).toMatchObject({ responseCount: 4, minResponses: 5 });
    expect(text).not.toContain('Tajna-odpowiedz-niska');
    expect(text).not.toContain('texts');
  });

  it('od progu lista jest alfabetyczna, niezależna od kolejności wpisania, i bez danych autora / from the threshold the list is alphabetical, independent of the insertion order, and has no author data', async () => {
    const response = await asStaff('/krotka/results', {});
    const text = await response.text();
    const body = JSON.parse(text) as { responseCount: number; questions: unknown[] };

    expect(body.responseCount).toBe(5);
    // PL: Dokładny kształt pytania: bez identyfikatorów wierszy i bez czasu, same treści w porządku alfabetycznym.
    // EN: The exact shape of the question: no row identifiers and no time, only the texts in alphabetical order.
    expect(body.questions).toEqual([{ prompt: 'Co zjadłeś?', type: 'short_text', options: [], texts: ['Arbuz', 'Lody', 'Łosoś', 'Mleko', 'Zupa'] }]);
    for (const forbidden of ['userId', 'createdAt']) expect(text).not.toContain(`"${forbidden}"`);
  });
});

describe('lista / the list', () => {
  it('dzieli ankiety na trwające i zakończone i podaje liczbę odpowiedzi, bez liczników głosów / splits surveys into running and ended and gives the response count, without vote counters', async () => {
    const response = await asStaff('/', {});
    const text = await response.text();
    const body = JSON.parse(text) as { active: { id: string; responseCount: number; questionCount: number }[]; ended: { id: string; responseCount: number }[] };

    expect(response.status).toBe(200);
    expect(body.active.find((survey) => survey.id === 'dwanascie')).toMatchObject({ responseCount: 12, questionCount: 1 });
    expect(body.active.find((survey) => survey.id === 'wielokrotna')).toMatchObject({ responseCount: 5 });
    expect(body.ended.find((survey) => survey.id === 'stara')).toMatchObject({ responseCount: 21 });
    expect(body.ended.map((survey) => survey.id)).toContain('zamknieta');
    expect(body.active.map((survey) => survey.id)).not.toContain('zamknieta');
    expect(text).not.toContain('votes');
  });
});

describe('tworzenie ankiety / creating a survey', () => {
  /**
   * PL: Wysyła POST z ankietą jako Samorząd (prawdziwa sesja i rola).
   * EN: Sends a POST with a survey as the Student Council (the real session and role).
   *
   * @param body - PL: treść JSON. EN: the JSON body.
   * @returns PL: odpowiedź routera. EN: the router response.
   */
  const publish = (body: unknown) => asStaff('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  it('zapisuje ankietę z pytaniami i odpowiedziami, a ostatni dzień liczy serwer / writes the survey with questions and options, and the server counts the last day', async () => {
    const response = await publish({ title: '  Dzień sportu ', questions: [{ prompt: 'W co zagrać?', options: ['Siatkówka', 'Koszykówka', 'Piłka nożna'] }, { prompt: 'Kiedy?', options: ['Rano', 'Po południu'] }], durationDays: 7 });
    const { id } = (await response.json()) as { id: string };

    expect(response.status).toBe(201);
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    expect(survey).toMatchObject({ title: 'Dzień sportu', endsOn: lastDayOf(warsawToday(new Date()), 7), closesAt: null });
    const questions = await db.select().from(surveyQuestions).where(eq(surveyQuestions.surveyId, id)).orderBy(surveyQuestions.position);
    expect(questions.map((question) => question.prompt)).toEqual(['W co zagrać?', 'Kiedy?']);
    const options = await db.select().from(surveyOptions).where(eq(surveyOptions.questionId, questions[0]!.id)).orderBy(surveyOptions.position);
    expect(options.map((option) => [option.position, option.label, option.votes])).toEqual([[1, 'Siatkówka', 0], [2, 'Koszykówka', 0], [3, 'Piłka nożna', 0]]);
  });

  it.each([
    { name: 'bez tytułu', body: { title: ' ', questions: [{ prompt: 'P', options: ['A', 'B'] }], durationDays: 7 } },
    { name: 'bez pytania', body: { title: 'Zła-1', questions: [], durationDays: 7 } },
    { name: 'z jedną odpowiedzią', body: { title: 'Zła-2', questions: [{ prompt: 'P', options: ['A'] }], durationDays: 7 } },
    { name: 'z sześcioma odpowiedziami', body: { title: 'Zła-3', questions: [{ prompt: 'P', options: ['A', 'B', 'C', 'D', 'E', 'F'] }], durationDays: 7 } },
    { name: 'z czasem 5 dni', body: { title: 'Zła-4', questions: [{ prompt: 'P', options: ['A', 'B'] }], durationDays: 5 } },
    { name: 'z nieznanym typem pytania', body: { title: 'Zła-7', questions: [{ prompt: 'P', type: 'open_text', options: ['A', 'B'] }], durationDays: 7 } },
    { name: 'z terminem w przeszłości', body: { title: 'Zła-5', questions: [{ prompt: 'P', options: ['A', 'B'] }], durationDays: 7, closesAt: '2020-01-01T12:00' } },
    { name: 'z terminem po ostatnim dniu', body: { title: 'Zła-6', questions: [{ prompt: 'P', options: ['A', 'B'] }], durationDays: 7, closesAt: warsawIn(Date.now() + 30 * 86400e3) } },
  ])('ankieta $name daje 400 i nic nie zapisuje / a survey $name gives 400 and writes nothing', async ({ body }) => {
    const before = await db.select().from(surveys);

    expect((await publish(body)).status).toBe(400);
    expect(await db.select().from(surveys)).toHaveLength(before.length);
  });

  it('zapisuje typ każdego pytania, a pytanie bez typu to jednokrotny wybór / writes the type of each question, and a question without a type is single choice', async () => {
    const response = await publish({ title: 'Z typami', questions: [{ prompt: 'Wiele', type: 'multiple_choice', options: ['A', 'B'] }, { prompt: 'Jeden', options: ['A', 'B'] }], durationDays: 7 });
    const { id } = (await response.json()) as { id: string };

    expect(response.status).toBe(201);
    const questions = await db.select().from(surveyQuestions).where(eq(surveyQuestions.surveyId, id)).orderBy(surveyQuestions.position);
    expect(questions.map((question) => [question.prompt, question.type])).toEqual([['Wiele', 'multiple_choice'], ['Jeden', 'single_choice']]);
  });

  it('krótka odpowiedź zapisuje się bez odpowiedzi do wyboru, nawet gdy telefon je przysłał / a short answer is stored without options, even when the phone sent them', async () => {
    const response = await publish({ title: 'Krótka', questions: [{ prompt: 'Co zjadłeś?', type: 'short_text', options: ['A', 'B'] }], durationDays: 7 });
    const { id } = (await response.json()) as { id: string };

    expect(response.status).toBe(201);
    const [question] = await db.select().from(surveyQuestions).where(eq(surveyQuestions.surveyId, id));
    expect([question?.type, question?.prompt]).toEqual(['short_text', 'Co zjadłeś?']);
    expect(await db.select().from(surveyOptions).where(eq(surveyOptions.questionId, question!.id))).toEqual([]);
  });

  it('zapisuje termin zamknięcia jako chwilę UTC / writes the closing time as a UTC moment', async () => {
    // PL: Termin za 26 godzin, zaokrąglony do minuty, bo pole formularza nie ma sekund.
    // EN: A time 26 hours from now, rounded to the minute, because the form field has no seconds.
    const soon = Math.floor((Date.now() + 26 * 3600e3) / 60000) * 60000;
    const response = await publish({ title: 'Z terminem', questions: [{ prompt: 'P', options: ['A', 'B'] }], durationDays: 7, closesAt: warsawIn(soon) });
    const { id } = (await response.json()) as { id: string };

    expect(response.status).toBe(201);
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    expect(survey?.closesAt?.getTime()).toBe(soon);
  });

  it('treść, która nie jest JSON-em, daje 400 / a body that is not JSON gives 400', async () => {
    const response = await asStaff('/', { method: 'POST', body: 'to nie json' });

    expect(response.status).toBe(400);
  });
});

describe('wyniki jako CSV / results as CSV', () => {
  it('poniżej progu daje 409 bez treści odpowiedzi / below the threshold gives 409 without option texts', async () => {
    const response = await asStaff('/malo/results/csv', {});
    const text = await response.text();

    expect(response.status).toBe(409);
    expect(JSON.parse(text)).toEqual({ error: 'too_few_responses' });
    for (const forbidden of ['Odpowiedź-malo', 'Pytanie malo']) expect(text).not.toContain(forbidden);
  });

  it('od progu zwraca plik z BOM-em, nagłówkami i poprawnie zapisanymi polami / from the threshold returns the file with the BOM, the headers and correctly written fields', async () => {
    const response = await asStaff('/csv/results/csv', {});
    const bytes = new Uint8Array(await response.arrayBuffer());
    // PL: Pytanie z przecinkiem, cudzysłowem i nową linią idzie w cudzysłów, a wewnętrzne cudzysłowy są podwojone.
    // EN: A question with a comma, a quote and a new line goes in quotes, and the inner quotes are doubled.
    const quoted = `"Co, ""naprawdę""?\nTak"`;
    const expected = [
      '﻿Pytanie,Odpowiedź,Liczba głosów,Procent,Średnia',
      `${quoted},"A, B",3,60,`,
      `${quoted},"C ""x""",1,20,`,
      `${quoted},D,1,20,`,
      `${quoted},Nie wiem,0,0,`,
    ].join('\r\n') + '\r\n';

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="ankieta-csv-wyniki.csv"');
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    // PL: Dekodujemy z zachowaniem BOM-u, bo domyślny dekoder by go zjadł i porównanie nie pokazałoby błędu.
    // EN: We decode keeping the BOM, because the default decoder would eat it and the comparison would not show the error.
    expect(new TextDecoder('utf-8', { ignoreBOM: true, fatal: false }).decode(bytes)).toBe(expected);
  });

  it('krótka odpowiedź i skala: wiersz na tekst w kolejności alfabetycznej i średnia z przecinkiem / a short answer and a scale: a row per text in the alphabetical order and the average with a decimal comma', async () => {
    const response = await asStaff('/krotka5/results/csv', {});
    const bytes = new Uint8Array(await response.arrayBuffer());
    const text = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false }).decode(bytes);
    // PL: Kolejność jak na ekranie wyników: „Ł” po „L”, „Za” przed „Zupą”, a formuła i odpowiedź z przecinkiem zapisane bezpiecznie.
    // EN: The order as on the results screen: "Ł" after "L", "Za" before "Zupa", and the formula and the answer with a comma written safely.
    const expected = [
      '﻿Pytanie,Odpowiedź,Liczba głosów,Procent,Średnia',
      'Co zmienić?,\'=1+1,,,',
      'Co zmienić?,Lody,,,',
      'Co zmienić?,Łyżwy,,,',
      'Co zmienić?,"Za drogo, ""bardzo""",,,',
      'Co zmienić?,Zupa,,,',
      'Jak oceniasz?,1,1,20,',
      'Jak oceniasz?,2,0,0,',
      'Jak oceniasz?,3,1,20,',
      'Jak oceniasz?,4,2,40,',
      'Jak oceniasz?,5,1,20,',
      'Jak oceniasz?,Średnia,,,"3,4"',
    ].join('\r\n') + '\r\n';

    expect(response.status).toBe(200);
    expect(text).toBe(expected);
  });

  it('krótka odpowiedź poniżej progu daje 409 i nie zdradza tekstów / a short answer below the threshold gives 409 and does not reveal the texts', async () => {
    const response = await asStaff('/krotka4/results/csv', {});
    const text = await response.text();

    expect(response.status).toBe(409);
    expect(JSON.parse(text)).toEqual({ error: 'too_few_responses' });
    for (const forbidden of ['Zupa', 'Co zmienić?', 'Jak oceniasz?']) expect(text).not.toContain(forbidden);
  });

  it('nieznana ankieta daje 404 / an unknown survey gives 404', async () => {
    expect((await asStaff('/nie-ma/results/csv', {})).status).toBe(404);
  });
});
