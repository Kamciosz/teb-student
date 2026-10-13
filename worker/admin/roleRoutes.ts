/**
 * PL: Router ról w panelu (podtor 8, ekrany 6.3a–6.3d): tylko administrator. Adresy: GET /roles (osoby z rolą), GET /roles/search?email= (szukanie po szkolnym adresie), GET /roles/:studentId (jeden uczeń), PUT /roles/:studentId (zapis dwóch przełączników: Samorząd i redakcja). Adresy uczniów są zamaskowane, a rola administratora nie jest tu do nadania.
 * EN: The router of roles in the panel (subtrack 8, screens 6.3a–6.3d): administrator only. Routes: GET /roles (the people with a role), GET /roles/search?email= (search by school address), GET /roles/:studentId (one student), PUT /roles/:studentId (saving the two switches: the Council and the editorial team). Student addresses are masked, and the administrator role cannot be granted here.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/auth/index.ts::findStudentByEmail
 * @uses worker/auth/index.ts::listStudentsByIds
 * @uses worker/admin/panelRoles.ts::getPanelRoles
 * @uses worker/admin/panelRoles.ts::grantPanelRole
 * @uses worker/admin/panelRoles.ts::revokePanelRole
 * @uses worker/admin/panelRoles.ts::listRoleHolders
 * @uses worker/admin/maskEmail.ts::maskEmail
 * @uses worker/admin/diary.ts::recordDiaryEntry
 * @used_by worker/admin/routes.ts::adminApp
 * @used_by worker/admin/roles.test.ts::rolesApp
 */

// PL: Hono to router serwera.
// EN: Hono is the server router.
import { Hono } from 'hono';
// PL: Wyszukiwanie uczniów i odczyt ich imion z drzwi modułu auth.
// EN: Searching students and reading their names from the auth module door.
import { findStudentByEmail, listStudentsByIds, type StudentSummary } from '../auth';
// PL: Typy roli i akcji dziennika (rola administratora nie wchodzi w przełączniki).
// EN: The role type and the diary action type (the administrator role is not one of the switches).
import type { DiaryAction, PanelRole } from '../db/schema/admin';
// PL: Odczyt, nadawanie i odbieranie ról, lista osób z rolą.
// EN: Reading, granting and revoking roles, the list of people with a role.
import { getPanelRoles, grantPanelRole, listRoleHolders, revokePanelRole } from './panelRoles';
// PL: Zapis zmiany roli w dzienniku zmian.
// EN: Recording a role change in the change diary.
import { recordDiaryEntry } from './diary';
// PL: Maskowanie adresu przed pokazaniem go w panelu.
// EN: Masking the address before showing it in the panel.
import { maskEmail } from './maskEmail';
// PL: Sprawdzanie roli administratora i typ środowiska z rolą.
// EN: The administrator role check and the environment type with the role.
import { requirePanelRole, type PanelEnv } from './requirePanelRole';

/**
 * PL: Kształt ucznia na ekranach 6.3: pierwsze imię, zamaskowany adres i dwa przełączniki.
 * EN: The shape of a student on screens 6.3: the first name, the masked address and the two switches.
 */
export type RoleCard = {
  studentId: string;
  firstName: string;
  maskedEmail: string;
  council: boolean;
  editor: boolean;
};

/**
 * PL: Dwa przełączniki ze zapisu: czy uczeń ma mieć rolę Samorządu i czy rolę redakcji.
 * EN: The two switches from a save: whether the student should have the Council role and the editorial role.
 */
type RoleChoice = { council: boolean; editor: boolean };

/**
 * PL: Bierze tylko pierwsze słowo z imienia. Puste imię (konto z kodu) zostaje puste.
 * EN: Takes only the first word of the name. An empty name (an account from a code) stays empty.
 *
 * @param name - PL: pełne imię z konta. EN: the full name from the account.
 * @returns PL: pierwsze imię. EN: the first name.
 */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

/**
 * PL: Składa kartę ucznia do ekranu: role, zamaskowany adres i pierwsze imię.
 * EN: Builds the student card for the screen: the roles, the masked address and the first name.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param student - PL: uczeń z drzwi auth. EN: the student from the auth door.
 * @returns PL: karta ucznia. EN: the student card.
 */
async function toCard(db: D1Database, student: StudentSummary): Promise<RoleCard> {
  // PL: Wczytaj role ucznia, żeby ustawić przełączniki.
  // EN: Load the student's roles to set the switches.
  const roles = await getPanelRoles(db, student.id);
  return {
    studentId: student.id,
    firstName: firstName(student.name),
    maskedEmail: maskEmail(student.email),
    council: roles.includes('council'),
    editor: roles.includes('editor'),
  };
}

/**
 * PL: Czyta z ciała zapytania dwa przełączniki. Gdy brakuje któregoś albo to nie jest logiczna wartość, zwraca null.
 * EN: Reads the two switches from the request body. When one is missing or is not a true/false value, returns null.
 *
 * @param body - PL: rozpakowane ciało zapytania. EN: the parsed request body.
 * @returns PL: przełączniki albo null. EN: the switches or null.
 */
