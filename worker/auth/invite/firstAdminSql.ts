/**
 * PL: SQL pierwszego administratora. Składa dwa polecenia: wpis kodu zaproszenia do bazy (przed rejestracją) i nadanie roli „admin” koncie założonemu tym kodem (po rejestracji). Sam nic nie zapisuje i nie łączy się z bazą, więc działa w skrypcie scripts/prodSql.ts i w testach.
 * EN: The SQL of the first administrator. It builds two statements: the row of an invitation code saved in the database (before registration) and the grant of the "admin" role to the account created with that code (after registration). It saves nothing itself and does not connect to the database, so it works in the scripts/prodSql.ts script and in tests.
 *
 * @author Szymon
 * @since 2026-10-31
 * @uses worker/auth/invite/generateInviteCode.ts::generateInviteCode
 * @uses worker/auth/invite/login.ts::normalizeLogin
 * @uses worker/auth/invite/login.ts::loginToEmail
 * @uses worker/auth/invite/settings.ts::INVITE_IDENTIFIER_PREFIX
 * @uses worker/auth/invite/settings.ts::INVITE_LIFETIME_DAYS
 * @used_by scripts/prodSql.ts::main
 * @used_by worker/auth/invite/firstAdminSql.test.ts::buildFirstAdminSql
 */

// PL: Losowanie kodu, sprawdzenie loginu i adres techniczny konta.
// EN: Drawing the code, checking the login and the technical address of the account.
import { generateInviteCode } from './generateInviteCode';
import { loginToEmail, normalizeLogin } from './login';
import { INVITE_IDENTIFIER_PREFIX, INVITE_LIFETIME_DAYS } from './settings';

/** PL: Ile milisekund ma doba. EN: How many milliseconds a day has. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * PL: Wynik składania: kod do przekazania na ekranie i dwa polecenia SQL do wykonania w kolejności.
 * EN: The result of building: the code to show on screen and the two SQL statements to run in order.
 */
export type FirstAdminSql = {
  /** PL: Kod zaproszenia (tylko na ekran). EN: The invitation code (screen only). */
  code: string;
  /** PL: Wpis kodu do tabeli verification, wykonać przed rejestracją. EN: The code row for the verification table, to run before registration. */
  inviteSql: string;
  /** PL: Nadanie roli admin, wykonać po rejestracji. EN: The admin role grant, to run after registration. */
  grantSql: string;
};

/**
 * PL: Składa SQL pierwszego administratora dla podanego loginu. Login sprawdza te same reguły co rejestracja, więc w SQL nie trafi cudzysłów ani inny znak spoza alfabetu loginu.
 * EN: Builds the first administrator's SQL for the given login. The login is checked with the same rules as registration, so no quote or other character outside the login alphabet gets into the SQL.
 *
 * @param rawLogin - PL: login podany w poleceniu. EN: the login given in the command.
 * @param now - PL: chwila wygenerowania (domyślnie teraz); od niej liczy się termin kodu. EN: the moment of generation (now by default); the code deadline counts from it.
 * @returns PL: kod i dwa polecenia SQL. EN: the code and the two SQL statements.
 * @throws PL: błąd, gdy login nie spełnia reguł. EN: an error when the login breaks the rules.
 */
export function buildFirstAdminSql(rawLogin: string, now = new Date()): FirstAdminSql {
  // PL: Odrzuć login, którego rejestracja by nie przyjęła.
  // EN: Reject a login that registration would not accept.
  const login = normalizeLogin(rawLogin);
  if (login === null) {
    throw new Error('Login nie spełnia reguł: 3–30 znaków, małe litery, cyfry, kropka, podkreślnik albo myślnik. / The login breaks the rules: 3–30 characters, lowercase letters, digits, dot, underscore or dash.');
  }

  // PL: Wylosuj kod i policz jego termin tak jak w issueInviteCode.
  // EN: Draw the code and count its deadline the way issueInviteCode does.
  const code = generateInviteCode();
  const expiresMs = now.getTime() + INVITE_LIFETIME_DAYS * DAY_MS;

  // PL: Wpis kodu z tym samym identyfikatorem i pustą wartością co w inviteCodes.ts. Kolumny created_at i updated_at mają domyślne wartości w bazie.
  // EN: The code row with the same identifier and empty value as in inviteCodes.ts. The created_at and updated_at columns have defaults in the database.
  const inviteSql = `INSERT INTO verification (id, identifier, value, expires_at) VALUES ('${crypto.randomUUID()}', '${INVITE_IDENTIFIER_PREFIX}${code}', '', ${expiresMs});`;

  // PL: Nadanie roli admin koncie o tym loginie. Czas nadania liczy baza w chwili wykonania, tak jak kolumny created_at w schemacie.
  // EN: Grant the admin role to the account with this login. The database computes the grant time when the statement runs, the same way as the created_at columns in the schema.
  const grantSql = `INSERT INTO panel_roles (user_id, role, granted_at) SELECT id, 'admin', cast(unixepoch('subsecond') * 1000 as integer) FROM user WHERE email = '${loginToEmail(login)}';`;

  return { code, inviteSql, grantSql };
}
