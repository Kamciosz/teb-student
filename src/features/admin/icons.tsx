/**
 * PL: Ikony ekranów panelu (kształty z biblioteki Lucide, jak w projekcie ekranów 6.x). Rysowane jako SVG w kolorze tekstu, więc zmieniają się razem z paletą.
 * EN: The icons of the panel screens (Lucide library shapes, as in the 6.x screen design). Drawn as SVG in the text color, so they change together with the palette.
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/admin/PanelHome.tsx::Icon
 * @used_by src/features/admin/InvitesScreen.tsx::Icon
 * @used_by src/features/admin/NoAccessScreen.tsx::Icon
 * @used_by src/features/admin/ScreenTop.tsx::Icon
 * @used_by src/features/admin/RoleScreen.tsx::Icon
 * @used_by src/features/admin/RoleCardScreen.tsx::Icon
 * @used_by src/features/admin/PilotScreen.tsx::Icon
 * @used_by src/features/admin/InviteList.tsx::Icon
 * @used_by src/features/admin/CopyCodeButton.tsx::Icon
 * @used_by src/features/admin/DiaryScreen.tsx::Icon
 */

/** PL: Nazwy ikon, których używa panel. EN: The names of the icons the panel uses. */
export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-right'
  | 'newspaper'
  | 'clipboard-list'
  | 'chart-column'
  | 'ticket'
  | 'lock'
  | 'plus'
  | 'copy'
  | 'check'
  | 'triangle-alert'
  | 'wifi-off'
  | 'users'
  | 'download'
  | 'search'
  | 'user-round'
  | 'x'
  | 'log-in'
  | 'history';

/** PL: Ścieżki SVG każdej ikony w siatce 24 na 24. EN: The SVG paths of every icon in a 24 by 24 grid. */
const SHAPES: Record<IconName, string[]> = {
  'arrow-left': ['m12 19-7-7 7-7', 'M19 12H5'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'chevron-right': ['m9 18 6-6-6-6'],
  newspaper: ['M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2', 'M18 14h-8', 'M15 18h-5', 'M10 6h8v4h-8V6Z'],
  'clipboard-list': ['M8 2h8v4H8z', 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2', 'M12 11h4', 'M12 16h4', 'M8 11h.01', 'M8 16h.01'],
  'chart-column': ['M3 3v16a2 2 0 0 0 2 2h16', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
  ticket: ['M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z', 'M13 5v2', 'M13 17v2', 'M13 11v2'],
  lock: ['M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  plus: ['M5 12h14', 'M12 5v14'],
  copy: ['M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z', 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'],
  check: ['M20 6 9 17l-5-5'],
  'triangle-alert': ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
  'wifi-off': ['M12 20h.01', 'M8.5 16.43a5 5 0 0 1 7 0', 'M2 8.82a15 15 0 0 1 4.17-2.65', 'M10.66 5c4.01-.36 8.14.9 11.34 3.76', 'M16.85 11.25a10 10 0 0 1 2.22 1.68', 'M5 13a10 10 0 0 1 5.24-2.76', 'm2 2 20 20'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  search: ['m21 21-4.34-4.34', 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16'],
  'user-round': ['M18 20a6 6 0 0 0-12 0', 'M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  'log-in': ['m10 17 5-5-5-5', 'M15 12H3', 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4'],
  history: ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5', 'M12 7v5l4 2'],
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
    <svg className="ad-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SHAPES[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
