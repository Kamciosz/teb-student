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
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
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
