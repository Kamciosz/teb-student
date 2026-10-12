/**
 * PL: Drzwi podtoru 8 (panel Samorządu: rama, role, wydawanie kodów) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts, sprawdzanie roli w panelu dla routerów innych podtorów i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 8 (Student Council panel: frame, roles, issuing codes) on the server side. Exposes the router to be mounted in worker/mounts.ts, the panel role check for the routers of other subtracks and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/admin/routes.ts::adminApp
 * @uses worker/admin/requirePanelRole.ts::requirePanelRole
 * @uses worker/admin/deleteStudentData.ts::deleteAdminStudentData
 * @used_by worker/mounts.ts::API_MOUNTS
 * @used_by worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS
 * @used_by worker/<moduł>/…::requirePanelRole (routery podtorów 3c, 4b, 5b / routers of subtracks 3c, 4b, 5b)
 */

// PL: Router podtoru 8.
// EN: The router of subtrack 8.
export { adminApp } from './routes';

// PL: Sprawdzanie roli w panelu dla routerów innych modułów. Użycie: new Hono<PanelEnv>().use(requirePanelRole('council')). Role od najniższej: 'editor' (redakcja, tylko Wpisy), 'council' (Samorząd: Wpisy, Zgłoszenia, Ankiety, Kody zaproszeń), 'admin' (wszystko). Rola wyższa przechodzi tam, gdzie wystarcza niższa. Bez sesji odpowiada 401, bez wystarczającej roli 403. Ucznia daje context.get('student'), a jego najwyższą rolę context.get('panelLevel'). Wpisy (3c): 'editor', zgłoszenia (4b) i ankiety (5b): 'council'.
// EN: The panel role check for the routers of other modules. Usage: new Hono<PanelEnv>().use(requirePanelRole('council')). Roles from the lowest: 'editor' (the newspaper team, Entries only), 'council' (the Council: Entries, Reports, Surveys, Invitation codes), 'admin' (everything). A higher role passes wherever a lower one is enough. Without a session it answers 401, without a sufficient role 403. The student comes from context.get('student') and their highest role from context.get('panelLevel'). Entries (3c): 'editor', reports (4b) and surveys (5b): 'council'.
export { requirePanelRole, type PanelEnv } from './requirePanelRole';
// PL: Typ roli w panelu.
// EN: The panel role type.
export type { PanelRole } from '../db/schema/admin';

// PL: Funkcja kasująca dane ucznia z modułu admin. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the admin module. worker/shared/accountDeletion.ts collects it.
export { deleteAdminStudentData } from './deleteStudentData';
