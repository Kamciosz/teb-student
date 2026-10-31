/**
 * PL: Testy ustawień produkcyjnych logowania kodem: limit zapytań zapisany w bazie (tabela rate_limit), ciasteczko sesji z Secure i HttpOnly przy adresie https oraz odrzucanie Origin spoza adresu aplikacji.
 * EN: Tests of the production settings of code sign-in: the request limit kept in the database (the rate_limit table), the session cookie with Secure and HttpOnly at an https address, and rejecting an Origin outside the app address.
 *
 * @author Szymon
 * @since 2026-10-31
 * @uses worker/auth/email/createAuth.ts::createAuth
 * @uses worker/auth/email/testRuntime.ts::createTestRuntime
 * @uses worker/db/schema/auth.ts::rateLimit
 * @used_by vitest.config.ts::include
 */

// PL: Baza testowa z bindingiem DB, którą sprawdzamy bezpośrednim zapytaniem SQL.
// EN: The test database (the DB binding), checked with a direct SQL query.
import { env } from 'cloudflare:workers';
import { describe, expect, it, vi } from 'vitest';
import { call, createTestRuntime, uniqueIp } from './testRuntime';

/** PL: Wymyślony adres ucznia do testów. EN: An invented student address for tests. */
const EMAIL = 'jan.test@teb.edu.pl';
/** PL: Adres wysyłki kodu. EN: The code sending path. */
const SEND = '/email-otp/send-verification-otp';
/** PL: Adres logowania kodem. EN: The code sign-in path. */
const SIGN_IN = '/sign-in/email-otp';
/** PL: Adres aplikacji z https, tak jak BETTER_AUTH_URL na produkcji. EN: The https app address, as BETTER_AUTH_URL is in production. */
const APP_URL = 'https://uczen.example.pl';

// PL: Grupa testów limitu zapytań w bazie.
// EN: A group of tests for the request limit in the database.
describe('limit zapytań w bazie / request limit in the database', () => {
  // PL: Licznik ma być w tabeli rate_limit, a nie w pamięci Workera. Na starym kodzie tabeli nie ma i zapytanie się wywala.
  // EN: The counter must be in the rate_limit table, not in the Worker's memory. On the old code the table does not exist and the query fails.
  it('zapisuje licznik w tabeli rate_limit / keeps the counter in the rate_limit table', async () => {
    const test = createTestRuntime();
    const ip = uniqueIp();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await call(test.app, SEND, { body: { email: EMAIL }, ip });
    }
    const row = await env.DB.prepare('SELECT count FROM rate_limit WHERE key LIKE ?').bind(`%${ip}%`).first<{ count: number }>();
    expect(row?.count).toBe(3);
  });

  // PL: Druga instancja logowania na tej samej bazie widzi próby pierwszej i odrzuca czwartą wysyłkę (429).
  // EN: A second sign-in instance on the same database sees the attempts of the first and rejects the fourth send (429).
  it('druga instancja na tej samej bazie dostaje 429 / a second instance on the same database gets 429', async () => {
    const first = createTestRuntime();
    const ip = uniqueIp();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await call(first.app, SEND, { body: { email: EMAIL }, ip });
    }
    const second = createTestRuntime();
    const response = await call(second.app, SEND, { body: { email: EMAIL }, ip });
    expect(response.status).toBe(429);
  });

  // PL: Ta sama próba z oddzielnym modułem: po wyczyszczeniu pamięci modułów druga instancja nie zna liczników pierwszej, więc licznik musi być w bazie.
  // EN: The same attempt with a separate module: after clearing the module memory the second instance does not know the first one's counters, so the counter must be in the database.
  it('limit przeżywa nowy moduł, bo liczy baza / the limit survives a new module, because the database counts', async () => {
    const first = createTestRuntime();
    const ip = uniqueIp();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await call(first.app, SEND, { body: { email: EMAIL }, ip });
    }
    vi.resetModules();
    const fresh = await import('./testRuntime');
    const second = fresh.createTestRuntime();
    const response = await fresh.call(second.app, SEND, { body: { email: EMAIL }, ip });
    expect(response.status).toBe(429);
  });
});

// PL: Grupa testów ciasteczka sesji i nagłówka Origin.
// EN: A group of tests for the session cookie and the Origin header.
describe('ciasteczko i Origin przy adresie https / cookie and Origin at an https address', () => {
  // PL: Ciasteczko sesji przy https ma Secure i HttpOnly, żeby nie poszło po zwykłym http i nie czytał go JavaScript.
  // EN: The session cookie at https has Secure and HttpOnly, so it is not sent over plain http and JavaScript cannot read it.
  it('ciasteczko sesji ma Secure i HttpOnly / the session cookie has Secure and HttpOnly', async () => {
    const test = createTestRuntime(true, APP_URL);
    const ip = uniqueIp();
    await call(test.app, SEND, { body: { email: EMAIL }, ip, origin: test.origin });
    const code = test.sent[test.sent.length - 1]?.code ?? '';
    const response = await call(test.app, SIGN_IN, { body: { email: EMAIL, otp: code }, ip, origin: test.origin });
    expect(response.status).toBe(200);
    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).toMatch(/;\s*Secure/i);
    expect(cookie).toMatch(/;\s*HttpOnly/i);
  });

  // PL: Przeglądarka wysyła Origin równy adresowi aplikacji, więc takie zapytanie przechodzi.
  // EN: The browser sends an Origin equal to the app address, so such a request goes through.
  it('przyjmuje Origin równy adresowi aplikacji / accepts an Origin equal to the app address', async () => {
    const test = createTestRuntime(true, APP_URL);
    const response = await call(test.app, SEND, { body: { email: EMAIL }, origin: APP_URL, cookie: 'x=1' });
    expect(response.status).toBe(200);
  });

  // PL: Zapytanie z ciasteczkiem i Origin z innego adresu niż aplikacja jest odrzucane. Ten przypadek to nasz adres „localhost”, który na starym kodzie był zaufany, bo Better Auth ufał adresowi samego zapytania.
  // EN: A request with a cookie and an Origin other than the app address is rejected. This case is our own "localhost" address, which the old code trusted, because Better Auth trusted the address of the request itself.
  it('odrzuca Origin spoza adresu aplikacji (localhost) / rejects an Origin outside the app address (localhost)', async () => {
    const test = createTestRuntime(true, APP_URL);
    const response = await call(test.app, SEND, { body: { email: EMAIL }, origin: 'http://localhost', cookie: 'x=1' });
    expect(response.status).toBe(403);
  });

  // PL: Obcy serwer też jest odrzucany, na starym i nowym kodzie.
  // EN: A foreign server is rejected too, on the old and the new code.
  it('odrzuca obcy Origin / rejects a foreign Origin', async () => {
    const test = createTestRuntime(true, APP_URL);
    const response = await call(test.app, SEND, { body: { email: EMAIL }, origin: 'https://evil.example', cookie: 'x=1' });
    expect(response.status).toBe(403);
  });
});
