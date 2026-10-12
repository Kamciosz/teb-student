/**
 * PL: Test routera pulpitu na prawdziwej bazie D1 z testowego Workera i prawdziwych routerach aktualności, zgłoszeń i ankiet. Sprawdza dane kafelków dla zalogowanego ucznia, pusty wynik bez sesji i bez danych oraz to, że awaria modułu daje błąd 502, a nie puste kafelki.
 * EN: Test of the dashboard router on a real D1 database of the test Worker and the real news, reports and surveys routers. Checks the tile data for a signed-in student, the empty result without a session and without data, and that a module failure gives a 502 error, not empty tiles.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses worker/dashboard/routes.ts::dashboardApp
 * @uses worker/auth/index.ts::authEmailApp
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1.
// EN: The Worker test environment with the D1 database.
import { env } from 'cloudflare:workers';
// PL: Klient bazy i warunek „równa się” do odczytu numeru ucznia.
// EN: The database client and the "equals" condition for reading the student id.
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Hono do zbudowania aplikacji z routerem logowania.
// EN: Hono to build an app with the sign-in router.
import { Hono } from 'hono';
// PL: Tabele potrzebne do wpisania danych testowych.
// EN: The tables needed to insert the test data.
import { newsEntries, reports, reportStageChanges, surveyParticipation, surveys, user } from '../db/schema';
// PL: Router logowania kodem z drzwi modułu auth, żeby zalogować ucznia tak jak w aplikacji.
// EN: The code sign-in router from the auth module door, to sign a student in the way the app does.
import { authEmailApp } from '../auth';
// PL: Typ środowiska Workera.
// EN: The Worker environment type.
import type { Env } from '../shared';
// PL: Router, który sprawdzamy.
// EN: The router under test.
import { dashboardApp } from './routes';

// PL: Klient bazy testowej.
// EN: The test database client.
const db = drizzle(env.DB);

// PL: Adres e-mail ucznia z testu. Wymyślony.
// EN: The student's e-mail address in the test. Made up.
const EMAIL = 'pulpit.test@teb.edu.pl';

// PL: Treść wpisu testowego: jeden akapit.
// EN: The test entry content: one paragraph.
const BODY = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Treść.' }] }] };

/**
 * PL: Loguje ucznia kodem przez prawdziwy router auth i oddaje ciasteczko sesji.
 * EN: Signs the student in with a code through the real auth router and returns the session cookie.
 *
 * @returns PL: ciasteczko sesji w postaci „nazwa=wartość”. EN: the session cookie as "name=value".
 */
