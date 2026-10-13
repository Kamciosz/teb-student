/**
 * PL: Test adresów podtoru 5b na prawdziwej bazie D1. Sprawdza odpowiedzi HTTP: dostęp (bez sesji 401, uczeń bez roli 403 przez prawdziwe sprawdzanie roli, także dla POST, który niczego nie zapisuje), próg 5 odpowiedzi (poniżej progu JSON nie ma rozkładu głosów ani treści odpowiedzi, od progu ma udziały), listę z liczbą odpowiedzi, utworzenie ankiety i jej odrzucenie przy złych danych.
 *     Wszystko idzie przez prawdziwą sesję i prawdziwe sprawdzanie roli podtoru 8: osoba z rolą „council” dostaje wyniki, uczeń bez roli i redakcja („editor”) dostają 403.
 * EN: Test of the subtrack 5b routes on a real D1 database. It checks the HTTP responses: access (no session 401, a student without a role 403 through the real role check, also for POST, which writes nothing), the 5-response threshold (below it the JSON has no vote distribution and no option texts, from it it has the shares), the list with the response count, creating a survey and rejecting it on bad data.
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
import { surveyOptions, surveyQuestions, surveys } from '../../db/schema/surveys';
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

// PL: Cztery ankiety testowe: 4 odpowiedzi (poniżej progu), 5 (próg), 12 (przykład z ekranu 6.5d) i zakończona z 21.
// EN: Four test surveys: 4 responses (below the threshold), 5 (the threshold), 12 (the example of screen 6.5d) and an ended one with 21.
beforeAll(async () => {
  councilCookie = await createSession('samorzad', '10.6.0.2');
  await grantRole('samorzad', 'council');
  await seedSurvey('niska', [3, 1]);
  await seedSurvey('prog', [3, 2]);
  await seedSurvey('dwanascie', [5, 4, 2, 1]);
  await seedSurvey('stara', [12, 9], '2020-01-01');
});

describe('dostęp / access', () => {
  it.each([
    { path: '/', method: 'GET' },
    { path: '/', method: 'POST' },
    { path: '/niska/results', method: 'GET' },
  ])('$method $path bez sesji daje 401 / without a session gives 401', async ({ path, method }) => {
    expect((await surveysAdminApp.request(path, { method }, env)).status).toBe(401);
  });

  it('uczeń bez roli dostaje 403 na każdym adresie, a POST niczego nie zapisuje / a student without a role gets 403 on every route, and POST writes nothing', async () => {
    const headers = { cookie: await createSession('uczen', '10.6.0.1'), 'Content-Type': 'application/json' };
    const body = JSON.stringify({ title: 'Z ucznia', questions: [{ prompt: 'P', options: ['A', 'B'] }], durationDays: 7 });

    expect((await surveysAdminApp.request('/', { headers }, env)).status).toBe(403);
    expect((await surveysAdminApp.request('/niska/results', { headers }, env)).status).toBe(403);
    expect((await surveysAdminApp.request('/', { method: 'POST', headers, body }, env)).status).toBe(403);
    expect(await db.select().from(surveys).where(eq(surveys.title, 'Z ucznia'))).toEqual([]);
  });
});

describe('rola redakcji / the editorial role', () => {
  it('rola „editor” nie wystarcza na ankiety, wymagany jest Samorząd / the "editor" role is not enough for surveys, the Council is required', async () => {
    const cookie = await createSession('redakcja', '10.6.0.3');
    await grantRole('redakcja', 'editor');

    expect((await surveysAdminApp.request('/', { headers: { cookie } }, env)).status).toBe(403);
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

describe('lista / the list', () => {
  it('dzieli ankiety na trwające i zakończone i podaje liczbę odpowiedzi, bez liczników głosów / splits surveys into running and ended and gives the response count, without vote counters', async () => {
    const response = await asStaff('/', {});
    const text = await response.text();
    const body = JSON.parse(text) as { active: { id: string; responseCount: number; questionCount: number }[]; ended: { id: string; responseCount: number }[] };

    expect(response.status).toBe(200);
    expect(body.active.find((survey) => survey.id === 'dwanascie')).toMatchObject({ responseCount: 12, questionCount: 1 });
    expect(body.ended).toMatchObject([{ id: 'stara', responseCount: 21 }]);
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
    expect(survey).toMatchObject({ title: 'Dzień sportu', endsOn: lastDayOf(warsawToday(new Date()), 7) });
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
  ])('ankieta $name daje 400 i nic nie zapisuje / a survey $name gives 400 and writes nothing', async ({ body }) => {
    const before = await db.select().from(surveys);

    expect((await publish(body)).status).toBe(400);
    expect(await db.select().from(surveys)).toHaveLength(before.length);
  });

  it('treść, która nie jest JSON-em, daje 400 / a body that is not JSON gives 400', async () => {
    const response = await asStaff('/', { method: 'POST', body: 'to nie json' });

    expect(response.status).toBe(400);
  });
});
