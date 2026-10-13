/**
 * PL: Test serwera profilu na prawdziwej bazie D1 i pełnej aplikacji (worker/index.ts), żeby wyszedł też cykl importów z listą kasowania. Sprawdza 401 bez sesji, zapis i odczyt profilu, błędy danych oraz usunięcie konta: to samo ciasteczko po usunięciu daje 401, konto i profil znikają, zgłoszenie zostaje bez autora, a cudze dane i sesja zostają.
 * EN: Test of the profile server on a real D1 database and the full app (worker/index.ts), so the import cycle with the deletion list shows up too. Checks 401 without a session, saving and reading the profile, data errors and the account deletion: the same cookie gives 401 after the deletion, the account and profile vanish, the report stays without an author, and other people's data and session stay.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses worker/index.ts::app
 * @uses worker/auth/email/testRuntime.ts::signIn
 * @uses worker/db/seed/profile.ts::PROFILE_SEED
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
import { PROFILE_OTHER_STUDENT_ID, PROFILE_SEED } from '../db/seed/profile';
// PL: Logowanie ucznia w teście, jak w testach podtoru 4a (plik pomocniczy testów, więc importujemy go wprost).
// EN: Signing a student in within a test, as in the tests of subtrack 4a (a test helper file, so we import it directly).
import { createTestRuntime, signIn } from '../auth/email/testRuntime';
// PL: Cała aplikacja Workera, razem z routerem profilu pod /api/profile.
// EN: The whole Worker app, with the profile router under /api/profile.
import app from '../index';
// PL: Funkcja dla panelu zgłoszeń z drzwi modułu (#70), importowana tak, jak zrobi to podtor 4b.
// EN: The function for the reports panel from the module door (#70), imported the way subtrack 4b does it.
import { getStudentNames } from './index';

/** PL: Sekret podpisu sesji z testRuntime.ts. EN: The session signing secret from testRuntime.ts. */
const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/** PL: Adresy wymyślonych uczniów. EN: The addresses of invented students. */
const JAN = 'jan.test@teb.edu.pl';
const ANNA = 'anna.test@teb.edu.pl';

/** PL: Poprawny profil do zapisu. EN: A valid profile to save. */
const BODY = { name: 'Jan', className: '2LB', school: 'T', palette: 'CF', textSize: 'duzy' };

/**
 * PL: Wysyła zapytanie do /api/profile pełnej aplikacji, z ciasteczkiem sesji albo bez niego.
 * EN: Sends a request to /api/profile of the full app, with the session cookie or without it.
 *
 * @param method - PL: metoda HTTP. EN: the HTTP method.
 * @param cookie - PL: ciasteczko sesji albo undefined. EN: the session cookie or undefined.
 * @param body - PL: treść JSON (tekst albo obiekt) albo undefined. EN: the JSON body (a string or an object) or undefined.
 * @returns PL: odpowiedź aplikacji. EN: the app response.
 */
