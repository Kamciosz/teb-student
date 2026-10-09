/**
 * PL: Wspólny ekran „W budowie”. Używają go wszystkie podtory, dopóki nie mają własnego ekranu. Pokazuje tytuł ekranu (tylko taki, który jest w docs/projekt/EKRANY.md) i napis „W budowie”.
 * EN: The shared "W budowie" (under construction) screen. Every subtrack uses it until it has its own screen. It shows the screen title (only one that exists in docs/projekt/EKRANY.md) and the "W budowie" label.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by src/shared/index.ts::UnderConstruction
 */

// PL: Napis, który uczeń widzi na ekranie w budowie.
// EN: The label the student sees on a screen under construction.
const UNDER_CONSTRUCTION_TEXT = 'W budowie';

/**
 * PL: Dane ekranu „W budowie”.
 * EN: Data of the "W budowie" screen.
 */
export type UnderConstructionProps = {
  /** PL: Numer podtoru z docs/PODZIAL_PRACY.md, na przykład „3a”. Trafia do atrybutu data-subtrack, po którym testy poznają ekran. EN: Subtrack number from docs/PODZIAL_PRACY.md, for example "3a". It goes to the data-subtrack attribute, which tests use to recognise the screen. */
  subtrack: string;
  /** PL: Tytuł ekranu z docs/projekt/EKRANY.md. Gdy go nie ma, nagłówkiem jest sam napis „W budowie”. EN: Screen title from docs/projekt/EKRANY.md. When missing, the heading is the "W budowie" label alone. */
  title?: string;
};

/**
 * PL: Rysuje ekran „W budowie”. Nie pobiera danych i nie zmienia nic poza ekranem.
 * EN: Draws the "W budowie" screen. It fetches no data and changes nothing outside the screen.
 *
 * @param props - PL: numer podtoru i opcjonalny tytuł. EN: the subtrack number and an optional title.
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function UnderConstruction({ subtrack, title }: UnderConstructionProps) {
  // PL: Zwróć ekran. Atrybut data-subtrack mówi testom, który podtor go narysował.
  // EN: Return the screen. The data-subtrack attribute tells tests which subtrack drew it.
  return (
    <main data-subtrack={subtrack}>
      {/* PL: Nagłówek ekranu: tytuł albo, gdy go nie ma, napis „W budowie”. EN: The screen heading: the title or, when there is none, the "W budowie" label. */}
      <h1>{title ?? UNDER_CONSTRUCTION_TEXT}</h1>
      {/* PL: Napis pod tytułem pokazujemy tylko wtedy, gdy tytuł go nie zastępuje. EN: The label under the title shows only when the title does not replace it. */}
      {title === undefined ? null : <p>{UNDER_CONSTRUCTION_TEXT}</p>}
    </main>
  );
}
