/**
 * PL: Ikona plusa 16×16 na przycisk i wiersz „Zgłoś problem”: dwie kreski, kolor z tekstu (currentColor), zaokrąglone końce. Jest ozdobna, więc czytnik ekranu ją pomija, a nazwę daje tekst obok.
 * EN: The 16×16 plus icon for the "Zgłoś problem" button and row: two strokes, the color comes from the text (currentColor), rounded ends. It is decorative, so the screen reader skips it, and the name comes from the text next to it.
 *
 * @author Szymon
 * @since 2026-10-31
 * @used_by src/shared/index.ts::PlusIcon
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 * @used_by src/features/reports/student/MyReports.tsx::MyReports
 */

/**
 * PL: Właściwości ikony plusa: tylko klasa od wywołującego, żeby można ją było ustawić z zewnątrz.
 * EN: The plus icon properties: only the caller's class, so the caller can set it from outside.
 */
export type PlusIconProps = {
  /** PL: Dodatkowa klasa od wywołującego. EN: An extra class from the caller. */
  className?: string;
};

/**
 * PL: Rysuje plus. Ikona nie ma własnego koloru, bierze kolor tekstu, więc działa w jasnym i ciemnym motywie.
 * EN: Draws the plus. The icon has no color of its own, it takes the text color, so it works in the light and the dark theme.
 *
 * @param props - PL: klasa od wywołującego. EN: the caller's class.
 * @returns PL: ikona SVG. EN: the SVG icon.
 */
export function PlusIcon({ className }: PlusIconProps) {
  // PL: Dwie kreski krzyżujące się w środku: pionowa i pozioma, obie od brzegu do brzegu z marginesem 3 px.
  // EN: Two strokes crossing in the middle: a vertical and a horizontal one, both edge to edge with a 3 px margin.
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}
