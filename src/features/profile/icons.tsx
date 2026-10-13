/**
 * PL: Ikony ekranu profilu (kształty z biblioteki Lucide, jak w projekcie ekranów). Rysowane jako SVG w kolorze tekstu, więc zmieniają się razem z paletą.
 * EN: The icons of the profile screen (Lucide library shapes, as in the screen design). Drawn as SVG in the text color, so they change together with the palette.
 *
 * @author Jakub
 * @since 2026-10-11
 * @used_by src/features/profile/ProfileHome.tsx::Icon
 * @used_by src/features/profile/ScreenTop.tsx::Icon
 */

/** PL: Nazwy ikon, których używa profil. EN: The names of the icons the profile uses. */
export type IconName = 'arrow-left' | 'chevron-right' | 'file-text' | 'log-out' | 'trash-2' | 'sliders-horizontal' | 'list-checks' | 'layout-dashboard' | 'smartphone';

/** PL: Ścieżki SVG każdej ikony w siatce 24 na 24. EN: The SVG paths of every icon in a 24 by 24 grid. */
const SHAPES: Record<IconName, string[]> = {
  'arrow-left': ['m12 19-7-7 7-7', 'M19 12H5'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'file-text': ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M10 9H8', 'M16 13H8', 'M16 17H8'],
  'log-out': ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  'trash-2': ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2', 'M10 11v6', 'M14 11v6'],
  'sliders-horizontal': ['M21 4h-7', 'M10 4H3', 'M21 12h-9', 'M8 12H3', 'M21 20h-5', 'M12 20H3', 'M14 2v4', 'M8 10v4', 'M16 18v4'],
  'list-checks': ['m3 17 2 2 4-4', 'm3 7 2 2 4-4', 'M13 6h8', 'M13 12h8', 'M13 18h8'],
  'layout-dashboard': ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
  'smartphone': ['M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z', 'M12 18h.01'],
};

/**
 * PL: Rysuje jedną ikonę. Ikona jest ozdobą (czytniki ekranu ją pomijają), bo obok niej zawsze stoi tekst albo podpis przycisku.
 * EN: Draws one icon. The icon is decoration (screen readers skip it), because a text or a button label always stands next to it.
 *
 * @param props - PL: nazwa ikony. EN: the icon name.
 * @returns PL: element SVG. EN: the SVG element.
 */
export function Icon({ name }: { name: IconName }) {
  // PL: Jedna ścieżka na element tablicy; kolor bierze z tekstu (currentColor).
  // EN: One path per array element; the color comes from the text (currentColor).
  return (
    <svg className="pf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SHAPES[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
