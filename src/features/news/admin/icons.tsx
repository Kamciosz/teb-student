/**
 * PL: Ikony ekranu „Wpisy” (zestaw Lucide, te same kształty co w ekranach z docs/projekt/EKRANY.md). Własny mały zestaw podtoru, bo ikony innych podtorów nie są wystawione przez drzwi modułów.
 * EN: The icons of the "Wpisy" screen (the Lucide set, the same shapes as in the screens from docs/projekt/EKRANY.md). The subtrack's own small set, because the icons of other subtracks are not exposed through the module doors.
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/news/admin/PanelTop.tsx::Icon
 * @used_by src/features/news/admin/Notice.tsx::Icon
 * @used_by src/features/news/admin/EntryTile.tsx::Icon
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::Icon
 */

/** PL: Nazwa ikony. EN: The icon name. */
export type IconName = 'arrow-left' | 'triangle-alert' | 'plus' | 'inbox' | 'send' | 'pencil' | 'pin' | 'trash-2';

/** PL: Ścieżki SVG każdej ikony. EN: The SVG paths of each icon. */
const SHAPES: Record<IconName, string[]> = {
  'arrow-left': ['m12 19-7-7 7-7', 'M19 12H5'],
  'triangle-alert': ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
  plus: ['M5 12h14', 'M12 5v14'],
  inbox: ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'],
  send: ['m22 2-7 20-4-9-9-4Z', 'M22 2 11 13'],
  pencil: ['M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z', 'm15 5 4 4'],
  pin: ['M12 17v5', 'M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z'],
  'trash-2': ['M3 6h18', 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2', 'M10 11v6', 'M14 11v6'],
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
