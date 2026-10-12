/**
 * PL: Ikona kafla „Ważne”: trójkąt z wykrzyknikiem (triangle-alert z ekranu 2.1 w docs/projekt/EKRANY.md). Rysunek jest ozdobą, więc czytniki ekranu go pomijają.
 * EN: The icon of the "Ważne" tile: a triangle with an exclamation mark (triangle-alert from screen 2.1 in docs/projekt/EKRANY.md). The drawing is decoration, so screen readers skip it.
 *
 * @author Kacper
 * @since 2026-10-11
 * @used_by src/features/dashboard/ImportantTile.tsx::ImportantTile
 */

/**
 * PL: Rysuje ikonę trójkąta z wykrzyknikiem w kolorze tekstu.
 * EN: Draws the triangle-with-exclamation-mark icon in the text color.
 *
 * @returns PL: obrazek SVG 16 × 16 px. EN: a 16 × 16 px SVG image.
 */
export function AlertIcon() {
  // PL: Linie obrysu: trójkąt, kreska i kropka wykrzyknika. aria-hidden ukrywa ozdobę przed czytnikiem ekranu.
  // EN: The outline strokes: the triangle, the bar and the dot of the exclamation mark. aria-hidden hides the decoration from the screen reader.
  return (
    <svg className="dash-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
