/**
 * PL: Jedyny Worker aplikacji. Odpowiada na zapytania pod /api/, a pliki aplikacji (HTML, JS, CSS) wysyła Cloudflare z katalogu zbudowanej aplikacji.
 * EN: The app's only Worker. Answers requests under /api/, while Cloudflare serves the app files (HTML, JS, CSS) from the built app directory.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses wrangler.jsonc::assets
 * @used_by vite.config.ts::cloudflare
 * @used_by worker/index.test.ts::app
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';

// PL: Aplikacja Hono: tu dopisujemy kolejne adresy serwera.
// EN: The Hono app: more server routes are added here.
const app = new Hono();

// PL: Adres kontrolny. Odpowiada „ok”, gdy Worker działa. Nie czyta bazy i nic nie zmienia.
// EN: Health-check route. Answers "ok" when the Worker runs. It reads no database and changes nothing.
app.get('/api/health', (context) => context.json({ status: 'ok' }));

// PL: Cloudflare uruchamia Workera przez ten eksport.
// EN: Cloudflare runs the Worker through this export.
export default app;
