/**
 * PL: Ikona ekranu „Wpisy” (zestaw Lucide, ten sam kształt co w ekranach z docs/projekt/EKRANY.md). Zostało jedno ostrzeżenie do komunikatu błędu, reszta czynności ma już tekst bez ikon. Własny mały zestaw podtoru, bo ikony innych podtorów nie są wystawione przez drzwi moduł.
 * EN: The icon of the "Wpisy" screen (the Lucide set, the same shape as in the screens from docs/projekt/EKRANY.md). One warning is left for the error message, the other actions have text without icons now. The subtrack's own small set, because the icons of other subtracks are not exposed through the module door.
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/news/admin/Notice.tsx::Icon
 */

/** PL: Nazwa ikony. EN: The icon name. */
export type IconName = 'triangle-alert';

/** PL: Ścieżki SVG każdej ikony. EN: The SVG paths of each icon. */
const SHAPES: Record<IconName, string[]> = {
  'triangle-alert': ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
};

/**
 * PL: Rysuje ikonę. Jest ozdobą, więc czytnik ekranu ją pomija.
 * EN: Draws an icon. It is decoration, so a screen reader skips it.
 *
 * @param props - PL: nazwa ikony. EN: the icon name.
 * @returns PL: element SVG. EN: the SVG element.
 */
export function Icon({ name }: { name: IconName }) {
  // PL: Narysuj wszystkie ścieżki wybranej ikony w jednym elemencie SVG.
  // EN: Draw all paths of the chosen icon in one SVG element.
  return (
    <svg className="na-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SHAPES[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