function readRoleChoice(body: unknown): RoleChoice | null {
  if (typeof body !== 'object' || body === null) return null;
  const { council, editor } = body as Record<string, unknown>;
  if (typeof council !== 'boolean' || typeof editor !== 'boolean') return null;
  return { council, editor };
}

/**
 * PL: Dwie akcje dziennika dla każdej roli przełącznika: nadanie i odebranie.
 * EN: Two diary actions for each switch role: granting and revoking.
 */
const DIARY_ACTIONS_OF_ROLE: Record<Exclude<PanelRole, 'admin'>, { granted: DiaryAction; revoked: DiaryAction }> = {
  council: { granted: 'council_granted', revoked: 'council_revoked' },
  editor: { granted: 'editor_granted', revoked: 'editor_revoked' },
};

/**
 * PL: Zmiana jednej roli: kto ją robi, czyj to uczeń, która rola i czy ma być.
 * EN: One role change: who makes it, whose student it is, which role and whether it should be there.
 */
type RoleChange = { actorId: string; userId: string; role: Exclude<PanelRole, 'admin'>; on: boolean };

/**
 * PL: Ustawia jedną rolę ucznia zgodnie z przełącznikiem: włączona nadaje, wyłączona odbiera. Wpis w dzienniku powstaje tylko przy realnej zmianie, więc powtórny zapis tego samego nic nie dopisuje.
 * EN: Sets one student role according to its switch: on grants it, off revokes it. A diary entry is made only on a real change, so saving the same thing again adds nothing.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param change - PL: zmiana roli. EN: the role change.
 */
async function setPanelRole(db: D1Database, change: RoleChange): Promise<void> {
  // PL: Jeśli rola już jest tak, jak chce przełącznik, nie zapisujemy nic.
  // EN: If the role is already as the switch wants, we save nothing.
  const has = (await getPanelRoles(db, change.userId)).includes(change.role);
  if (has === change.on) return;
  // PL: Włączony przełącznik nadaje rolę, wyłączony ją odbiera.
  // EN: An on switch grants the role, an off switch revokes it.
  if (change.on) await grantPanelRole(db, change.userId, change.role);
  else await revokePanelRole(db, change.userId, change.role);
  // PL: Zapisz w dzienniku, kto i którego ucznia zmienił. Wpis dotyczy numeru ucznia, bez adresu.
  // EN: Record in the diary who changed which student. The entry concerns the student id, without the address.
  const action = DIARY_ACTIONS_OF_ROLE[change.role][change.on ? 'granted' : 'revoked'];
  await recordDiaryEntry(db, { actorId: change.actorId, action, targetId: change.userId });
}

/**
 * PL: Router ról: tylko administrator. Szukanie stoi przed szczegółami, żeby adres „search” nie został wzięty za numer ucznia.
 * EN: The roles router: administrator only. Search is registered before the details, so the "search" address is not taken for a student id.
 */
export const rolesApp = new Hono<PanelEnv>()
  .use(requirePanelRole('admin'))
  // PL: Osoby z rolą Samorządu albo redakcji, każda raz, z zamaskowanym adresem.
  // EN: The people with the Council or editorial role, each once, with a masked address.
  .get('/', async (context) => {
    const holders = await listRoleHolders(context.env.DB);
    const ids = [...new Set(holders.map((holder) => holder.userId))];
    const students = await listStudentsByIds(context.env.DB, ids);
    const cards = await Promise.all(students.map((student) => toCard(context.env.DB, student)));
    return context.json({ holders: cards });
  })
  // PL: Szukanie po szkolnym adresie: nie ma konta, to 404.
  // EN: Search by the school address: no account means 404.
  .get('/search', async (context) => {
    const student = await findStudentByEmail(context.env.DB, context.req.query('email') ?? '');
    if (student === null) return context.json({ error: 'not_found' }, 404);
    return context.json(await toCard(context.env.DB, student));
  })
  // PL: Jeden uczeń z przełącznikami. Nie ma takiego numeru, to 404.
  // EN: One student with the switches. No such id means 404.
  .get('/:studentId', async (context) => {
    const [student] = await listStudentsByIds(context.env.DB, [context.req.param('studentId')]);
    if (student === undefined) return context.json({ error: 'not_found' }, 404);
    return context.json(await toCard(context.env.DB, student));
  })
  // PL: Zapis obu przełączników. Zapis jest idempotentny: dwa razy to samo daje ten sam stan.
  // EN: Saves both switches. The save is idempotent: the same request twice gives the same state.
  .put('/:studentId', async (context) => {
    const [student] = await listStudentsByIds(context.env.DB, [context.req.param('studentId')]);
    if (student === undefined) return context.json({ error: 'not_found' }, 404);
    const choice = readRoleChoice(await context.req.json().catch(() => null));
    if (choice === null) return context.json({ error: 'bad_request' }, 400);
    const actorId = context.get('student').id;
    await setPanelRole(context.env.DB, { actorId, userId: student.id, role: 'council', on: choice.council });
    await setPanelRole(context.env.DB, { actorId, userId: student.id, role: 'editor', on: choice.editor });
    return context.json(await toCard(context.env.DB, student));
  });
