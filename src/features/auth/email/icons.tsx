/**
 * PL: Małe ikony ekranów logowania jako SVG. Aplikacja nie ma biblioteki ikon, a cztery ikony nie uzasadniają dodawania pakietu. Ikony są ozdobą: tekst przy nich mówi to samo, więc czytnik ekranu je pomija.
 * EN: The small icons of the sign-in screens as SVG. The app has no icon library, and four icons do not justify adding a package. The icons are decoration: the text next to them says the same, so a screen reader skips them.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/auth/email/EmailStep.tsx::Icon
 * @used_by src/features/auth/email/CodeStep.tsx::Icon
 */

/** PL: Nazwy dostępnych ikon. EN: The names of the available icons. */
export type IconName = 'arrow-left' | 'arrow-right' | 'send' | 'lock';

/** PL: Linie każdej ikony (siatka 24 × 24, kreska 2). EN: The lines of each icon (24 × 24 grid, stroke 2). */
const ICON_PATHS: Record<IconName, string> = {
  'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
};

/**
 * PL: Rysuje ikonę o rozmiarze 20 px w kolorze tekstu.
 * EN: Draws a 20 px icon in the text color.
 *
 * @param props - PL: nazwa ikony. EN: the icon name.
 * @returns PL: element SVG. EN: the SVG element.
 */
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
