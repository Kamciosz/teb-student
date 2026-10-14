/**
 * PL: Wspólne narzędzia testów panelu: logowanie uczniów kodem przez prawdziwy router auth, nadawanie ról w bazie D1 i wołanie routera panelu z ciasteczkiem albo ciałem zapytania. Używają ich testy routes, roles, pilot i dziennik.
 * EN: Shared tools for the panel tests: signing students in with a code through the real auth router, granting roles in the D1 database, and calling the panel router with a cookie or a request body. The routes, roles, pilot and diary tests use them.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/auth/index.ts::authEmailApp
 * @uses worker/admin/routes.ts::adminApp
 * @uses worker/db/schema/admin.ts::diaryEntries
 * @used_by worker/admin/routes.test.ts::setUpPanel
 * @used_by worker/admin/roles.test.ts::setUpPanel
 * @used_by worker/admin/pilot.test.ts::setUpPanel
 * @used_by worker/admin/diary.test.ts::setUpPanel
 */

// PL: Funkcje udawania console.info (tam Better Auth wypisuje kod logowania).
// EN: The function that stubs console.info (where Better Auth prints the sign-in code).
import { vi } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1.
// EN: The Worker test environment with the D1 database.
import { env } from 'cloudflare:workers';
// PL: Klient bazy i warunki do odczytu i czyszczenia.
// EN: The database client and the conditions for reading and clearing.
import { eq, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Hono do zbudowania aplikacji z routerem logowania.
// EN: Hono to build an app with the sign-in router.
import { Hono } from 'hono';
// PL: Tabele: role, konta i kody zaproszeń (leżą w verification).
// EN: The tables: roles, accounts and invitation codes (they live in verification).
import { diaryEntries, panelRoles, type PanelRole } from '../db/schema/admin';
import { user, verification } from '../db/schema/auth';
// PL: Router logowania kodem z drzwi modułu auth i typ środowiska Workera.
// EN: The code sign-in router from the auth module door and the Worker environment type.
import { authEmailApp } from '../auth';
import type { Env } from '../shared';
// PL: Router panelu, który sprawdzamy.
// EN: The panel router under test.
import { adminApp } from './routes';

/**
 * PL: Klient bazy testowej.
 * EN: The test database client.
 */
export const db = drizzle(env.DB);

/**
 * PL: Wymyślone adresy kont z testów: zwykły uczeń, redakcja, Samorząd i administrator.
 * EN: The invented account addresses of the tests: an ordinary student, the editorial team, the Council and the administrator.
 */
export const EMAILS = {
  plain: 'panel.zwykly@teb.edu.pl',
  editor: 'panel.redakcja@teb.edu.pl',
  council: 'panel.samorzad@teb.edu.pl',
  admin: 'panel.admin@teb.edu.pl',
} as const;

/**
 * PL: Kto z testów, czyli klucz do ciasteczka sesji.
 * EN: Who in the tests, that is the key of the session cookie.
 */
export type Who = keyof typeof EMAILS;

// PL: Licznik adresów IP, żeby limit logowania jednego konta nie wpływał na inne.
// EN: The IP address counter, so one account's sign-in limit does not affect another's.
let nextIp = 1;

// PL: Ciasteczka wszystkich kont w tym pliku (logowanie ma limity, więc logujemy raz).
// EN: The cookies of all accounts in this file (sign-in has limits, so we sign in once).
let cookies: Record<Who, string> | null = null;

/**
 * PL: Loguje konto kodem przez prawdziwy router auth i oddaje ciasteczko sesji.
 * EN: Signs the account in with a code through the real auth router and returns the session cookie.
 *
 * @param email - PL: adres konta. EN: the account address.
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
 * PL: Loguje wszystkie konta testów (tylko za pierwszym razem w pliku) i oddaje ich ciasteczka.
 * EN: Signs in all the test accounts (only the first time in the file) and returns their cookies.
 *
 * @returns PL: ciasteczka według kto. EN: the cookies by who.
 */
async function signInAll(): Promise<Record<Who, string>> {
  // PL: Zaloguj po raz pierwszy, potem oddawaj zapamiętane ciasteczka.
  // EN: Sign in the first time, then return the remembered cookies.
  if (cookies === null) {
    cookies = {
      plain: await signIn(EMAILS.plain),
      editor: await signIn(EMAILS.editor),
      council: await signIn(EMAILS.council),
      admin: await signIn(EMAILS.admin),
    };
  }
  return cookies;
}

/**
 * PL: Numer konta po adresie (pusty tekst, gdy konta nie ma).
 * EN: The account id by the address (empty text when there is no account).
 *
 * @param email - PL: adres konta. EN: the account address.
 * @returns PL: numer konta. EN: the account id.
 */
export async function studentId(email: string): Promise<string> {
  // PL: Szukaj konta po adresie.
  // EN: Look for the account by its address.
  const [account] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  return account?.id ?? '';
}

/**
 * PL: Daje koncie rolę w bazie.
 * EN: Gives the account a role in the database.
 *
 * @param email - PL: adres konta, które już się zalogowało. EN: the address of an account that has already signed in.
 * @param role - PL: rola do nadania. EN: the role to grant.
 */
async function grant(email: string, role: PanelRole): Promise<void> {
  // PL: Wpisz rolę dla numeru konta.
  // EN: Insert the role for the account id.
  await db.insert(panelRoles).values({ userId: await studentId(email), role, grantedAt: 1 });
}

/**
 * PL: Przygotowuje panel do testu: loguje konta, czyści role i kody, nadaje redakcji rolę redakcji, Samorządowi rolę Samorządu, administratorowi rolę administratora.
 * EN: Prepares the panel for a test: signs the accounts in, clears the roles and codes, gives the editorial team the editorial role, the Council the Council role and the administrator the administrator role.
 *
 * @returns PL: ciasteczka kont. EN: the cookies of the accounts.
 */
export async function setUpPanel(): Promise<Record<Who, string>> {
  // PL: Zaloguj konta, wyczyść role i kody z poprzedniego testu, a potem nadaj role startowe.
  // EN: Sign the accounts in, clear the roles and codes from the previous test, then grant the starting roles.
  const signedIn = await signInAll();
  await db.delete(panelRoles);
  await db.delete(diaryEntries);
  await db.delete(verification).where(like(verification.identifier, 'invite-code-%'));
  await grant(EMAILS.editor, 'editor');
  await grant(EMAILS.council, 'council');
  await grant(EMAILS.admin, 'admin');
  return signedIn;
}

/**
 * PL: Czyta z bazy role konta (bez rol innych kont).
 * EN: Reads the account's roles from the database (not the roles of other accounts).
 *
 * @param email - PL: adres konta. EN: the account address.
 * @returns PL: lista ról konta. EN: the list of the account's roles.
 */
export async function rolesOf(email: string): Promise<PanelRole[]> {
  // PL: Zapytanie ma warunek po numerze konta.
  // EN: The query has a condition on the account id.
  const rows = await db.select({ role: panelRoles.role }).from(panelRoles).where(eq(panelRoles.userId, await studentId(email)));
  return rows.map((row) => row.role);
}

/**
 * PL: Woła router panelu z ciasteczkiem sesji albo bez niego, z ciałem zapytania albo bez.
 * EN: Calls the panel router with a session cookie or without one, with a request body or without one.
 *
 * @param path - PL: adres w routerze (z zapytaniem, jeśli trzeba). EN: the route in the router (with the query, if needed).
 * @param method - PL: metoda HTTP. EN: the HTTP method.
 * @param cookie - PL: ciasteczko sesji albo null. EN: the session cookie or null.
 * @param body - PL: ciało zapytania w JSON (opcjonalne). EN: the request body as JSON (optional).
 * @returns PL: odpowiedź routera. EN: the router response.
 */
export async function callAdmin(path: string, method: 'GET' | 'POST' | 'PUT', cookie: string | null, body?: unknown): Promise<Response> {
  // PL: Nagłówki: ciasteczko, gdy jest, i typ JSON, gdy jest ciało.
  // EN: Headers: the cookie when there is one, and the JSON type when there is a body.
  const headers: Record<string, string> = {};
  if (cookie !== null) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  // PL: Oddaj odpowiedź routera razem z bindingiem bazy testowej.
  // EN: Return the router response together with the test database binding.
  return adminApp.request(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }, env);
}
