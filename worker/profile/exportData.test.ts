/**
 * PL: Test eksportu „Pobierz moje dane” na prawdziwej bazie D1 i pełnej aplikacji (worker/index.ts). Sprawdza 401 bez sesji, plik z numerem i adresem konta, profilem, zgłoszeniami i ankietami ucznia, domyślny profil dla ucznia, który niczego nie zapisał, oraz to, że plik nie zawiera danych innego ucznia.
 * EN: Test of the "Pobierz moje dane" export on a real D1 database and the full app (worker/index.ts). Checks 401 without a session, a file with the account id and address, the profile, the student's reports and surveys, the default profile for a student who saved nothing, and that the file has no data of another student.
 *
 * @author Jakub
 * @since 2026-10-13
 * @uses worker/index.ts::app
 * @uses worker/auth/email/testRuntime.ts::signIn
 * @uses worker/profile/exportData.ts::StudentExport
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera (baza D1 i ustawienia).
// EN: The Worker test environment (the D1 database and the settings).
import { env } from 'cloudflare:workers';
// PL: Drizzle dla D1 i tabele, które sprawdzamy.
// EN: Drizzle for D1 and the tables we check.
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { user } from '../db/schema/auth';
import { profiles } from '../db/schema/profile';
import { reports } from '../db/schema/reports';
import { surveys, surveyParticipation } from '../db/schema/surveys';
// PL: Logowanie ucznia w teście (plik pomocniczy testów, więc importujemy go wprost).
// EN: Signing a student in within a test (a test helper file, so we import it directly).
import { createTestRuntime, signIn } from '../auth/email/testRuntime';
// PL: Cała aplikacja Workera, razem z routerem profilu pod /api/profile.
// EN: The whole Worker app, with the profile router under /api/profile.
import app from '../index';
// PL: Kształt pliku eksportu, żeby asercje sprawdzały prawdziwe pola.
// EN: The shape of the export file, so the assertions check the real fields.
import type { StudentExport } from './exportData';

/** PL: Sekret podpisu sesji z testRuntime.ts. EN: The session signing secret from testRuntime.ts. */
const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/** PL: Adresy wymyślonych uczniów. EN: The addresses of invented students. */
const JAN = 'jan.test@teb.edu.pl';
const ANNA = 'anna.test@teb.edu.pl';

/** PL: Profil Jana do zapisu. EN: Jan's profile to save. */
const JAN_PROFILE = { name: 'Jan', className: '2LB', school: 'T', palette: 'CF', textSize: 'duzy' };

/** PL: Profil Anny do zapisu, z imieniem, którego nie może być w pliku Jana. EN: Anna's profile to save, with a name that must not be in Jan's file. */
const ANNA_PROFILE = { name: 'Anna Obca', className: '1A', school: 'L', palette: 'CH', textSize: 'normalny' };

/** PL: Opis zgłoszenia Jana i Anny, każdy inny, żeby dało się je odróżnić w pliku. EN: The report descriptions of Jan and Anna, each different, so they can be told apart in the file. */
const JAN_REPORT = 'Jan: cieknący kran w łazience';
const ANNA_REPORT = 'Anna: zepsuta klamka w sali gimnastycznej';

/** PL: Ankiety Jana i Anny, z tytułami, których nie może być w pliku drugiego ucznia. EN: The surveys of Jan and Anna, with titles that must not be in the other student's file. */
const JAN_SURVEY = 'Ankieta Jana o kołach';
const ANNA_SURVEY = 'Ankieta Anny o stołówce';

/** PL: Chwila zgłoszenia w testach (milisekundy od 1970). EN: The moment of a report in the tests (milliseconds since 1970). */
const REPORT_TIME = Date.UTC(2026, 9, 1);

/**
 * PL: Wysyła GET na eksport w pełnej aplikacji, z ciasteczkiem sesji albo bez niego.
 * EN: Sends GET to the export in the full app, with the session cookie or without it.
 *
 * @param cookie - PL: ciasteczko sesji albo undefined. EN: the session cookie or undefined.
 * @returns PL: odpowiedź aplikacji. EN: the app response.
 */
