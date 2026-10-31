/**
 * PL: Role w panelu Samorządu po stronie serwera: odczyt ról ucznia z bazy i sprawdzenie, czy rola wystarcza do danej części panelu. Role mają kolejność: redakcja (tylko Wpisy) < Samorząd (Wpisy, Zgłoszenia, Ankiety, Kody zaproszeń) < administrator (wszystko, także Role i Dane z pilotażu), zgodnie z docs/projekt/EKRANY.md, przepływ 6.
 * EN: The Student Council panel roles on the server side: reading a student's roles from the database and checking whether a role is enough for a given panel section. The roles are ordered: editorial team (Entries only) < Council (Entries, Reports, Surveys, Invitation codes) < administrator (everything, also Roles and Pilot data), as in docs/projekt/EKRANY.md, flow 6.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/db/schema/admin.ts::panelRoles
 * @used_by worker/admin/requirePanelRole.ts::createRequirePanelRole
 * @used_by worker/admin/routes.ts::adminApp
 * @used_by worker/admin/panelRoles.test.ts::highestPanelRole
 */

// PL: Warunek „równa się” i klient bazy do zapytania o role.
// EN: The "equals" condition and the database client for the roles query.
import { and, eq, inArray } from 'drizzle-orm';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
// PL: Tabela ról, lista ról i typ roli.
// EN: The roles table, the list of roles and the role type.
import { PANEL_ROLES, panelRoles, type PanelRole } from '../db/schema/admin';

/**
 * PL: Kolejność ról od najniższej do najwyższej to kolejność w PANEL_ROLES. Rola wyższa może wszystko, co niższa, bo Samorząd ma też Wpisy, a administrator ma całe menu Samorządu.
 * EN: The order of the roles from the lowest to the highest is the order in PANEL_ROLES. A higher role can do everything a lower one can, because the Council also has Entries and the administrator has the whole Council menu.
 */
const ROLE_ORDER: readonly PanelRole[] = PANEL_ROLES;

/**
 * PL: Wybiera najwyższą rolę z listy ról ucznia.
 * EN: Picks the highest role from a student's role list.
 *
 * @param roles - PL: role zapisane dla ucznia (może być pusta lista). EN: the roles stored for the student (may be an empty list).
 * @returns PL: najwyższa rola albo null, gdy uczeń nie ma żadnej. EN: the highest role or null when the student has none.
 */
export function highestPanelRole(roles: readonly PanelRole[]): PanelRole | null {
  // PL: Zacznij bez roli i podnoś ją przy każdej wyższej, którą uczeń ma.
  // EN: Start with no role and raise it for every higher one the student has.
  let highest: PanelRole | null = null;
  for (const role of roles) {
    if (highest === null || ROLE_ORDER.indexOf(role) > ROLE_ORDER.indexOf(highest)) highest = role;
  }
  // PL: Oddaj najwyższą rolę.
  // EN: Return the highest role.
  return highest;
}

/**
 * PL: Sprawdza, czy najwyższa rola ucznia wystarcza do części panelu, która wymaga roli minimalnej.
 * EN: Checks whether a student's highest role is enough for a panel section that needs a minimum role.
 *
 * @param highest - PL: najwyższa rola ucznia albo null. EN: the student's highest role or null.
 * @param minimum - PL: najniższa rola, która wystarcza. EN: the lowest role that is enough.
 * @returns PL: true, gdy rola wystarcza. EN: true when the role is enough.
 */
export function isRoleEnough(highest: PanelRole | null, minimum: PanelRole): boolean {
  // PL: Bez roli nie ma dostępu do niczego.
  // EN: Without a role there is no access to anything.
  if (highest === null) return false;
  // PL: Rola wystarcza, gdy stoi w kolejności nie niżej niż minimalna.
  // EN: A role is enough when it stands in the order no lower than the minimum.
  return ROLE_ORDER.indexOf(highest) >= ROLE_ORDER.indexOf(minimum);
}

/**
 * PL: Czyta najwyższą rolę ucznia w panelu z bazy.
 * EN: Reads a student's highest panel role from the database.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param userId - PL: numer ucznia (konta). EN: the student (account) id.
 * @returns PL: najwyższa rola albo null, gdy uczeń nie ma żadnej. EN: the highest role or null when the student has none.
 * @throws PL: błąd bazy. EN: a database error.
 */
