/**
 * PL: Drzwi podtoru 8 (panel Samorządu: rama, role, wydawanie kodów) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts, sprawdzanie roli w panelu dla routerów innych podtorów i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 8 (Student Council panel: frame, roles, issuing codes) on the server side. Exposes the router to be mounted in worker/mounts.ts, the panel role check for the routers of other subtracks and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/admin/routes.ts::adminApp
 * @uses worker/admin/requirePanelRole.ts::requirePanelRole
 * @uses worker/admin/deleteStudentData.ts::deleteAdminStudentData
 * @uses worker/admin/diary.ts::recordDiaryEntry
 * @used_by worker/mounts.ts::API_MOUNTS
 * @used_by worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS
 * @used_by worker/<moduł>/…::requirePanelRole (routery podtorów 3c, 4b, 5b / routers of subtracks 3c, 4b, 5b)
 * @used_by worker/news/admin/routes.ts::createNewsAdminApp (zapis wpisu w dzienniku / diary entry)
 * @used_by worker/reports/admin/routes.ts::reportsAdminApp (zapis zmiany etapu w dzienniku / diary entry)
 */

// PL: Sprawdzanie roli w panelu dla routerów innych modułów. Użycie: new Hono<PanelEnv>().use(requirePanelRole('council')). Role od najniższej: 'editor' (redakcja, tylko Wpisy), 'council' (Samorząd: Wpisy, Zgłoszenia, Ankiety, Kody zaproszeń), 'admin' (wszystko). Rola wyższa przechodzi tam, gdzie wystarcza niższa. Bez sesji odpowiada 401, bez wystarczającej roli 403. Ucznia daje context.get('student'), a jego najwyższą rolę context.get('panelLevel'). Wpisy (3c): 'editor', zgłoszenia (4b) i ankiety (5b): 'council'.
// EN: The panel role check for the routers of other modules. Usage: new Hono<PanelEnv>().use(requirePanelRole('council')). Roles from the lowest: 'editor' (the newspaper team, Entries only), 'council' (the Council: Entries, Reports, Surveys, Invitation codes), 'admin' (everything). A higher role passes wherever a lower one is enough. Without a session it answers 401, without a sufficient role 403. The student comes from context.get('student') and their highest role from context.get('panelLevel'). Entries (3c): 'editor', reports (4b) and surveys (5b): 'council'.
// PL: Kolejność ma znaczenie: sprawdzanie roli jest eksportowane przed routerem, bo router ciągnie drzwi reports i surveys, które już go potrzebują (cykl importów).
// EN: The order matters: the role check is exported before the router, because the router pulls in the reports and surveys doors, which already need it (an import cycle).
export { requirePanelRole, type PanelEnv } from './requirePanelRole';

// PL: Router podtoru 8.
// EN: The router of subtrack 8.
export { adminApp } from './routes';

// PL: Typ roli w panelu.
// EN: The panel role type.
export type { PanelRole } from '../db/schema/admin';

// PL: Zapis wpisu w dzienniku zmian. Wołają go trasy innych podtorów (wpisy 3c, zgłoszenia 4b), bez wewnętrznych plików modułu admin. Wpis nie ma treści: podajesz id wykonawcy, nazwę akcji i id celu albo null.
// EN: Writes an entry in the change diary. The routes of other subtracks call it (entries 3c, reports 4b), without the internal files of the admin module. An entry has no content: you give the actor's id, the action name and the target id or null.
export { recordDiaryEntry } from './diary';

// PL: Funkcja kasująca dane ucznia z modułu admin. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the admin module. worker/shared/accountDeletion.ts collects it.
export { deleteAdminStudentData } from './deleteStudentData';