async function requestExport(cookie?: string): Promise<Response> {
  const headers: Record<string, string> = cookie ? { cookie } : {};
  return app.request('/api/profile/export', { method: 'GET', headers }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
}

/**
 * PL: Wysyła PUT z profilem w pełnej aplikacji, żeby uczeń miał zapisane dane.
 * EN: Sends a PUT with a profile in the full app, so the student has saved data.
 *
 * @param cookie - PL: ciasteczko sesji. EN: the session cookie.
 * @param body - PL: profil do zapisu. EN: the profile to save.
 */
async function saveProfile(cookie: string, body: object): Promise<void> {
  const response = await app.request('/api/profile', { method: 'PUT', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify(body) }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
  expect(response.status).toBe(200);
}

/**
 * PL: Numer konta ucznia o danym adresie, albo undefined, gdy konta nie ma.
 * EN: The account id of the student with the given address, or undefined when there is no account.
 *
 * @param email - PL: adres ucznia. EN: the student's address.
 * @returns PL: numer konta. EN: the account id.
 */
async function accountId(email: string): Promise<string | undefined> {
  const [row] = await drizzle(env.DB).select({ id: user.id }).from(user).where(eq(user.email, email));
  return row?.id;
}

/**
 * PL: Dodaje zgłoszenie ucznia do bazy, tak jak zrobiłby to formularz.
 * EN: Adds a student's report to the database, the way the form would.
 *
 * @param authorId - PL: numer autora zgłoszenia. EN: the id of the report's author.
 * @param description - PL: opis zgłoszenia. EN: the report description.
 */
async function seedReport(authorId: string, description: string): Promise<void> {
  await drizzle(env.DB).insert(reports).values({ id: crypto.randomUUID(), authorId, category: 'safety', place: 'corridor', description, createdAt: REPORT_TIME, updatedAt: REPORT_TIME });
}

/**
 * PL: Dodaje ankietę i zaznacza, że uczeń ją wypełnił.
 * EN: Adds a survey and marks that the student filled it in.
 *
 * @param studentId - PL: numer ucznia, który wypełnił ankietę. EN: the id of the student who filled in the survey.
 * @param id - PL: numer ankiety. EN: the survey id.
 * @param title - PL: tytuł ankiety. EN: the survey title.
 */
async function seedSurvey(studentId: string, id: string, title: string): Promise<void> {
  const db = drizzle(env.DB);
  await db.insert(surveys).values({ id, label: null, title, endsOn: '2026-12-01' });
  await db.insert(surveyParticipation).values({ surveyId: id, userId: studentId });
}

/** PL: Ciasteczka sesji Jana i Anny w bieżącym teście. EN: The session cookies of Jan and Anna in the current test. */
let janCookie: string;
let annaCookie: string;

// PL: Przed każdym testem: czyste profile, zgłoszenia i ankiety oraz dwóch zalogowanych uczniów.
// EN: Before every test: clean profiles, reports and surveys, and two signed-in students.
beforeEach(async () => {
  const db = drizzle(env.DB);
  await db.delete(surveyParticipation);
  await db.delete(surveys);
  await db.delete(reports);
  await db.delete(profiles);
  const login = createTestRuntime();
  janCookie = await signIn(login, JAN);
  annaCookie = await signIn(login, ANNA);
});

// PL: Bez sesji eksport nie działa.
// EN: Without a session the export does not work.
describe('dostęp / access', () => {
  // PL: Bez sesji albo z zmyślonym ciasteczkiem eksport daje 401.
  // EN: Without a session or with a forged cookie the export gives 401.
  it('bez sesji daje 401 / without a session gives 401', async () => {
    expect((await requestExport()).status).toBe(401);
    expect((await requestExport('better-auth.session_token=zmyslone.zmyslone')).status).toBe(401);
  });
});

// PL: Zawartość pliku z danymi ucznia.
// EN: The content of the file with the student's data.
describe('plik z danymi / the data file', () => {
  // PL: Plik ma numer, adres i datę założenia konta, zapisany profil, zgłoszenia i ankiety ucznia, a przeglądarka dostaje go jako załącznik. Lista brakujących danych jest pusta.
  // EN: The file has the account id, the address and the creation date, the saved profile, the student's reports and surveys, and the browser gets it as an attachment. The list of missing data is empty.
  it('oddaje konto, profil, zgłoszenia i ankiety jako załącznik / returns the account, the profile, the reports and the surveys as an attachment', async () => {
    await saveProfile(janCookie, JAN_PROFILE);
    await seedReport(await accountId(JAN) as string, JAN_REPORT);
    await seedSurvey(await accountId(JAN) as string, 'ank-jan', JAN_SURVEY);
    const response = await requestExport(janCookie);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toBe('attachment; filename="moje-dane-teb.json"');
    const data = (await response.json()) as StudentExport;
    expect(data.version).toBe(1);
    expect(Number.isNaN(Date.parse(data.exportedAt))).toBe(false);
    const janId = await accountId(JAN);
    expect(janId).toBeDefined();
    expect(data.account).toEqual({ id: janId, email: JAN, name: '', createdAt: expect.any(Number) });
    expect(data.profile).toEqual(JAN_PROFILE);
    expect(data.reports.map((report) => report.description)).toEqual([JAN_REPORT]);
    expect(data.surveys).toEqual([{ id: 'ank-jan', label: null, title: JAN_SURVEY, endsOn: '2026-12-01' }]);
    expect(data.missing).toEqual([]);
  });

  // PL: Uczeń, który niczego nie zapisał, dostaje w pliku profil domyślny i puste listy.
  // EN: A student who saved nothing gets the default profile and empty lists in the file.
  it('bez zapisu profil jest domyślny, a listy puste / without a save the profile is the default one and the lists are empty', async () => {
    const data = (await (await requestExport(annaCookie)).json()) as StudentExport;

    expect(data.profile).toEqual({ name: '', className: '', school: 'L', palette: 'CE', textSize: 'normalny' });
    expect(data.reports).toEqual([]);
    expect(data.surveys).toEqual([]);
  });

  // PL: Plik Jana nie zawiera danych Anny: ani jej imienia, adresu, numeru konta, zgłoszeń ani ankiet.
  // EN: Jan's file has no data of Anna: neither her name, address, account id, reports nor surveys.
  it('nie zawiera danych innego ucznia / does not contain another student\'s data', async () => {
    const annaId = await accountId(ANNA);
    expect(annaId).toBeDefined();
    await saveProfile(annaCookie, ANNA_PROFILE);
    await seedReport(annaId as string, ANNA_REPORT);
    await seedSurvey(annaId as string, 'ank-anna', ANNA_SURVEY);
    const text = await (await requestExport(janCookie)).text();

    expect(text).not.toContain('Anna Obca');
    expect(text).not.toContain(ANNA);
    expect(text).not.toContain(annaId as string);
    expect(text).not.toContain(ANNA_REPORT);
    expect(text).not.toContain(ANNA_SURVEY);
  });
});