async function send(method: string, cookie?: string, body?: unknown): Promise<Response> {
  // PL: Nagłówki z ciasteczkiem i typem treści, gdy są potrzebne.
  // EN: The headers with the cookie and the content type, when needed.
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const payload = typeof body === 'string' || body === undefined ? body : JSON.stringify(body);
  return app.request('/api/profile', { method, headers, body: payload }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
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

/** PL: Ciasteczka sesji Jana i Anny w bieżącym teście. EN: The session cookies of Jan and Anna in the current test. */
let janCookie: string;
let annaCookie: string;

// PL: Przed każdym testem: czyste profile i zgłoszenia, dwóch zalogowanych uczniów.
// EN: Before every test: clean profiles and reports, two signed-in students.
beforeEach(async () => {
  await drizzle(env.DB).delete(profiles);
  await drizzle(env.DB).delete(reports);
  const login = createTestRuntime();
  janCookie = await signIn(login, JAN);
  annaCookie = await signIn(login, ANNA);
});

// PL: Grupa testów dostępu.
// EN: A group of access tests.
describe('401 bez sesji / 401 without a session', () => {
  // PL: Każda metoda bez sesji (także ze zmyślonym ciasteczkiem) daje 401 i niczego nie zapisuje.
  // EN: Every method without a session (also with a forged cookie) gives 401 and saves nothing.
  it.each(['GET', 'PUT', 'DELETE'])('%s / %s', async (method) => {
    const anonymous = await send(method, undefined, method === 'PUT' ? BODY : undefined);
    const forged = await send(method, 'better-auth.session_token=zmyslone.zmyslone', method === 'PUT' ? BODY : undefined);

    expect(anonymous.status).toBe(401);
    expect(forged.status).toBe(401);
    expect(await drizzle(env.DB).select().from(profiles)).toEqual([]);
  });
});

// PL: Grupa testów zapisu i odczytu profilu.
// EN: A group of tests for saving and reading the profile.
describe('GET i PUT / GET and PUT', () => {
  // PL: Uczeń, który niczego nie zapisał, dostaje profil domyślny: puste imię i klasa, liceum, paleta CE.
  // EN: A student who saved nothing gets the default profile: an empty name and class, lyceum, palette CE.
  it('GET bez zapisu oddaje profil domyślny / GET before any save returns the default profile', async () => {
    const response = await send('GET', janCookie);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ name: '', className: '', school: 'L', palette: 'CE', textSize: 'normalny' });
  });

  // PL: Zapisany profil wraca przy odczycie, a drugi zapis go nadpisuje.
  // EN: A saved profile comes back on reading, and a second save overwrites it.
  it('PUT zapisuje, a GET oddaje i drugi PUT nadpisuje / PUT saves, GET returns and a second PUT overwrites', async () => {
    expect((await send('PUT', janCookie, BODY)).status).toBe(200);
    expect(await (await send('GET', janCookie)).json()).toEqual(BODY);

    await send('PUT', janCookie, { ...BODY, school: 'L', palette: 'CA' });
    expect(await (await send('GET', janCookie)).json()).toEqual({ ...BODY, school: 'L', palette: 'CA' });
  });

  // PL: Zapis jednego ucznia nie zmienia profilu drugiego.
  // EN: One student's save does not change the other's profile.
  it('profil jednego ucznia nie wpływa na drugiego / one profile does not affect the other', async () => {
    await send('PUT', janCookie, BODY);

    expect(await (await send('GET', annaCookie)).json()).toEqual({ name: '', className: '', school: 'L', palette: 'CE', textSize: 'normalny' });
  });

  // PL: Zła paleta, szkoła, zepsuty JSON i zbyt duża treść są odrzucone, a profil zostaje.
  // EN: A bad palette, school, broken JSON and an oversized body are rejected and the profile stays.
  it('odrzuca złe dane / rejects bad data', async () => {
    const badPalette = await send('PUT', janCookie, { ...BODY, palette: 'CZ' });
    const badSchool = await send('PUT', janCookie, { ...BODY, school: 'X' });
    const broken = await send('PUT', janCookie, '{nie json');
    const huge = await send('PUT', janCookie, { ...BODY, name: 'a'.repeat(5000) });

    expect(badPalette.status).toBe(400);
    expect(await badPalette.json()).toEqual({ error: 'invalid_profile', fields: ['palette'] });
    expect(badSchool.status).toBe(400);
    expect(broken.status).toBe(400);
    expect(huge.status).toBe(413);
    expect(await drizzle(env.DB).select().from(profiles)).toEqual([]);
  });
});

