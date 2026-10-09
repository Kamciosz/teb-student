/**
 * PL: Router Hono podtoru 4b (zgłoszenia w panelu: zmiana etapu). Na razie pusty. Agent podtoru dopisze tu adresy serwera. Router jest podpięty pod /api/reports/admin w worker/mounts.ts.
 * EN: The Hono router of subtrack 4b (reports in the panel: stage change). Empty for now. The agent of this subtrack adds the server routes here. The router is mounted under /api/reports/admin in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by worker/reports/admin/index.ts::reportsAdminApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';

/**
 * PL: Pusty router podtoru 4b. Nie ma jeszcze adresów, więc każde zapytanie do niego kończy się kodem 404.
 * EN: The empty router of subtrack 4b. It has no routes yet, so every request to it ends with code 404.
 */
export const reportsAdminApp = new Hono();
