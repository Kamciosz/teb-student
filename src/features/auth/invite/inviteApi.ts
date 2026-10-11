/**
 * PL: Rozmowa telefonu z serwerem kont z loginem i hasłem: założenie konta kodem zaproszenia i logowanie. Każda funkcja oddaje gotowy wynik z komunikatem po polsku i nigdy nie rzuca błędu sieci. Po sukcesie serwer ustawia ciasteczko sesji, a sesję pokazuje podtor 1a (useAuthSession).
 * EN: The phone's conversation with the login and password account server: creating an account with an invitation code and signing in. Every function returns a ready result with a message in Polish and never throws a network error. After success the server sets the session cookie, and subtrack 1a shows the session (useAuthSession).
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/routes.ts::authInviteApp
 * @uses src/features/auth/invite/inviteMessages.ts::describeError
 * @used_by src/features/auth/invite/SignUpForm.tsx::signUpWithCode
 * @used_by src/features/auth/invite/SignInForm.tsx::signInWithPassword
 */

import { describeError, MESSAGES, type ClientError } from './inviteMessages';

/**
 * PL: Wynik rozmowy z serwerem: udało się albo błąd z komunikatem dla ucznia.
 * EN: The result of a server conversation: it worked, or an error with a message for the student.
 */
export type InviteResult = { ok: true } | { ok: false; message: string };

/** PL: Adres routera podtoru 1b, ten sam co w worker/mounts.ts. EN: The address of the subtrack 1b router, the same as in worker/mounts.ts. */
const API_BASE = '/api/auth/invite';

/**
 * PL: Wysyła ciało JSON na adres routera i zamienia odpowiedź na wynik. Błąd sieci (fetch rzuca) to brak internetu.
 * EN: Sends a JSON body to a router address and turns the answer into a result. A network error (fetch throws) means no internet.
 *
 * @param path - PL: adres za /api/auth/invite. EN: the path after /api/auth/invite.
 * @param body - PL: pola formularza. EN: the form fields.
 * @returns PL: wynik z komunikatem po polsku przy błędzie. EN: the result with a message in Polish on error.
 */
async function post(path: string, body: Record<string, string>): Promise<InviteResult> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true };

    // PL: Odpowiedź błędu ma kod z Better Auth (code) albo z routera (error). Gdy to nie JSON, zostaje sam status.
    // EN: An error answer has a code from Better Auth (code) or from the router (error). When it is not JSON, only the status remains.
    const details = (await response.json().catch(() => ({}))) as ClientError;
    return { ok: false, message: describeError({ status: response.status, code: details.code, error: details.error }) };
  } catch {
    return { ok: false, message: MESSAGES.offline };
  }
}

/**
 * PL: Zakłada konto kodem zaproszenia. Serwer zużywa kod i od razu loguje ucznia.
 * EN: Creates an account with an invitation code. The server uses the code and signs the student in at once.
 *
 * @param fields - PL: kod, login i hasło z formularza. EN: the code, the login and the password from the form.
 * @returns PL: wynik z komunikatem po polsku przy błędzie. EN: the result with a message in Polish on error.
 */
export function signUpWithCode(fields: { code: string; login: string; password: string }): Promise<InviteResult> {
  return post('/sign-up', fields);
}

/**
 * PL: Loguje loginem i hasłem.
 * EN: Signs in with a login and a password.
 *
 * @param fields - PL: login i hasło z formularza. EN: the login and the password from the form.
 * @returns PL: wynik z komunikatem po polsku przy błędzie. EN: the result with a message in Polish on error.
 */
export function signInWithPassword(fields: { login: string; password: string }): Promise<InviteResult> {
  return post('/sign-in', fields);
}
