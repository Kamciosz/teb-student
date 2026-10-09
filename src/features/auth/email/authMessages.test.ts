/**
 * PL: Testy doboru komunikatów błędów logowania: każdy błąd serwera ma polski komunikat, a brak sieci jest rozpoznany.
 * EN: Tests of picking the sign-in error messages: every server error has a Polish message, and no network is recognized.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/auth/email/authMessages.ts::describeSendError
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { describeSendError, describeVerifyError, MESSAGES } from './authMessages';

// PL: Grupa testów błędów prośby o kod.
// EN: A group of code request error tests.
describe('describeSendError', () => {
  // PL: Obcy adres, limit, niedostępny serwer i brak sieci mają własne teksty.
  // EN: A foreign address, the limit, an unavailable server and no network have their own texts.
  it('dobiera komunikat do błędu / picks the message for the error', () => {
    expect(describeSendError({ status: 400, error: 'email_not_allowed' })).toBe(MESSAGES.emailForeign);
    expect(describeSendError({ status: 429 })).toBe(MESSAGES.tooManyRequests);
    expect(describeSendError({ status: 503, error: 'codes_unavailable' })).toBe(MESSAGES.unavailable);
    expect(describeSendError({ status: 0 })).toBe(MESSAGES.offline);
    expect(describeSendError({})).toBe(MESSAGES.offline);
  });

  // PL: Nieznany błąd z działającego serwera dostaje ogólny tekst.
  // EN: An unknown error from a working server gets the general text.
  it('daje ogólny tekst dla nieznanego błędu / gives the general text for an unknown error', () => {
    expect(describeSendError({ status: 500 })).toBe(MESSAGES.unknown);
  });
});

// PL: Grupa testów błędów wpisania kodu.
// EN: A group of code entry error tests.
describe('describeVerifyError', () => {
  // PL: Zły kod, kod po terminie i za dużo prób mają osobne teksty.
  // EN: A wrong code, an expired code and too many attempts have separate texts.
  it('dobiera komunikat do kodu błędu / picks the message for the error code', () => {
    expect(describeVerifyError({ status: 400, code: 'INVALID_OTP' })).toBe(MESSAGES.codeWrong);
    expect(describeVerifyError({ status: 400, code: 'OTP_EXPIRED' })).toBe(MESSAGES.codeExpired);
    expect(describeVerifyError({ status: 403, code: 'TOO_MANY_ATTEMPTS' })).toBe(MESSAGES.codeTooManyAttempts);
    expect(describeVerifyError({ status: 0 })).toBe(MESSAGES.offline);
    expect(describeVerifyError({ status: 500 })).toBe(MESSAGES.unknown);
  });
});
