/**
 * PL: Ikony ekranów ankiet w panelu (podtor 5b): plus, krzyżyk, kłódka, brak sieci, ostrzeżenie i wysłanie. Rysunki są z biblioteki Lucide z makiet (docs/projekt/EKRANY.md), wpisane jako SVG, żeby nie dodawać pakietu. Podtor 5a ma własne ikony w swoim katalogu, a inne podtory ich nie importują.
 * EN: The icons of the survey panel screens (subtrack 5b): plus, cross, lock, no network, warning and send. The drawings are from the Lucide library used in the mockups (docs/projekt/EKRANY.md), written as SVG so as not to add a package. Subtrack 5a has its own icons in its directory, and other subtracks do not import them.
 *
 * @author Jakub
 * @since 2026-10-12
 * @used_by src/features/surveys/admin/PanelParts.tsx::ErrorMessage
 * @used_by src/features/surveys/admin/QuestionEditor.tsx::QuestionEditor
 * @used_by src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 * @used_by src/features/surveys/admin/ResultsScreen.tsx::ResultsScreen
 * @used_by src/features/surveys/admin/SurveyListScreen.tsx::SurveyListScreen
 */

import type { ReactNode } from 'react';

/**
 * PL: Wspólna rama ikony: rozmiar, kolor z tekstu wokół i ukrycie przed czytnikiem ekranu, bo obok jest napis albo opis przycisku.
 * EN: The shared icon frame: size, the color of the surrounding text and hiding from the screen reader, because a label or a button description sits next to it.
 *
 * @param props - PL: rozmiar i rysunek. EN: the size and the drawing.
 * @returns PL: element svg. EN: an svg element.
 */
function Icon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

/** PL: Plus (nowa ankieta, dodanie odpowiedzi i pytania). EN: Plus (a new survey, adding an option and a question). */
export const PlusIcon = () => (
  <Icon size={20}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Icon>
);

/** PL: Krzyżyk (usunięcie odpowiedzi albo pytania). EN: Cross (removing an option or a question). */
export const XIcon = () => (
  <Icon size={20}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);

/** PL: Kłódka (zbiorcze wyniki, brak dostępu). EN: Lock (aggregated results, no access). */
export const LockIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

/** PL: Brak sieci (podpis „wymaga internetu”). EN: No network (the "needs internet" note). */
export const WifiOffIcon = () => (
  <Icon size={16}>
    <path d="M12 20h.01" />
    <path d="M8.5 16.429a5 5 0 0 1 7 0" />
    <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
    <path d="M19 12.859a10 10 0 0 0-2.007-1.523" />
    <path d="M2 8.82a15 15 0 0 1 4.177-2.643" />
    <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
    <path d="m2 2 20 20" />
  </Icon>
);

/** PL: Trójkąt z wykrzyknikiem (błąd; błędu nie oznaczamy kolorem). EN: A triangle with an exclamation mark (an error; an error is not marked with color). */
export const TriangleAlertIcon = ({ size = 16 }: { size?: number }) => (
  <Icon size={size}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Icon>
);

/** PL: Papierowy samolot (przycisk „Opublikuj ankietę”). EN: A paper plane (the "Opublikuj ankietę" button). */
export const SendIcon = () => (
  <Icon size={20}>
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </Icon>
);
