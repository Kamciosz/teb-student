/**
 * PL: Router Hono podtoru 8 (panel Samorządu: rama, role, wydawanie kodów), podpięty pod /api/admin w worker/mounts.ts. Adresy: GET /me (rola ucznia w panelu, dla ramy panelu) i POST /invites (nowy kod zaproszenia, od Samorządu).
 * EN: The Hono router of subtrack 8 (Student Council panel: frame, roles, issuing codes), mounted under /api/admin in worker/mounts.ts. Routes: GET /me (the student's panel role, for the panel frame) and POST /invites (a new invitation code, from the Council).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/auth/index.ts::requireStudent
 * @uses worker/auth/index.ts::issueInviteCode
 * @uses worker/admin/requirePanelRole.ts::requirePanelRole
 * @uses worker/admin/panelRoles.ts::getPanelLevel
 * @used_by worker/admin/index.ts::adminApp
 * @used_by worker/admin/routes.test.ts::adminApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';
// PL: Sprawdzanie sesji, typ środowiska ucznia i tworzenie kodu zaproszenia z drzwi modułu auth.
// EN: The session check, the student environment type and creating an invitation code from the auth module door.
import { issueInviteCode, requireStudent, type StudentEnv } from '../auth';
// PL: Odczyt roli ucznia.
// EN: Reading the student's role.
import { getPanelLevel } from './panelRoles';
// PL: Sprawdzanie roli i typ środowiska z rolą.
// EN: The role check and the environment type with the role.
import { requirePanelRole, type PanelEnv } from './requirePanelRole';

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
 * PL: Router kodów zaproszeń: tylko Samorząd i administrator. Kod jest ważny 14 dni i działa raz (podtor 1b).
 * EN: The invitation codes router: only the Council and the administrator. A code is valid for 14 days and works once (subtrack 1b).
 */
const invitesApp = new Hono<PanelEnv>().use(requirePanelRole('council')).post('/', async (context) => {
  // PL: Wydaj kod w bazie i oddaj go razem z datą końca ważności.
  // EN: Issue the code in the database and return it together with the expiry date.
  const { code, expiresAt } = await issueInviteCode(context.env.DB);
  return context.json({ code, expiresAt: expiresAt.toISOString() }, 201);
});

/**
 * PL: Router podtoru 8 pod /api/admin: /me (rola ucznia) i /invites (wydawanie kodów).
 * EN: The router of subtrack 8 under /api/admin: /me (the student's role) and /invites (issuing codes).
 */
export const adminApp = new Hono().route('/me', meApp).route('/invites', invitesApp);
