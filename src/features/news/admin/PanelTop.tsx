/**
 * PL: Górny pasek ekranu „Wpisy”: przycisk wstecz i tytuł (`flowTop` w ekranach przepływu 6).
 * EN: The top bar of the "Wpisy" screen: the back button and the title (`flowTop` in the flow 6 screens).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/admin/icons.tsx::Icon
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::PanelTop
 */

import { Link } from 'react-router';
import { Icon } from './icons';
import { SCREEN, TO_AGREE } from './texts';

/**
 * PL: Rysuje górny pasek. Przycisk wstecz prowadzi do ramy panelu.
 * EN: Draws the top bar. The back button leads to the panel frame.
 *
 * @returns PL: drzewo elementów paska. EN: the tree of bar elements.
 */
export function PanelTop() {
  // PL: Przycisk wstecz jest linkiem z nazwą dla czytnika ekranu, bo ma tylko ikonę.
  // EN: The back button is a link with a name for a screen reader, because it has only an icon.
  return (
    <div className="na-top">
      <Link className="na-icon-btn" to="/admin" aria-label={TO_AGREE.back}>
        <Icon name="arrow-left" />
      </Link>
      <h1>{SCREEN.title}</h1>
    </div>
  );
}
