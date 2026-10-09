/**
 * PL: Router Hono podtoru 3a (aktualności: lista i wpis). Na razie pusty. Agent podtoru dopisze tu adresy serwera. Router jest podpięty pod /api/news/feed w worker/mounts.ts.
 * EN: The Hono router of subtrack 3a (news: list and entry). Empty for now. The agent of this subtrack adds the server routes here. The router is mounted under /api/news/feed in worker/mounts.ts.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by worker/news/feed/index.ts::newsFeedApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';

/**
 * PL: Pusty router podtoru 3a. Nie ma jeszcze adresów, więc każde zapytanie do niego kończy się kodem 404.
 * EN: The empty router of subtrack 3a. It has no routes yet, so every request to it ends with code 404.
 */
export const newsFeedApp = new Hono();