export async function getPanelLevel(db: D1Database, userId: string): Promise<PanelRole | null> {
  // PL: Pobierz wszystkie role ucznia. Zapytanie ma warunek po numerze ucznia, więc nie czyta cudzych ról.
  // EN: Fetch all of the student's roles. The query has a condition on the student id, so it reads nobody else's roles.
  const rows = await drizzle(db).select({ role: panelRoles.role }).from(panelRoles).where(eq(panelRoles.userId, userId));
  // PL: Zwróć najwyższą z nich.
  // EN: Return the highest of them.
  return highestPanelRole(rows.map((row) => row.role));
}

/**
 * PL: Zapytanie nadające uczniowi rolę, bez wykonania. Używa go batch, żeby zapis roli i wpis w dzienniku poszły razem.
 * EN: The query that grants the student a role, not run yet. A batch uses it, so the role write and the diary entry go together.
 *
 * @param orm - PL: klient Drizzle na bazie D1. EN: the Drizzle client on the D1 database.
 * @param userId - PL: numer ucznia (konta). EN: the student (account) id.
 * @param role - PL: rola do nadania. EN: the role to grant.
 * @param now - PL: chwila nadania (do zapisu w bazie). EN: the moment of granting (for the database).
 * @returns PL: zapytanie do wykonania w batchu. EN: the query to run in a batch.
 */
export function grantPanelRoleQuery(orm: DrizzleD1Database, userId: string, role: PanelRole, now: Date = new Date()) {
  // PL: Wstaw wiersz roli. Gdy wiersz już jest, zostaw go bez zmian.
  // EN: Insert the role row. When the row is already there, leave it unchanged.
  return orm.insert(panelRoles).values({ userId, role, grantedAt: now.getTime() }).onConflictDoNothing();
}

/**
 * PL: Zapytanie odbierające uczniowi rolę, bez wykonania. Używa go batch, żeby zmiana roli i wpis w dzienniku poszły razem.
 * EN: The query that revokes a student's role, not run yet. A batch uses it, so the role change and the diary entry go together.
 *
 * @param orm - PL: klient Drizzle na bazie D1. EN: the Drizzle client on the D1 database.
 * @param userId - PL: numer ucznia (konta). EN: the student (account) id.
 * @param role - PL: rola do odebrania. EN: the role to revoke.
 * @returns PL: zapytanie do wykonania w batchu. EN: the query to run in a batch.
 */
export function revokePanelRoleQuery(orm: DrizzleD1Database, userId: string, role: PanelRole) {
  // PL: Usuń wiersz tej roli tylko tego ucznia.
  // EN: Delete the row of this role for this student only.
  return orm.delete(panelRoles).where(and(eq(panelRoles.userId, userId), eq(panelRoles.role, role)));
}

/**
 * PL: Czyta wszystkie role ucznia w panelu (nie tylko najwyższą), żeby pokazać dwa przełączniki na ekranie roli.
 * EN: Reads all of the student's panel roles (not only the highest), to show the two switches on the role screen.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param userId - PL: numer ucznia (konta). EN: the student (account) id.
 * @returns PL: lista ról ucznia (może być pusta). EN: the list of the student's roles (may be empty).
 */
export async function getPanelRoles(db: D1Database, userId: string): Promise<PanelRole[]> {
  // PL: Zapytanie ma warunek po numerze ucznia, więc nie czyta cudzych ról.
  // EN: The query has a condition on the student id, so it reads nobody else's roles.
  const rows = await drizzle(db).select({ role: panelRoles.role }).from(panelRoles).where(eq(panelRoles.userId, userId));
  return rows.map((row) => row.role);
}

/**
 * PL: Lista uczniów, którzy mają rolę Samorządu albo redakcji (bez administratora). Każdy numer ucznia jest raz, z wszystkimi jego rolami z tej listy.
 * EN: The list of students who have the Council or editorial role (without the administrator). Each student id appears once, with all of their roles from this list.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @returns PL: pary numer ucznia i rola, bez administratora. EN: pairs of student id and role, without the administrator.
 */
export async function listRoleHolders(db: D1Database): Promise<{ userId: string; role: PanelRole }[]> {
  // PL: Weź tylko role, które da się nadać w ekranie 6.3 (Samorząd i redakcja).
  // EN: Take only the roles that can be granted on screen 6.3 (the Council and the editorial team).
  return drizzle(db).select({ userId: panelRoles.userId, role: panelRoles.role }).from(panelRoles).where(inArray(panelRoles.role, ['council', 'editor']));
}