async function signIn(): Promise<string> {
  // PL: Aplikacja z routerem logowania pod adresem, pod którym stoi w Workerze.
  // EN: An app with the sign-in router under the address where it stands in the Worker.
  const authApp = new Hono<{ Bindings: Env }>().route('/api/auth/email', authEmailApp);
  // PL: Adres aplikacji z ustawień serwera (lokalnie z .dev.vars, na przykład z portem podtoru), bo logowanie przyjmuje tylko zapytania z tego adresu.
  // EN: The app address from the server settings (locally from .dev.vars, for example with the subtrack port), because sign-in accepts only requests from this address.
  const origin = env.BETTER_AUTH_URL ?? 'http://localhost';
  const call = (path: string, body: unknown) =>
    authApp.request(
      `http://localhost/api/auth/email${path}`,
      { method: 'POST', headers: { origin, 'cf-connecting-ip': '10.9.0.1', 'content-type': 'application/json' }, body: JSON.stringify(body) },
      env,
    );

  // PL: Poproś o kod. Bez prawdziwej poczty serwer wypisuje go w konsoli, więc go przechwytujemy.
  // EN: Ask for a code. Without a real mailbox the server prints it to the console, so we capture it.
  const printed = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  await call('/email-otp/send-verification-otp', { email: EMAIL });
  const otp = /: (\d{6})$/.exec(String(printed.mock.calls.at(-1)?.[0]))?.[1] ?? '';
  printed.mockRestore();

  // PL: Wpisz kod i weź ciasteczko z odpowiedzi.
  // EN: Enter the code and take the cookie from the answer.
  const response = await call('/sign-in/email-otp', { email: EMAIL, otp });
  return (response.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
}

/**
 * PL: Pyta pulpit o dane, z ciasteczkiem sesji albo bez niego.
 * EN: Asks the dashboard for the data, with a session cookie or without one.
 *
 * @param cookie - PL: ciasteczko sesji albo null (uczeń bez sesji). EN: the session cookie or null (a student without a session).
 * @param testEnv - PL: środowisko Workera (domyślnie to z bazą testową). EN: the Worker environment (by default the one with the test database).
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function ask(cookie: string | null, testEnv: object = env): Response | Promise<Response> {
  return dashboardApp.request('/', { headers: cookie === null ? {} : { cookie } }, testEnv);
}

/**
 * PL: Wpisuje do bazy wpisy, ankiety i zgłoszenia testowe. Zgłoszenia ucznia z testu dostają jego numer.
 * EN: Inserts the test entries, surveys and reports into the database. The test student's reports get their id.
 *
 * @param studentId - PL: numer zalogowanego ucznia. EN: the id of the signed-in student.
 */
async function insertData(studentId: string): Promise<void> {
  // PL: Wpisy: dwa „Ważne” (starszy i nowszy), trzy inne, a do tego najnowszy szkic „Ważne”, którego uczeń nie widzi.
  // EN: Entries: two "Ważne" (older and newer), three others, and the newest "Ważne" draft that the student does not see.
  const at = (day: number) => new Date(Date.UTC(2026, 9, day, 10, 0, 0));
  await db.insert(newsEntries).values([
    { id: 'w-stary', type: 'important', status: 'published', title: 'Stare ważne', body: BODY, source: 'Sekretariat', publishedAt: at(1) },
    { id: 'n1', type: 'news', status: 'published', title: 'Biblioteka', body: BODY, source: 'Biblioteka', publishedAt: at(2) },
    { id: 'w-nowy', type: 'important', status: 'published', title: 'Nowe ważne', body: BODY, source: 'Sekretariat', publishedAt: at(3) },
    { id: 'e1', type: 'event', status: 'published', title: 'Turniej', body: BODY, source: 'Samorząd', publishedAt: at(4) },
    { id: 's1', type: 'sport', status: 'published', title: 'Mecz', body: BODY, source: 'WF', publishedAt: at(5) },
    { id: 'w-szkic', type: 'important', status: 'draft', title: 'Szkic ważnego', body: BODY, source: 'Sekretariat', publishedAt: null },
  ]);

  // PL: Ankiety: wypełniona przez ucznia (kończy się wcześniej) i druga do wypełnienia. Daty z dużym zapasem, żeby test nie starzał się z dniem.
  // EN: Surveys: one filled in by the student (ends sooner) and another one to fill in. Dates with a wide margin, so the test does not age with the day.
  await db.insert(surveys).values([
    { id: 'wypelniona', label: null, title: 'Wypełniona ankieta', endsOn: '2098-01-01' },
    { id: 'otwarta', label: null, title: 'Zajęcia dodatkowe', endsOn: '2099-12-31' },
  ]);
  await db.insert(surveyParticipation).values({ surveyId: 'wypelniona', userId: studentId });

  // PL: Zgłoszenia: dwa ucznia (załatwione starsze i nowsze w trakcie) oraz jedno cudze, najnowsze, które nie może trafić na kafel.
  // EN: Reports: two of the student (an older resolved and a newer in progress) and one of someone else, the newest, which must not reach the tile.
  const base = { isAnonymous: false, category: 'room_equipment', place: 'classroom', placeDetail: null } as const;
  await db.insert(reports).values([
    { ...base, id: 'r-stare', authorId: studentId, description: 'Okno się nie domyka', stage: 'resolved', createdAt: 1000, updatedAt: 1500 },
    { ...base, id: 'r-nowe', authorId: studentId, description: 'Nie działa projektor w sali 204', stage: 'in_progress', createdAt: 2000, updatedAt: 2500 },
    { ...base, id: 'r-cudze', authorId: 'inny-uczen', description: 'Cudze zgłoszenie', stage: 'received', createdAt: 3000, updatedAt: 3000 },
  ]);
}

// PL: Przed każdym testem czyścimy dane trzech modułów. Konto ucznia zostaje, bo logowanie ma limity.
// EN: Before every test we clear the data of the three modules. The student account stays, because sign-in has limits.
beforeEach(async () => {
  await db.delete(reportStageChanges);
  await db.delete(reports);
  await db.delete(surveyParticipation);
  await db.delete(surveys);
  await db.delete(newsEntries);
});

// PL: Grupa testów zalogowanego ucznia.
// EN: A group of signed-in student tests.
describe('GET / jako zalogowany uczeń / as a signed-in student', () => {
  // PL: Wszystkie cztery kafelki dostają dane: najnowszy opublikowany „Ważne”, trzy ostatnie wpisy, ankieta bez głosu i własne zgłoszenie w trakcie.
  // EN: All four tiles get data: the newest published "Ważne", the three latest entries, the survey without a vote and the own report in progress.
  it('oddaje dane wszystkich kafelków / returns the data of all tiles', async () => {
    const cookie = await signIn();
    const student = await db.select().from(user).where(eq(user.email, EMAIL));
    await insertData(student[0]?.id ?? '');

    const response = await ask(cookie);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      important: { id: 'w-nowy', title: 'Nowe ważne', excerpt: 'Treść.', source: 'Sekretariat', publishedAt: '2026-10-03T10:00:00.000Z' },
      announcements: [
        { id: 's1', title: 'Mecz', publishedAt: '2026-10-05T10:00:00.000Z' },
        { id: 'e1', title: 'Turniej', publishedAt: '2026-10-04T10:00:00.000Z' },
        { id: 'w-nowy', title: 'Nowe ważne', publishedAt: '2026-10-03T10:00:00.000Z' },
      ],
      survey: { id: 'otwarta', title: 'Zajęcia dodatkowe', daysLeft: expect.any(Number) },
      report: { description: 'Nie działa projektor w sali 204', stage: 2, openCount: 1 },
    });
  });

  // PL: Bez żadnych danych każdy kafelek jest pusty, a odpowiedź to nadal 200.
  // EN: Without any data every tile is empty, and the answer is still 200.
  it('bez danych oddaje puste kafelki / without data returns empty tiles', async () => {
    const response = await ask(await signIn());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ important: null, announcements: [], survey: null, report: null });
  });
});

