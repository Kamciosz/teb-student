/**
 * PL: Login ucznia: sprowadzenie do jednej postaci, sprawdzenie reguł i zamiana na adres techniczny. Tabela user wymaga adresu e-mail, a konto z loginem go nie ma, więc login jest częścią adresu „<login>@login.invalid”. Better Auth traktuje ten adres jak każdy inny i pilnuje, żeby był unikalny, więc login też jest unikalny.
 * EN: The student's login: bringing it to one form, checking the rules and turning it into a technical address. The user table requires an e-mail address and a login account has none, so the login is part of the address "<login>@login.invalid". Better Auth treats this address like any other and keeps it unique, so the login is unique too.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/settings.ts::LOGIN_PATTERN
 * @uses worker/auth/invite/settings.ts::LOGIN_EMAIL_DOMAIN
 * @used_by worker/auth/invite/routes.ts::createAuthInviteApp
 */

import { LOGIN_EMAIL_DOMAIN, LOGIN_PATTERN } from './settings';

/**
 * PL: Sprowadza login do małych liter bez spacji na brzegach i sprawdza reguły. Duże litery nie robią różnicy: „Ola3ta” i „ola3ta” to ten sam login.
 * EN: Brings the login to lowercase without edge spaces and checks the rules. Capital letters make no difference: "Ola3ta" and "ola3ta" are the same login.
 *
 * @param raw - PL: tekst z pola. EN: the text from the field.
 * @returns PL: login albo null, gdy nie spełnia reguł. EN: the login or null when it breaks the rules.
 */
export function normalizeLogin(raw: string): string | null {
  const login = raw.trim().toLowerCase();
  return LOGIN_PATTERN.test(login) ? login : null;
}

/**
 * PL: Zamienia poprawny login na adres techniczny, pod którym konto jest w tabeli user.
 * EN: Turns a valid login into the technical address under which the account is in the user table.
 *
 * @param login - PL: login po normalizeLogin. EN: the login after normalizeLogin.
 * @returns PL: adres „<login>@login.invalid”. EN: the address "<login>@login.invalid".
 */
export function loginToEmail(login: string): string {
  return `${login}@${LOGIN_EMAIL_DOMAIN}`;
}
