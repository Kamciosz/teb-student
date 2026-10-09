/**
 * PL: Drzwi wspólnej części serwera (podtor 0): typy, które mają wszystkie moduły. Lista funkcji kasujących leży osobno w accountDeletion.ts, bo importuje moduły. Gdyby ten plik ją wystawiał, powstałby cykl: moduł wczytuje ten plik, a ten plik wczytuje moduł.
 * EN: The door of the shared part of the server (subtrack 0): the types every module has. The list of deleting functions lives separately in accountDeletion.ts, because it imports the modules. If this file exposed it, a cycle would appear: a module loads this file and this file loads the module.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/shared/seed.ts::SeedSet
 * @used_by worker/auth/email/deleteStudentData.ts::DeleteStudentDataInput
 * @used_by worker/shared/accountDeletion.ts::DeleteStudentData
 * @used_by worker/mounts.ts::ApiMount
 */

/**
 * PL: Środowisko Workera: to, co Cloudflare podaje serwerowi poza zapytaniem. Dziś baza D1 pod nazwą DB (wrangler.jsonc, d1_databases) i dwa ustawienia logowania (.dev.vars.example). Router dostaje je jako `Hono<{ Bindings: Env }>`, a funkcja kasująca przez pole `db`.
 * EN: The Worker environment: what Cloudflare gives the server besides the request. Today the D1 database under the name DB (wrangler.jsonc, d1_databases) and two sign-in settings (.dev.vars.example). A router receives it as `Hono<{ Bindings: Env }>`, and a deleting function through the `db` field.
 */
export type Env = {
  /** PL: Baza D1 aplikacji (binding DB). EN: The app's D1 database (the DB binding). */
  DB: D1Database;
  /** PL: Sekret logowania (Better Auth), min. 32 znaki. Lokalnie w .dev.vars, na produkcji sekret Workera. EN: The sign-in secret (Better Auth), 32+ characters. Locally in .dev.vars, in production a Worker secret. */
  BETTER_AUTH_SECRET?: string;
  /** PL: Adres aplikacji (Better Auth). Lokalnie w .dev.vars. EN: The app address (Better Auth). Locally in .dev.vars. */
  BETTER_AUTH_URL?: string;
};

// PL: Alias, bo wewnątrz przestrzeni nazw Cloudflare nazwa Env oznacza już interfejs, który rozszerzamy.
// EN: An alias, because inside the Cloudflare namespace the name Env already means the interface we extend.
type AppEnv = Env;

declare global {
  namespace Cloudflare {
    /**
     * PL: Dopisuje bindingi aplikacji do typu Env z Cloudflare. Dzięki temu `import { env } from 'cloudflare:workers'` i `env` w testach mają typ z polem DB, bez rzutowania.
     * EN: Adds the app bindings to Cloudflare's Env type. Because of this, `import { env } from 'cloudflare:workers'` and `env` in tests have a type with the DB field, no cast needed.
     */
    interface Env extends AppEnv {}
  }
}

/**
 * PL: Dane wejściowe funkcji kasującej dane ucznia. Obiekt, żeby dało się dodać pole (na przykład dostęp do R2) bez zmiany wszystkich modułów.
 * EN: The input of a function that deletes a student's data. An object, so a field (for example access to R2) can be added without changing every module.
 */
export type DeleteStudentDataInput = {
  /** PL: Numer ucznia (konta), którego dane znikają. EN: The id of the student (account) whose data goes away. */
  userId: string;
  /** PL: Baza D1, z której funkcja kasuje dane. Usuwanie konta podaje ją z Env.DB, a test z env.DB z "cloudflare:workers". EN: The D1 database the function deletes data from. The account deletion passes it from Env.DB, and a test passes env.DB from "cloudflare:workers". */
  db: D1Database;
};

/**
 * PL: Funkcja kasująca dane ucznia z jednego modułu. Kończy się po skasowaniu, a przy błędzie bazy rzuca wyjątek, żeby usuwanie konta się zatrzymało.
 * EN: A function that deletes a student's data from one module. It settles after the deletion and throws on a database error, so the account deletion stops.
 */
export type DeleteStudentData = (input: DeleteStudentDataInput) => Promise<void>;

// PL: Typ zestawu danych testowych (worker/db/seed/<moduł>.ts). Leży w osobnym pliku, bo skrypty Node.js (scripts/db.ts) go importują, a ten plik używa typów Cloudflare, których Node.js nie ma.
// EN: The test data set type (worker/db/seed/<module>.ts). It lives in a separate file, because Node.js scripts (scripts/db.ts) import it, and this file uses Cloudflare types that Node.js does not have.
export type { SeedSet } from './seed';