// PL: Grupa testów bez sesji i z awarią.
// EN: A group of tests without a session and with a failure.
describe('GET / bez sesji i przy awarii / without a session and on a failure', () => {
  // PL: Aktualności są publiczne, więc bez sesji kafelki wpisów mają dane, a ankieta i zgłoszenia są puste (moduły odpowiadają 401).
  // EN: The news is public, so without a session the entry tiles have data, and the survey and reports are empty (the modules answer 401).
  it('bez sesji pokazuje aktualności, a ankietę i zgłoszenia puste / without a session shows the news, and the survey and reports empty', async () => {
    await insertData('ktos');

    const response = await ask(null);
    const data = (await response.json()) as { important: { id: string } | null; announcements: unknown[]; survey: unknown; report: unknown };

    expect(response.status).toBe(200);
    expect(data.important?.id).toBe('w-nowy');
    expect(data.announcements).toHaveLength(3);
    expect(data.survey).toBeNull();
    expect(data.report).toBeNull();
  });

  // PL: Gdy baza nie działa, moduł aktualności odpowiada błędem, a pulpit oddaje 502 bez szczegółów. To nie może wyglądać jak „nic nie ma”, bo telefon zastąpiłby zapisane dane pustymi kafelkami.
  // EN: When the database does not work, the news module answers with an error, and the dashboard returns 502 without details. It must not look like "nothing there", because the phone would replace the saved data with empty tiles.
  it('przy awarii bazy oddaje 502 bez szczegółów, a nie puste kafelki / on a database failure returns 502 without details, not empty tiles', async () => {
    const failing = { DB: { prepare: () => { throw new Error('tajny szczegół bazy'); } } };

    const response = await ask(null, failing);
    const text = await response.text();

    expect(response.status).toBe(502);
    expect(JSON.parse(text)).toEqual({ error: 'upstream_error' });
    expect(text).not.toContain('tajny');
  });
});
