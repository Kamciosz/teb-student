/**
 * PL: Testy doboru komunikatu błędu na ekranie kodu zaproszenia: każdy kod z serwera ma czytelny komunikat po polsku, a brak sieci, limit i niedostępny serwer mają własne.
 * EN: Tests of picking the error message on the invitation code screen: every code from the server has a readable message in Polish, and no network, the limit and an unavailable server have their own.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses src/features/auth/invite/inviteMessages.ts::describeError
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { describeError, MESSAGES } from './inviteMessages';

// PL: Grupa testów doboru komunikatu.
// EN: A group of message picking tests.
describe('describeError', () => {
  // PL: Każdy znany kod daje swój komunikat, niezależnie od statusu.
  // EN: Every known code gives its own message, regardless of the status.
  it.each([
    [{ status: 400, code: 'INVITE_INVALID' }, MESSAGES.inviteInvalid],
    [{ status: 422, code: 'LOGIN_TAKEN' }, MESSAGES.loginTaken],
    [{ status: 400, error: 'invalid_login' }, MESSAGES.loginInvalid],
    [{ status: 400, error: 'invalid_password' }, MESSAGES.passwordInvalid],
    [{ status: 401, error: 'invalid_credentials' }, MESSAGES.credentialsWrong],
  ])('%j daje właściwy komunikat / gives the right message', (error, message) => {
    expect(describeError(error)).toBe(message);
  });

  // PL: Złe hasło z Better Auth ma tylko status 401 i swój kod, którego nie znamy z nazwy.
  // EN: A wrong password from Better Auth has only the 401 status and a code of its own that we do not know by name.
  it('zła para login i hasło z Better Auth to 401 / a wrong login and password pair from Better Auth is 401', () => {
    expect(describeError({ status: 401, code: 'INVALID_EMAIL_OR_PASSWORD' })).toBe(MESSAGES.credentialsWrong);
  });

  // PL: Błędy niezależne od tego, co uczeń robił.
  // EN: Errors that do not depend on what the student was doing.
  it('brak sieci, limit, serwer i nieznany błąd / no network, the limit, the server and an unknown error', () => {
    expect(describeError({})).toBe(MESSAGES.offline);
    expect(describeError({ status: 0 })).toBe(MESSAGES.offline);
    expect(describeError({ status: 429 })).toBe(MESSAGES.tooManyRequests);
    expect(describeError({ status: 503 })).toBe(MESSAGES.unavailable);
    expect(describeError({ status: 500, code: 'COS_NOWEGO' })).toBe(MESSAGES.unknown);
  });
});
