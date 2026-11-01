/**
 * PL: Test ekranu nieznanego adresu. Otwiera w routerze adresy, których nie ma w APP_ROUTES (np. /surveys, czyli sam początek podtoru bez ekranu) i sprawdza, że zamiast surowego błędu 404 pojawia się komunikat z przyciskiem powrotu na pulpit. Rysuje przez renderToString, bez przeglądarki.
 * EN: Test of the unknown address screen. Opens in the router addresses that are not in APP_ROUTES (e.g. /surveys, the bare start of a subtrack with no screen) and checks that instead of a raw 404 error a message with a button back to the dashboard appears. Draws through renderToString, without a browser.
 *
 * @author Szymon Sosnowski
 * @since 2026-11-01
 * @uses src/app/routes.ts::APP_ROUTES
 * @uses src/app/NotFoundScreen.tsx::NotFoundScreen
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie drzewa React do tekstu HTML.
// EN: Rendering a React tree to an HTML string.
import { renderToString } from 'react-dom/server';
// PL: Router w pamięci zamiast przeglądarki: startuje od wskazanego adresu.
// EN: An in-memory router instead of the browser: it starts from the given address.
import { createMemoryRouter, RouterProvider } from 'react-router';
// PL: Prawdziwa lista adresów aplikacji, a nie atrapa.
// EN: The real list of app addresses, not a mock.
import { APP_ROUTES } from './routes';

/**
 * PL: Rysuje aplikację od podanego adresu i zwraca HTML.
 * EN: Draws the app from the given address and returns the HTML.
 *
 * @param path - PL: adres startowy. EN: the start address.
 * @returns PL: HTML ekranu. EN: the HTML of the screen.
 */
function renderAt(path: string): string {
  // PL: Router z prawdziwą listą adresów, startujący od adresu z testu.
  // EN: A router with the real address list, starting from the address of the test.
  const router = createMemoryRouter(APP_ROUTES, { initialEntries: [path] });
  return renderToString(<RouterProvider router={router} />);
}

describe('ekran nieznanego adresu / the unknown address screen', () => {
  // PL: Adres bez ekranu ma pokazać komunikat, a nie surowy błąd routera.
  // EN: An address without a screen must show the message, not the raw router error.
  it('pokazuje komunikat dla adresu bez ekranu / shows the message for an address without a screen', () => {
    const html = renderAt('/surveys');

    expect(html).toContain('Nie ma takiej strony');
    expect(html).toContain('Ten adres nie prowadzi do żadnego ekranu.');
    expect(html).not.toContain('Unexpected Application Error');
  });

  // PL: Dowolny nieznany adres dostaje ten sam ekran, także głęboko w ścieżce.
  // EN: Any unknown address gets the same screen, also deep in the path.
  it('obejmuje dowolny nieznany adres / covers any unknown address', () => {
    const html = renderAt('/cokolwiek/jeszcze/glebiej');

    expect(html).toContain('Nie ma takiej strony');
  });

  // PL: Przycisk na dole prowadzi na pulpit, czyli pod „/”.
  // EN: The button at the bottom leads to the dashboard, which is "/".
  it('ma przycisk powrotu na pulpit / has the button back to the dashboard', () => {
    const html = renderAt('/cokolwiek');

    expect(html).toContain('href="/"');
    expect(html).toContain('Wróć na pulpit');
  });
});
