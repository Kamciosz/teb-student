/**
 * PL: Test routera panelu na prawdziwej bazie D1 i prawdziwym logowaniu kodem z drzwi modułu auth. Sprawdza GET /me (401 bez sesji, null bez roli, rola z bazy) oraz POST /invites (401 bez sesji, 403 bez roli i dla redakcji, 201 dla Samorządu i kod, który naprawdę trafia do bazy).
 * EN: Test of the panel router on a real D1 database and the real code sign-in from the auth module door. Checks GET /me (401 without a session, null without a role, the role from the database) and POST /invites (401 without a session, 403 without a role and for the editorial team, 201 for the Council and a code that really lands in the database).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/admin/routes.ts::adminApp
 * @uses worker/auth/index.ts::authEmailApp
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1.
// EN: The Worker test environment with the D1 database.
import { env } from 'cloudflare:workers';
// PL: Klient bazy i warunki do odczytu numeru ucznia i kodów.
// EN: The database client and the conditions to read the student id and the codes.
import { eq, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Hono do zbudowania aplikacji z routerem logowania.
// EN: Hono to build an app with the sign-in router.
import { Hono } from 'hono';
// PL: Tabele: role, konta i kody zaproszeń (leżą w verification).
// EN: The tables: roles, accounts and invitation codes (they live in verification).
import { panelRoles } from '../db/schema/admin';
import { user, verification } from '../db/schema/auth';
// PL: Router logowania kodem z drzwi modułu auth, żeby zalogować ucznia tak jak w aplikacji.
// EN: The code sign-in router from the auth module door, to sign a student in the way the app does.
import { authEmailApp } from '../auth';
// PL: Typ środowiska Workera.
// EN: The Worker environment type.
import type { Env } from '../shared';
// PL: Router, który sprawdzamy.
// EN: The router under test.
import { adminApp } from './routes';

// PL: Klient bazy testowej.
// EN: The test database client.
const db = drizzle(env.DB);

// PL: Wymyślone adresy uczniów z testu: bez roli, z redakcją i z Samorządem.
// EN: The invented student addresses from the test: without a role, with the editorial role and with the Council role.
const PLAIN_EMAIL = 'panel.zwykly@teb.edu.pl';
const EDITOR_EMAIL = 'panel.redakcja@teb.edu.pl';
const COUNCIL_EMAIL = 'panel.samorzad@teb.edu.pl';

// PL: Licznik adresów IP, żeby limit logowania jednego ucznia nie wpływał na innego.
// EN: The IP address counter, so one student's sign-in limit does not affect another's.
let nextIp = 1;

/**
 * PL: Loguje ucznia kodem przez prawdziwy router auth i oddaje ciasteczko sesji.
 * EN: Signs the student in with a code through the real auth router and returns the session cookie.
 *
 * @param email - PL: adres ucznia. EN: the student's address.
 * @returns PL: ciasteczko sesji w postaci „nazwa=wartość”. EN: the session cookie as "name=value".
 */
async function signIn(email: string): Promise<string> {
  // PL: Aplikacja z routerem logowania pod adresem, pod którym stoi w Workerze.
  // EN: An app with the sign-in router under the address where it stands in the Worker.
  const authApp = new Hono<{ Bindings: Env }>().route('/api/auth/email', authEmailApp);
  // PL: Adres aplikacji z ustawień serwera, bo logowanie przyjmuje tylko zapytania z tego adresu.
  // EN: The app address from the server settings, because sign-in accepts only requests from this address.
  const origin = env.BETTER_AUTH_URL ?? 'http://localhost';
  const ip = `10.8.0.${nextIp++}`;
  const call = (path: string, body: unknown) =>
    authApp.request(
      `http://localhost/api/auth/email${path}`,
      { method: 'POST', headers: { origin, 'cf-connecting-ip': ip, 'content-type': 'application/json' }, body: JSON.stringify(body) },
      env,
    );

  // PL: Poproś o kod. Bez prawdziwej poczty serwer wypisuje go w konsoli, więc go przechwytujemy.
  // EN: Ask for a code. Without a real mailbox the server prints it to the console, so we capture it.
  const printed = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  await call('/email-otp/send-verification-otp', { email });
  const otp = /: (\d{6})$/.exec(String(printed.mock.calls.at(-1)?.[0]))?.[1] ?? '';
  printed.mockRestore();

  // PL: Wpisz kod i weź ciasteczko z odpowiedzi.
  // EN: Enter the code and take the cookie from the answer.
  const response = await call('/sign-in/email-otp', { email, otp });
  return (response.headers.get('set-cookie') ?? '').split(';')[0] ?? '';
}

