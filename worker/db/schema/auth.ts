/**
 * PL: Schemat bazy modułu auth (tabele Drizzle dla D1): konta, sesje, powiązane konta (hasła z podtoru 1b) i kody logowania. Tabele wygenerował generator schematu Better Auth 1.7.7 dla SQLite (`generateDrizzleSchema` z @better-auth/drizzle-adapter, wtyczka emailOTP). Po zmianie wtyczek trzeba wygenerować je od nowa, a nie poprawiać ręcznie. Schemat modułu należy do podtoru 1a (docs/PODZIAL_PRACY.md, część 2).
 * EN: The database schema of the auth module (Drizzle tables for D1): accounts, sessions, linked accounts (passwords from subtrack 1b) and sign-in codes. The tables were produced by the Better Auth 1.7.7 schema generator for SQLite (`generateDrizzleSchema` from @better-auth/drizzle-adapter, the emailOTP plugin). After a plugin change, regenerate them instead of editing by hand. The module schema belongs to subtrack 1a (docs/PODZIAL_PRACY.md, part 2).
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by worker/db/schema/index.ts::*
 * @used_by worker/auth/email/runtimeAuth.ts::getRuntimeAuth
 */

// PL: Funkcje Drizzle do opisu tabel SQLite (D1) i wartość domyślna liczona w bazie.
// EN: Drizzle functions describing SQLite (D1) tables and a default computed in the database.
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * PL: Wyrażenie SQL „teraz” w milisekundach. Better Auth zapisuje czas jako liczbę milisekund od 1970 roku.
 * EN: The SQL expression for "now" in milliseconds. Better Auth stores time as milliseconds since 1970.
 */
const NOW_MS = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

/**
 * PL: Konto ucznia. Uczeń zakłada je przy pierwszym logowaniu kodem. Adres e-mail jest unikalny.
 * EN: A student account. The student creates it at the first code sign-in. The e-mail address is unique.
 */
