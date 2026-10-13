/**
 * PL: Test adresów dni skróconych podtoru 6 na prawdziwej bazie D1. Sprawdza dostęp (bez sesji 401, uczeń bez roli 403 przy włączaniu i wyłączaniu, bez zmian w bazie), włączenie dnia przez Samorząd (201, zapisane kto i kiedy), ponowne włączenie bez zmian, wyłączenie (200), złe daty (400), listę dni od dziś (tylko przyszłe) i sprawdzanie daty.
 *     Wszystko idzie przez prawdziwą sesję i prawdziwe sprawdzanie roli: osoba z rolą „council” dostaje 201 i 200, uczeń bez roli dostaje 403.
 * EN: Test of the shortened-day routes of subtrack 6 on a real D1 database. It checks access (no session 401, a student without a role 403 when turning a day on and off, with no change in the database), turning a day on by the Student Council (201, with who and when saved), turning it on again without changes, turning it off (200), bad dates (400), the list of days from today (future only) and date checking.
 *     Everything goes through a real session and the real role check: a person with the "council" role gets 201 and 200, a student without a role gets 403.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses worker/bell/routes.ts::bellApp
 * @uses worker/bell/shortenedDay.ts::parseShortenedDay
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
import { panelRoles } from '../db/schema/admin';
import { user } from '../db/schema/auth';
import { shortenedDays } from '../db/schema/bell';
// PL: Router logowania kodem z drzwi modułu auth, żeby zalogować ucznia tak jak w aplikacji.
// EN: The code sign-in router from the auth module door, to sign a student in the way the app does.
import { authEmailApp } from '../auth';
import type { Env } from '../shared';
import { bellApp } from './routes';
import { parseShortenedDay } from './shortenedDay';

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
async function grantRole(name: string, role: 'council'): Promise<void> {
  const [student] = await db.select().from(user).where(eq(user.email, `${name}.test@teb.edu.pl`));
  await db.insert(panelRoles).values({ userId: student!.id, role, grantedAt: 1 });
}

// PL: Ciasteczka sesji: osoby z rolą Samorządu i zwykłego ucznia bez roli, założone raz przed testami.
// EN: The session cookies: of a person with the Student Council role and of an ordinary student without a role, created once before the tests.
let councilCookie = '';
let studentCookie = '';

beforeAll(async () => {
  // PL: Samorząd dostaje rolę po zalogowaniu, uczeń zostaje bez roli.
  // EN: The council gets the role after signing in, the student stays without a role.
  councilCookie = await createSession('rada', '10.6.0.1');
  await grantRole('rada', 'council');
  studentCookie = await createSession('uczen', '10.6.0.2');
});

/**
 * PL: Wysyła zapytanie do routera dni skróconych z podanym ciasteczkiem (puste = bez sesji).
 * EN: Sends a request to the shortened-days router with the given cookie (empty = no session).
 *
 * @param method - PL: metoda HTTP. EN: the HTTP method.
 * @param path - PL: adres względem /shortened, np. „/2099-11-02”. EN: the address relative to /shortened, e.g. "/2099-11-02".
 * @param cookie - PL: ciasteczko sesji. EN: the session cookie.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
const request = async (method: 'GET' | 'POST' | 'DELETE', path: string, cookie = ''): Promise<Response> =>
  bellApp.request(`http://localhost/shortened${path}`, { method, headers: cookie ? { cookie } : {} }, env);

/**
 * PL: Czyta wiersz dnia skróconego z bazy albo null, gdy dnia nie ma.
 * EN: Reads the shortened-day row from the database, or null when the day is not there.
 *
 * @param date - PL: dzień RRRR-MM-DD. EN: the day as YYYY-MM-DD.
 * @returns PL: wiersz albo null. EN: the row or null.
 */
async function rowFor(date: string) {
  const [row] = await db.select().from(shortenedDays).where(eq(shortenedDays.date, date));
  return row ?? null;
}

describe('dostęp do dni skróconych', () => {
  it('bez sesji odczyt daje 401', async () => {
    // PL: Bez ciasteczka żaden adres nie odpowiada danymi.
    // EN: Without a cookie no address answers with data.
    expect((await request('GET', '')).status).toBe(401);
  });

  it('uczeń bez roli nie włączy dnia (403) i baza zostaje bez zmian', async () => {
    // PL: Zalogowany uczeń bez roli Samorządu dostaje 403 i żaden wiersz nie powstaje.
    // EN: A signed-in student without the Student Council role gets 403 and no row is created.
    const response = await request('POST', '/2099-11-02', studentCookie);
    expect(response.status).toBe(403);
    expect(await rowFor('2099-11-02')).toBeNull();
  });

  it('uczeń bez roli nie wyłączy dnia (403) i wiersz zostaje', async () => {
    // PL: Dzień jest już skrócony. Uczeń nie może go skasować, więc wiersz zostaje.
    // EN: The day is already shortened. The student cannot delete it, so the row stays.
    await db.insert(shortenedDays).values({ date: '2099-11-03', setAt: new Date(1) });
    expect((await request('DELETE', '/2099-11-03', studentCookie)).status).toBe(403);
    expect(await rowFor('2099-11-03')).not.toBeNull();
  });
});

