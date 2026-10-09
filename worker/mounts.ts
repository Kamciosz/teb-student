/**
 * PL: Lista routerów serwera: adres /api/<moduł>/<część> każdego podtoru z docs/PODZIAL_PRACY.md (część 3) i jego router Hono. Powstała w etapie A i nikt jej potem nie zmienia: nowe adresy podtor dopisuje w swoim routerze. Podtor 0 (wspólne) nie ma routera.
 * EN: The list of server routers: the /api/<module>/<part> address of every subtrack from docs/PODZIAL_PRACY.md (part 3) and its Hono router. It was made in stage A and nobody changes it afterwards: a subtrack adds new routes in its own router. Subtrack 0 (shared) has no router.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/auth/index.ts::authEmailApp
 * @uses worker/media/index.ts::mediaApp
 * @uses worker/news/index.ts::newsFeedApp
 * @uses worker/reports/index.ts::reportsStudentApp
 * @uses worker/surveys/index.ts::surveysVoteApp
 * @uses worker/bell/index.ts::bellApp
 * @uses worker/profile/index.ts::profileApp
 * @uses worker/admin/index.ts::adminApp
 * @uses worker/dashboard/index.ts::dashboardApp
 * @used_by worker/index.ts::app
 * @used_by worker/mounts.test.ts::API_MOUNTS
 */

// PL: Typ routera Hono.
// EN: The Hono router type.
import type { Hono } from 'hono';
// PL: Routery modułów. Każdy moduł importujemy tylko przez jego index.ts.
// EN: The module routers. We import every module only through its index.ts.
import { authEmailApp, authInviteApp } from './auth';
import { mediaApp } from './media';
import { newsAdminApp, newsEditorApp, newsFeedApp } from './news';
import { reportsAdminApp, reportsStudentApp } from './reports';
import { surveysAdminApp, surveysVoteApp } from './surveys';
import { bellApp } from './bell';
import { profileApp } from './profile';
import { adminApp } from './admin';
import { dashboardApp } from './dashboard';

/**
 * PL: Jeden wpis listy: podtor, adres i router.
 * EN: One entry of the list: the subtrack, the address and the router.
 */
export type ApiMount = {
  /** PL: Numer podtoru, na przykład „3a”. EN: The subtrack number, for example "3a". */
  id: string;
  /** PL: Adres, pod którym działa router. Zawsze zaczyna się od /api/, bo tylko takie adresy trafiają do Workera (wrangler.jsonc, run_worker_first). EN: The address the router works under. It always starts with /api/, because only such addresses reach the Worker (wrangler.jsonc, run_worker_first). */
  basePath: string;
  /** PL: Router Hono podtoru. EN: The subtrack's Hono router. */
  router: Hono;
};

/**
 * PL: Routery wszystkich podtorów z serwerem, w kolejności numerów podtorów.
 * EN: The routers of all subtracks that have a server, in subtrack number order.
 */
export const API_MOUNTS: readonly ApiMount[] = [
  { id: '1a', basePath: '/api/auth/email', router: authEmailApp },
  { id: '1b', basePath: '/api/auth/invite', router: authInviteApp },
  { id: '2', basePath: '/api/media', router: mediaApp },
  { id: '3a', basePath: '/api/news/feed', router: newsFeedApp },
  { id: '3b', basePath: '/api/news/editor', router: newsEditorApp },
  { id: '3c', basePath: '/api/news/admin', router: newsAdminApp },
  { id: '4a', basePath: '/api/reports/student', router: reportsStudentApp },
  { id: '4b', basePath: '/api/reports/admin', router: reportsAdminApp },
  { id: '5a', basePath: '/api/surveys/vote', router: surveysVoteApp },
  { id: '5b', basePath: '/api/surveys/admin', router: surveysAdminApp },
  { id: '6', basePath: '/api/bell', router: bellApp },
  { id: '7', basePath: '/api/profile', router: profileApp },
  { id: '8', basePath: '/api/admin', router: adminApp },
  { id: '9', basePath: '/api/dashboard', router: dashboardApp },
];