export const user = sqliteTable('user', {
  /** PL: Numer konta nadany przez Better Auth. EN: The account id assigned by Better Auth. */
  id: text('id').primaryKey(),
  /** PL: Imię na koncie. Przy logowaniu kodem Better Auth wpisuje tu pusty tekst, uczeń ustawia je w profilu (podtor 7). EN: The name on the account. With code sign-in Better Auth stores an empty text here, the student sets it in the profile (subtrack 7). */
  name: text('name').notNull(),
  /** PL: Adres e-mail małymi literami, unikalny. EN: The lowercase e-mail address, unique. */
  email: text('email').notNull().unique(),
  /** PL: Prawda, gdy uczeń potwierdził adres kodem. EN: True when the student confirmed the address with a code. */
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  /** PL: Adres zdjęcia profilowego. Aplikacja go nie używa. EN: The profile picture URL. The app does not use it. */
  image: text('image'),
  /** PL: Kiedy konto powstało (data, w bazie milisekundy). EN: When the account was created (a date, milliseconds in the database). */
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(NOW_MS).notNull(),
  /** PL: Kiedy konto ostatnio się zmieniło. EN: When the account last changed. */
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(NOW_MS)
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * PL: Sesja zalogowanego ucznia. Telefon trzyma jej klucz w ciasteczku, a baza pilnuje, do kiedy sesja jest ważna.
 * EN: A signed-in student's session. The phone keeps its key in a cookie and the database tracks how long the session is valid.
 */
export const session = sqliteTable(
  'session',
  {
    /** PL: Numer sesji. EN: The session id. */
    id: text('id').primaryKey(),
    /** PL: Do kiedy sesja jest ważna. EN: Until when the session is valid. */
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    /** PL: Klucz sesji z ciasteczka, unikalny. EN: The session key from the cookie, unique. */
    token: text('token').notNull().unique(),
    /** PL: Kiedy sesja powstała. EN: When the session was created. */
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(NOW_MS).notNull(),
    /** PL: Kiedy sesja ostatnio się zmieniła (przedłużenie). EN: When the session last changed (renewal). */
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    /** PL: Adres IP telefonu przy logowaniu, jeśli serwer go zna. EN: The phone's IP address at sign-in, if the server knows it. */
    ipAddress: text('ip_address'),
    /** PL: Przeglądarka telefonu przy logowaniu. EN: The phone's browser at sign-in. */
    userAgent: text('user_agent'),
    /** PL: Konto, do którego należy sesja. Usunięcie konta usuwa sesje. EN: The account the session belongs to. Deleting the account deletes the sessions. */
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

/**
 * PL: Sposób logowania powiązany z kontem. Logowanie kodem go nie używa, ale kody zaproszeń z loginem i hasłem (podtor 1b) trzymają tu hasło.
 * EN: A sign-in method linked to an account. Code sign-in does not use it, but invitation codes with a login and a password (subtrack 1b) keep the password here.
 */
export const account = sqliteTable(
  'account',
  {
    /** PL: Numer powiązania. EN: The link id. */
    id: text('id').primaryKey(),
    /** PL: Numer konta u dostawcy logowania. EN: The account id at the sign-in provider. */
    accountId: text('account_id').notNull(),
    /** PL: Nazwa dostawcy logowania, na przykład „credential” dla hasła. EN: The sign-in provider name, for example "credential" for a password. */
    providerId: text('provider_id').notNull(),
    /** PL: Konto ucznia. Usunięcie konta usuwa powiązania. EN: The student's account. Deleting the account deletes the links. */
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** PL: Klucz dostępu od zewnętrznego dostawcy. Aplikacja go nie używa. EN: The access key from an external provider. The app does not use it. */
    accessToken: text('access_token'),
    /** PL: Klucz odświeżania od zewnętrznego dostawcy. Aplikacja go nie używa. EN: The refresh key from an external provider. The app does not use it. */
    refreshToken: text('refresh_token'),
    /** PL: Klucz tożsamości od zewnętrznego dostawcy. Aplikacja go nie używa. EN: The identity key from an external provider. The app does not use it. */
    idToken: text('id_token'),
    /** PL: Do kiedy działa klucz dostępu. EN: Until when the access key works. */
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    /** PL: Do kiedy działa klucz odświeżania. EN: Until when the refresh key works. */
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    /** PL: Zakres uprawnień od zewnętrznego dostawcy. EN: The permission scope from an external provider. */
    scope: text('scope'),
    /** PL: Hasło po zaszyfrowaniu (scrypt), tylko dla loginu i hasła. EN: The hashed password (scrypt), only for login and password. */
    password: text('password'),
    /** PL: Kiedy powiązanie powstało. EN: When the link was created. */
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(NOW_MS).notNull(),
    /** PL: Kiedy powiązanie ostatnio się zmieniło. EN: When the link last changed. */
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

/**
 * PL: Kody logowania czekające na wpisanie. Wiersz powstaje po wysłaniu kodu, a znika po użyciu, po trzech złych próbach albo po wygaśnięciu.
 * EN: Sign-in codes waiting to be entered. A row appears when a code is sent and disappears after use, after three wrong attempts or after expiry.
 */
export const verification = sqliteTable(
  'verification',
  {
    /** PL: Numer wiersza. EN: The row id. */
    id: text('id').primaryKey(),
    /** PL: Co jest potwierdzane, dla logowania kodem „sign-in-otp-<adres>”. EN: What is being confirmed, for code sign-in "sign-in-otp-<address>". */
    identifier: text('identifier').notNull(),
    /** PL: Kod i licznik złych prób w formie „kod:próby”. EN: The code and the wrong-attempt counter as "code:attempts". */
    value: text('value').notNull(),
    /** PL: Do kiedy kod jest ważny (10 minut od wysłania). EN: Until when the code is valid (10 minutes after sending). */
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    /** PL: Kiedy kod wysłano. EN: When the code was sent. */
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).default(NOW_MS).notNull(),
    /** PL: Kiedy wiersz ostatnio się zmienił (kolejna zła próba). EN: When the row last changed (another wrong attempt). */
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(NOW_MS)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);
