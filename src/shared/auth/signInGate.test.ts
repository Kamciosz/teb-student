/**
 * PL: Test bramki logowania: 401 z adresów serwera aplikacji wywołuje przeniesienie na logowanie, a inne odpowiedzi, obce adresy, logowanie (/api/auth/…) i ekrany logowania nie. Odpowiedź zawsze wraca do wołającego bez zmian.
 * EN: Test of the sign-in gate: a 401 from the app server addresses triggers the move to sign-in, and other responses, foreign addresses, sign-in (/api/auth/…) and the sign-in screens do not. The response always returns to the caller unchanged.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses src/shared/auth/signInGate.ts::withSignInGate
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it, vi } from 'vitest';
// PL: Funkcja pod testem.
// EN: The function under test.
import { withSignInGate } from './signInGate';

// PL: Adres aplikacji w testach.
// EN: The app origin in the tests.
const ORIGIN = 'https://teb.example';

/**
 * PL: Buduje fetch z bramką nad atrapą serwera, która odpowiada podanym kodem, oraz atrapę reakcji na 401.
 * EN: Builds fetch with the gate over a server stub that answers with the given status, and a stub of the 401 reaction.
 *
 * @param status - PL: kod odpowiedzi atrapy serwera. EN: the status the server stub answers with.
 * @param pathname - PL: ścieżka otwartego ekranu. EN: the path of the open screen.
 */
function createGate(status: number, pathname = '/reports/student') {
  const onUnauthorized = vi.fn();
  const baseFetch = vi.fn(async () => new Response('{}', { status }));
  const gated = withSignInGate(baseFetch as unknown as typeof fetch, { origin: ORIGIN, getPathname: () => pathname, onUnauthorized });
  return { gated, onUnauthorized };
}

describe('bramka logowania / the sign-in gate', () => {
  it('przy 401 z /api/ przenosi na logowanie i oddaje odpowiedź / on a 401 from /api/ moves to sign-in and returns the response', async () => {
    const { gated, onUnauthorized } = createGate(401);

    const response = await gated('/api/reports/student');

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });

  it('rozpoznaje adres podany jako URL i jako Request / recognizes an address given as a URL and as a Request', async () => {
    const { gated, onUnauthorized } = createGate(401);

    await gated(new URL(`${ORIGIN}/api/surveys/vote/`));
    await gated(new Request(`${ORIGIN}/api/surveys/vote/`));

    expect(onUnauthorized).toHaveBeenCalledTimes(2);
  });

  it('nie reaguje na inne kody niż 401 / ignores statuses other than 401', async () => {
    for (const status of [200, 403, 409, 500]) {
      const { gated, onUnauthorized } = createGate(status);
      await gated('/api/reports/student');
      expect(onUnauthorized).not.toHaveBeenCalled();
    }
  });

  it('nie reaguje na logowanie i obce adresy / ignores sign-in and foreign addresses', async () => {
    const { gated, onUnauthorized } = createGate(401);

    await gated('/api/auth/email/sign-in/email-otp');
    await gated('https://inna-domena.example/api/reports/student');
    await gated('/zasoby/plik.json');

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('milczy na ekranie logowania, żeby nie zapętlić przeniesień / stays quiet on the sign-in screen so redirects do not loop', async () => {
    const { gated, onUnauthorized } = createGate(401, '/auth/email');

    await gated('/api/reports/student');

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('błąd sieci przechodzi dalej bez przeniesienia / a network error passes through without a move', async () => {
    const onUnauthorized = vi.fn();
    const failing = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const gated = withSignInGate(failing as unknown as typeof fetch, { origin: ORIGIN, getPathname: () => '/', onUnauthorized });

    await expect(gated('/api/reports/student')).rejects.toThrow('Failed to fetch');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
