/**
 * PL: Jedyny Worker aplikacji. Odpowiada na zapytania pod /api/, a pliki aplikacji (HTML, JS, CSS) wysyła Cloudflare z katalogu zbudowanej aplikacji.
 * EN: The app's only Worker. Answers requests under /api/, while Cloudflare serves the app files (HTML, JS, CSS) from the built app directory.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses wrangler.jsonc::assets
 * @uses worker/mounts.ts::API_MOUNTS
 * @used_by vite.config.ts::cloudflare
 * @used_by worker/index.test.ts::app
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';
// PL: Lista routerów wszystkich podtorów.
// EN: The list of routers of all subtracks.
import { API_MOUNTS } from './mounts';

// PL: Aplikacja Hono. Adresy podtorów wchodzą z listy w mounts.ts, więc tu zostaje tylko adres kontrolny.
// EN: The Hono app. The subtrack routes come from the list in mounts.ts, so only the health-check route stays here.
const app = new Hono();

// PL: Adres kontrolny. Odpowiada „ok”, gdy Worker działa. Nie czyta bazy i nic nie zmienia.
// EN: Health-check route. Answers "ok" when the Worker runs. It reads no database and changes nothing.
app.get('/api/health', (context) => context.json({ status: 'ok' }));

// PL: Podepnij router każdego podtoru pod jego adresem /api/<moduł>/<część>.
// EN: Mount every subtrack's router under its /api/<module>/<part> address.
for (const mount of API_MOUNTS) app.route(mount.basePath, mount.router);

// PL: Cloudflare uruchamia Workera przez ten eksport.
// EN: Cloudflare runs the Worker through this export.
export default app;
