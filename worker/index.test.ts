/**
 * PL: Test adresu /api/health. Sprawdza, że Worker odpowiada kodem 200 i treścią {"status":"ok"}. Test działa w środowisku Cloudflare (workerd), co sprawdzono przez navigator.userAgent.
 * EN: Test of the /api/health route. Checks that the Worker answers with code 200 and the body {"status":"ok"}. The test runs in the Cloudflare environment (workerd), verified through navigator.userAgent.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/index.ts::app
 * @used_by vitest.config.ts::cloudflareTest
 */

// PL: Aplikacja Hono z kodu serwera. Test uruchamia ją w środowisku Cloudflare dzięki wtyczce w vitest.config.ts.
// EN: The Hono app from the server code. The test runs it in the Cloudflare environment thanks to the plugin in vitest.config.ts.
import app from './index';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';

// PL: Grupa testów adresu /api/health.
// EN: A group of tests for the /api/health route.
describe('GET /api/health', () => {
  // PL: Jedyny przypadek: Worker działa, więc odpowiada „ok”.
  // EN: The only case: the Worker runs, so it answers "ok".
  it('odpowiada 200 i status ok / answers 200 and status ok', async () => {
    // PL: Wyślij zapytanie do aplikacji tak, jak zrobiłby to telefon.
    // EN: Send a request to the app the way a phone would.
    const response = await app.request('/api/health');

    // PL: Kod odpowiedzi musi być 200, czyli „działa”.
    // EN: The response code must be 200, meaning "works".
    expect(response.status).toBe(200);
    // PL: Treść musi mówić „ok”.
    // EN: The body must say "ok".
    expect(await response.json()).toEqual({ status: 'ok' });
  });
});
