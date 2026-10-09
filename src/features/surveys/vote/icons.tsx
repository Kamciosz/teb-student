/**
 * PL: Cztery ikony ekranów ankiety (znacznik, znacznik w kółku, strzałka w lewo, kłódka). Rysunki są z biblioteki Lucide z makiet (docs/projekt/EKRANY.md), wpisane jako SVG, żeby nie dodawać pakietu.
 * EN: Four icons of the survey screens (check, check in a circle, left arrow, lock). The drawings are from the Lucide library used in the mockups (docs/projekt/EKRANY.md), written as SVG so as not to add a package.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by src/features/surveys/vote/SurveyListScreen.tsx::SurveyListScreen
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 * @used_by src/features/surveys/vote/SurveyDoneScreen.tsx::SurveyDoneScreen
 */

// PL: Typ elementów potomnych SVG.
// EN: The type of SVG child elements.
import type { ReactNode } from 'react';

/**
 * PL: Wspólna rama ikony: rozmiar, kolor z tekstu wokół i ukrycie przed czytnikiem ekranu, bo obok jest napis.
 * EN: The shared icon frame: size, the color of the surrounding text and hiding from the screen reader, because a label sits next to it.
 *
 * @param props - PL: rozmiar, grubość kreski i rysunek. EN: the size, the stroke width and the drawing.
 * @returns PL: element svg. EN: an svg element.
 */
function Icon({ size, stroke, children }: { size: number; stroke: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/** PL: Znacznik dużej ikony potwierdzenia. EN: The check of the large confirmation icon. */
export function CheckIcon({ size = 44 }: { size?: number }) {
  return (
    <Icon size={size} stroke={2.5}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

/** PL: Znacznik w kółku przy wypełnionej ankiecie. EN: The check in a circle next to a filled survey. */
export function CircleCheckIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size} stroke={1.75}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

/** PL: Strzałka w lewo przycisku „Wstecz”. EN: The left arrow of the "Wstecz" button. */
export function ArrowLeftIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size} stroke={1.75}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Icon>
  );
}

/** PL: Kłódka przy notatce o anonimowości. EN: The lock next to the anonymity note. */
export function LockIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size} stroke={1.75}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
}
