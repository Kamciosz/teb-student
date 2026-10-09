/**
 * PL: Test listy ekranów w telefonie. Sprawdza, że każdy z 14 podtorów z ekranem ma wpis w APP_ROUTES, że ekrany panelu mają ramę panelu oraz że wpisy dolnego paska i menu panelu prowadzą do istniejących adresów. Podtor 0 (wspólne) nie ma adresu z założenia.
 * EN: Test of the screen list on the phone. Checks that each of the 14 subtracks with a screen has an entry in APP_ROUTES, that the panel screens have the panel frame, and that the bottom bar and panel menu entries lead to existing addresses. Subtrack 0 (shared) has no address by design.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/app/routes.ts::APP_ROUTES
 * @uses src/shared/index.ts::DOCK_ITEMS
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Typ opisu jednego adresu w React Router.
// EN: The type describing one address in React Router.
import type { RouteObject } from 'react-router';
// PL: Wpisy dolnego paska i menu panelu.
// EN: The bottom bar and panel menu entries.
import { DOCK_ITEMS, PANEL_MENU_ITEMS } from '../shared';
// PL: Lista, którą sprawdzamy.
// EN: The list under test.
import { APP_ROUTES } from './routes';

/**
 * PL: Podtory z ekranem i ich adresy. Lista jest wpisana ręcznie według docs/PODZIAL_PRACY.md, część 3, a nie wyliczona z kodu, bo wtedy test nie wykryłby brakującego wpisu. Podtoru 0 tu nie ma, bo wspólne elementy nie mają adresu.
 * EN: The subtracks with a screen and their addresses. The list is written by hand from docs/PODZIAL_PRACY.md, part 3, and not computed from the code, because then the test would not notice a missing entry. Subtrack 0 is not here, because the shared elements have no address.
 */
const EXPECTED_SCREENS: ReadonlyArray<{ id: string; path: string }> = [
  { id: '1a', path: '/auth/email/*' },
  { id: '1b', path: '/auth/invite/*' },
  { id: '2', path: '/media/*' },
  { id: '3a', path: '/news/feed/*' },
  { id: '3b', path: '/news/editor/*' },
  { id: '3c', path: '/news/admin/*' },
  { id: '4a', path: '/reports/student/*' },
  { id: '4b', path: '/reports/admin/*' },
  { id: '5a', path: '/surveys/vote/*' },
  { id: '5b', path: '/surveys/admin/*' },
  { id: '6', path: '/bell/*' },
  { id: '7', path: '/profile/*' },
  { id: '8', path: '/admin/*' },
  { id: '9', path: '/' },
];

/**
 * PL: Podtory, których ekrany leżą w ramie panelu Samorządu.
 * EN: The subtracks whose screens live in the Student Council panel frame.
 */
const PANEL_SUBTRACKS = ['3c', '4b', '5b', '8'];

/**
 * PL: Rozpłaszcza drzewo adresów do jednej listy, żeby test znalazł adres także w ramie panelu.
 * EN: Flattens the address tree into one list, so the test finds an address inside the panel frame too.
 *
 * @param routes - PL: drzewo adresów. EN: the address tree.
 * @returns PL: wszystkie adresy, rodzice przed dziećmi. EN: all addresses, parents before children.
 */
function flatten(routes: RouteObject[]): RouteObject[] {
  // PL: Dla każdego adresu weź jego samego, a potem jego dzieci.
  // EN: For every address take itself, then its children.
  return routes.flatMap((route) => [route, ...flatten(route.children ?? [])]);
}

// PL: Wszystkie adresy aplikacji w jednej liście.
// EN: All the app addresses in one list.
const ALL_ROUTES = flatten(APP_ROUTES);

// PL: Grupa testów listy ekranów.
// EN: A group of tests for the screen list.
describe('APP_ROUTES', () => {
  // PL: Jeden przypadek na podtor: wpis istnieje, ma właściwy adres i ekran.
  // EN: One case per subtrack: the entry exists and has the right address and screen.
  it.each(EXPECTED_SCREENS)('podtor $id ma wpis pod adresem $path / subtrack $id has an entry at address $path', ({ id, path }) => {
    // PL: Znajdź wpis po numerze podtoru.
    // EN: Find the entry by subtrack number.
    const route = ALL_ROUTES.find((item) => item.id === id);

    // PL: Wpis musi istnieć, mieć adres z listy oraz ekran.
    // EN: The entry must exist and have the address from the list and a screen.
    expect(route?.path).toBe(path);
    expect(typeof route?.Component).toBe('function');
  });

  // PL: Ekrany panelu muszą leżeć w ramie z menu, a nie obok niej.
  // EN: The panel screens must live inside the frame with the menu, not beside it.
  it('ekrany 3c, 4b, 5b i 8 są w ramie panelu / screens 3c, 4b, 5b and 8 are in the panel frame', () => {
    // PL: Znajdź ramę panelu i zbierz numery jej dzieci.
    // EN: Find the panel frame and collect the ids of its children.
    const frame = ALL_ROUTES.find((item) => item.id === 'panel');
    const childIds = (frame?.children ?? []).map((child) => child.id);

    // PL: Dzieci ramy to dokładnie cztery podtory panelu.
    // EN: The children of the frame are exactly the four panel subtracks.
    expect(childIds).toEqual(PANEL_SUBTRACKS);
  });

  // PL: Podtor 0 to wspólne elementy, nie ekran, więc nie ma adresu.
  // EN: Subtrack 0 is shared elements, not a screen, so it has no address.
  it('podtor 0 nie ma adresu / subtrack 0 has no address', () => {
    // PL: Żaden adres nie nosi numeru 0.
    // EN: No address carries the number 0.
    expect(ALL_ROUTES.some((item) => item.id === '0')).toBe(false);
  });

  // PL: Wpis nawigacji, który prowadzi donikąd, to martwy link.
  // EN: A navigation entry that leads nowhere is a dead link.
  it('wpisy dolnego paska i menu panelu prowadzą do adresów z listy / bottom bar and panel menu entries lead to addresses from the list', () => {
    // PL: Adresy z listy bez końcówki „/*”, bo wpis nawigacji wskazuje początek podtoru.
    // EN: The addresses from the list without the trailing "/*", because a navigation entry points to the start of a subtrack.
    const knownPaths = ALL_ROUTES.map((item) => item.path?.replace(/\/\*$/, '') || '/');

    // PL: Każdy wpis obu list musi mieć swój adres.
    // EN: Every entry of both lists must have its address.
    for (const item of [...DOCK_ITEMS, ...PANEL_MENU_ITEMS]) {
      expect(knownPaths).toContain(item.path);
    }
  });
});
