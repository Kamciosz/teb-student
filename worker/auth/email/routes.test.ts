/**
 * PL: Testy routera logowania kodem: zły kod, kod po terminie, obca domena, sesja po zalogowaniu, wylogowanie, limit wysyłek i brak wysyłki bez nadawcy. Działają na bazie w pamięci, ale na tym samym kodzie co Worker.
 * EN: Tests of the code sign-in router: a wrong code, an expired code, a foreign domain, the session after sign-in, sign-out, the send limit and no sending without a sender. They run on an in-memory database, but on the same code as the Worker.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/routes.ts::createAuthEmailApp
 * @uses worker/auth/email/testRuntime.ts::createTestRuntime
 * @used_by vitest.config.ts::include
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { call, createTestRuntime, sessionCookie, signIn, uniqueIp } from './testRuntime';

/** PL: Wymyślony adres ucznia do testów. EN: An invented student address for tests. */
const EMAIL = 'jan.test@teb.edu.pl';
/** PL: Adres wysyłki kodu. EN: The code sending path. */
const SEND = '/email-otp/send-verification-otp';
/** PL: Adres logowania kodem. EN: The code sign-in path. */
const SIGN_IN = '/sign-in/email-otp';

// PL: Po każdym teście zegar wraca do prawdziwego.
// EN: After every test the clock goes back to the real one.
afterEach(() => {
  vi.useRealTimers();
});

// PL: Grupa testów wysyłania kodu.
// EN: A group of code sending tests.
describe('wysyłanie kodu / sending the code', () => {
  // PL: Adres szkolny dostaje sześciocyfrowy kod, a wielkość liter nie ma znaczenia.
  // EN: A school address gets a six-digit code, and letter case does not matter.
  it('wysyła 6 cyfr na adres szkolny / sends 6 digits to a school address', async () => {
    const test = createTestRuntime();
    const response = await call(test.app, SEND, { body: { email: 'Jan.TEST@TEB.edu.pl' } });
    expect(response.status).toBe(200);
    expect(test.sent).toHaveLength(1);
    expect(test.sent[0]?.email).toBe(EMAIL);
    expect(test.sent[0]?.code).toMatch(/^\d{6}$/);
  });

  // PL: Obca domena jest odrzucana, zanim powstanie kod. Są tu też podstępy: doklejony początek, doklejony koniec i poddomena.
  // EN: A foreign domain is rejected before a code is created. Tricks are here too: a glued start, a glued end and a subdomain.
  it.each(['a@gmail.com', 'a@xteb.edu.pl', 'a@teb.edu.pl.evil.com', 'a@sub.teb.edu.pl', '@teb.edu.pl'])(
    'odrzuca obcy adres i nie wysyła kodu / rejects a foreign address and sends no code: %s',
    async (email) => {
      const test = createTestRuntime();
      const response = await call(test.app, SEND, { body: { email } });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'email_not_allowed' });
      expect(test.sent).toEqual([]);
    },
  );
});

// PL: Grupa testów zepsutego ciała i typu kodu.
// EN: A group of tests for a broken body and the code type.
describe('wysyłanie kodu: ciało zapytania / sending the code: request body', () => {
  // PL: Ciało bez adresu albo nie-JSON to błąd telefonu.
  // EN: A body without an address, or not JSON, is the phone's error.
  it('odrzuca zepsute ciało / rejects a broken body', async () => {
    const test = createTestRuntime();
    const noEmail = await call(test.app, SEND, { body: { type: 'sign-in' } });
    expect(noEmail.status).toBe(400);
    const notJson = await test.app.request('http://localhost/api/auth/email' + SEND, {
      method: 'POST',
      headers: { origin: 'http://localhost', 'cf-connecting-ip': uniqueIp(), 'content-type': 'application/json' },
      body: 'to nie jest json',
    });
    expect(notJson.status).toBe(400);
    expect(test.sent).toEqual([]);
  });

  // PL: Telefon nie może wybrać typu kodu: prośba o kod do resetu hasła i tak daje kod logowania.
  // EN: The phone cannot choose the code type: a request for a password reset code still gives a sign-in code.
  it('ignoruje typ kodu z telefonu / ignores the code type from the phone', async () => {
    const test = createTestRuntime();
    await call(test.app, SEND, { body: { email: EMAIL, type: 'forget-password' } });
    const login = await call(test.app, SIGN_IN, { body: { email: EMAIL, otp: test.sent[0]?.code } });
    expect(login.status).toBe(200);
  });
});

