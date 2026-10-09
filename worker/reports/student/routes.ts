/**
 * PL: Router Hono podtoru 4a (zgłoszenie: formularz i „moje zgłoszenia”). Na razie pusty. Agent podtoru dopisze tu adresy serwera. Router jest podpięty pod /api/reports/student w worker/mounts.ts.
 * EN: The Hono router of subtrack 4a (report: form and "my reports"). Empty for now. The agent of this subtrack adds the server routes here. The router is mounted under /api/reports/student in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by worker/reports/student/index.ts::reportsStudentApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';

/**
 * PL: Pusty router podtoru 4a. Nie ma jeszcze adresów, więc każde zapytanie do niego kończy się kodem 404.
 * EN: The empty router of subtrack 4a. It has no routes yet, so every request to it ends with code 404.
 */
export const reportsStudentApp = new Hono();
