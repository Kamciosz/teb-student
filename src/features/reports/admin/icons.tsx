/**
 * PL: Ikony ekranów 4b (zestaw Lucide, te same kształty co w ekranach 6.4a–6.4d). Własny mały zestaw podtoru, bo ikony 4a nie są wystawione przez drzwi modułu.
 * EN: The icons of the 4b screens (the Lucide set, the same shapes as in screens 6.4a–6.4d). The subtrack's own small set, because the 4a icons are not exposed through the module door.
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/reports/admin/PanelTop.tsx::Icon
 * @used_by src/features/reports/admin/ReportDetail.tsx::Icon
 * @used_by src/features/reports/admin/ReportsList.tsx::Icon
 */

/** PL: Nazwa ikony. EN: The icon name. */
export type IconName = 'arrow-left' | 'triangle-alert' | 'user-round' | 'inbox' | 'check';

/** PL: Ścieżki SVG każdej ikony. EN: The SVG paths of each icon. */
const SHAPES: Record<IconName, string[]> = {
  'arrow-left': ['m12 19-7-7 7-7', 'M19 12H5'],
  'triangle-alert': ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
  'user-round': ['M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', 'M20 21a8 8 0 0 0-16 0'],
  inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'],
  check: ['M20 6 9 17l-5-5'],
};

/**
 * PL: Rysuje ikonę. Jest ozdobą, więc czytnik ekranu ją pomija.
 * EN: Draws an icon. It is decoration, so a screen reader skips it.
 *
 * @param props - PL: nazwa ikony. EN: the icon name.
 * @returns PL: element SVG. EN: the SVG element.
 */
export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="ra-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SHAPES[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
