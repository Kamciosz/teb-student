/**
 * PL: Ikony ekranów 4a jako SVG w kodzie. Kształty pochodzą z biblioteki Lucide (licencja ISC), tej samej, której używa makieta; nie dodajemy pakietu, bo potrzeba tylko dziewięciu ikon.
 * EN: The icons of the 4a screens as inline SVG. The shapes come from the Lucide library (ISC license), the same one the mockup uses; we add no package, because only nine icons are needed.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/reports/student/ReportForm.tsx::Icon
 * @used_by src/features/reports/student/MyReports.tsx::Icon
 * @used_by src/features/reports/student/FlowTop.tsx::Icon
 */

/** PL: Nazwy ikon, które umiemy narysować. EN: The names of the icons we can draw. */
export type IconName = 'wrench' | 'shield-alert' | 'lightbulb' | 'circle-help' | 'arrow-right' | 'arrow-left' | 'send' | 'check' | 'x';

/** PL: Elementy SVG każdej ikony (siatka 24×24). EN: The SVG elements of every icon (24×24 grid). */
const SHAPES: Record<IconName, string[]> = {
  wrench: ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6.002 6.002 0 0 1 7.057-8.259c.438.12.54.662.219.984z'],
  'shield-alert': ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'M12 8v4', 'M12 16h.01'],
  lightbulb: ['M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5', 'M9 18h6', 'M10 22h4'],
  'circle-help': ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-left': ['m12 19-7-7 7-7', 'M19 12H5'],
  send: ['M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z', 'm21.854 2.147-10.94 10.939'],
  check: ['M20 6 9 17l-5-5'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
};

/**
 * PL: Rysuje ikonę. Ikona jest ozdobą (aria-hidden), bo przycisk obok ma własny napis.
 * EN: Draws an icon. The icon is decoration (aria-hidden), because the button next to it has its own label.
 *
 * @param props - PL: nazwa ikony. EN: the icon name.
 * @returns PL: element SVG. EN: the SVG element.
 */
export function Icon({ name }: { name: IconName }) {
  // PL: Jedna ścieżka na element tablicy; kolor bierze z tekstu (currentColor).
  // EN: One path per array element; the color comes from the text (currentColor).
  return (
    <svg className="rs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {SHAPES[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
