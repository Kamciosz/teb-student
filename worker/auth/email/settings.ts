/**
 * PL: Ustawienia logowania kodem z maila: adres Better Auth, domena szkolna, długość i czas życia kodu, limit prób. Wartości z docs/PLAN_APLIKACJI.md (części 3 i 7) oraz domyślne wartości Better Auth tam, gdzie plan milczy.
 * EN: Settings of the e-mail code sign-in: the Better Auth address, the school domain, the code length and lifetime, the attempt limit. Values from docs/PLAN_APLIKACJI.md (parts 3 and 7) and Better Auth defaults where the plan is silent.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by worker/auth/email/createAuth.ts::createAuth
 * @used_by worker/auth/email/schoolEmail.ts::normalizeSchoolEmail
 * @used_by worker/auth/email/routes.ts::createAuthEmailApp
 */

/**
 * PL: Adres, pod którym Better Auth obsługuje logowanie. Musi być taki sam jak wpis podtoru 1a w worker/mounts.ts (docs/adr/0003-adresy-podtorow.md).
 * EN: The address under which Better Auth handles sign-in. It must match the subtrack 1a entry in worker/mounts.ts (docs/adr/0003-adresy-podtorow.md).
 */
export const AUTH_BASE_PATH = '/api/auth/email';

/**
 * PL: Domena szkolnych adresów. Tylko adres kończący się tak może dostać kod (docs/PLAN_APLIKACJI.md, część 7: „Wpisuję adres @teb.edu.pl”).
 * EN: The domain of school addresses. Only an address ending like this can get a code (docs/PLAN_APLIKACJI.md, part 7: "Wpisuję adres @teb.edu.pl").
 */
export const SCHOOL_EMAIL_SUFFIX = '@teb.edu.pl';

/**
 * PL: Długość kodu w cyfrach (docs/PLAN_APLIKACJI.md, część 2: „kod 6 cyfr”).
 * EN: The code length in digits (docs/PLAN_APLIKACJI.md, part 2: "kod 6 cyfr").
 */
export const CODE_LENGTH = 6;

/**
 * PL: Czas życia kodu w sekundach: 10 minut (docs/PLAN_APLIKACJI.md, części 3 i 7). Domyślne 5 minut w Better Auth jest za krótkie.
 * EN: The code lifetime in seconds: 10 minutes (docs/PLAN_APLIKACJI.md, parts 3 and 7). The Better Auth default of 5 minutes is too short.
 */
export const CODE_LIFETIME_SECONDS = 600;

/**
 * PL: Ile złych prób przepala kod. Plan mówi tylko „po kilku złych próbach”, więc to domyślna wartość Better Auth (pytanie w pull requeście).
 * EN: How many wrong attempts burn a code. The plan says only "po kilku złych próbach", so this is the Better Auth default (a question in the pull request).
 */
export const CODE_MAX_ATTEMPTS = 3;
