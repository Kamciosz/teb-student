/**
 * PL: Teksty ekranów kodu zaproszenia (1.3 i logowania loginem) i dobór komunikatu błędu. Teksty ekranu 1.3 pochodzą z docs/projekt/EKRANY.md. Pozostałe (błędy i logowanie loginem) nie mają tam wpisu, więc są oznaczone „DO USTALENIA” i czekają na zespół. Zwykłe funkcje, więc da się je sprawdzić testem.
 * EN: The texts of the invitation code screens (1.3 and login sign-in) and how an error message is picked. The texts of screen 1.3 come from docs/projekt/EKRANY.md. The others (errors and login sign-in) have no entry there, so they are marked "DO USTALENIA" (to be agreed) and wait for the team. Plain functions, so a test can check them.
 *
 * @author Szymon
 * @since 2026-10-11
 * @used_by src/features/auth/invite/inviteApi.ts::describeError
 * @used_by src/features/auth/invite/AuthInviteScreen.tsx::MESSAGES
 * @used_by src/features/auth/invite/SignUpForm.tsx::SCREEN_TEXT
 * @used_by src/features/auth/invite/SignInForm.tsx::MESSAGES
 * @used_by src/features/auth/invite/inviteMessages.test.ts::describeError
 */

/**
 * PL: To, co z błędu serwera jest nam potrzebne: kod HTTP, kod błędu Better Auth (code) albo nasz kod z routera (error). Brak statusu albo status 0 oznacza brak sieci.
 * EN: What we need from a server error: the HTTP status, the Better Auth error code (code) or our own code from the router (error). A missing status or a status of 0 means no network.
 */
export type ClientError = {
  /** PL: Kod HTTP odpowiedzi. EN: The HTTP status of the response. */
  status?: number;
  /** PL: Kod błędu Better Auth, na przykład INVITE_INVALID. EN: The Better Auth error code, for example INVITE_INVALID. */
  code?: string;
  /** PL: Nasz kod błędu z routera, na przykład invalid_login. EN: Our own error code from the router, for example invalid_login. */
  error?: string;
};

/** PL: Teksty z docs/projekt/EKRANY.md, ekran 1.3. EN: The texts from docs/projekt/EKRANY.md, screen 1.3. */
export const SCREEN_TEXT = {
  topBarTitle: 'Kod zaproszenia',
  heading: 'Masz kod od Samorządu?',
  lead: 'Użyj go, jeśli nie masz szkolnej skrzynki. Ustawisz własny login i hasło.',
  codeLabel: 'Kod zaproszenia',
  codePlaceholder: 'TEB-7K4Q-92',
  loginLabel: 'Login',
  loginPlaceholder: 'np. ola3ta',
  passwordLabel: 'Hasło',
  passwordPlaceholder: '••••••••',
  note: 'Kod zaproszenia działa tylko jeden raz.',
  submit: 'Załóż konto',
} as const;

/** PL: DO USTALENIA z zespołem: teksty logowania loginem i błędów, których nie ma w docs/projekt/EKRANY.md. EN: DO USTALENIA (to agree) with the team: the login sign-in texts and errors that docs/projekt/EKRANY.md does not have. */
export const MESSAGES = {
  signInTopBarTitle: 'Logowanie',
  signInHeading: 'Zaloguj się',
  signInLead: 'Wpisz login i hasło, które ustawiłeś z kodem zaproszenia.',
  signInSubmit: 'Zaloguj się',
  switchToSignIn: 'Mam już konto',
  switchToSignUp: 'Mam kod zaproszenia',
  backLabel: 'Wróć do logowania szkolnym adresem e-mail',
  busySignUp: 'Zakładanie konta…',
  busySignIn: 'Logowanie…',
  inviteInvalid: 'Kod zaproszenia jest nieprawidłowy, został już użyty albo wygasł.',
  loginInvalid: 'Login ma 3 do 30 znaków: małe litery, cyfry, kropkę, podkreślnik lub myślnik.',
  passwordInvalid: 'Hasło ma mieć od 8 do 128 znaków.',
  loginTaken: 'Ten login jest już zajęty. Wybierz inny.',
  credentialsWrong: 'Login lub hasło są nieprawidłowe.',
  tooManyRequests: 'Za dużo prób. Poczekaj chwilę i spróbuj ponownie.',
  unavailable: 'Logowanie jest chwilowo niedostępne. Spróbuj później.',
  offline: 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.',
  unknown: 'Coś poszło nie tak. Spróbuj ponownie.',
} as const;

/**
 * PL: Nazwa kodu błędu (Better Auth albo routera) i komunikat, który ją opisuje.
 * EN: An error code name (Better Auth or router) and the message that describes it.
 */
const MESSAGE_BY_CODE: Record<string, string> = {
  INVITE_INVALID: MESSAGES.inviteInvalid,
  LOGIN_TAKEN: MESSAGES.loginTaken,
  invalid_login: MESSAGES.loginInvalid,
  invalid_password: MESSAGES.passwordInvalid,
  invalid_credentials: MESSAGES.credentialsWrong,
};

/**
 * PL: Dobiera komunikat dla błędu serwera. Najpierw brak sieci, potem znany kod błędu, potem status HTTP.
 * EN: Picks the message for a server error. First no network, then a known error code, then the HTTP status.
 *
 * @param error - PL: błąd serwera. EN: the server error.
 * @returns PL: komunikat po polsku. EN: the message in Polish.
 */
export function describeError(error: ClientError): string {
  // PL: Bez statusu odpowiedź nie doszła: to brak sieci.
  // EN: Without a status no answer arrived: this is no network.
  if (!error.status) return MESSAGES.offline;

  // PL: Znany kod błędu ma własny komunikat. Kod z serwera nie jest tu zaufany: nieznany kod trafia do statusu.
  // EN: A known error code has its own message. A code from the server is not trusted here: an unknown code falls to the status.
  const byCode = MESSAGE_BY_CODE[error.code ?? error.error ?? ''];
  if (byCode) return byCode;

  // PL: Zła odpowiedź logowania hasłem Better Auth (INVALID_EMAIL_OR_PASSWORD) ma status 401.
  // EN: Better Auth's wrong password sign-in answer (INVALID_EMAIL_OR_PASSWORD) has status 401.
  if (error.status === 401) return MESSAGES.credentialsWrong;
  if (error.status === 429) return MESSAGES.tooManyRequests;
  if (error.status === 503) return MESSAGES.unavailable;
  return MESSAGES.unknown;
}
