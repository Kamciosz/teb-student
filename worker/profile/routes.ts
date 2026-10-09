/**
 * PL: Router Hono podtoru 7 (profil i ustawienia). Na razie pusty. Agent podtoru dopisze tu adresy serwera. Router jest podpięty pod /api/profile w worker/mounts.ts.
 * EN: The Hono router of subtrack 7 (profile and settings). Empty for now. The agent of this subtrack adds the server routes here. The router is mounted under /api/profile in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by worker/profile/index.ts::profileApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';

/**
 * PL: Pusty router podtoru 7. Nie ma jeszcze adresów, więc każde zapytanie do niego kończy się kodem 404.
 * EN: The empty router of subtrack 7. It has no routes yet, so every request to it ends with code 404.
 */
export const profileApp = new Hono();
