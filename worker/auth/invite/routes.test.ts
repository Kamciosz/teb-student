/**
 * PL: Testy routera kodów zaproszeń, loginu i hasła: konto za kodem zaproszenia, kod tylko raz, kod po terminie, zajęty login, złe dane, logowanie hasłem, sesja rozpoznawana przez podtor 1a (logowanie kodem z maila), ukryty adres rejestracji Better Auth, limit prób i brak sekretu. Działają na prawdziwej bazie D1 testów, na tym samym kodzie co Worker.
 * EN: Tests of the invitation codes, login and password router: an account with an invitation code, a code only once, an expired code, a taken login, bad input, password sign-in, a session recognized by subtrack 1a (e-mail code sign-in), the hidden Better Auth sign-up route, the attempt limit and a missing secret. They run on the real test D1 database, on the same code as the Worker.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/routes.ts::createAuthInviteApp
 * @uses worker/auth/invite/testRuntime.ts::createTestInvite
 * @used_by vitest.config.ts::include
 */

import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import type { Env } from '../../shared';
import { account, user } from '../../db/schema/auth';
import { sessionCookie, uniqueIp } from '../email/testRuntime';
import { issueInviteCode } from './inviteCodes';
import { authInviteApp } from './routes';
import { call, createTestInvite, TEST_ORIGIN, TEST_SECRET, type TestInvite } from './testRuntime';

/** PL: Hasło używane w testach (8 znaków, najmniej, jakie wolno). EN: The password used in tests (8 characters, the least allowed). */
const PASSWORD = 'haslo1234';

/**
 * PL: Zakłada konto z nowym kodem i podanym loginem. Skrót dla testów, które potrzebują istniejącego konta.
 * EN: Creates an account with a new code and the given login. A shortcut for tests that need an existing account.
 *
 * @param test - PL: konta testowe. EN: the test accounts.
 * @param login - PL: login. EN: the login.
 * @returns PL: odpowiedź rejestracji. EN: the sign-up response.
 */
async function signUp(test: TestInvite, login: string): Promise<Response> {
  const { code } = await issueInviteCode(env.DB);
  return call(test.app, '/sign-up', { body: { code, login, password: PASSWORD } });
}

/**
 * PL: Pyta podtor 1a (logowanie kodem z maila), kim jest właściciel ciasteczka. Tak robi requireStudent.
 * EN: Asks subtrack 1a (e-mail code sign-in) who owns the cookie. This is what requireStudent does.
 *
 * @param test - PL: konta testowe. EN: the test accounts.
 * @param cookie - PL: ciasteczko sesji. EN: the session cookie.
 * @returns PL: adres użytkownika z sesji albo null. EN: the user's address from the session, or null.
 */
async function emailOfSession(test: TestInvite, cookie: string): Promise<string | null> {
  const session = await test.emailAuth.api.getSession({ headers: new Headers({ cookie }) });
  return session ? session.user.email : null;
}

/**
 * PL: Składa aplikację z prawdziwym routerem podtoru pod adresem z worker/mounts.ts, jak w Workerze.
 * EN: Builds an app with the real subtrack router under the address from worker/mounts.ts, as in the Worker.
 *
 * @returns PL: aplikacja Hono. EN: the Hono app.
 */
function workerApp(): Hono<{ Bindings: Env }> {
  return new Hono<{ Bindings: Env }>().route('/api/auth/invite', authInviteApp);
}

