/**
 * PL: Ikony edytora. Rysowane w SVG, bez zewnętrznej biblioteki.
 * EN: Editor icons. Drawn in SVG, without an external library.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/news/editor/TypeStep.tsx::PlusIcon
 */

/**
 * PL: Plus na kafelku „dodaj” (ekran 5.1). Ozdobny, bo nazwę kafla podaje etykieta przycisku.
 * EN: The plus on the "add" tile (screen 5.1). Decorative, because the button label gives the tile its name.
 *
 * @returns PL: ikona SVG. EN: the SVG icon.
 */
export function PlusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
