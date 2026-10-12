/**
 * PL: Górny pasek ekranów 4b: przycisk wstecz i tytuł (`flowTop` w ekranach 6.4a–6.4d).
 * EN: The top bar of the 4b screens: the back button and the title (`flowTop` in screens 6.4a–6.4d).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/icons.tsx::Icon
 * @used_by src/features/reports/admin/ReportsList.tsx::PanelTop
 * @used_by src/features/reports/admin/ReportDetail.tsx::PanelTop
 */

import { Link } from 'react-router';
import { Icon } from './icons';

/**
 * PL: Rysuje górny pasek.
 * EN: Draws the top bar.
 *
 * @param props - PL: tytuł, cel przycisku wstecz i jego nazwa dla czytnika ekranu. EN: the title, the back button target and its name for a screen reader.
 * @returns PL: drzewo elementów paska. EN: the tree of bar elements.
 */
export function PanelTop({ title, to, backLabel }: { title: string; to: string; backLabel: string }) {
  return (
    <div className="ra-top">
      <Link className="ra-icon-btn" to={to} aria-label={backLabel}>
        <Icon name="arrow-left" />
      </Link>
      <h1>{title}</h1>
    </div>
  );
}