describe('włączanie i wyłączanie dnia przez Samorząd', () => {
  it('Samorząd włącza dzień (201) i zapisuje, kto i kiedy', async () => {
    // PL: Po włączeniu dzień jest w bazie, a jako osoba ustawiająca zapisany jest członek Samorządu.
    // EN: After turning the day on it is in the database, and the setter saved is the council member.
    const before = Date.now();
    const response = await request('POST', '/2099-11-04', councilCookie);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ date: '2099-11-04', shortened: true });

    const [council] = await db.select().from(user).where(eq(user.email, 'rada.test@teb.edu.pl'));
    const row = await rowFor('2099-11-04');
    expect(row?.setBy).toBe(council!.id);
    expect(row!.setAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('ponowne włączenie tego samego dnia nic nie zmienia', async () => {
    // PL: Drugi zapis nie nadpisuje pierwszego: zostaje ta sama data ustawienia.
    // EN: The second write does not overwrite the first: the same setting time stays.
    const first = await rowFor('2099-11-04');
    expect((await request('POST', '/2099-11-04', councilCookie)).status).toBe(201);
    expect((await rowFor('2099-11-04'))?.setAt.getTime()).toBe(first!.setAt.getTime());
  });

  it('Samorząd wyłącza dzień (200) i wiersz znika', async () => {
    // PL: Po wyłączeniu dnia nie ma w bazie wiersza dla tej daty.
    // EN: After turning the day off there is no row for this date in the database.
    const response = await request('DELETE', '/2099-11-04', councilCookie);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ date: '2099-11-04', shortened: false });
    expect(await rowFor('2099-11-04')).toBeNull();
  });
});

describe('złe daty', () => {
  it.each(['2026-02-30', '2026-13-01', 'abc', '2026-1-05'])('data „%s” daje 400 i nic nie zapisuje', async (date) => {
    // PL: Data spoza kalendarza albo w złym kształcie nie trafia do bazy, ani przy włączaniu, ani przy wyłączaniu.
    // EN: A date outside the calendar or in the wrong shape does not reach the database, neither when turning on nor when turning off.
    const post = await request('POST', `/${date}`, councilCookie);
    expect(post.status).toBe(400);
    expect(await post.json()).toEqual({ error: 'invalid_date' });
    expect((await request('DELETE', `/${date}`, councilCookie)).status).toBe(400);
    expect(await db.select().from(shortenedDays).where(eq(shortenedDays.date, date))).toEqual([]);
  });
});

describe('lista dni skróconych', () => {
  it('uczeń dostaje tylko dni od dziś w górę, rosnąco', async () => {
    // PL: Dzień z 2000 roku już minął i nie wraca na listę. Dni z 2099 roku są w przyszłości.
    // EN: A day from 2000 has passed and does not come back on the list. Days from 2099 are in the future.
    await db.insert(shortenedDays).values([
      { date: '2099-12-20', setAt: new Date(1) },
      { date: '2000-01-01', setAt: new Date(1) },
      { date: '2099-12-10', setAt: new Date(1) },
    ]);
    const response = await request('GET', '', studentCookie);
    expect(response.status).toBe(200);
    const body = (await response.json()) as { dates: string[] };
    expect(body.dates.filter((date) => date.startsWith('2099-12-'))).toEqual(['2099-12-10', '2099-12-20']);
    expect(body.dates).not.toContain('2000-01-01');
  });
});

describe('sprawdzanie daty', () => {
  it('przyjmuje prawdziwe daty w formacie RRRR-MM-DD', () => {
    // PL: Zwykła data i 29 lutego w roku przestępnym przechodzą.
    // EN: An ordinary date and 29 February in a leap year pass.
    expect(parseShortenedDay('2026-10-23')).toBe('2026-10-23');
    expect(parseShortenedDay('2028-02-29')).toBe('2028-02-29');
  });

  it('odrzuca daty spoza kalendarza i złe kształty', () => {
    // PL: 30 lutego, 13. miesiąc, 29 lutego w roku bez 29 dnia, tekst i skrócony zapis.
    // EN: 30 February, the 13th month, 29 February in a year without it, text and a short form.
    expect(parseShortenedDay('2026-02-30')).toBeNull();
    expect(parseShortenedDay('2026-13-01')).toBeNull();
    expect(parseShortenedDay('2027-02-29')).toBeNull();
    expect(parseShortenedDay('abc')).toBeNull();
    expect(parseShortenedDay('2026-1-05')).toBeNull();
  });
});