// PL: Grupa testów zakładania konta.
// EN: A group of account creation tests.
describe('zakładanie konta kodem / creating an account with a code', () => {
  // PL: Dobry kod, login i hasło dają konto, hasło zapisane w skrócie i sesję.
  // EN: A good code, login and password give an account, a hashed password and a session.
  it('zakłada konto i sesję / creates the account and the session', async () => {
    const test = createTestInvite();
    const response = await signUp(test, 'ola3ta');
    expect(response.status).toBe(200);
    expect(sessionCookie(response)).toContain('session_token');

    const [created] = await drizzle(env.DB).select().from(user).where(eq(user.email, 'ola3ta@login.invalid'));
    expect(created?.name).toBe('ola3ta');
    const [link] = await drizzle(env.DB).select().from(account).where(eq(account.userId, created?.id ?? ''));
    expect(link?.providerId).toBe('credential');
    expect(link?.password).toBeTruthy();
    expect(link?.password).not.toContain(PASSWORD);
  });

  // PL: Sesja z kodu zaproszenia jest rozpoznawana przez podtor 1a, czyli przez requireStudent w innych modułach, także przy kolejnym zapytaniu z tym samym ciasteczkiem (ponowne otwarcie aplikacji).
  // EN: A session from an invitation code is recognized by subtrack 1a, that is by requireStudent in other modules, also on the next request with the same cookie (reopening the app).
  it('sesja działa w podtorze 1a / the session works in subtrack 1a', async () => {
    const test = createTestInvite();
    const cookie = sessionCookie(await signUp(test, 'kuba_p'));
    expect(await emailOfSession(test, cookie)).toBe('kuba_p@login.invalid');
    expect(await emailOfSession(test, cookie)).toBe('kuba_p@login.invalid');
    expect(await emailOfSession(test, 'better-auth.session_token=cos-obcego')).toBeNull();
  });

  // PL: Kod działa jeden raz.
  // EN: A code works once.
  it('kod działa tylko raz / a code works only once', async () => {
    const test = createTestInvite();
    const { code } = await issueInviteCode(env.DB);
    const first = await call(test.app, '/sign-up', { body: { code, login: 'ewa.p', password: PASSWORD } });
    const second = await call(test.app, '/sign-up', { body: { code, login: 'ewa.q', password: PASSWORD } });
    expect(first.status).toBe(200);
    expect(second.status).toBe(400);
    expect(await second.json()).toMatchObject({ code: 'INVITE_INVALID' });
    expect(await drizzle(env.DB).select().from(user).where(eq(user.email, 'ewa.q@login.invalid'))).toEqual([]);
  });

  // PL: Dwie rejestracje naraz tym samym kodem: konto powstaje tylko jedno.
  // EN: Two sign-ups at once with the same code: only one account is created.
  it('przy dwóch próbach naraz powstaje jedno konto / with two attempts at once only one account is created', async () => {
    const test = createTestInvite();
    const { code } = await issueInviteCode(env.DB);
    const results = await Promise.all(
      ['para.a', 'para.b'].map((login) => call(test.app, '/sign-up', { body: { code, login, password: PASSWORD } })),
    );
    expect(results.map((response) => response.status).sort()).toEqual([200, 400]);
  });

  // PL: Kod wpisany małymi literami i ze spacją działa tak samo jak oryginał.
  // EN: A code typed in lowercase and with a space works the same as the original.
  it('przyjmuje kod małymi literami / accepts a code in lowercase', async () => {
    const test = createTestInvite();
    const { code } = await issueInviteCode(env.DB);
    const response = await call(test.app, '/sign-up', { body: { code: ` ${code.toLowerCase()} `, login: 'male.litery', password: PASSWORD } });
    expect(response.status).toBe(200);
  });
});

