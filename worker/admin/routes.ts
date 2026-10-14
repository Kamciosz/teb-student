/**
 * PL: Router Hono podtoru 8 (panel Samorządu: rama, role, wydawanie kodów, dane z pilotażu, dziennik zmian), podpięty pod /api/admin w worker/mounts.ts. Adresy: GET /me (rola ucznia w panelu), GET /invites i POST /invites (kody zaproszeń, od Samorządu), /roles (role, tylko administrator), GET /pilot (plik z pilotażu, tylko administrator) i GET /diary (dziennik zmian, od Samorządu). Wydanie kodu zapisuje wpis w dzienniku.
 * EN: The Hono router of subtrack 8 (Student Council panel: frame, roles, issuing codes, pilot data, change diary), mounted under /api/admin in worker/mounts.ts. Routes: GET /me (the student's panel role), GET /invites and POST /invites (invitation codes, from the Council), /roles (roles, administrator only), GET /pilot (the pilot file, administrator only) and GET /diary (the change diary, from the Council). Issuing a code records an entry in the diary.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/auth/index.ts::requireStudent
 * @uses worker/auth/index.ts::issueInviteCode
 * @uses worker/auth/index.ts::listInviteCodes
 * @uses worker/admin/requirePanelRole.ts::requirePanelRole
 * @uses worker/admin/panelRoles.ts::getPanelLevel
 * @uses worker/admin/roleRoutes.ts::rolesApp
 * @uses worker/admin/pilotRoutes.ts::pilotApp
 * @uses worker/admin/diaryRoutes.ts::diaryApp
 * @uses worker/admin/diary.ts::recordDiaryEntry
 * @used_by worker/admin/index.ts::adminApp
 * @used_by worker/admin/routes.test.ts::adminApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';
// PL: Sprawdzanie sesji, typ środowiska ucznia, tworzenie i listowanie kodów zaproszeń z drzwi modułu auth.
// EN: The session check, the student environment type, and creating and listing invitation codes from the auth module door.
import { issueInviteCode, listInviteCodes, requireStudent, type StudentEnv } from '../auth';
// PL: Odczyt roli ucznia i sprawdzanie roli. Importowane przed routerami ról i pilotażu, bo te korzystają z drzwi reports i surveys, które z kolei sięgają po requirePanelRole (cykl importów).
// EN: Reading the student's role and checking the role. Imported before the roles and pilot routers, because those use the reports and surveys doors, which in turn reach for requirePanelRole (an import cycle).
import { getPanelLevel } from './panelRoles';
import { requirePanelRole, type PanelEnv } from './requirePanelRole';
// PL: Routery ról (administrator) i pliku z pilotażu (administrator).
// EN: The roles router (administrator) and the pilot file router (administrator).
import { rolesApp } from './roleRoutes';
import { pilotApp } from './pilotRoutes';
// PL: Dziennik zmian: router odczytu i zapis wpisu przy wydaniu kodu.
// EN: The change diary: the read router and recording an entry when a code is issued.
import { diaryApp } from './diaryRoutes';
import { recordDiaryEntry } from './diary';

/**
 * PL: Router roli ucznia: adres /me odpowiada każdemu zalogowanemu uczniowi. Uczeń bez roli dostaje null, a ekran pokazuje wtedy „Tylko dla Samorządu”.
 * EN: The student role router: the /me route answers every signed-in student. A student without a role gets null, and the screen then shows "Tylko dla Samorządu".
 */
const meApp = new Hono<StudentEnv>().use(requireStudent).get('/', async (context) => {
  // PL: Odczytaj najwyższą rolę ucznia z sesji (null, gdy nie ma żadnej).
  // EN: Read the student's highest role from the session (null when there is none).
  const level = await getPanelLevel(context.env.DB, context.get('student').id);
  // PL: Odpowiedz rolą.
  // EN: Answer with the role.
  return context.json({ level });
});

/**
 * PL: Router kodów zaproszeń: tylko Samorząd i administrator. Kod jest ważny 14 dni i działa raz (podtor 1b). Lista pokazuje kody, które jeszcze działają.
 * EN: The invitation codes router: only the Council and the administrator. A code is valid for 14 days and works once (subtrack 1b). The list shows the codes that still work.
 */
const invitesApp = new Hono<PanelEnv>()
  .use(requirePanelRole('council'))
  // PL: Lista kodów, które jeszcze działają, od najkrócej ważnego. Daty idą jako tekst ISO.
  // EN: The list of codes that still work, from the one valid for the shortest time. The dates go as ISO text.
  .get('/', async (context) => {
    const codes = await listInviteCodes(context.env.DB);
    return context.json({ codes: codes.map((invite) => ({ code: invite.code, expiresAt: invite.expiresAt.toISOString() })) });
  })
  // PL: Wydaj kod w bazie i oddaj go razem z datą końca ważności.
  // EN: Issue the code in the database and return it together with the expiry date.
  .post('/', async (context) => {
    const { code, expiresAt } = await issueInviteCode(context.env.DB);
    // PL: Zapisz w dzienniku, kto wydał kod. Sam kod do dziennika nie trafia, bo to sekret.
    // EN: Record in the diary who issued the code. The code itself does not go into the diary, because it is a secret.
    await recordDiaryEntry(context.env.DB, { actorId: context.get('student').id, action: 'invite_issued', targetId: null });
    return context.json({ code, expiresAt: expiresAt.toISOString() }, 201);
  });

/**
 * PL: Router podtoru 8 pod /api/admin: /me, /invites, /roles, /pilot i /diary.
 * EN: The router of subtrack 8 under /api/admin: /me, /invites, /roles, /pilot and /diary.
 */
export const adminApp = new Hono()
  .route('/me', meApp)
  .route('/invites', invitesApp)
  .route('/roles', rolesApp)
  .route('/pilot', pilotApp)
  .route('/diary', diaryApp);
