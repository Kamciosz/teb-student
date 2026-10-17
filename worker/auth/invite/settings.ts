/**
 * PL: Ustawienia kodów zaproszeń oraz loginu i hasła: adres Better Auth, ważność kodu, kształt kodu, reguły loginu i hasła. Wartości z docs/PLAN_APLIKACJI.md (część 7: kody ważne 14 dni) i docs/projekt/EKRANY.md (ekran 1.3: kod „TEB-7K4Q-92”). Tam, gdzie plan milczy (długość loginu i hasła), to przyjęte wartości.
 * EN: Settings of the invitation codes and of the login and password: the Better Auth address, the code lifetime, the code shape, the login and password rules. Values from docs/PLAN_APLIKACJI.md (part 7: codes valid for 14 days) and docs/projekt/EKRANY.md (screen 1.3: the code "TEB-7K4Q-92"). Where the plan is silent (login and password length), these are the accepted values.
 *
 * @author Szymon
 * @since 2026-10-11
 * @used_by worker/auth/invite/createInviteAuth.ts::createInviteAuth
 * @used_by worker/auth/invite/inviteCodes.ts::issueInviteCode
 * @used_by worker/auth/invite/routes.ts::createAuthInviteApp
 * @used_by worker/auth/invite/login.ts::normalizeLogin
 */

/**
 * PL: Adres, pod którym Better Auth obsługuje konta z hasłem. Musi być taki sam jak wpis podtoru 1b w worker/mounts.ts (docs/adr/0003-adresy-podtorow.md).
 * EN: The address under which Better Auth handles password accounts. It must match the subtrack 1b entry in worker/mounts.ts (docs/adr/0003-adresy-podtorow.md).
 */
export const INVITE_BASE_PATH = '/api/auth/invite';

/**
 * PL: Ile dni ważny jest kod zaproszenia (docs/PLAN_APLIKACJI.md, część 7: „kody zaproszeń, ważne 14 dni”).
 * EN: How many days an invitation code is valid (docs/PLAN_APLIKACJI.md, part 7: "kody zaproszeń, ważne 14 dni").
 */
export const INVITE_LIFETIME_DAYS = 14;

/**
 * PL: Początek identyfikatora wiersza z kodem w tabeli verification. Reszta to kod. Podtor 1a używa tej samej tabeli z identyfikatorem „sign-in-otp-<adres>”, więc nie ma kolizji.
 * EN: The start of the identifier of a code row in the verification table. The rest is the code. Subtrack 1a uses the same table with the identifier "sign-in-otp-<address>", so there is no collision.
 */
export const INVITE_IDENTIFIER_PREFIX = 'invite-code-';

/**
 * PL: Znaki kodu: litery i cyfry bez I, O, 0 i 1, które łatwo pomylić przy przepisywaniu. Dokładnie 32 znaki, więc losowy bajt daje znak bez przekrzywienia rozkładu.
 * EN: The code characters: letters and digits without I, O, 0 and 1, which are easy to confuse when copying. Exactly 32 characters, so a random byte gives a character without skewing the distribution.
 */
export const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * PL: Kształt kodu: „TEB-”, cztery znaki, kreska, dwa znaki (jak „TEB-7K4Q-92” z ekranu 1.3).
 * EN: The code shape: "TEB-", four characters, a dash, two characters (like "TEB-7K4Q-92" on screen 1.3).
 */
export const INVITE_CODE_PATTERN = /^TEB-[A-Z0-9]{4}-[A-Z0-9]{2}$/;

/**
 * PL: Przyjęte zasady loginu: od 3 do 30 znaków, małe litery, cyfry, kropka, podkreślnik i myślnik. Plan nie określa kształtu loginu, więc to przyjęta wartość.
 * EN: The accepted login rules: 3 to 30 characters, lowercase letters, digits, dot, underscore and dash. The plan does not say what a login looks like, so this is the accepted value.
 */
export const LOGIN_PATTERN = /^[a-z0-9._-]{3,30}$/;

/**
 * PL: Najkrótsze hasło w znakach. Przyjęta wartość: to domyślna wartość Better Auth i placeholder „••••••••” z ekranu 1.3.
 * EN: The shortest password in characters. An accepted value: it is the Better Auth default and the "••••••••" placeholder from screen 1.3.
 */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * PL: Najdłuższe hasło w znakach. Limit chroni serwer przed ogromnym hasłem, które trzeba by haszować. To domyślna wartość Better Auth.
 * EN: The longest password in characters. The limit protects the server from a huge password that would have to be hashed. It is the Better Auth default.
 */
export const PASSWORD_MAX_LENGTH = 128;

/**
 * PL: Domena adresów technicznych kont z loginem. Tabela user wymaga adresu e-mail, a konto z loginem go nie ma, więc login zamieniamy na „<login>@login.invalid”. Domena .invalid nie istnieje w internecie (RFC 2606) i nie kończy się na @teb.edu.pl, więc nie koliduje z kontami ze szkolnej poczty.
 * EN: The domain of the technical addresses of login accounts. The user table requires an e-mail address and a login account has none, so we turn the login into "<login>@login.invalid". The .invalid domain does not exist on the internet (RFC 2606) and does not end with @teb.edu.pl, so it does not collide with school-mail accounts.
 */
export const LOGIN_EMAIL_DOMAIN = 'login.invalid';
