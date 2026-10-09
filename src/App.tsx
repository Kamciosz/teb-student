/**
 * PL: Ekran startowy aplikacji. Na razie pokazuje tylko nazwę i napis „W budowie”. Router i pozostałe ekrany dodają kolejne etapy.
 * EN: The start screen of the app. For now it shows only the name and a "Under construction" label. Later stages add the router and other screens.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by src/main.tsx::createRoot
 */

/**
 * PL: Rysuje ekran startowy. Nie pobiera danych i nie zmienia nic poza ekranem.
 * EN: Draws the start screen. It fetches no data and changes nothing outside the screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function App() {
  // PL: Zwróć ekran: nagłówek z nazwą aplikacji i informację, że ekran jest w budowie.
  // EN: Return the screen: a heading with the app name and a note that the screen is under construction.
  return (
    <main>
      {/* PL: Nazwa aplikacji, którą uczeń widzi jako pierwszą. EN: The app name the student sees first. */}
      <h1>TEB Student</h1>
      {/* PL: Informacja, że właściwe ekrany jeszcze powstają. EN: A note that the real screens are still being built. */}
      <p>W budowie</p>
    </main>
  );
}
