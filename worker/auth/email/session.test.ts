/**
 * PL: Testy middleware requireStudent: 401 bez sesji, uczeń w kontekście z sesją, 503 bez ustawień serwera.
 * EN: Tests of the requireStudent middleware: 401 without a session, the student in the context with a session, 503 without server settings.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/session.ts::createRequireStudent
 * @uses worker/auth/email/testRuntime.ts::createTestRuntime
 * @used_by vitest.config.ts::include
 */

import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { AuthNotConfiguredError } from './runtimeAuth';
import { createRequireStudent, type StudentEnv } from './session';
import { createTestRuntime, signIn } from './testRuntime';

/**
 * PL: Buduje wymyślony router innego podtoru, który wymaga zalogowanego ucznia.
 * EN: Builds an invented router of another subtrack that requires a signed-in student.
 *
 * @param getRuntime - PL: skąd middleware bierze logowanie. EN: where the middleware gets sign-in.
 * @returns PL: router z jednym adresem /moje. EN: a router with one route, /mine.
 */
function createProtectedApp(getRuntime: Parameters<typeof createRequireStudent>[0]) {
  const app = new Hono<StudentEnv>();
  app.use(createRequireStudent(getRuntime));
  app.get('/mine', (context) => context.json(context.get('student')));
  return app;
}

// PL: Grupa testów sprawdzania sesji.
// EN: A group of session check tests.
describe('requireStudent', () => {
  // PL: Bez ciasteczka i ze zmyślonym ciasteczkiem odpowiedź to 401.
  // EN: Without a cookie and with a made-up cookie the answer is 401.
  it('bez sesji odpowiada 401 / answers 401 without a session', async () => {
    const test = createTestRuntime();
    const app = createProtectedApp(() => test.runtime);
    expect((await app.request('/mine')).status).toBe(401);
    const forged = await app.request('/mine', { headers: { cookie: 'better-auth.session_token=zmyslone.zmyslone' } });
    expect(forged.status).toBe(401);
  });

  // PL: Z sesją uczeń jest dostępny w kontekście.
  // EN: With a session the student is available in the context.
  it('z sesją podaje ucznia / gives the student with a session', async () => {
    const test = createTestRuntime();
    const app = createProtectedApp(() => test.runtime);
    const cookie = await signIn(test, 'jan.test@teb.edu.pl');
    const response = await app.request('/mine', { headers: { cookie } });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ email: 'jan.test@teb.edu.pl' });
  });

  // PL: Brak ustawień serwera to 503, nie 401.
  // EN: Missing server settings is 503, not 401.
  it('bez ustawień serwera odpowiada 503 / answers 503 without server settings', async () => {
    const app = createProtectedApp(() => {
      throw new AuthNotConfiguredError('test');
    });
    expect((await app.request('/mine')).status).toBe(503);
  });
});