/**
 * PL: Daje uczniowi z podanym adresem rolę w panelu.
 * EN: Gives the student with the given address a panel role.
 *
 * @param email - PL: adres ucznia, który już się zalogował. EN: the address of a student who has already signed in.
 * @param role - PL: rola do nadania. EN: the role to grant.
 */
async function grant(email: string, role: 'editor' | 'council'): Promise<void> {
  // PL: Znajdź numer konta po adresie i wpisz mu rolę.
  // EN: Find the account id by the address and insert the role for it.
  const [account] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  await db.insert(panelRoles).values({ userId: account?.id ?? '', role, grantedAt: 1 });
}

/**
 * PL: Woła router panelu z ciasteczkiem sesji albo bez niego.
 * EN: Calls the panel router with a session cookie or without one.
 *
 * @param path - PL: adres w routerze. EN: the route in the router.
 * @param method - PL: metoda HTTP. EN: the HTTP method.
 * @param cookie - PL: ciasteczko sesji albo null. EN: the session cookie or null.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function call(path: string, method: 'GET' | 'POST', cookie: string | null): Response | Promise<Response> {
  return adminApp.request(path, { method, headers: cookie === null ? {} : { cookie } }, env);
}

// PL: Cookies uczniów (logowanie ma limity, więc logujemy raz na plik).
// EN: The students' cookies (sign-in has limits, so we sign in once per file).
let plain = '';
let editor = '';
let council = '';

// PL: Przed każdym testem wyczyść role i kody, a uczniów zaloguj tylko za pierwszym razem.
// EN: Before every test clear the roles and the codes, and sign the students in only the first time.
beforeEach(async () => {
  if (plain === '') [plain, editor, council] = [await signIn(PLAIN_EMAIL), await signIn(EDITOR_EMAIL), await signIn(COUNCIL_EMAIL)];
  await db.delete(panelRoles);
  await db.delete(verification).where(like(verification.identifier, 'invite-code-%'));
  await grant(EDITOR_EMAIL, 'editor');
  await grant(COUNCIL_EMAIL, 'council');
});

// PL: Grupa testów adresu /me.
// EN: A group of tests for the /me route.
describe('GET /me', () => {
  it('bez sesji odpowiada 401 / answers 401 without a session', async () => {
    expect((await call('/me', 'GET', null)).status).toBe(401);
  });

  it('uczeń bez roli dostaje null, a z rolą jej poziom / a student without a role gets null, with a role its level', async () => {
    expect(await (await call('/me', 'GET', plain)).json()).toEqual({ level: null });
    expect(await (await call('/me', 'GET', editor)).json()).toEqual({ level: 'editor' });
    expect(await (await call('/me', 'GET', council)).json()).toEqual({ level: 'council' });
  });
});

// PL: Grupa testów wydawania kodów.
// EN: A group of tests for issuing codes.
describe('POST /invites', () => {
  it('bez sesji 401, bez roli i dla redakcji 403 / 401 without a session, 403 without a role and for the editorial team', async () => {
    expect((await call('/invites', 'POST', null)).status).toBe(401);
    expect((await call('/invites', 'POST', plain)).status).toBe(403);
    expect((await call('/invites', 'POST', editor)).status).toBe(403);
  });

  it('Samorząd dostaje kod ważny 14 dni, który jest w bazie / the Council gets a code valid for 14 days that is in the database', async () => {
    const response = await call('/invites', 'POST', council);
    const body = (await response.json()) as { code: string; expiresAt: string };

    // PL: Kod ma kształt „TEB-XXXX-XX”, a koniec ważności jest za 14 dni (z minutą zapasu).
    // EN: The code has the shape "TEB-XXXX-XX" and the expiry is in 14 days (with a minute of margin).
    expect(response.status).toBe(201);
    expect(body.code).toMatch(/^TEB-[A-Z0-9]{4}-[A-Z0-9]{2}$/);
    expect(Math.abs(Date.parse(body.expiresAt) - (Date.now() + 14 * 24 * 60 * 60 * 1000))).toBeLessThan(60_000);
    // PL: Kod naprawdę leży w bazie jako wiersz zaproszenia.
    // EN: The code really lies in the database as an invitation row.
    const rows = await db.select().from(verification).where(eq(verification.identifier, `invite-code-${body.code}`));
    expect(rows).toHaveLength(1);
  });
});