// PL: Grupa testów odrzuconych prób.
// EN: A group of rejected attempt tests.
describe('odrzucone próby / rejected attempts', () => {
  // PL: Zły, nieistniejący i przeterminowany kod nie zakładają konta.
  // EN: A wrong, a non-existent and an expired code create no account.
  it.each([
    ['nieistniejący / non-existent', () => Promise.resolve('TEB-AAAA-AA')],
    ['zły kształt / wrong shape', () => Promise.resolve('123456')],
    [
      'po 14 dniach / after 14 days',
      async () => (await issueInviteCode(env.DB, new Date(Date.now() - 15 * 24 * 60 * 60 * 1000))).code,
    ],
  ])('kod %s nie zakłada konta / the code does not create an account', async (_name, makeCode) => {
    const test = createTestInvite();
    const response = await call(test.app, '/sign-up', { body: { code: await makeCode(), login: 'bez.kodu', password: PASSWORD } });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: 'INVITE_INVALID' });
    expect(await drizzle(env.DB).select().from(user).where(eq(user.email, 'bez.kodu@login.invalid'))).toEqual([]);
  });

  // PL: Zajęty login daje błąd, a kod nie przepada: uczeń wybiera inny login tym samym kodem.
  // EN: A taken login gives an error and the code is not lost: the student picks another login with the same code.
  it('zajęty login nie zużywa kodu / a taken login does not use the code', async () => {
    const test = createTestInvite();
    await signUp(test, 'zajety');
    const { code } = await issueInviteCode(env.DB);
    const taken = await call(test.app, '/sign-up', { body: { code, login: 'ZAJETY', password: PASSWORD } });
    expect(taken.status).toBe(422);
    expect(await taken.json()).toMatchObject({ code: 'LOGIN_TAKEN' });
    const retry = await call(test.app, '/sign-up', { body: { code, login: 'wolny', password: PASSWORD } });
    expect(retry.status).toBe(200);
  });

  // PL: Zły login albo za krótkie hasło są odrzucone, a kod zostaje nietknięty.
  // EN: A bad login or a too short password is rejected and the code stays untouched.
  it.each([
    ['ab', PASSWORD, 'invalid_login'],
    ['ola@teb.edu.pl', PASSWORD, 'invalid_login'],
    ['ze spacja', PASSWORD, 'invalid_login'],
    ['dobry.login', 'krotkie', 'invalid_password'],
    ['dobry.login', 'x'.repeat(129), 'invalid_password'],
  ])('login %j i hasło %j: %s / login and password rejected', async (login, password, error) => {
    const test = createTestInvite();
    const { code } = await issueInviteCode(env.DB);
    const response = await call(test.app, '/sign-up', { body: { code, login, password } });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error });
    const retry = await call(test.app, '/sign-up', { body: { code, login: `dobry.${crypto.randomUUID().slice(0, 8)}`, password: PASSWORD } });
    expect(retry.status).toBe(200);
  });

  // PL: Ciało bez pola albo nie-JSON to błąd telefonu.
  // EN: A body without a field, or not JSON, is the phone's error.
  it('odrzuca zepsute ciało / rejects a broken body', async () => {
    const test = createTestInvite();
    const noPassword = await call(test.app, '/sign-up', { body: { code: 'TEB-AAAA-AA', login: 'ktos' } });
    expect(noPassword.status).toBe(400);
    const notJson = await test.app.request('http://localhost/api/auth/invite/sign-in', {
      method: 'POST',
      headers: { origin: TEST_ORIGIN, 'cf-connecting-ip': uniqueIp(), 'content-type': 'application/json' },
      body: 'to nie jest json',
    });
    expect(notJson.status).toBe(400);
  });
});

// PL: Grupa testów granicy: telefon nie może założyć konta z pominięciem kodu.
// EN: A group of boundary tests: the phone cannot create an account bypassing the code.
describe('granica zaufania / trust boundary', () => {
  // PL: Surowy adres rejestracji Better Auth jest ukryty, a nawet gdy ktoś trafi do Better Auth bez routera, hak żąda kodu.
  // EN: The raw Better Auth sign-up route is hidden, and even when someone reaches Better Auth without the router, the hook demands a code.
  it('nie da się założyć konta bez kodu / an account cannot be created without a code', async () => {
    const test = createTestInvite();
    const raw = await call(test.app, '/sign-up/email', { body: { email: 'obcy@login.invalid', name: 'obcy', password: PASSWORD } });
    expect(raw.status).toBe(404);

    const direct = await test.auth.handler(
      new Request('http://localhost/api/auth/invite/sign-up/email', {
        method: 'POST',
        headers: { origin: TEST_ORIGIN, 'cf-connecting-ip': uniqueIp(), 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'obcy@login.invalid', name: 'obcy', password: PASSWORD }),
      }),
    );
    expect(direct.status).toBe(400);
    expect(await drizzle(env.DB).select().from(user).where(eq(user.email, 'obcy@login.invalid'))).toEqual([]);
  });

  // PL: Inne adresy Better Auth (zmiana hasła, sesje) nie są wystawione przez ten router.
  // EN: Other Better Auth routes (changing the password, sessions) are not exposed by this router.
  it.each(['/sign-in/email', '/get-session', '/sign-out', '/change-password'])('ukrywa %s / hides %s', async (path) => {
    const test = createTestInvite();
    const response = await call(test.app, path, { body: { email: 'x@login.invalid', password: PASSWORD } });
    expect(response.status).toBe(404);
  });

  // PL: Limit zapytań: czwarta próba rejestracji z jednego adresu IP w krótkim czasie dostaje 429.
  // EN: The request limit: the fourth sign-up attempt from one IP address in a short time gets 429.
  it('ogranicza zgadywanie kodów / limits code guessing', async () => {
    const test = createTestInvite();
    const ip = uniqueIp();
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await call(test.app, '/sign-up', { ip, body: { code: 'TEB-AAAA-AA', login: 'zgaduje', password: PASSWORD } });
      statuses.push(response.status);
    }
    expect(statuses).toEqual([400, 400, 400, 429]);
  });
});