// PL: Grupa testów usunięcia konta.
// EN: A group of tests for the account deletion.
describe('DELETE: usunięcie konta / account deletion', () => {
  // PL: Po usunięciu to samo ciasteczko jest martwe, konto i profil znikają, zgłoszenie zostaje bez autora, a Anna ma wszystko.
  // EN: After the deletion the same cookie is dead, the account and profile vanish, the report stays without an author, and Anna keeps everything.
  it('usuwa konto, blokuje sesję i zostawia cudze dane / deletes the account, kills the session and leaves other data', async () => {
    // PL: Przygotuj dane: profil Jana, profil Anny (seed) i zgłoszenie Jana.
    // EN: Prepare data: Jan's profile, Anna's profile (seed) and Jan's report.
    const janId = (await accountId(JAN)) ?? '';
    const annaId = (await accountId(ANNA)) ?? '';
    await send('PUT', janCookie, BODY);
    await send('PUT', annaCookie, { ...BODY, name: 'Anna' });
    await drizzle(env.DB).insert(reports).values({ id: 'r-jan', authorId: janId, category: 'idea', place: 'gym', description: 'Pomysł', createdAt: 1, updatedAt: 1 });

    // PL: Usuń konto Jana.
    // EN: Delete Jan's account.
    expect((await send('DELETE', janCookie)).status).toBe(204);

    // PL: Stare ciasteczko nie działa na żadnym adresie, a konta i profilu nie ma.
    // EN: The old cookie works at no route, and the account and profile are gone.
    expect((await send('GET', janCookie)).status).toBe(401);
    expect((await send('PUT', janCookie, BODY)).status).toBe(401);
    expect(await accountId(JAN)).toBeUndefined();
    expect(await drizzle(env.DB).select().from(profiles).where(eq(profiles.userId, janId))).toEqual([]);

    // PL: Zgłoszenie zostało, ale bez autora.
    // EN: The report stayed, but without an author.
    const [report] = await drizzle(env.DB).select().from(reports).where(eq(reports.id, 'r-jan'));
    expect(report?.authorId).toBeNull();

    // PL: Anna nadal jest zalogowana i ma swój profil.
    // EN: Anna is still signed in and has her profile.
    expect(await accountId(ANNA)).toBe(annaId);
    expect(await (await send('GET', annaCookie)).json()).toMatchObject({ name: 'Anna' });
  });

  // PL: Usunięcie konta jest ostateczne: ten sam adres po ponownym zalogowaniu dostaje nowe, puste konto, a nie dawny profil.
  // EN: The deletion is final: the same address gets a new, empty account after signing in again, not the old profile.
  it('po usunięciu ten sam adres zaczyna od nowa / after the deletion the same address starts from scratch', async () => {
    const oldId = (await accountId(JAN)) ?? '';
    await send('PUT', janCookie, BODY);
    await send('DELETE', janCookie);

    const newCookie = await signIn(createTestRuntime(), JAN);

    expect(await accountId(JAN)).not.toBe(oldId);
    expect(await (await send('GET', newCookie)).json()).toEqual({ name: '', className: '', school: 'L', palette: 'CE', textSize: 'normalny' });
  });

  // PL: Cudzy profil z danych testowych przeżywa usunięcie konta Jana.
  // EN: Another person's profile from the test data survives Jan's account deletion.
  it('profil innego ucznia z seedu zostaje / another student seed profile stays', async () => {
    await drizzle(env.DB).insert(profiles).values(PROFILE_SEED);

    await send('DELETE', janCookie);

    const rows = await drizzle(env.DB).select({ userId: profiles.userId }).from(profiles).where(eq(profiles.userId, PROFILE_OTHER_STUDENT_ID));
    expect(rows).toHaveLength(1);
  });
});

// PL: Grupa testów imion i klas dla panelu zgłoszeń (#70).
// EN: A group of tests for the names and classes for the reports panel (#70).
describe('getStudentNames: imiona i klasy dla panelu / names and classes for the panel', () => {
  // PL: Oddaje imię i klasę tylko tych, którzy mają profil; uczeń bez profilu i obcy numer nie trafiają do wyniku.
  // EN: Returns the name and class only of those who have a profile; a student without a profile and an unknown id are not in the result.
  it('oddaje imię i klasę tych, którzy mają profil / returns the name and class of those who have a profile', async () => {
    const janId = (await accountId(JAN)) ?? '';
    const annaId = (await accountId(ANNA)) ?? '';
    await send('PUT', janCookie, BODY);

    const names = await getStudentNames(env.DB, [janId, annaId, 'nie-ma-takiego-konta']);

    expect(names).toEqual([{ userId: janId, name: 'Jan', className: '2LB' }]);
  });

  // PL: Pusta lista daje pusty wynik bez zapytania do bazy.
  // EN: An empty list gives an empty result without a database query.
  it('pusta lista daje pusty wynik / an empty list gives an empty result', async () => {
    expect(await getStudentNames(env.DB, [])).toEqual([]);
  });

  // PL: Długa lista jest dzielona na części, a wynik z ostatniej części też wraca.
  // EN: A long list is split into chunks, and the result from the last chunk comes back too.
  it('długa lista też działa / a long list works too', async () => {
    const janId = (await accountId(JAN)) ?? '';
    await send('PUT', janCookie, BODY);
    const ids = [...Array.from({ length: 200 }, (_, index) => `fałszywy-${index}`), janId];

    expect(await getStudentNames(env.DB, ids)).toEqual([{ userId: janId, name: 'Jan', className: '2LB' }]);
  });
});