// PL: Grupa testów nadawcy kodu i limitu wysyłek.
// EN: A group of tests for the code sender and the send limit.
describe('wysyłanie kodu: nadawca i limit / sending the code: sender and limit', () => {
  // PL: Bez nadawcy kodu serwer mówi to wprost (503) i niczego nie tworzy, więc uczeń nie widzi fałszywego „kod wysłany”.
  // EN: Without a code sender the server says so plainly (503) and creates nothing, so the student does not see a false "code sent".
  it('bez nadawcy odpowiada 503 / answers 503 without a sender', async () => {
    const test = createTestRuntime(false);
    const response = await call(test.app, SEND, { body: { email: EMAIL } });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'codes_unavailable' });
    expect(test.sent).toEqual([]);
  });

  // PL: Czwarta wysyłka w minucie z jednego adresu IP dostaje 429, a inny adres IP nie jest dotknięty.
  // EN: The fourth send within a minute from one IP address gets 429, and another IP address is not affected.
  it('limituje wysyłki do 3 na minutę z jednego IP / limits sends to 3 per minute per IP', async () => {
    const test = createTestRuntime();
    const ip = uniqueIp();
    const statuses: number[] = [];
    for (let i = 0; i < 4; i += 1) {
      statuses.push((await call(test.app, SEND, { body: { email: EMAIL }, ip })).status);
    }
    expect(statuses).toEqual([200, 200, 200, 429]);
    const other = await call(test.app, SEND, { body: { email: EMAIL }, ip: uniqueIp() });
    expect(other.status).toBe(200);
  });
});

// PL: Grupa testów logowania kodem.
// EN: A group of code sign-in tests.
describe('logowanie kodem / signing in with a code', () => {
  // PL: Zły kod nie daje sesji ani ciasteczka.
  // EN: A wrong code gives no session and no cookie.
  it('zły kod nie loguje / a wrong code does not sign in', async () => {
    const test = createTestRuntime();
    await call(test.app, SEND, { body: { email: EMAIL } });
    const wrong = test.sent[0]?.code === '000000' ? '111111' : '000000';
    const response = await call(test.app, SIGN_IN, { body: { email: EMAIL, otp: wrong } });
    expect(response.status).toBe(400);
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  // PL: Po trzech złych próbach nawet dobry kod przestaje działać.
  // EN: After three wrong attempts even the correct code stops working.
  it('po 3 złych próbach dobry kod nie działa / the correct code fails after 3 wrong attempts', async () => {
    const test = createTestRuntime();
    await call(test.app, SEND, { body: { email: EMAIL } });
    const good = test.sent[0]?.code ?? '';
    const wrong = good === '000000' ? '111111' : '000000';
    for (let i = 0; i < 3; i += 1) await call(test.app, SIGN_IN, { body: { email: EMAIL, otp: wrong } });
    const response = await call(test.app, SIGN_IN, { body: { email: EMAIL, otp: good } });
    expect(response.status).toBe(403);
    expect(response.headers.get('set-cookie')).toBeNull();
  });
});

// PL: Grupa testów czasu życia kodu i obcego adresu przy logowaniu.
// EN: A group of tests for the code lifetime and a foreign address at sign-in.
describe('logowanie kodem: czas / signing in with a code: time', () => {
  // PL: Kod żyje 10 minut: po 9 działa, po 11 nie.
  // EN: The code lives 10 minutes: it works after 9, it does not after 11.
  it('kod wygasa po 10 minutach / the code expires after 10 minutes', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-09T10:00:00Z'));
    const early = createTestRuntime();
    await call(early.app, SEND, { body: { email: EMAIL } });
    vi.setSystemTime(new Date('2026-10-09T10:09:00Z'));
    const stillValid = await call(early.app, SIGN_IN, { body: { email: EMAIL, otp: early.sent[0]?.code } });
    expect(stillValid.status).toBe(200);

    vi.setSystemTime(new Date('2026-10-09T10:00:00Z'));
    const late = createTestRuntime();
    await call(late.app, SEND, { body: { email: EMAIL } });
    vi.setSystemTime(new Date('2026-10-09T10:11:00Z'));
    const expired = await call(late.app, SIGN_IN, { body: { email: EMAIL, otp: late.sent[0]?.code } });
    expect(expired.status).toBe(400);
    expect(expired.headers.get('set-cookie')).toBeNull();
  });

  // PL: Obcy adres nie zakłada konta nawet z poprawnym kodem: sprawdzamy, że po odrzuceniu nie ma użytkownika.
  // EN: A foreign address creates no account even with a correct code: we check there is no user after the rejection.
  it('obcy adres nie zakłada konta / a foreign address creates no account', async () => {
    const test = createTestRuntime();
    const response = await call(test.app, SIGN_IN, { body: { email: 'a@gmail.com', otp: '123456' } });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'email_not_allowed' });
    const { internalAdapter } = await test.runtime.auth.$context;
    expect(await internalAdapter.findUserByEmail('a@gmail.com')).toBeNull();
  });
});