// PL: Grupa testów logowania loginem i hasłem.
// EN: A group of login and password sign-in tests.
describe('logowanie loginem i hasłem / sign-in with a login and a password', () => {
  // PL: Dobry login i hasło dają sesję, a wielkość liter loginu nie ma znaczenia.
  // EN: A good login and password give a session, and the letter case of the login does not matter.
  it('loguje i daje sesję / signs in and gives a session', async () => {
    const test = createTestInvite();
    await signUp(test, 'wraca');
    const response = await call(test.app, '/sign-in', { body: { login: ' Wraca ', password: PASSWORD } });
    expect(response.status).toBe(200);
    expect(await emailOfSession(test, sessionCookie(response))).toBe('wraca@login.invalid');
  });

  // PL: Złe hasło, nieznany login i login spoza reguł dostają odmowę 401 bez sesji.
  // EN: A wrong password, an unknown login and a login outside the rules get a 401 refusal without a session.
  it.each([
    ['wrong password', 'logowanie', 'inne-haslo'],
    ['unknown login', 'nikogo', PASSWORD],
    ['login outside the rules', 'ola@teb.edu.pl', PASSWORD],
  ])('odmawia: %s / refuses', async (_name, login, password) => {
    const test = createTestInvite();
    await signUp(test, 'logowanie');
    const response = await call(test.app, '/sign-in', { body: { login, password } });
    expect(response.status).toBe(401);
    expect(sessionCookie(response)).toBe('');
  });
});

// PL: Grupa testów prawdziwego routera z Workera.
// EN: A group of tests of the real router from the Worker.
describe('router w Workerze / the router in the Worker', () => {
  // PL: Bez sekretu BETTER_AUTH_SECRET serwer odpowiada 503, a nie 500.
  // EN: Without the BETTER_AUTH_SECRET secret the server answers 503, not 500.
  it('bez sekretu odpowiada 503 / answers 503 without the secret', async () => {
    const init = { method: 'POST', body: JSON.stringify({ login: 'ktos', password: PASSWORD }), headers: { 'content-type': 'application/json' } };
    const response = await workerApp().request(`${TEST_ORIGIN}/api/auth/invite/sign-in`, init, { DB: env.DB });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'not_configured' });
  });

  // PL: Z sekretem prawdziwy router (getInviteAuth) działa na bazie testów.
  // EN: With the secret the real router (getInviteAuth) works on the test database.
  it('z sekretem działa na bazie / works on the database with the secret', async () => {
    const { code } = await issueInviteCode(env.DB);
    const response = await workerApp().request(
      `${TEST_ORIGIN}/api/auth/invite/sign-up`,
      {
        method: 'POST',
        headers: { origin: TEST_ORIGIN, 'cf-connecting-ip': uniqueIp(), 'content-type': 'application/json' },
        body: JSON.stringify({ code, login: 'prawdziwy', password: PASSWORD }),
      },
      { DB: env.DB, BETTER_AUTH_SECRET: TEST_SECRET },
    );
    expect(response.status).toBe(200);
  });
});
