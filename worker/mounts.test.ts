/**
 * PL: Test listy routerów serwera. Sprawdza, że każdy z 14 podtorów ma wpis w API_MOUNTS pod adresem /api/<moduł>/<część> i że adresy się nie powtarzają. Podtor 0 (wspólne) nie ma routera z założenia. Pusty router odpowiada 404 tak samo, gdy jest podpięty i gdy go nie ma, więc test sprawdza listę, a nie zapytanie.
 * EN: Test of the server router list. Checks that each of the 14 subtracks has an entry in API_MOUNTS at /api/<module>/<part> and that the addresses do not repeat. Subtrack 0 (shared) has no router by design. An empty router answers 404 both when it is mounted and when it is not, so the test checks the list, not a request.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/mounts.ts::API_MOUNTS
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Klasa routera Hono, żeby sprawdzić, że wpis ma prawdziwy router.
// EN: The Hono router class, to check that an entry has a real router.
import { Hono } from 'hono';
// PL: Lista, którą sprawdzamy.
// EN: The list under test.
import { API_MOUNTS } from './mounts';

/**
 * PL: Podtory z serwerem i ich adresy. Lista jest wpisana ręcznie według docs/PODZIAL_PRACY.md, część 3, a nie wyliczona z kodu, bo wtedy test nie wykryłby brakującego wpisu. Podtoru 0 tu nie ma, bo wspólne elementy nie mają routera.
 * EN: The subtracks with a server and their addresses. The list is written by hand from docs/PODZIAL_PRACY.md, part 3, and not computed from the code, because then the test would not notice a missing entry. Subtrack 0 is not here, because the shared elements have no router.
 */
const EXPECTED_MOUNTS: ReadonlyArray<{ id: string; basePath: string }> = [
  { id: '1a', basePath: '/api/auth/email' },
  { id: '1b', basePath: '/api/auth/invite' },
  { id: '2', basePath: '/api/media' },
  { id: '3a', basePath: '/api/news/feed' },
  { id: '3b', basePath: '/api/news/editor' },
  { id: '3c', basePath: '/api/news/admin' },
  { id: '4a', basePath: '/api/reports/student' },
  { id: '4b', basePath: '/api/reports/admin' },
  { id: '5a', basePath: '/api/surveys/vote' },
  { id: '5b', basePath: '/api/surveys/admin' },
  { id: '6', basePath: '/api/bell' },
  { id: '7', basePath: '/api/profile' },
  { id: '8', basePath: '/api/admin' },
  { id: '9', basePath: '/api/dashboard' },
];

// PL: Grupa testów listy routerów.
// EN: A group of tests for the router list.
describe('API_MOUNTS', () => {
  // PL: Jeden przypadek na podtor: wpis istnieje, ma właściwy adres i router Hono.
  // EN: One case per subtrack: the entry exists and has the right address and a Hono router.
  it.each(EXPECTED_MOUNTS)('podtor $id ma router pod adresem $basePath / subtrack $id has a router at address $basePath', ({ id, basePath }) => {
    // PL: Znajdź wpis po numerze podtoru.
    // EN: Find the entry by subtrack number.
    const mount = API_MOUNTS.find((item) => item.id === id);

    // PL: Wpis musi mieć adres z listy i prawdziwy router.
    // EN: The entry must have the address from the list and a real router.
    expect(mount?.basePath).toBe(basePath);
    expect(mount?.router).toBeInstanceOf(Hono);
  });

  // PL: Dwa podtory pod jednym adresem to konflikt, o którym nikt by nie wiedział.
  // EN: Two subtracks under one address would be a conflict nobody would notice.
  it('adresy się nie powtarzają / addresses do not repeat', () => {
    // PL: Zbierz adresy i usuń powtórzenia.
    // EN: Collect the addresses and remove repeats.
    const paths = API_MOUNTS.map((item) => item.basePath);

    // PL: Po usunięciu powtórzeń lista ma tyle samo wpisów.
    // EN: After removing repeats the list has the same number of entries.
    expect(new Set(paths).size).toBe(paths.length);
  });

  // PL: Adres spoza /api/ nie trafiłby do Workera, tylko do plików aplikacji.
  // EN: An address outside /api/ would not reach the Worker, only the app files.
  it('każdy adres zaczyna się od /api/ / every address starts with /api/', () => {
    // PL: Sprawdź początek każdego adresu.
    // EN: Check the start of every address.
    for (const mount of API_MOUNTS) {
      expect(mount.basePath.startsWith('/api/')).toBe(true);
    }
  });
});