// PL: Grupa testów sesji i wylogowania.
// EN: A group of session and sign-out tests.
describe('sesja i wylogowanie / session and sign-out', () => {
  // PL: Bez ciasteczka sesji nie ma.
  // EN: Without a cookie there is no session.
  it('bez ciasteczka sesja jest pusta / without a cookie the session is empty', async () => {
    const test = createTestRuntime();
    const response = await call(test.app, '/get-session');
    expect(await response.json()).toBeNull();
  });

  // PL: Po dobrym kodzie ciasteczko jest HttpOnly, a sesja wskazuje ucznia.
  // EN: After a correct code the cookie is HttpOnly and the session points to the student.
  it('po zalogowaniu sesja wskazuje ucznia / after sign-in the session points to the student', async () => {
    const test = createTestRuntime();
    const ip = uniqueIp();
    await call(test.app, SEND, { body: { email: EMAIL }, ip });
    const login = await call(test.app, SIGN_IN, { body: { email: EMAIL, otp: test.sent[0]?.code }, ip });
    expect(login.status).toBe(200);
    expect(login.headers.get('set-cookie')).toContain('HttpOnly');

    const response = await call(test.app, '/get-session', { cookie: sessionCookie(login) });
    const session = (await response.json()) as { user: { email: string } };
    expect(session.user.email).toBe(EMAIL);
  });

  // PL: Po wylogowaniu to samo ciasteczko nie daje już sesji, bo sesja zniknęła z bazy.
  // EN: After sign-out the same cookie no longer gives a session, because the session is gone from the database.
  it('po wylogowaniu ciasteczko przestaje działać / after sign-out the cookie stops working', async () => {
    const test = createTestRuntime();
    const cookie = await signIn(test, EMAIL);
    expect(cookie).not.toBe('');

    const out = await call(test.app, '/sign-out', { body: {}, cookie });
    expect(out.status).toBe(200);
    const response = await call(test.app, '/get-session', { cookie });
    expect(await response.json()).toBeNull();
  });
});

// PL: Grupa testów adresów, które router ma nie przepuszczać.
// EN: A group of tests for routes the router must not let through.
describe('inne adresy Better Auth / other Better Auth routes', () => {
  // PL: Reset hasła, logowanie hasłem i weryfikacja maila nie są częścią tego podtoru, więc dostają 404.
  // EN: Password reset, password sign-in and e-mail verification are not part of this subtrack, so they get 404.
  it.each([
    ['/email-otp/reset-password', 'POST'],
    ['/email-otp/verify-email', 'POST'],
    ['/sign-in/email', 'POST'],
    ['/sign-up/email', 'POST'],
    ['/email-otp/check-verification-otp', 'POST'],
  ])('%s zwraca 404 / returns 404', async (path, method) => {
    const test = createTestRuntime();
    const response = await call(test.app, path, { method, body: { email: EMAIL } });
    expect(response.status).toBe(404);
  });
});
