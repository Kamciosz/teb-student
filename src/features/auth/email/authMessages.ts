/**
 * PL: Teksty błędów logowania dla ucznia i ich dobór. Każda odpowiedź serwera ma czytelny komunikat po polsku, a brak sieci i nieznany błąd mają własne. Zwykłe funkcje, więc da się je sprawdzić testem.
 * EN: The sign-in error texts for the student and how they are picked. Every server answer has a readable message in Polish, and no network and an unknown error have their own. Plain functions, so a test can check them.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/auth/email/authApi.ts::describeSendError
 * @used_by src/features/auth/email/EmailStep.tsx::MESSAGES
 * @used_by src/features/auth/email/authMessages.test.ts::describeSendError
 */

/**
 * PL: To, co z błędu serwera jest nam potrzebne: kod HTTP, kod błędu Better Auth albo nasz kod błędu. Brak statusu albo status równy 0 oznacza brak sieci.
 * EN: What we need from a server error: the HTTP status, the Better Auth error code or our own error code. A missing status or a status equal to 0 means no network.
 */
export type ClientError = {
  /** PL: Kod HTTP odpowiedzi. EN: The HTTP status of the response. */
  status?: number;
  /** PL: Kod błędu Better Auth, na przykład INVALID_OTP. EN: The Better Auth error code, for example INVALID_OTP. */
  code?: string;
  /** PL: Nasz kod błędu z routera, na przykład email_not_allowed. EN: Our error code from the router, for example email_not_allowed. */
  error?: string;
};

/** PL: Teksty, które widzi uczeń. EN: The texts the student sees. */
export const MESSAGES = {
  emailEmpty: 'Wpisz swój szkolny adres e-mail.',
  emailForeign: 'Użyj adresu kończącego się na @teb.edu.pl. Inne adresy nie działają.',
  codeWrong: 'Kod jest nieprawidłowy. Sprawdź cyfry i spróbuj ponownie.',
  codeExpired: 'Kod stracił ważność. Wyślij nowy kod.',
  codeTooManyAttempts: 'Za dużo błędnych prób. Wyślij nowy kod.',
  tooManyRequests: 'Za dużo prób. Poczekaj minutę i spróbuj ponownie.',
  unavailable: 'Logowanie jest chwilowo niedostępne. Spróbuj później.',
  offline: 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.',
  unknown: 'Coś poszło nie tak. Spróbuj ponownie.',
} as const;

/**
 * PL: Dobiera komunikat dla błędu, który nie zależy od tego, co uczeń robił: brak sieci, limit zapytań i niedostępny serwer.
 * EN: Picks the message for an error that does not depend on what the student was doing: no network, the request limit and an unavailable server.
 *
 * @param error - PL: błąd serwera. EN: the server error.
 * @returns PL: komunikat albo null, gdy błąd jest szczególny. EN: the message, or null when the error is specific.
 */
function describeCommonError(error: ClientError): string | null {
  if (!error.status) return MESSAGES.offline;
  if (error.status === 429) return MESSAGES.tooManyRequests;
  if (error.status === 503) return MESSAGES.unavailable;
  return null;
}

/**
 * PL: Dobiera komunikat dla błędu przy prośbie o kod.
 * EN: Picks the message for an error when requesting a code.
 *
 * @param error - PL: błąd serwera. EN: the server error.
 * @returns PL: komunikat po polsku. EN: the message in Polish.
 */
export function describeSendError(error: ClientError): string {
  if (error.error === 'email_not_allowed') return MESSAGES.emailForeign;
  return describeCommonError(error) ?? MESSAGES.unknown;
}

/**
 * PL: Dobiera komunikat dla błędu przy wpisaniu kodu.
 * EN: Picks the message for an error when entering a code.
 *
 * @param error - PL: błąd serwera. EN: the server error.
 * @returns PL: komunikat po polsku. EN: the message in Polish.
 */
export function describeVerifyError(error: ClientError): string {
  if (error.code === 'INVALID_OTP') return MESSAGES.codeWrong;
  if (error.code === 'OTP_EXPIRED') return MESSAGES.codeExpired;
  if (error.code === 'TOO_MANY_ATTEMPTS') return MESSAGES.codeTooManyAttempts;
  return describeCommonError(error) ?? MESSAGES.unknown;
}
