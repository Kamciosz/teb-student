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
import { describeDeviceError, describePasskeySignInError, describeSendError, describeVerifyError, MESSAGES } from './authMessages';

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

// PL: Grupa testów błędów ekranu urządzeń.
// EN: A group of devices screen error tests.
describe('describeDeviceError', () => {
  // PL: Stara sesja, koniec sesji i zniknięte urządzenie mają własne teksty.
  // EN: An old session, a session that ended and a device that is gone have their own texts.
  it('dobiera komunikat do błędu urządzeń / picks the message for the devices error', () => {
    expect(describeDeviceError({ status: 403, error: 'session_not_fresh' })).toBe(MESSAGES.sessionNotFresh);
    expect(describeDeviceError({ status: 401, error: 'unauthorized' })).toBe(MESSAGES.sessionEnded);
    expect(describeDeviceError({ status: 404, error: 'not_found' })).toBe(MESSAGES.deviceGone);
    expect(describeDeviceError({ status: 429 })).toBe(MESSAGES.tooManyRequests);
    expect(describeDeviceError({})).toBe(MESSAGES.offline);
    expect(describeDeviceError({ status: 500, error: 'forbidden' })).toBe(MESSAGES.unknown);
  });
});

// PL: Grupa testów błędów logowania kluczem Face ID albo odciskiem palca.
// EN: A group of tests for the errors of signing in with a Face ID or fingerprint key.
describe('describePasskeySignInError', () => {
  // PL: Anulowanie przez ucznia nie daje komunikatu, także gdy kod przychodzi z przeglądarki.
  // EN: Cancelling by the student gives no message, also when the code comes from the browser.
  it('nie pokazuje komunikatu przy anulowaniu / shows no message when cancelled', () => {
    expect(describePasskeySignInError(null)).toBeNull();
    expect(describePasskeySignInError({ code: 'AUTH_CANCELLED' })).toBeNull();
    expect(describePasskeySignInError({ code: 'ERROR_CEREMONY_ABORTED' })).toBeNull();
    expect(describePasskeySignInError({ code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY' })).toBeNull();
  });

  // PL: Nieznany klucz albo odrzucony podpis (401) dostaje własny tekst z podpowiedzią kodu z maila.
  // EN: An unknown key or a rejected signature (401) gets its own text with the hint to use the email code.
  it('dobiera komunikat do błędu logowania / picks the message for the sign-in error', () => {
    expect(describePasskeySignInError({ status: 401, code: 'UNKNOWN_ERROR' })).toBe(MESSAGES.passkeySignInFailed);
    expect(describePasskeySignInError({ status: 0 })).toBe(MESSAGES.offline);
    expect(describePasskeySignInError({ status: 429 })).toBe(MESSAGES.tooManyRequests);
    expect(describePasskeySignInError({ status: 503 })).toBe(MESSAGES.unavailable);
  });

  // PL: Inny błąd z działającego serwera dostaje ogólny tekst.
  // EN: Any other error from a working server gets the general text.
  it('daje ogólny tekst dla nieznanego błędu / gives the general text for an unknown error', () => {
    expect(describePasskeySignInError({ status: 500 })).toBe(MESSAGES.unknown);
  });
});
