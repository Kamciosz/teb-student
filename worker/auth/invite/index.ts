/**
 * PL: Drzwi podtoru 1b (kody zaproszeń, login i hasło) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts oraz funkcję tworzącą kod zaproszenia dla panelu Samorządu (podtor 8).
 * EN: The door of subtrack 1b (invitation codes, login and password) on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that creates an invitation code for the Student Council panel (subtrack 8).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/auth/invite/routes.ts::authInviteApp
 * @uses worker/auth/invite/inviteCodes.ts::issueInviteCode
 * @uses worker/auth/invite/inviteCodes.ts::listInviteCodes
 * @used_by worker/auth/index.ts::authInviteApp
 * @used_by worker/auth/index.ts::issueInviteCode
 * @used_by worker/auth/index.ts::listInviteCodes
 */

// PL: Router podtoru 1b.
// EN: The router of subtrack 1b.
export { authInviteApp } from './routes';

// PL: Tworzy kod zaproszenia ważny 14 dni (issueInviteCode(env.DB) → { code, expiresAt }). Panel Samorządu (podtor 8) pokazuje go uczniowi.
// EN: Creates an invitation code valid for 14 days (issueInviteCode(env.DB) → { code, expiresAt }). The Student Council panel (subtrack 8) shows it to the student.
export { issueInviteCode } from './inviteCodes';

// PL: Lista kodów zaproszeń, które jeszcze działają, od najkrócej ważnego (listInviteCodes(env.DB) → { code, expiresAt }[]). Panel Samorządu (podtor 8) pokazuje ją na ekranie „Kody zaproszeń”.
// EN: The list of invitation codes that still work, from the one valid for the shortest time (listInviteCodes(env.DB) → { code, expiresAt }[]). The Student Council panel (subtrack 8) shows it on the "Invitation codes" screen.
export { listInviteCodes } from './inviteCodes';
